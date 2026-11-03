import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { createHash } from 'crypto';

async function requireChildUser(req: NextRequest): Promise<{ id: string } | null> {
  const token = req.cookies.get('jez_child_session')?.value;
  if (!token) return null;

  const tokenHash = createHash('sha256').update(token).digest('hex');
  const supabase = getSupabaseAdmin();
  const { data: childUser } = await supabase
    .from('child_users')
    .select('id, session_token_hash, session_expires_at')
    .eq('session_token_hash', tokenHash)
    .gt('session_expires_at', new Date().toISOString())
    .maybeSingle();

  return childUser ? { id: childUser.id } : null;
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const childUser = await requireChildUser(req);
  if (!childUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from('api_keys')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', id)
    .eq('child_user_id', childUser.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
