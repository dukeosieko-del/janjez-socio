import { createAdminClient } from "@/lib/supabase/admin";
import { getCallbackUrl, initiateStkPush } from "@/lib/mpesa/client";
import { getBusinessSideAccountId } from "./config";
import { withIdempotency } from "./idempotency";

function normalizePhone(value: string) {
  return value.replace(/\s+/g, "");
}

export async function topUpBusinessWallet(input: {
  amount: number;
  phoneNumber: string;
  idempotencyKey: string;
}) {
  const accountId = getBusinessSideAccountId();
  if (!accountId) {
    return { ok: false as const, code: "SERVER_MISCONFIGURED", message: "Business Side account is not configured." };
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return { ok: false as const, code: "SERVER_MISCONFIGURED", message: "Server misconfigured." };
  }

  const { data: account, error: accountError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", accountId)
    .single();

  if (accountError || !account) {
    return { ok: false as const, code: "BUSINESS_ACCOUNT_NOT_FOUND", message: "Business Side account was not found." };
  }

  const existing = await supabase
    .from("wallet_transactions")
    .select("reference, status, amount")
    .eq("user_id", accountId)
    .eq("type", "topup")
    .eq("notes", `business-side:${input.idempotencyKey}`)
    .maybeSingle();

  if (existing?.data?.reference) {
    return {
      ok: true as const,
      checkoutRequestId: existing.data.reference,
      status: existing.data.status,
      amount: Number(existing.data.amount),
      replayed: true,
    };
  }

  const stk = await initiateStkPush({
    phoneNumber: normalizePhone(input.phoneNumber),
    amount: input.amount,
    callbackUrl: getCallbackUrl(process.env.NEXT_PUBLIC_SITE_URL || "https://janjez.social"),
    accountReference: `business-side-${input.idempotencyKey}`,
    transactionDesc: "Business Side wallet top-up",
  }).catch((error: unknown) => ({
    error: error instanceof Error ? error.message : "M-Pesa STK push failed",
  }));

  if ("error" in stk) {
    return { ok: false as const, code: "MPESA_ERROR", message: stk.error };
  }

  const { error: insertError } = await supabase.from("wallet_transactions").insert({
    user_id: accountId,
    type: "topup",
    amount: input.amount,
    currency: "KES",
    payment_method: "mpesa",
    mpesa_phone: normalizePhone(input.phoneNumber),
    reference: stk.CheckoutRequestID,
    status: "pending",
    notes: `business-side:${input.idempotencyKey}`,
  });

  if (insertError) {
    return { ok: false as const, code: "SERVER_ERROR", message: insertError.message };
  }

  return {
    ok: true as const,
    checkoutRequestId: stk.CheckoutRequestID,
    status: "pending",
    amount: input.amount,
    replayed: false,
  };
}

export function runTopupIdempotent<T>(key: string, operation: () => Promise<T>) {
  return withIdempotency<T>(`business-topup:${key}`, 24 * 60 * 60 * 1000, operation);
}
