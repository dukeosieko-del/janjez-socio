/**
 * Helpers for the atomic wallet RPCs (credit_wallet / debit_wallet).
 *
 * Both functions are declared as `RETURNS TABLE(...)` in
 * supabase/migrations/20250101000011_wallet_atomic_functions.sql, so PostgREST
 * exposes their result as an ARRAY of rows:
 *
 *   credit_wallet -> [{ new_balance: 1500 }]
 *   debit_wallet  -> [{ new_balance: 900, success: false }]
 *
 * Reading `data.new_balance` (or `data.success`) from that array silently
 * yields `undefined`. That made a *failed* debit look successful (orders were
 * created and fulfilled without money being taken) and made every top-up
 * report a balance of 0. Always unwrap the first row.
 */

export interface WalletDebitRow {
  new_balance: number;
  success: boolean;
}

export interface WalletCreditRow {
  new_balance: number;
}

/** Unwrap the first row of a PostgREST table-returning RPC result. */
export function readWalletRpcRow<T>(data: unknown): T | null {
  if (Array.isArray(data)) {
    const row = data[0];
    return row && typeof row === "object" ? (row as T) : null;
  }
  if (data && typeof data === "object") {
    return data as T;
  }
  return null;
}

/** Debit a wallet, returning the post-debit balance and whether it succeeded. */
export async function debitWallet(
  supabase: {
    rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }>;
  },
  userId: string,
  amount: number
): Promise<{ success: boolean; newBalance: number; error: string | null }> {
  const result = await supabase.rpc("debit_wallet", {
    p_user_id: userId,
    p_amount: amount,
  });
  const error = (result as { error?: { message: string } | null }).error;
  const data = (result as { data?: unknown }).data;

  if (error) {
    return { success: false, newBalance: 0, error: error.message };
  }

  const row = readWalletRpcRow<WalletDebitRow>(data);
  if (!row || row.success !== true) {
    return { success: false, newBalance: Number(row?.new_balance) || 0, error: "Insufficient balance" };
  }

  return { success: true, newBalance: Number(row.new_balance) || 0, error: null };
}

/** Credit a wallet, returning the post-credit balance. */
export async function creditWallet(
  supabase: {
    rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }>;
  },
  userId: string,
  amount: number
): Promise<{ newBalance: number; error: string | null }> {
  const result = await supabase.rpc("credit_wallet", {
    p_user_id: userId,
    p_amount: amount,
  });
  const error = (result as { error?: { message: string } | null }).error;
  const data = (result as { data?: unknown }).data;

  if (error) {
    return { newBalance: 0, error: error.message };
  }

  const row = readWalletRpcRow<WalletCreditRow>(data);
  return { newBalance: Number(row?.new_balance) || 0, error: null };
}
