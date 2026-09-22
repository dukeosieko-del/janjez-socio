import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { createHash } from 'crypto';

async function requireAdmin(): Promise<boolean> {
  const cookieStore = await import('next/headers').then(m => m.cookies());
  const token = cookieStore.get('jez_bs_session')?.value;
  if (!token) return false;

  const tokenHash = createHash('sha256').update(token).digest('hex');
  const supabase = getSupabaseAdmin();
  const { data: session } = await supabase
    .from('sessions')
    .select('partner_id')
    .eq('token_hash', tokenHash)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  if (!session) return false;

  const { data: partner } = await supabase
    .from('partners')
    .select('is_admin')
    .eq('id', session.partner_id)
    .maybeSingle();

  return partner?.is_admin === true;
}

interface AnalyticsRow {
  total_orders: number;
  completed_orders: number;
  pending_orders: number;
  failed_orders: number;
  cancelled_orders: number;
  total_revenue: number;
  total_cost: number;
  total_markup: number;
  active_users: number;
}

/**
 * GET /api/admin/child-panels/[id]/analytics
 * Panel-scoped analytics: order counts by status, revenue, markup, active users.
 *
 * Aggregation is real-time (direct SQL count/sum) rather than a materialized
 * view because the panel's order volume is modest and the numbers must reflect
 * the latest webhook-driven status transitions immediately.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  // Verify panel exists
  const { data: panel } = await supabase
    .from('child_panels')
    .select('id, subdomain, status')
    .eq('id', id)
    .maybeSingle();
  if (!panel) {
    return NextResponse.json({ error: 'Panel not found' }, { status: 404 });
  }

  // Aggregate orders by status
  const { data: orderRows } = await supabase
    .from('child_orders')
    .select('status, charge, cost, markup')
    .eq('panel_id', id);

  const rows = orderRows ?? [];
  const agg: AnalyticsRow = {
    total_orders: rows.length,
    completed_orders: rows.filter(r => r.status === 'completed' || r.status === 'partial').length,
    pending_orders: rows.filter(r => r.status === 'pending' || r.status === 'processing' || r.status === 'in_progress').length,
    failed_orders: rows.filter(r => r.status === 'failed' || r.status === 'failed_refunded').length,
    cancelled_orders: rows.filter(r => r.status === 'cancelled').length,
    total_revenue: rows.reduce((s, r) => s + Number(r.charge ?? 0), 0),
    total_cost: rows.reduce((s, r) => s + Number(r.cost ?? 0), 0),
    total_markup: rows.reduce((s, r) => s + Number(r.markup ?? 0), 0),
    active_users: 0,
  };

  const { count: activeUsers } = await supabase
    .from('child_users')
    .select('id', { count: 'exact', head: true })
    .eq('panel_id', id)
    .eq('status', 'active');
  agg.active_users = activeUsers ?? 0;

  return NextResponse.json({ success: true, data: { panel, analytics: agg } });
}