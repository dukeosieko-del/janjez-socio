import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireScope, paginate, ok, err } from '@/lib/business-side/route-helpers';

/**
 * GET /api/business/v1/commissions
 * Commission ledger (admin scope).
 *
 * Main-build schema has no `affiliate_commissions` table; commissions are
 * recorded in `affiliate_earnings` (referrer_id, order_id, amount, status).
 * This route exposes the same shape the island expects.
 */
export async function GET(req: NextRequest) {
  const ctx = await requireScope(req, 'admin:read');
  if (!ctx.ok) return ctx.response;

  const { page, limit, offset } = paginate(req);
  const supabase = createAdminClient();
  if (!supabase) return err('SERVER_MISCONFIGURED', 'Database client unavailable.', 500);

  const { data, error, count } = await supabase
    .from('affiliate_earnings')
    .select('id, referrer_id as affiliate_id, order_id, amount, status, created_at', { count: 'exact', head: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return err('FETCH_FAILED', error.message, 500);
  return ok(data ?? [], { page, limit, total: count ?? data?.length ?? 0 });
}