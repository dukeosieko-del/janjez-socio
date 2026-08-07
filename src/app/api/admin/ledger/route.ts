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
    await logAdminAction({ actor_id: auth.id, actor_email: auth.email, action: "ledger_viewed" });
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "100");
    const type = searchParams.get("type") || "";

    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ledger: any[] = [];

    let ordersQuery = supabase
      .from("orders")
      .select("id, user_id, service_name, amount, status, created_at, updated_at");

    if (type) {
      ordersQuery = ordersQuery.eq("status", type);
    }

    const { data: orders } = await ordersQuery.order("created_at", { ascending: false }).limit(limit);

    if (orders) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const userIds = Array.from(new Set(orders.map((o: any) => o.user_id).filter(Boolean)));
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .in("id", userIds);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      orders.forEach((order: any) => {
        ledger.push({
          id: order.id,
          type: "order",
          category: order.status,
          amount: order.amount,
          currency: "KES",
          user_email: profileMap.get(order.user_id)?.email || "—",
          user_name: profileMap.get(order.user_id)?.full_name || "—",
          description: `Order: ${order.service_name}`,
          created_at: order.created_at,
        });
      });
    }

    let txQuery = supabase
      .from("wallet_transactions")
      .select("id, user_id, type, amount, currency, status, payment_method, mpesa_phone, reference, created_at");

    if (type) {
      txQuery = txQuery.eq("type", type);
    }

    const { data: transactions } = await txQuery.order("created_at", { ascending: false }).limit(limit);

    if (transactions) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const userIds = Array.from(new Set(transactions.map((t: any) => t.user_id).filter(Boolean)));
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .in("id", userIds);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transactions.forEach((tx: any) => {
        ledger.push({
          id: tx.id,
          type: tx.type,
          category: tx.payment_method || "wallet",
          amount: tx.amount,
          currency: tx.currency,
          user_email: profileMap.get(tx.user_id)?.email || "—",
          user_name: profileMap.get(tx.user_id)?.full_name || "—",
          description: tx.reference || `${tx.type} transaction`,
          created_at: tx.created_at,
        });
      });
    }

    const { data: verifications } = await supabase
      .from("email_verifications")
      .select("user_id, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (verifications) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const userIds = Array.from(new Set(verifications.map((v: any) => v.user_id).filter(Boolean)));
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .in("id", userIds);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      verifications.forEach((v: any) => {
        ledger.push({
          id: `verify-${v.user_id}`,
          type: "verification",
          category: "email",
          amount: 0,
          currency: "KES",
          user_email: profileMap.get(v.user_id)?.email || "—",
          user_name: profileMap.get(v.user_id)?.full_name || "—",
          description: "Email verification created",
          created_at: v.created_at,
        });
      });
    }

    const { data: logs } = await supabase
      .from("admin_activity_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (logs) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      logs.forEach((log: any) => {
        ledger.push({
          id: log.id,
          type: "admin_action",
          category: log.action,
          amount: 0,
          currency: "KES",
          user_email: log.actor_email,
          user_name: log.actor_email,
          description: log.action,
          created_at: log.created_at,
        });
      });
    }

    ledger.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const total = ledger.length;
    const start = (page - 1) * limit;
    const paginated = ledger.slice(start, start + limit);

    return NextResponse.json({
      ledger: paginated,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Admin ledger error:", error);
    return NextResponse.json({ error: "Failed to load ledger" }, { status: 500 });
  }
}
