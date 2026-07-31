import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fulfillOrder } from "@/lib/smm/fulfillment";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
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
      timestamp,
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
      timestamp?: string;
      refill_guarantee?: string | null;
      quantity_source?: "preset" | "custom";
    };

    if (!category || !subcategory || !quantity || !link_submitted || amount_paid === undefined || !quantity_source) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    const { data, error } = await supabase
      .from("orders")
      .insert({
        order_id: order_id || undefined,
        category,
        subcategory,
        sku_id: sku_id ?? null,
        quantity,
        link_submitted,
        amount: amount_paid,
        payment_reference: payment_reference || null,
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

    // Trigger automatic fulfillment asynchronously
    if (data?.id) {
      Promise.resolve(fulfillOrder(data.id)).catch((err) => {
        console.error("Auto-fulfillment failed for order", data.id, err);
      });
    }

    return NextResponse.json({ order: data }, { status: 201 });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const header = request.headers.get("authorization") || "";
    const match = header.match(/^Bearer\s+(.*)$/i);
    if (!match) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = match[1].trim();
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ orders: data || [] });
  } catch {
    return NextResponse.json({ error: "Failed to load orders" }, { status: 500 });
  }
}
