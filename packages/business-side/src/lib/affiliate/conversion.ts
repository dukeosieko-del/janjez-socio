import { getSupabaseAdmin } from '@/lib/supabase/server';
import { findClickByFingerprint, calculateCommission, refreshAffiliateAggregates } from '@/lib/affiliate/commission';

/**
 * Wrapper around /api/affiliate/convert that is safe to call from a webhook
 * handler (fire-and-forget). Resolves the order's customer fingerprint from
 * the webhook payload and creates the commission row if attribution succeeds.
 */
export async function triggerAffiliateConversion(params: {
  order_id: string;
  customer_ip?: string;
  customer_user_agent?: string;
  ref_code?: string;
}) {
  const { order_id, customer_ip, customer_user_agent, ref_code } = params;
  const supabase = getSupabaseAdmin();

  const { data: order } = await supabase
    .from('child_orders')
    .select('id, markup, charge')
    .eq('id', order_id)
    .maybeSingle();
  if (!order) return { success: false, reason: 'Order not found' };

  const fingerprint = `${customer_ip ?? 'unknown'}:${customer_user_agent ?? 'unknown'}`;
  const click = await findClickByFingerprint(fingerprint, ref_code);
  if (!click) return { success: false, reason: 'No matching click' };

  const { data: existing } = await supabase
    .from('affiliate_commissions')
    .select('id')
    .eq('order_id', order_id)
    .eq('affiliate_id', click.affiliate_id)
    .maybeSingle();
  if (existing) return { success: true, cached: true };

  const commission = calculateCommission(order.markup ?? order.charge);

  const { data, error } = await supabase
    .from('affiliate_commissions')
    .insert({
      affiliate_id: click.affiliate_id,
      order_id,
      amount: commission,
      status: 'pending',
      hold_until: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select()
    .single();

  if (error) return { success: false, reason: error.message };

  await refreshAffiliateAggregates(click.affiliate_id);
  return { success: true, commission: data };
}