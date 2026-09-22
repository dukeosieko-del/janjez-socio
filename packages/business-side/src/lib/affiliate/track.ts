import { createHash } from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { recordAffiliateReferral } from '@/lib/affiliate/commission';

export async function trackClick(refCode: string, ip?: string, userAgent?: string) {
  const supabase = getSupabaseAdmin();
  const fingerprint = generateFingerprint(ip, userAgent);

  const { data: click, error } = await supabase
    .from('affiliate_clicks')
    .insert({
      ref_code: refCode,
      fingerprint,
      ip: ip ?? undefined,
      user_agent: userAgent ?? undefined,
      clicked_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  // Record the referral attribution at click time (owner spec: "Janjez
  // records referral"). Non-fatal — a click is still tracked even if the
  // referral write fails.
  try {
    await recordAffiliateReferral({
      ref_code: refCode,
      fingerprint,
      ip,
      user_agent: userAgent,
      clicked_at: click.clicked_at,
    });
  } catch {
    // swallow — click row is the source of truth
  }

  return click;
}

export function generateFingerprint(ip?: string, userAgent?: string): string {
  const parts = [ip ?? 'unknown', userAgent ?? 'unknown'];
  return createHash('sha256').update(parts.join('|')).digest('hex').slice(0, 32);
}