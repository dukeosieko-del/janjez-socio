import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireScope, paginate, ok, err } from '@/lib/business-side/route-helpers';

/**
 * GET /api/business/v1/withdrawals
 * Withdrawal history for the caller's tenant.
 *
 * Main-build schema maps the island `withdrawal_requests` table to
 * `affiliate_withdrawals` (user_id, amount, mpesa_phone, status).
 */
export async function GET(req: NextRequest) {
  const ctx = await requireScope(req, 'wallet:read');
  if (!ctx.ok) return ctx.response;

  const { page, limit, offset } = paginate(req);
  const supabase = createAdminClient();
  if (!supabase) return err('SERVER_MISCONFIGURED', 'Database client unavailable.', 500);

  const { data, error, count } = await supabase
    .from('affiliate_withdrawals')
    .select('id, user_id as partner_id, amount, mpesa_phone as mpesa_number, status, created_at', { count: 'exact', head: false })
    .eq('user_id', ctx.payload.sub)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return err('FETCH_FAILED', error.message, 500);
  return ok(data ?? [], { page, limit, total: count ?? data?.length ?? 0 });
}