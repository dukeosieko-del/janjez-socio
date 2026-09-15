import { createAdminClient } from "@/lib/supabase/admin";
import { getBusinessSideAccountId } from "./config";

export async function getBusinessSideAccount() {
  const accountId = getBusinessSideAccountId();
  if (!accountId) return { ok: false as const, code: "SERVER_MISCONFIGURED" as const };

  const supabase = createAdminClient();
  if (!supabase) return { ok: false as const, code: "SERVER_MISCONFIGURED" as const };

  const { data, error } = await supabase
    .from("profiles")
    .select("id, wallet_balance, email")
    .eq("id", accountId)
    .single();

  if (error || !data) return { ok: false as const, code: "BUSINESS_ACCOUNT_NOT_FOUND" as const };
  return { ok: true as const, account: data };
}
