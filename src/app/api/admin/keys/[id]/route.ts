import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/server/auth-helpers';
import { rateLimitAdmin } from '@/lib/server/rate-limiter';

/**
 * DELETE /api/admin/keys/[id]
 * Revoke an API key (admin session auth).
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rl = rateLimitAdmin(request);
  if (!rl.ok && rl.response) return rl.response;

  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  const { id } = await params;
  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  const { error } = await supabase
    .from('api_keys')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: 'REVOKE_FAILED', message: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, revoked: true });
}