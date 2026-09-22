import { getSupabaseAdmin } from '@/lib/supabase/server';
import { refreshAffiliateAggregates } from '@/lib/affiliate/commission';

/**
 * Claw back a commission when an order is refunded or fails.
 * Sets the commission to 'clawed_back' and recomputes the affiliate's
 * denormalised totals so the dashboard reflects the reversal.
 */
export async function clawbackCommission(orderId: string) {
  const supabase = getSupabaseAdmin();

  const { data: commission } = await supabase
    .from('affiliate_commissions')
    .select('affiliate_id')
    .eq('order_id', orderId)
    .maybeSingle();

  await supabase
    .from('affiliate_commissions')
    .update({ status: 'clawed_back', updated_at: new Date().toISOString() })
    .eq('order_id', orderId);

  if (commission?.affiliate_id) {
    await refreshAffiliateAggregates(commission.affiliate_id);
  }
}