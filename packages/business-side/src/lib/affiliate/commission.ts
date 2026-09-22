import { getSupabaseAdmin } from '@/lib/supabase/server';

/**
 * Attribution model: a click is attributed to an affiliate only when BOTH
 * conditions hold:
 *   1. ref_code matches the affiliate's code (not just any fingerprint)
 *   2. fingerprint matches (device/browser continuity)
 *
 * Matching on fingerprint alone caused cross-affiliate misattribution: two
 * affiliates sharing an IP (e.g. same office / coffee shop) would steal each
 * other's conversions. ref_code is the authoritative join key.
 */
export async function findClickByFingerprint(
  fingerprint: string,
  refCode?: string
) {
  const supabase = getSupabaseAdmin();
  let query = supabase
    .from('affiliate_clicks')
    .select('*')
    .eq('fingerprint', fingerprint)
    .order('clicked_at', { ascending: false })
    .limit(1);

  if (refCode) {
    query = query.eq('ref_code', refCode);
  }

  const { data } = await query;
  return data?.[0] ?? null;
}

export async function isWithinHoldPeriod(clickedAt: string, holdDays = 14): Promise<boolean> {
  const clickDate = new Date(clickedAt).getTime();
  const now = Date.now();
  const daysDiff = (now - clickDate) / (1000 * 60 * 60 * 24);
  return daysDiff < holdDays;
}

export function calculateCommission(orderValue: number, rate = 0.1): number {
  return orderValue * rate;
}

/**
 * Persist an affiliate referral record and return it.
 * Called from the click-track path so that referral attribution is captured
 * at click time (per the owner's spec: "Janjez records referral").
 */
export async function recordAffiliateReferral(click: {
  ref_code: string;
  fingerprint: string;
  ip?: string | null;
  user_agent?: string | null;
  clicked_at: string;
}) {
  const supabase = getSupabaseAdmin();

  // Resolve ref_code -> affiliate_id for the referral record
  const { data: affiliate } = await supabase
    .from('affiliates')
    .select('id')
    .eq('affiliate_code', click.ref_code)
    .maybeSingle();

  if (!affiliate) return null;

  const { data, error } = await supabase
    .from('affiliate_referrals')
    .insert({
      affiliate_id: affiliate.id,
      visitor_fingerprint: click.fingerprint,
      referral_source: click.user_agent ?? null,
      converted_order_id: null,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Recompute denormalised aggregate columns on the affiliates table from the
 * commissions ledger. Called after any commission status change so the
 * dashboard (total_earned / total_pending / total_paid) reflects reality
 * instead of the zeros written at registration time.
 */
export async function refreshAffiliateAggregates(affiliateId: string) {
  const supabase = getSupabaseAdmin();

  const { data: rows } = await supabase
    .from('affiliate_commissions')
    .select('amount, status')
    .eq('affiliate_id', affiliateId);

  const earned = (rows ?? [])
    .filter(r => r.status === 'completed')
    .reduce((s, r) => s + Number(r.amount), 0);
  const pending = (rows ?? [])
    .filter(r => r.status === 'pending' || r.status === 'hold')
    .reduce((s, r) => s + Number(r.amount), 0);
  const paid = (rows ?? [])
    .filter(r => r.status === 'completed')
    .reduce((s, r) => s + Number(r.amount), 0);

  await supabase
    .from('affiliates')
    .update({
      total_earned: earned,
      total_pending: pending,
      total_paid: paid,
      updated_at: new Date().toISOString(),
    })
    .eq('id', affiliateId);
}