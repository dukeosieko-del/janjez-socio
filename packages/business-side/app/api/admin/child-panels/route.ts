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
 * GET /api/admin/child-panels
 * List all child panels with partner identity, paginated.
 */
export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)));
  const status = searchParams.get('status');
  const offset = (page - 1) * limit;

  const supabase = getSupabaseAdmin();
  let query = supabase
    .from('child_panels')
    .select('id, partner_id, subdomain, name, custom_domain, custom_domain_verified, status, signup_source, branding, copy, payment_gateways, created_at, updated_at, partners!inner(id, display_name, janjez_email, status, is_admin)')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error, count } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    data: data ?? [],
    pagination: { page, limit, total: count ?? data?.length ?? 0 },
  });
}