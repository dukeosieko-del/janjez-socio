import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { createHash } from 'crypto';

async function requirePartner(req: NextRequest): Promise<{ id: string } | null> {
  const token = req.cookies.get('jez_bs_session')?.value;
  if (!token) return null;

  const tokenHash = createHash('sha256').update(token).digest('hex');
  const supabase = getSupabaseAdmin();
  const { data: session } = await supabase
    .from('sessions')
    .select('partner_id')
    .eq('token_hash', tokenHash)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  return session ? { id: session.partner_id } : null;
}

/**
 * GET /api/partner/panels/[id]/analytics
 * Partner-scoped analytics for one of their own panels.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const partner = await requirePartner(req);
  if (!partner) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  const { data: panel } = await supabase
    .from('child_panels')
    .select('id, partner_id, subdomain, status')
    .eq('id', id)
    .eq('partner_id', partner.id)
    .maybeSingle();
  if (!panel) {
    return NextResponse.json({ error: 'Panel not found' }, { status: 404 });
  }

  const { data: orderRows } = await supabase
    .from('child_orders')
    .select('status, charge, cost, markup')
    .eq('panel_id', id);

  const rows = orderRows ?? [];
  const agg = {
    total_orders: rows.length,
    completed_orders: rows.filter(r => r.status === 'completed' || r.status === 'partial').length,
    pending_orders: rows.filter(r => r.status === 'pending' || r.status === 'processing' || r.status === 'in_progress').length,
    failed_orders: rows.filter(r => r.status === 'failed' || r.status === 'failed_refunded').length,
    cancelled_orders: rows.filter(r => r.status === 'cancelled').length,
    total_revenue: rows.reduce((s, r) => s + Number(r.charge ?? 0), 0),
    total_cost: rows.reduce((s, r) => s + Number(r.cost ?? 0), 0),
    total_markup: rows.reduce((s, r) => s + Number(r.markup ?? 0), 0),
  };

  const { count: activeUsers } = await supabase
    .from('child_users')
    .select('id', { count: 'exact', head: true })
    .eq('panel_id', id)
    .eq('status', 'active');

  return NextResponse.json({
    success: true,
    data: { panel, analytics: { ...agg, active_users: activeUsers ?? 0 } },
  });
}