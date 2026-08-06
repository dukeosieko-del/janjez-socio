import { NextResponse, NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin, logAdminAction } from "@/lib/server/auth-helpers";
import { rateLimitAdmin } from "@/lib/server/rate-limiter";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const rl = rateLimitAdmin(request);
  if (!rl.ok && rl.response) return rl.response;

  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const orderId = searchParams.get("orderId") || "";

    const supabase = createAdminClient();
    if (!supabase) {
  
    await logAdminAction({
      actorId: auth.id,
      actorEmail: auth.email,
      action: "fulfillment_logs_viewed",
      request,
    }).catch(() => {});
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    let query = supabase
      .from("fulfillment_logs")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .limit(limit);

    if (orderId) {
      query = query.eq("order_id", orderId);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ logs: data || [], total: count || 0 });
  } catch (error) {
    console.error("Admin fulfillment logs error:", error);
    return NextResponse.json({ error: "Failed to load logs" }, { status: 500 });
  }
}
