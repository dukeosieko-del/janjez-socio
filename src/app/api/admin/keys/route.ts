import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/server/auth-helpers';
import { rateLimitAdmin } from '@/lib/server/rate-limiter';
import { signApiKey, generateKeyPair, DEFAULT_SCOPES, DEFAULT_KEY_EXPIRY_MS, DEFAULT_RATE_LIMIT } from '@/lib/business-side/jwt';

/**
 * POST /api/admin/keys
 * Issue a new API key for the authenticated admin (dashboard UI).
 *
 * Uses the admin's Supabase session token rather than an API-key JWT, so the
 * first key can be bootstrapped without needing an existing key.
 */
export async function POST(request: NextRequest) {
  const rl = rateLimitAdmin(request);
  if (!rl.ok && rl.response) return rl.response;

  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

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
      user_id: admin.id,
      key_id: keyId,
      key_hash: hash,
      name,
      scopes,
      rate_limit,
      expires_at: expiresAt,
      created_by: admin.id,
    })
    .select('id, key_id, name, scopes, rate_limit, expires_at, created_at')
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'ISSUANCE_FAILED', message: error?.message ?? 'Unknown' }, { status: 500 });
  }

  const token = await signApiKey(
    { sub: admin.id, tid: null, kid: keyId, scopes },
    expires_in_ms
  );

  return NextResponse.json({
    success: true,
    data: {
      ...data,
      token,
      secret,
    },
  }, { status: 201 });
}