import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { createHash } from 'crypto';
import { randomUUID } from 'crypto';
import { initiateSTKPush } from '@/lib/mpesa/client';

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

export async function POST(request: NextRequest) {
  const partner = await requirePartner(request);
  if (!partner) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { amount, phoneNumber } = await request.json();
  
  if (typeof amount !== 'number' || amount < 50) {
    return NextResponse.json({ error: 'Minimum top-up is KES 50' }, { status: 400 });
  }

  if (!phoneNumber || !/^254[0-9]{9}$/.test(phoneNumber)) {
    return NextResponse.json({ error: 'Invalid phone number. Use format 254XXXXXXXXX' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const checkoutRequestId = randomUUID();
  
  try {
    const stkResponse = await initiateSTKPush({
      phoneNumber,
      amount,
      accountReference: `TOPUP-${partner.id.slice(0, 8)}`,
      transactionDesc: 'Wallet Top-up',
    });

    const { error } = await supabase
      .from('mpesa_transactions')
      .insert({
        partner_id: partner.id,
        transaction_type: 'deposit',
        amount,
        phone_number: phoneNumber,
        checkout_request_id: checkoutRequestId,
        merchant_request_id: stkResponse.MerchantRequestID,
        status: 'pending',
        metadata: stkResponse,
      });

    if (error) {
      console.error('Failed to log MPesa transaction:', error);
    }

    return NextResponse.json({
      success: true,
      data: {
        checkoutRequestId: stkResponse.CheckoutRequestID,
        merchantRequestId: stkResponse.MerchantRequestID,
        customerMessage: stkResponse.CustomerMessage,
      },
    });
  } catch (error) {
    console.error('M-Pesa topup error:', error);
    return NextResponse.json({ error: 'Failed to initiate M-Pesa payment' }, { status: 500 });
  }
}
