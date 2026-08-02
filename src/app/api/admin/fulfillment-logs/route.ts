import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) {
      return auth;
    }
    const { supabase } = auth;

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const orderId = searchParams.get("orderId") || "";

    let query = supabase
      .from("fulfillment_logs")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .limit(limit);

    if (orderId) {
      query = query.eq("order_id", orderId);
    }

    const { data, error: dbError, count } = await query;

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 400 });
    }

    return NextResponse.json({ logs: data || [], total: count || 0 });
  } catch (error) {
    console.error("Admin fulfillment logs error:", error);
    return NextResponse.json({ error: "Failed to load logs" }, { status: 500 });
  }
}
