import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { signApiKey, generateKeyPair, DEFAULT_SCOPES, DEFAULT_KEY_EXPIRY_MS, DEFAULT_RATE_LIMIT } from '@/lib/business-side/jwt';
import { authenticateApiKeyRequest, hasScope } from '@/lib/business-side/api-key-auth';

/**
 * POST /api/business/v1/keys
 * Issue a new API key for the authenticated user.
 *
 * Response: the JWT token is shown ONCE. Only the hash is stored.
 */
export async function POST(request: NextRequest) {
  const auth = await authenticateApiKeyRequest(request);
  if (!auth.ok) return auth.response;

  if (!hasScope(auth.payload, 'admin:write')) {
    return NextResponse.json(
      { error: 'INSUFFICIENT_SCOPE', message: 'admin:write scope required to issue keys.', code: 'INSUFFICIENT_SCOPE' },
      { status: 403 }
    );
  }

  let body: { name?: string; scopes?: string[]; rate_limit?: number; expires_in_ms?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'INVALID_BODY', message: 'Body must be valid JSON.' }, { status: 400 });
  }

  const name = body.name?.trim() || 'Default key';
  const scopes = Array.isArray(body.scopes) && body.scopes.length > 0 ? body.scopes : [...DEFAULT_SCOPES];
  const rate_limit = Number.isInteger(body.rate_limit) && (body.rate_limit as number) > 0 ? (body.rate_limit as number) : DEFAULT_RATE_LIMIT;
  const expires_in_ms = Number.isInteger(body.expires_in_ms) && (body.expires_in_ms as number) > 0 ? (body.expires_in_ms as number) : DEFAULT_KEY_EXPIRY_MS;

  const { keyId, secret, hash } = generateKeyPair();
  const expiresAt = new Date(Date.now() + expires_in_ms).toISOString();

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: 'SERVER_MISCONFIGURED', message: 'Database client unavailable.' }, { status: 500 });
  }
  const { data, error } = await supabase
    .from('api_keys')
    .insert({
      user_id: auth.payload.sub,
      tenant_id: auth.payload.tid,
      key_id: keyId,
      key_hash: hash,
      name,
      scopes,
      rate_limit,
      expires_at: expiresAt,
      created_by: auth.payload.sub,
    })
    .select('id, key_id, name, scopes, rate_limit, expires_at, created_at')
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'ISSUANCE_FAILED', message: error?.message ?? 'Unknown' }, { status: 500 });
  }

  // Sign the JWT with the secret embedded
  const token = await signApiKey(
    { sub: auth.payload.sub, tid: auth.payload.tid, kid: keyId, scopes },
    expires_in_ms
  );

  return NextResponse.json({
    success: true,
    data: {
      ...data,
      token,           // shown ONCE — never stored
      secret,          // shown ONCE — never stored
    },
  }, { status: 201 });
}

/**
 * GET /api/business/v1/keys
 * List the authenticated user's active keys (secrets masked).
 */
export async function GET(request: NextRequest) {
  const auth = await authenticateApiKeyRequest(request);
  if (!auth.ok) return auth.response;

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: 'SERVER_MISCONFIGURED', message: 'Database client unavailable.' }, { status: 500 });
  }
  const { data, error } = await supabase
    .from('api_keys')
    .select('id, key_id, name, scopes, rate_limit, last_used_at, expires_at, revoked_at, created_at')
    .eq('user_id', auth.payload.sub)
    .is('revoked_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'FETCH_FAILED', message: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: data ?? [] });
}