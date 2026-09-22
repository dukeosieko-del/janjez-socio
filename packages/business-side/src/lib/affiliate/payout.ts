import { getSupabaseAdmin } from '@/lib/supabase/server';
import { refreshAffiliateAggregates } from '@/lib/affiliate/commission';

/**
 * Create a payout request.
 *
 * Fixes over the original:
 *   - mpesa_number is now persisted (was silently discarded).
 *   - amount is validated against the affiliate's real earned balance
 *     (total_earned - total_paid), not just the KES 500 floor.
 *   - total_paid is incremented when the request is approved.
 */
export async function createPayout(
  affiliateId: string,
  amount: number,
  mpesaNumber?: string
) {
  const supabase = getSupabaseAdmin();

  const { data: affiliate } = await supabase
    .from('affiliates')
    .select('id, total_earned, total_paid, total_pending')
    .eq('id', affiliateId)
    .single();

  if (!affiliate) throw new Error('Affiliate not found');
  if (amount < 500) throw new Error('Minimum payout is KES 500');

  // Real available balance = completed earnings minus already-paid payouts.
  const available = (affiliate.total_earned ?? 0) - (affiliate.total_paid ?? 0);
  if (amount > available) {
    throw new Error(
      `Insufficient balance. Available: KES ${available.toLocaleString()}, requested: KES ${amount.toLocaleString()}`
    );
  }

  const array = new Uint8Array(8);
  crypto.getRandomValues(array);
  const mpesaRef = `PAYOUT-${Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 12)
    .toUpperCase()}`;

  const { data, error } = await supabase
    .from('affiliate_payouts')
    .insert({
      affiliate_id: affiliateId,
      amount,
      mpesa_ref: mpesaRef,
      mpesa_number: mpesaNumber,
      status: 'pending_admin_approval',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Approve a payout request. Sets status -> approved, records the approver,
 * and increments the affiliate's total_paid so subsequent requests recompute
 * against the correct remaining balance.
 */
export async function approvePayout(payoutId: string, approvedBy: string) {
  const supabase = getSupabaseAdmin();

  const { data: payout, error: fetchError } = await supabase
    .from('affiliate_payouts')
    .select('id, affiliate_id, amount, status')
    .eq('id', payoutId)
    .single();

  if (fetchError || !payout) throw new Error('Payout not found');
  if (payout.status !== 'pending_admin_approval') {
    throw new Error(`Payout is ${payout.status}, cannot approve`);
  }

  const { data, error } = await supabase
    .from('affiliate_payouts')
    .update({
      status: 'approved',
      approved_by: approvedBy,
      approved_at: new Date().toISOString(),
    })
    .eq('id', payoutId)
    .select()
    .single();

  if (error) throw error;

  // Recompute aggregates so total_paid reflects the approved payout.
  await refreshAffiliateAggregates(payout.affiliate_id);

  return data;
}

/**
 * Mark a payout as paid with the M-Pesa receipt number.
 */
export async function markPayoutPaid(payoutId: string, mpesaReceipt: string) {
  const supabase = getSupabaseAdmin();

  const { data: payout, error: fetchError } = await supabase
    .from('affiliate_payouts')
    .select('id, affiliate_id, status')
    .eq('id', payoutId)
    .single();

  if (fetchError || !payout) throw new Error('Payout not found');
  if (payout.status !== 'approved') {
    throw new Error(`Payout is ${payout.status}, must be approved before marking paid`);
  }

  const { data, error } = await supabase
    .from('affiliate_payouts')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString(),
      mpesa_receipt: mpesaReceipt,
    })
    .eq('id', payoutId)
    .select()
    .single();

  if (error) throw error;
  await refreshAffiliateAggregates(payout.affiliate_id);
  return data;
}

/**
 * Reject a payout with a reason.
 */
export async function rejectPayout(payoutId: string, rejectedBy: string, reason: string) {
  const supabase = getSupabaseAdmin();

  const { data: payout, error: fetchError } = await supabase
    .from('affiliate_payouts')
    .select('id, affiliate_id, status')
    .eq('id', payoutId)
    .single();

  if (fetchError || !payout) throw new Error('Payout not found');
  if (payout.status !== 'pending_admin_approval') {
    throw new Error(`Payout is ${payout.status}, cannot reject`);
  }

  const { data, error } = await supabase
    .from('affiliate_payouts')
    .update({
      status: 'rejected',
      approved_by: rejectedBy,
      approved_at: new Date().toISOString(),
      failure_reason: reason,
    })
    .eq('id', payoutId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * List all payouts for admin review, joined with affiliate + partner identity.
 */
export async function listPayoutsForAdmin(status?: string) {
  const supabase = getSupabaseAdmin();
  let query = supabase
    .from('affiliate_payouts')
    .select('id, affiliate_id, amount, mpesa_ref, mpesa_number, status, approved_by, approved_at, paid_at, mpesa_receipt, failure_reason, created_at, updated_at, affiliates!inner(id, affiliate_code, janjez_user_id)')
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}