import { getSupabaseAdmin } from '@/lib/supabase/server';

/**
 * Record a reseller commission when a child order completes.
 * Called from the order-status webhook (order completing) and the child
 * order creation flow.
 *
 * commission_amount = markup (the reseller's margin).
 * base_price = the wholesale cost the reseller paid (A5a integration).
 */
export async function recordResellerCommission(orderId: string) {
  const supabase = getSupabaseAdmin();

  const { data: order } = await supabase
    .from('child_orders')
    .select('id, panel_id, cost, markup, status')
    .eq('id', orderId)
    .maybeSingle();

  if (!order) return { success: false, reason: 'Order not found' };

  // Resolve the reseller (partner) who owns the panel
  const { data: panel } = await supabase
    .from('child_panels')
    .select('partner_id')
    .eq('id', order.panel_id)
    .maybeSingle();

  if (!panel?.partner_id) return { success: false, reason: 'No reseller for this panel' };

  // Idempotency
  const { data: existing } = await supabase
    .from('reseller_commissions')
    .select('id')
    .eq('order_id', orderId)
    .maybeSingle();
  if (existing) return { success: true, cached: true };

  const { data, error } = await supabase
    .from('reseller_commissions')
    .insert({
      reseller_id: panel.partner_id,
      order_id: orderId,
      base_price: Number(order.cost ?? 0),
      markup_amount: Number(order.markup ?? 0),
      commission_amount: Number(order.markup ?? 0),
      status: 'pending',
    })
    .select()
    .single();

  if (error) return { success: false, reason: error.message };

  await refreshResellerTotals(panel.partner_id);
  return { success: true, commission: data };
}

/**
 * Claw back a reseller commission when an order is refunded or fails.
 */
export async function clawbackResellerCommission(orderId: string) {
  const supabase = getSupabaseAdmin();

  const { data: commission } = await supabase
    .from('reseller_commissions')
    .select('reseller_id')
    .eq('order_id', orderId)
    .maybeSingle();

  await supabase
    .from('reseller_commissions')
    .update({ status: 'clawed_back', updated_at: new Date().toISOString() })
    .eq('order_id', orderId);

  if (commission?.reseller_id) {
    await refreshResellerTotals(commission.reseller_id);
  }
}

/**
 * Recompute denormalised totals on the partners table from the commissions
 * ledger. Replaces the real-time dashboard computation with a persisted
 * aggregate so the reseller dashboard can show totals without a full order
 * scan and reconciliation is possible.
 */
export async function refreshResellerTotals(resellerId: string) {
  const supabase = getSupabaseAdmin();

  const { data: rows } = await supabase
    .from('reseller_commissions')
    .select('amount:commission_amount, status')
    .eq('reseller_id', resellerId);

  const totalCommission = (rows ?? [])
    .filter(r => r.status === 'completed')
    .reduce((s, r) => s + Number(r.amount), 0);
  const pendingCommission = (rows ?? [])
    .filter(r => r.status === 'pending')
    .reduce((s, r) => s + Number(r.amount), 0);

  await supabase
    .from('partners')
    .update({
      total_commission: totalCommission,
      pending_commission: pendingCommission,
      updated_at: new Date().toISOString(),
    })
    .eq('id', resellerId);
}