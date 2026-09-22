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

/**
 * GET /api/admin/child-panels/[id]
 * Detail view for a single child panel: panel, partner, services, orders.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data: panel, error: panelError } = await supabase
    .from('child_panels')
    .select('*, partners!inner(id, display_name, janjez_email, status, is_admin)')
    .eq('id', id)
    .maybeSingle();

  if (panelError || !panel) {
    return NextResponse.json({ error: 'Panel not found' }, { status: 404 });
  }

  const { data: services } = await supabase
    .from('child_services')
    .select('*')
    .eq('panel_id', id)
    .order('display_order', { ascending: true });

  const { data: orders } = await supabase
    .from('child_orders')
    .select('id, status, charge, cost, markup, created_at')
    .eq('panel_id', id)
    .order('created_at', { ascending: false })
    .limit(50);

  return NextResponse.json({ success: true, data: { panel, services: services ?? [], recent_orders: orders ?? [] } });
}