import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireScope, paginate, ok, err } from '@/lib/business-side/route-helpers';

/**
 * GET /api/business/v1/affiliates
 * Affiliate directory (admin scope).
 *
 * Main-build schema has no dedicated `affiliates` table; the affiliate
 * relationship is expressed through `affiliate_referrals` (referrer_id →
 * profiles) and `affiliate_earnings`. This route aggregates a stable
 * affiliate shape from those two sources.
 */
export async function GET(req: NextRequest) {
  const ctx = await requireScope(req, 'admin:read');
  if (!ctx.ok) return ctx.response;

  const { page, limit, offset } = paginate(req);
  const supabase = createAdminClient();
  if (!supabase) return err('SERVER_MISCONFIGURED', 'Database client unavailable.', 500);

  const { data: referrals, error: refError } = await supabase
    .from('affiliate_referrals')
    .select('referrer_id, code, status, created_at')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (refError) return err('FETCH_FAILED', refError.message, 500);

  const referrerIds = [...new Set((referrals ?? []).map((r) => {
    const rr = r as Record<string, unknown>;
    return rr.referrer_id as string;
  }).filter(Boolean))];
  const { data: profiles } = referrerIds.length
    ? await supabase.from('profiles').select('id, email, full_name').in('id', referrerIds)
    : { data: [] };

  const profileMap = new Map((profiles ?? []).map((p) => {
    const pr = p as Record<string, unknown>;
    return [pr.id, pr] as [string, Record<string, unknown>];
  }));

  const { data: earnings } = await supabase
    .from('affiliate_earnings')
    .select('referrer_id, amount, status')
    .in('referrer_id', referrerIds.length ? referrerIds : ['__none__']);

  const agg = new Map<string, { total_earned: number; total_pending: number; total_paid: number }>();
  for (const e of earnings ?? []) {
    const er = e as Record<string, unknown>;
    const id = er.referrer_id as string;
    const amt = Number(er.amount) || 0;
    const entry = agg.get(id) ?? { total_earned: 0, total_pending: 0, total_paid: 0 };
    entry.total_earned += amt;
    if (er.status === 'pending') entry.total_pending += amt;
    if (er.status === 'paid') entry.total_paid += amt;
    agg.set(id, entry);
  }

  const rows = (referrals ?? []).map((r) => {
    const ref = r as Record<string, unknown>;
    const profile = profileMap.get(ref.referrer_id as string) as Record<string, unknown> | undefined;
    const a = agg.get(ref.referrer_id as string) ?? { total_earned: 0, total_pending: 0, total_paid: 0 };
    return {
      id: ref.referrer_id,
      janjez_user_id: ref.referrer_id,
      affiliate_code: ref.code ?? null,
      commission_rate: null,
      total_earned: a.total_earned,
      total_pending: a.total_pending,
      total_paid: a.total_paid,
      status: ref.status ?? 'active',
      display_name: profile?.full_name ?? null,
      janjez_email: profile?.email ?? null,
      created_at: ref.created_at,
    };
  });

  return ok(rows, { page, limit, total: rows.length });
}