import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireScope, paginate, ok, err } from '@/lib/business-side/route-helpers';

/**
 * GET /api/business/v1/users
 * User directory scoped to the caller's tenant.
 *
 * Main-build schema maps the island `partners` table to `profiles`
 * (id, email, full_name, phone, wallet_balance, role). The business-side
 * API exposes a stable shape regardless of underlying table.
 */
export async function GET(req: NextRequest) {
  const ctx = await requireScope(req, 'users:read');
  if (!ctx.ok) return ctx.response;

  const supabase = createAdminClient();
  if (!supabase) return err('SERVER_MISCONFIGURED', 'Database client unavailable.', 500);

  const { page, limit, offset } = paginate(req);

  const { data, error, count } = await supabase
    .from('profiles')
    .select('id, email, full_name, phone, wallet_balance, role, created_at', { count: 'exact', head: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return err('FETCH_FAILED', error.message, 500);

  const users = (data ?? []).map((row) => {
    const r = row as Record<string, unknown>;
    return {
      id: r.id,
      janjez_user_id: r.id,
      janjez_email: r.email ?? null,
      display_name: r.full_name ?? null,
      phone: r.phone ?? null,
      wallet_balance: r.wallet_balance ?? 0,
      role: r.role ?? 'user',
      created_at: r.created_at,
    };
  });

  return ok(users, { page, limit, total: count ?? users.length });
}