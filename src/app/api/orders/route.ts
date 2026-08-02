import { NextResponse, NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fulfillOrder } from "@/lib/smm/fulfillment";
import { getUserFromRequest } from "@/lib/server/auth-helpers";
import { rateLimit } from "@/lib/server/rate-limiter";
import { validateLink, validateNumber, sanitizeString } from "@/lib/server/validation";

export const runtime = "nodejs";

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
       payment_reference,
       refill_guarantee,
      quantity_source,
    } = body as {
      order_id?: string;
      category?: string;
      subcategory?: string;
      sku_id?: string | null;
      quantity?: number;
      link_submitted?: string;
      amount_paid?: number;
      payment_reference?: string;
      refill_guarantee?: string | null;
      quantity_source?: "preset" | "custom";
    };

    const errors: string[] = [];

    if (!category) errors.push("category is required");
    if (!subcategory) errors.push("subcategory is required");
    if (!quantity_source) errors.push("quantity_source is required");

    const quantityErr = validateNumber(quantity, "quantity", { min: 1 });
    if (quantityErr) errors.push(quantityErr);

    const linkErr = validateLink(link_submitted);
    if (linkErr) errors.push(linkErr);

    if (amount_paid === undefined || isNaN(Number(amount_paid)) || Number(amount_paid) < 0) {
      errors.push("amount_paid must be a non-negative number");
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 });
    }

    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    const { data, error } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        order_id: order_id || undefined,
        category,
        subcategory,
        sku_id: sku_id ?? null,
        quantity: Number(quantity),
        link_submitted: sanitizeString(link_submitted, 500),
        amount: Number(amount_paid),
        payment_reference: sanitizeString(payment_reference, 200) || null,
        refill_guarantee: refill_guarantee ?? null,
        quantity_source,
        status: "pending",
        payment_status: "paid",
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (data?.id) {
      try {
        const fulfillmentResult = await fulfillOrder(data.id);

        if (fulfillmentResult.status === "failed" || fulfillmentResult.status === "error") {
          await supabase.from("notifications").insert({
            user_id: user.id,
            type: "order_failed",
            title: "Order Fulfillment Failed",
            message: `Your order ${data.order_id || data.id.slice(0, 8)} could not be fulfilled: ${fulfillmentResult.error || "Unknown error"}. Our team has been notified.`,
            link: "/orders/all",
          });
        } else {
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
