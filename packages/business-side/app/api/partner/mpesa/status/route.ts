import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { createHash } from 'crypto';
import { querySTKPushStatus } from '@/lib/mpesa/client';

async function requirePartner(req: NextRequest): Promise<{ id: string } | null> {
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

  return session ? { id: session.partner_id } : null;
}

export async function GET(request: NextRequest) {
  const partner = await requirePartner(request);
  if (!partner) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const checkoutRequestId = request.nextUrl.searchParams.get('checkoutRequestId');
  if (!checkoutRequestId) {
    return NextResponse.json({ error: 'checkoutRequestId required' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  
  try {
    const status = await querySTKPushStatus(checkoutRequestId);
    return NextResponse.json({ success: true, data: status });
  } catch (error) {
    console.error('M-Pesa status query error:', error);
    return NextResponse.json({ error: 'Failed to query status' }, { status: 500 });
  }
}
