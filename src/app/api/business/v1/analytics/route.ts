import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireScope, ok, err } from '@/lib/business-side/route-helpers';

export async function GET(req: NextRequest) {
  const ctx = await requireScope(req, 'analytics:read');
  if (!ctx.ok) return ctx.response;

  const supabase = createAdminClient();
  if (!supabase) return err('SERVER_MISCONFIGURED', 'Database client unavailable.', 500);

  const userId = ctx.payload.sub;

  const { data: profileRow } = await supabase
    .from('profiles')
    .select('id, email, full_name, wallet_balance, role')
    .eq('id', userId)
    .maybeSingle();

  const { count: totalOrders } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);

  const { count: openOrders } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .in('status', ['pending', 'processing']);

  const { count: completedOrders } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'completed');

  const { data: earnings } = await supabase
    .from('affiliate_earnings')
    .select('amount, status')
    .eq('referrer_id', userId);

  let totalCommission = 0;
  let pendingCommission = 0;
  for (const row of earnings ?? []) {
    const r = row as Record<string, unknown>;
    const amt = Number(r.amount) || 0;
    totalCommission += amt;
    if (r.status === 'pending') pendingCommission += amt;
  }

  const profile = (profileRow as Record<string, unknown> | null) ?? null;

  return ok({
    user: profile,
    total_orders: totalOrders ?? 0,
    open_orders: openOrders ?? 0,
    completed_orders: completedOrders ?? 0,
    wallet_balance: (profile?.wallet_balance as number) ?? 0,
    total_commission: totalCommission,
    pending_commission: pendingCommission,
    generated_at: new Date().toISOString(),
  });
}