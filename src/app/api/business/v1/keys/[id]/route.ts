import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { authenticateApiKeyRequest } from '@/lib/business-side/api-key-auth';

/**
 * DELETE /api/business/v1/keys/[id]
 * Revoke an API key. Immediate — subsequent requests with this key are rejected.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await authenticateApiKeyRequest(request);
  if (!auth.ok) return auth.response;

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: 'SERVER_MISCONFIGURED', message: 'Database client unavailable.' }, { status: 500 });
  }

  // Only the key owner or an admin may revoke
  const { data: key } = await supabase
    .from('api_keys')
    .select('id, user_id')
    .eq('id', id)
    .maybeSingle();

  if (!key) {
    return NextResponse.json({ error: 'NOT_FOUND', message: 'Key not found.' }, { status: 404 });
  }

  const isAdmin = auth.payload.scopes.includes('admin:write');
  if (key.user_id !== auth.payload.sub && !isAdmin) {
    return NextResponse.json({ error: 'FORBIDDEN', message: 'Cannot revoke another user\'s key.' }, { status: 403 });
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