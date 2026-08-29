import { NextResponse, NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { listJanjezServices } from "@/lib/janzez-services";
import { rateLimit } from "@/lib/server/rate-limiter";
import { validateLink, validateNumber, sanitizeString } from "@/lib/server/validation";
import { calculateOrderCost } from "@/lib/pricing";
import { getCallbackUrl, initiateStkPush } from "@/lib/mpesa/client";

export const runtime = "nodejs";

function validateDripFeedField(value: unknown, name: string): string | null {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  if (isNaN(num) || !Number.isInteger(num) || num < 1) return `${name} must be a positive integer`;
  return null;
}

export async function POST(request: NextRequest) {
  const rl = rateLimit(request, 20);
  if (!rl.ok && rl.response) return rl.response;

  try {
    const body = await request.json();
    const {
      janjez_service_id,
      link_submitted,
      quantity,
      phone_number,
      runs,
      interval,
    } = body as {
      janjez_service_id?: string;
      link_submitted?: string;
      quantity?: number;
      phone_number?: string;
      runs?: number | null;
      interval?: number | null;
    };

    const errors: string[] = [];

    if (!janjez_service_id) errors.push("janjez_service_id is required");
    if (!phone_number || !/^\d{9,15}$/.test(phone_number.replace(/\s+/g, ""))) {
      errors.push("A valid phone number is required");
    }

    const quantityErr = validateNumber(quantity, "quantity", { min: 1 });
    if (quantityErr) errors.push(quantityErr);

    const linkErr = validateLink(link_submitted);
    if (linkErr) errors.push(linkErr);

    const runsErr = validateDripFeedField(runs, "runs");
    if (runsErr) errors.push(runsErr);

    const intervalErr = validateDripFeedField(interval, "interval");
    if (intervalErr) errors.push(intervalErr);

    if (errors.length > 0) {
      return NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 });
    }

    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    const numQuantity = Number(quantity);

    const services = await listJanjezServices(true, "show_anonymous");
    const janjezService = services.find((s) => s.id === janjez_service_id) || null;
    if (!janjezService) {
      return NextResponse.json({ error: "Service not found or not available" }, { status: 404 });
    }

    if (!janjezService.provider_service_id) {
      return NextResponse.json({ error: "Service is not configured for ordering. Please try another service." }, { status: 400 });
    }

    if (numQuantity < janjezService.min_quantity || numQuantity > janjezService.max_quantity) {
      return NextResponse.json({
        error: `Quantity must be between ${janjezService.min_quantity} and ${janjezService.max_quantity.toLocaleString()}.`,
      }, { status: 400 });
    }

    if ((runs != null || interval != null) && !janjezService.supports_drip_feed) {
      return NextResponse.json({ error: "This service does not support drip-feed" }, { status: 400 });
    }

    const expectedAmount = calculateOrderCost(janjezService.selling_price_ksh, numQuantity);

    if (isNaN(expectedAmount) || expectedAmount <= 0) {
      return NextResponse.json({ error: "Unable to verify service price" }, { status: 400 });
    }

    const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;
    const amountForMpesa = Math.max(50, expectedAmount);

    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_id: orderId,
        user_id: null,
        phone_number: sanitizeString(phone_number || "", 30),
        anonymous: true,
        category: janjezService.category,
        subcategory: janjezService.subcategory || janjezService.name,
        service_name: janjezService.name,
        sku_id: janjezService.slug,
        janjez_service_id,
        link_submitted: sanitizeString(link_submitted, 500),
        link: sanitizeString(link_submitted, 500),
        quantity: numQuantity,
        amount: expectedAmount,
        amount_paid: amountForMpesa,
        quantity_source: "preset",
        status: "pending",
        payment_status: "pending_mpesa",
        fulfillment_status: "pending",
        runs: runs ?? null,
        interval: interval ?? null,
      })
      .select("id, order_id")
      .single();

    if (orderError || !orderData) {
      console.error("Anonymous order insert error:", orderError?.message);
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }

    const requestUrl = new URL(request.url);
    const callbackUrl = getCallbackUrl(requestUrl.origin);

    try {
      const stkRes = await initiateStkPush({
        phoneNumber: phone_number!,
        amount: amountForMpesa,
        callbackUrl,
        accountReference: orderId,
        transactionDesc: `Anonymous order payment for ${janjezService.name}`,
      });

      const { error: txError } = await supabase.from("wallet_transactions").insert({
        user_id: null,
        phone_number: sanitizeString(phone_number || "", 30),
        type: "order_payment",
        amount: amountForMpesa,
        currency: "KES",
        payment_method: "mpesa",
        mpesa_phone: phone_number,
        reference: stkRes.CheckoutRequestID,
        related_order_id: orderData.id,
        status: "pending",
        notes: `Anonymous order STK for ${orderId}`,
      });

      if (txError) {
        console.error("Anonymous wallet_transactions insert error:", txError.message);
      }

      return NextResponse.json({
        ok: true,
        order_id: orderData.order_id,
        checkoutRequestId: stkRes.CheckoutRequestID,
        amount: expectedAmount,
        amountForMpesa,
        message: stkRes.CustomerMessage || "STK push initiated. Check your phone.",
      });
    } catch (stkError) {
      console.error("Anonymous STK push error:", stkError);
      await supabase
        .from("orders")
        .update({ fulfillment_status: "failed", fulfillment_error: "M-Pesa payment initiation failed" })
        .eq("id", orderData.id);
      return NextResponse.json({
        error: "Failed to initiate M-Pesa payment. Please try again.",
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Anonymous order error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
