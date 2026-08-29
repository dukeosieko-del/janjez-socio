import { NextResponse, NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fulfillOrder, resolveJanjezService } from "@/lib/smm/fulfillment";
import { getUserFromRequest } from "@/lib/server/auth-helpers";
import { rateLimit } from "@/lib/server/rate-limiter";
import { validateLink, validateNumber, sanitizeString } from "@/lib/server/validation";
import { ORDER_SERVICES } from "@/lib/data";
import { SERVICE_CATALOG } from "@/lib/service-catalog";
import { calculateOrderCost } from "@/lib/pricing";

export const runtime = "nodejs";

function validateDripFeedField(value: unknown, field: string): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== "number" || !Number.isInteger(value)) {
    return `${field} must be an integer`;
  }
  if (value <= 0) {
    return `${field} must be greater than 0`;
  }
  return null;
}

function calculateExpectedAmount(
  catalogCategoryId: string | undefined,
  category: string,
  subcategory: string,
  skuId: string | null | undefined,
  quantity: number
): number {
  console.warn("[orders] Legacy pricing path used without janjez_service_id. Migrate callers to use janjez_service_id for authoritative pricing.");
  if (skuId && catalogCategoryId) {
    const service = ORDER_SERVICES.find(
      (s) => s.categoryId === catalogCategoryId && (s.serviceId === skuId || s.id === skuId)
    );
    if (service) {
      return calculateOrderCost(service.rate * 1000, quantity);
    }
  }

  const catalogItem = SERVICE_CATALOG.find(
    (c) => c.id === catalogCategoryId || c.name === category
  );
  if (catalogItem) {
    const sub = catalogItem.subcategories.find((s) => s.name === subcategory);
    if (sub) {
      const deliverable = sub.deliverables.find((d) => d.name === skuId || d.name === sub.deliverables[0].name);
      if (deliverable) {
        const priceMatch = deliverable.price.match(/([\d,.]+)/);
        if (priceMatch) {
          const rate = parseFloat(priceMatch[1].replace(/,/g, ""));
          return calculateOrderCost(rate * 1000, quantity);
        }
      }
    }
  }

  return NaN;
}

