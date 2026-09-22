import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { createHash } from 'crypto';
import { createPayout } from '@/lib/affiliate/payout';

async function getAffiliateIdFromSession(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get('jez_bs_session')?.value;
  if (!token) return null;

  const tokenHash = createHash('sha256').update(token).digest('hex');
  const supabase = getSupabaseAdmin();
  const { data: session } = await supabase
    .from('sessions')
    .select('partner_id')
    .eq('token_hash', tokenHash)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  if (!session) return null;

  const { data: affiliate } = await supabase
    .from('affiliates')
    .select('id')
    .eq('janjez_user_id', session.partner_id)
    .maybeSingle();

  return affiliate?.id ?? null;
}

export async function POST(req: NextRequest) {
  const affiliateId = await getAffiliateIdFromSession(req);
  if (!affiliateId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { amount, mpesa_number } = await req.json();

  if (!amount || Number(amount) < 500) {
    return NextResponse.json({ error: 'Minimum payout is KES 500' }, { status: 400 });
  }

  try {
    const payout = await createPayout(affiliateId, Number(amount), mpesa_number);
    return NextResponse.json({ success: true, data: payout });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown';
    const status = message.toLowerCase().includes('insufficient balance') ? 422 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}