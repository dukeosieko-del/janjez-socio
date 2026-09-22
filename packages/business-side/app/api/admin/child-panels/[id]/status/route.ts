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

const VALID_STATUSES = ['demo', 'active', 'suspended'];

/**
 * PATCH /api/admin/child-panels/[id]/status
 * Activate or suspend a child panel.
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { status?: string; reason?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const status = body.status;
  if (!status || !VALID_STATUSES.includes(status)) {
    return NextResponse.json(
      { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();
  const { data: panel, error } = await supabase
    .from('child_panels')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id, subdomain, status')
    .maybeSingle();

  if (error || !panel) {
    return NextResponse.json({ error: 'Panel not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: panel });
}