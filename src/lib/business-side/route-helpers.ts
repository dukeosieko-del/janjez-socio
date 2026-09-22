import { NextRequest, NextResponse } from 'next/server';
import { authenticateApiKeyRequest, hasScope } from '@/lib/business-side/api-key-auth';

export interface BusinessRouteContext {
  req: NextRequest;
  payload: { sub: string; tid: string | null; kid: string; scopes: string[] };
}

/**
 * Shared auth + scope wrapper for A7d routes.
 *
 * Usage:
 *   export async function GET(req: NextRequest) {
 *     const ctx = await requireScope(req, 'users:read');
 *     if (!ctx.ok) return ctx.response;
 *     // ... use ctx.payload
 *   }
 */
export async function requireScope(
  req: NextRequest,
  scope: string
): Promise<{ ok: true; payload: { sub: string; tid: string | null; kid: string; scopes: string[] } } | { ok: false; response: NextResponse }> {
  const auth = await authenticateApiKeyRequest(req);
  if (!auth.ok) return { ok: false, response: auth.response };

  if (!hasScope(auth.payload, scope)) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'INSUFFICIENT_SCOPE', message: `${scope} scope required.`, code: 'INSUFFICIENT_SCOPE' },
        { status: 403 }
      ),
    };
  }

  return { ok: true, payload: auth.payload };
}

export function paginate(req: NextRequest, defaultLimit = 20, maxLimit = 100) {
  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10));
  const limit = Math.min(maxLimit, Math.max(1, parseInt(url.searchParams.get('limit') ?? String(defaultLimit), 10)));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

export function ok<T>(data: T, pagination?: { page: number; limit: number; total: number }) {
  return NextResponse.json({ success: true, data, ...(pagination ? { pagination } : {}) });
}

export function err(code: string, message: string, status: number) {
  return NextResponse.json({ error: code, message, code }, { status });
}