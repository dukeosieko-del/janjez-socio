import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import {
  findClickByFingerprint,
  calculateCommission,
  isWithinHoldPeriod,
  refreshAffiliateAggregates,
} from '@/lib/affiliate/commission';

/**
 * POST /api/affiliate/convert
 *
 * Records an affiliate commission when a referred visitor places an order.
 * Called by the order-status webhook (order completing) and by the child
 * order creation flow when a ref cookie is present.
 *
 * Attribution: ref_code + fingerprint (see findClickByFingerprint).
 * Commissions enter a 14-day hold before the affiliate can claim them.
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { order_id, customer_ip, customer_user_agent, ref_code } = body;

  if (!order_id) {
    return NextResponse.json({ error: 'order_id required' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: order } = await supabase
    .from('child_orders')
    .select('id, status, markup, charge')
    .eq('id', order_id)
    .maybeSingle();

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  const fingerprint = `${customer_ip ?? 'unknown'}:${customer_user_agent ?? 'unknown'}`;
  const click = await findClickByFingerprint(fingerprint, ref_code);

  if (!click) {
    return NextResponse.json({ success: false, reason: 'No matching click' });
  }

  if (await isWithinHoldPeriod(click.clicked_at)) {
    return NextResponse.json({ success: false, reason: 'Still in hold period' });
  }

  // Idempotency: don't double-charge an order already attributed to this click
  const { data: existing } = await supabase
    .from('affiliate_commissions')
    .select('id')
    .eq('order_id', order_id)
    .eq('affiliate_id', click.affiliate_id)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ success: true, commission_id: existing.id, cached: true });
  }

  const commission = calculateCommission(order.markup ?? order.charge);

  const { data: commissionRow, error: insertError } = await supabase
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

  if (insertError || !commissionRow) {
    return NextResponse.json({ error: insertError?.message ?? 'Insert failed' }, { status: 500 });
  }

  // Link the referral record to the converted order
  await supabase
    .from('affiliate_referrals')
    .update({
      converted_order_id: order_id,
      status: 'pending',
    })
    .eq('fingerprint', click.fingerprint)
    .is('converted_order_id', null);

  await refreshAffiliateAggregates(click.affiliate_id);

  return NextResponse.json({ success: true, commission: commissionRow });
}