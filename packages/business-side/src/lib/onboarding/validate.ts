import { getSupabaseAdmin } from '@/lib/supabase/server';

export interface ValidateResult {
  valid: boolean;
  partner: Record<string, unknown> | string;
  blockers?: string[];
}

/**
 * Validate that a partner is ready to activate.
 *
 * Reseller branch (A5d): resellers must complete additional onboarding steps
 * before activation — wholesale agreement acceptance and panel branding. These
 * are checked in addition to the baseline 'pending' status check.
 */
export async function validateActivationReadiness(
  partnerId: string
): Promise<ValidateResult> {
  const supabase = getSupabaseAdmin();
  const { data: partner, error } = await supabase
    .from('partners')
    .select('*')
    .eq('id', partnerId)
    .single();

  if (error || !partner) {
    return { valid: false, partner: 'Partner not found' };
  }

  if (partner.status !== 'pending') {
    return { valid: false, partner: `Partner status is ${partner.status}, expected 'pending'` };
  }

  const blockers: string[] = [];

  // Reseller-specific onboarding requirements
  if (partner.signup_source === 'reseller') {
    if (!partner.reseller_agreement_accepted) {
      blockers.push('Wholesale agreement not accepted');
    }
    if (!partner.branding_completed) {
      blockers.push('Panel branding not completed');
    }
  }

  if (blockers.length > 0) {
    return { valid: false, partner: `Onboarding incomplete: ${blockers.join('; ')}`, blockers };
  }

  return { valid: true, partner: partner as Record<string, unknown> };
}