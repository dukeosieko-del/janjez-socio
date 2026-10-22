import { NextResponse, NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserFromRequest, requireAdmin } from "@/lib/server/auth-helpers";
import { rateLimit } from "@/lib/server/rate-limiter";
import { completeStkPayment, queryStkStatus, StkCallbackMetadata } from "@/lib/mpesa/client";

export const runtime = "nodejs";

/** Only reconcile transactions that are old enough for Safaricom to have settled. */
const MIN_AGE_MS = 60_000;

function extractMetadata(result: {
  CallbackMetadata?: { Item: Array<{ Name: string; Value?: string }> };
}): StkCallbackMetadata {
  const items = result?.CallbackMetadata?.Item || [];
  if (!Array.isArray(items)) return {};
  const get = (name: string): string | undefined =>
    items.find((i: { Name: string; Value?: string }) => i.Name === name)?.Value;
  return {
    amount: get("Amount") ? Number(get("Amount")) : undefined,
    phone: get("PhoneNumber"),
    receipt: get("ReceiptNumber") || get("MpesaReceiptNumber"),
  };
}

/**
 * Reconcile stuck M-Pesa transactions.
 *
 * Safaricom's callback can be lost (network hiccup, deploy, the callback
 * arriving while the app was down). The money still leaves the customer's
 * M-Pesa, so the transaction stays "pending" and the dashboard balance never
 * moves. This endpoint asks Safaricom for the real status of every pending
 * transaction and settles the ones that were actually paid.
 *
 * It is a read-only query against Daraja's STK query API — it never charges
 * anything.
 */
export async function POST(request: NextRequest) {
  const rl = rateLimit(request, 20);
  if (!rl.ok && rl.response) return rl.response;

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  let scopeUserId: string | null = null;
  let reconcileAll = false;

  const body = await request.json().catch(() => ({}));
  if (body?.all === true) {
    const admin = await requireAdmin(request);
    if (admin instanceof NextResponse) return admin;
    reconcileAll = true;
  } else {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    scopeUserId = user.id;
  }

  const cutoff = new Date(Date.now() - MIN_AGE_MS).toISOString();

  let query = supabase
    .from("wallet_transactions")
    .select("id, user_id, amount, reference, related_order_id, created_at")
    .eq("status", "pending")
    .eq("payment_method", "mpesa")
    .lt("created_at", cutoff)
    .order("created_at", { ascending: true })
    .limit(50);

  if (!reconcileAll && scopeUserId) {
    query = query.eq("user_id", scopeUserId);
  }

  const { data: pending, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const reconciled: Array<{ reference: string; amount: number; newBalance: number }> = [];
  const unresolved: Array<{ reference: string; reason: string }> = [];

  for (const tx of pending || []) {
    try {
      const status = await queryStkStatus(tx.reference);
      if (status.ResultCode !== "0") {
        unresolved.push({ reference: tx.reference, reason: status.ResultDesc || `ResultCode ${status.ResultCode}` });
        continue;
      }

      const result = await completeStkPayment(tx.reference, extractMetadata(status));
      reconciled.push({
        reference: tx.reference,
        amount: result.amount,
        newBalance: result.newBalance,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      unresolved.push({ reference: tx.reference, reason: message });
      console.error(`[mpesa-reconcile] ${tx.reference}: ${message}`);
    }
  }

  return NextResponse.json({
    ok: true,
    checked: pending?.length || 0,
    reconciled,
    unresolved,
  });
}
