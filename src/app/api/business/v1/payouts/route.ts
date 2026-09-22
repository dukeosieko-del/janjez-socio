import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireScope, paginate, ok, err } from '@/lib/business-side/route-helpers';

/**
 * GET /api/business/v1/payouts
 * Affiliate payout list (admin scope).
 *
 * Main-build schema has no `affiliate_payouts` table (island-only, created by
 * packages/business-side/supabase/migrations/20260919000001). The closest
 * main-build equivalent is `affiliate_withdrawals`, which records paid-out
 * affiliate earnings. This route exposes the payout shape over that table.
 */
export async function GET(req: NextRequest) {
  const ctx = await requireScope(req, 'admin:read');
  if (!ctx.ok) return ctx.response;

  const { page, limit, offset } = paginate(req);
  const supabase = createAdminClient();
  if (!supabase) return err('SERVER_MISCONFIGURED', 'Database client unavailable.', 500);

  const { data, error, count } = await supabase
    .from('affiliate_withdrawals')
    .select('id, user_id as affiliate_id, amount, mpesa_phone as mpesa_number, status, created_at', { count: 'exact', head: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return err('FETCH_FAILED', error.message, 500);
  return ok(data ?? [], { page, limit, total: count ?? data?.length ?? 0 });
}