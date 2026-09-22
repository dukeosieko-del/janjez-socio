import { NextRequest } from 'next/server';
import { requireScope, paginate, ok } from '@/lib/business-side/route-helpers';

/**
 * GET /api/business/v1/webhooks
 * Registered webhooks for the caller's tenant.
 *
 * The main build has no `integration_connections` table (island-only). The
 * webhook registration surface is wired at /api/business/v1/webhooks/register
 * (A7g stub). Until that lands, this route returns an empty list rather than
 * a 500, so the API contract holds.
 */
export async function GET(req: NextRequest) {
  const ctx = await requireScope(req, 'webhooks:read');
  if (!ctx.ok) return ctx.response;

  const { page, limit } = paginate(req);

  return ok([], { page, limit, total: 0 });
}