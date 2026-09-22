import { getSupabaseAdmin } from '@/lib/supabase/server';

/**
 * Approve a partner withdrawal request.
 *
 * debit_wallet RPC signature is (p_partner_id, p_amount, p_category, p_reference,
 * p_metadata) — p_metadata has no default, so the original 4-arg call would
 * fail with "function debit_wallet(...) does not exist".
 */
export async function approveWithdrawal(withdrawalId: string) {
  const supabase = getSupabaseAdmin();

  const { data: withdrawal } = await supabase
    .from('withdrawal_requests')
    .select('*')
    .eq('id', withdrawalId)
    .single();
  if (!withdrawal) throw new Error('Withdrawal not found');
  if (withdrawal.status !== 'pending') throw new Error('Withdrawal not in pending state');

  const { error: debitError } = await supabase.rpc('debit_wallet', {
    p_partner_id: withdrawal.partner_id,
    p_amount: withdrawal.amount,
    p_category: 'withdrawal',
    p_reference: `withdrawal-${withdrawalId}`,
    p_metadata: { withdrawal_id: withdrawalId, net_amount: withdrawal.net_amount },
  });

  if (debitError) throw debitError;

  await supabase.from('withdrawal_requests').update({
    status: 'approved',
    approved_at: new Date().toISOString(),
  }).eq('id', withdrawalId);

  return { success: true };
}