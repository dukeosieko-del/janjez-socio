import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyApiKey, type ApiKeyPayload } from '@/lib/business-side/jwt';
import { rateLimitByKey } from '@/lib/server/rate-limiter';

export interface ApiKeyAuthResult {
  ok: true;
  payload: ApiKeyPayload;
  rawBody: string;
}

export interface ApiKeyAuthError {
  ok: false;
  response: NextResponse;
}

/**
 * Authenticate a business-side API request using a JWT API key.
 *
 * Accepts two formats for backwards compatibility during the A7 transition:
 *   1. New (preferred):  Authorization: Bearer <jwt>
 *   2. Legacy (fallback): x-business-side-api-key header (constant-time compare)
 *
 * The legacy path is retained so existing integrations keep working while
 * callers migrate to per-user JWT keys. It will be removed in a future
 * release once migration is complete.
 */
export async function authenticateApiKeyRequest(
  request: NextRequest
): Promise<ApiKeyAuthResult | ApiKeyAuthError> {
  const authHeader = request.headers.get('authorization');
  const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  // Preferred path: JWT bearer token
  if (bearer) {
    const payload = await verifyApiKey(bearer);
    if (!payload) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: 'INVALID_API_KEY', message: 'Invalid or expired API key.', code: 'INVALID_API_KEY' },
          { status: 401 }
        ),
      };
    }

    // Verify the key still exists and is not revoked
    const supabase = createAdminClient();
    if (!supabase) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: 'SERVER_MISCONFIGURED', message: 'Database client unavailable.', code: 'SERVER_MISCONFIGURED' },
          { status: 500 }
        ),
      };
    }
    const { data: keyRow } = await supabase
      .from('api_keys')
      .select('id, revoked_at, expires_at, rate_limit')
      .eq('key_id', payload.kid)
      .maybeSingle();

    if (!keyRow || keyRow.revoked_at) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: 'KEY_REVOKED', message: 'API key has been revoked.', code: 'KEY_REVOKED' },
          { status: 401 }
        ),
      };
    }

    if (keyRow.expires_at && new Date(keyRow.expires_at) < new Date()) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: 'KEY_EXPIRED', message: 'API key has expired.', code: 'KEY_EXPIRED' },
          { status: 401 }
        ),
      };
    }

    // A7c — per-key rate limiting, using the key's configured limit
    const rateCheck = rateLimitByKey(payload.kid, keyRow.rate_limit ?? 60);
    if (!rateCheck.ok) return rateCheck;

    // Update last_used_at (fire-and-forget — don't block the response)
    supabase.from('api_keys').update({ last_used_at: new Date().toISOString() }).eq('id', keyRow.id).then(() => {});

    return { ok: true, payload, rawBody: '' };
  }

  // Legacy path: static env-var key
  const legacyKey = request.headers.get('x-business-side-api-key');
  const configuredKey = process.env.BUSINESS_SIDE_API_KEY;
  if (legacyKey && configuredKey) {
    const { createHash, timingSafeEqual } = await import('node:crypto');
    const providedHash = createHash('sha256').update(legacyKey).digest('hex');
    const configuredHash = createHash('sha256').update(configuredKey).digest('hex');
    try {
      if (timingSafeEqual(Buffer.from(providedHash), Buffer.from(configuredHash))) {
        return {
          ok: true,
          payload: {
            sub: 'legacy',
            tid: null,
            kid: 'legacy',
            scopes: ['orders:read', 'orders:write', 'services:read', 'wallet:read'],
            iat: 0,
            exp: 0,
          },
          rawBody: '',
        };
      }
    } catch {
      // fall through to error
    }
  }

  return {
    ok: false,
    response: NextResponse.json(
      { error: 'INVALID_API_KEY', message: 'Valid API key required. Use Authorization: Bearer <jwt>.', code: 'INVALID_API_KEY' },
      { status: 401 }
    ),
  };
}

/** Check whether the payload has a required scope. */
export function hasScope(payload: ApiKeyPayload, scope: string): boolean {
  return payload.scopes.includes(scope) || payload.scopes.includes('*');
}