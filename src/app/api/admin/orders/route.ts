import { NextResponse, NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/server/auth-helpers";
import { rateLimitAdmin } from "@/lib/server/rate-limiter";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const rl = rateLimitAdmin(request);
  if (!rl.ok && rl.response) return rl.response;

  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const status = searchParams.get("status") || "";

    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    let query = supabase
      .from("orders")
      .select("id, user_id, service_name, service_id, link, quantity, amount, comments, status, payment_status, created_at, updated_at", { count: "exact" });

    if (status) {
      query = query.eq("status", status);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query.order("created_at", { ascending: false }).range(from, to);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userIds = Array.from(new Set((data || []).map((o: any) => o.user_id).filter(Boolean)));
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .in("id", userIds);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orders = (data || []).map((o: any) => ({
      ...o,
      profiles: profileMap.get(o.user_id) || null,
    }));

    return NextResponse.json({
      orders,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error("Admin orders error:", error);
    return NextResponse.json({ error: "Failed to load orders" }, { status: 500 });
  }
}