export async function POST(request: NextRequest) {
  try {
    const rl = rateLimit(request, 30);
    if (!rl.ok && rl.response) return rl.response;

    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
       order_id,
       category,
       subcategory,
       sku_id,
       quantity,
       link_submitted,
       amount_paid,
       catalog_category_id,
        payment_reference,
        refill_guarantee,
        quantity_source,
        runs,
        interval,
        janjez_service_id,
     } = body as {
       order_id?: string;
       category?: string;
       subcategory?: string;
       sku_id?: string | null;
       quantity?: number;
       link_submitted?: string;
       amount_paid?: number;
       catalog_category_id?: string;
       payment_reference?: string;
       refill_guarantee?: string | null;
       quantity_source?: "preset" | "custom";
       runs?: number | null;
       interval?: number | null;
       janjez_service_id?: string | null;
     };

    const errors: string[] = [];

    if (!janjez_service_id) {
      if (!category) errors.push("category is required");
      if (!subcategory) errors.push("subcategory is required");
    }
    if (!quantity_source) errors.push("quantity_source is required");

    const quantityErr = validateNumber(quantity, "quantity", { min: 1 });
    if (quantityErr) errors.push(quantityErr);

    const linkErr = validateLink(link_submitted);
    if (linkErr) errors.push(linkErr);

    if (amount_paid === undefined || isNaN(Number(amount_paid)) || Number(amount_paid) < 0) {
      errors.push("amount_paid must be a non-negative number");
    }

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

    let expectedAmount: number;
    let janjezService = null;

    if (janjez_service_id) {
      janjezService = await resolveJanjezService(janjez_service_id, null, janjez_service_id);
      if (!janjezService) {
        return NextResponse.json({ error: "Service not found or not available" }, { status: 404 });
      }
      if (numQuantity < janjezService.min_quantity || numQuantity > janjezService.max_quantity) {
        return NextResponse.json({
          error: `Quantity must be between ${janjezService.min_quantity} and ${janjezService.max_quantity.toLocaleString()}.`,
        }, { status: 400 });
      }
      if (runs != null || interval != null) {
        if (!janjezService.supports_drip_feed) {
          return NextResponse.json({ error: "This service does not support drip-feed" }, { status: 400 });
        }
      }
      expectedAmount = calculateOrderCost(janjezService.selling_price_ksh, numQuantity);
    } else {
      expectedAmount = calculateExpectedAmount(
        catalog_category_id,
        category!,
        subcategory!,
        sku_id,
        numQuantity
      );
    }

    if (isNaN(expectedAmount) || expectedAmount <= 0) {
      return NextResponse.json({ error: "Unable to verify service price. Please try a different service." }, { status: 400 });
    }

    const clientAmount = Number(amount_paid) || 0;
    const tolerance = 0.01;
    if (Math.abs(expectedAmount - clientAmount) > tolerance) {
      console.error(`Order price mismatch: expected ${expectedAmount}, got ${clientAmount}`);
      return NextResponse.json({
        error: "Price verification failed. The submitted amount does not match the service price.",
      }, { status: 400 });
    }

    const { data: debitData, error: debitError } = await supabase.rpc("debit_wallet", {
      p_user_id: user.id,
      p_amount: expectedAmount,
    });

    const debitResult = debitData as { success: boolean; new_balance: number } | null;

    if (debitError || !debitResult || debitResult.success === false) {
      const currentBalance = await supabase
        .from("profiles")
        .select("wallet_balance")
        .eq("id", user.id)
        .single();
      const balance = Number(currentBalance.data?.wallet_balance) || 0;
      await supabase.from("notifications").insert({
        user_id: user.id,
        type: "order_failed",
        title: "Order Failed - Insufficient Wallet Balance",
        message: `Your order could not be placed: insufficient wallet balance (KES ${balance.toFixed(2)}). Top up via M-Pesa first.`,
        link: "/pay",
      });
      return NextResponse.json({
        error: "Insufficient wallet balance. Please top up your wallet before placing an order.",
      }, { status: 402 });
    }

    const { data, error } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        order_id: order_id || undefined,
        category,
        subcategory,
        service_name: subcategory,
        sku_id: sku_id ?? janjezService?.slug ?? null,
        quantity: numQuantity,
        link_submitted: sanitizeString(link_submitted, 500),
        link: sanitizeString(link_submitted, 500),
        amount: expectedAmount,
        amount_paid: expectedAmount,
        payment_reference: sanitizeString(payment_reference, 200) || null,
        refill_guarantee: refill_guarantee ?? null,
        quantity_source,
        catalog_category_id,
        janjez_service_id: janjez_service_id || null,
        status: "pending",
        payment_status: "paid",
        fulfillment_status: "pending",
        runs: runs ?? null,
        interval: interval ?? null,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (data?.id) {
      try {
        const fulfillmentResult = await fulfillOrder(data.id);

        if (fulfillmentResult.status === "processing" || fulfillmentResult.status === "already_fulfilled") {
          await supabase.from("notifications").insert({
            user_id: user.id,
            type: "order_fulfilled",
            title: "Order Accepted",
            message: `Your order ${data.order_id || data.id.slice(0, 8)} has been sent to the provider. Status: ${fulfillmentResult.status}.`,
            link: "/orders/all",
          });
        }
      } catch (fulfillError) {
        console.error("Auto-fulfillment failed for order", data.id, fulfillError);
        const errorMessage = fulfillError instanceof Error ? fulfillError.message : "Auto-fulfillment error";
        await supabase
          .from("orders")
          .update({
            fulfillment_status: "failed",
            fulfillment_error: errorMessage,
          })
          .eq("id", data.id);
        await supabase.from("notifications").insert({
          user_id: user.id,
          type: "order_failed",
          title: "Order Fulfillment Failed",
          message: `Your order ${data.order_id || data.id.slice(0, 8)} could not be processed: ${errorMessage}.`,
          link: "/orders/all",
        });

        try {
          await supabase.rpc("credit_wallet", {
            p_user_id: user.id,
            p_amount: expectedAmount,
          });
        } catch (refundError) {
          console.error("Wallet refund failed for order", data.id, refundError);
        }
      }

      try {
        await supabase.from("notifications").insert({
          user_id: user.id,
          type: "order_created",
          title: "Order Placed",
          message: `Your order ${data.order_id || data.id.slice(0, 8)} for ${subcategory} has been recorded.`,
          link: "/orders/all",
        });
      } catch (notifErr) {
        console.error("Failed to create notification for order", data.id, notifErr);
      }
    }

    return NextResponse.json({ order: data }, { status: 201 });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const rl = rateLimit(request, 60);
    if (!rl.ok && rl.response) return rl.response;

    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ orders: data || [] });
  } catch {
    return NextResponse.json({ error: "Failed to load orders" }, { status: 500 });
  }
}
