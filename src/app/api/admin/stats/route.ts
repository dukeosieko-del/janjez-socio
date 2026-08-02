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
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    const [
      { count: totalUsers },
      { count: totalOrders },
      { count: pendingOrders },
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("*", { count: "exact", head: true }).neq("status", "draft"),
      supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
    ]);

    const { data: recentUsers } = await supabase
      .from("profiles")
      .select("id, email, full_name, wallet_balance, created_at")
      .order("created_at", { ascending: false })
      .limit(10);

    const { data: recentOrders } = await supabase
      .from("orders")
      .select("id, user_id, service_name, amount, status, created_at")
      .order("created_at", { ascending: false })
      .limit(10);

    return NextResponse.json({
      stats: {
        totalUsers: totalUsers || 0,
        totalOrders: totalOrders || 0,
        pendingOrders: pendingOrders || 0,
      },
      recentUsers: recentUsers || [],
      recentOrders: recentOrders || [],
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 });
  }
}
