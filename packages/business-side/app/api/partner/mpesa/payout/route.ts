import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { createHash } from 'crypto';
import { randomUUID } from 'crypto';
import { initiateB2CPayment } from '@/lib/mpesa/client';

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

  const { amount, phoneNumber, remarks = 'Payout' } = await request.json();
  
  if (typeof amount !== 'number' || amount < 500) {
    return NextResponse.json({ error: 'Minimum payout is KES 500' }, { status: 400 });
  }

  if (!phoneNumber || !/^254[0-9]{9}$/.test(phoneNumber)) {
    return NextResponse.json({ error: 'Invalid phone number. Use format 254XXXXXXXXX' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  
  // Check wallet balance
  const { data: partnerRow } = await supabase
    .from('partners')
    .select('wallet_balance')
    .eq('id', partner.id)
    .single();

  if (!partnerRow || partnerRow.wallet_balance < amount) {
    return NextResponse.json({ error: 'Insufficient wallet balance' }, { status: 400 });
  }

  const conversationId = randomUUID();
  
  try {
    // Debit wallet first
    const { error: debitError } = await supabase.rpc('debit_wallet', {
      p_partner_id: partner.id,
      p_amount: amount,
      p_category: 'mpesa_payout',
      p_reference: conversationId,
      p_metadata: { phoneNumber },
    });

    if (debitError) {
      return NextResponse.json({ error: debitError.message }, { status: 500 });
    }

    const b2cResponse = await initiateB2CPayment({
      phoneNumber,
      amount,
      remarks,
      occasion: 'Payout',
    });

    const { error } = await supabase
      .from('mpesa_transactions')
      .insert({
        partner_id: partner.id,
        transaction_type: 'payout',
        amount,
        phone_number: phoneNumber,
        conversation_id: conversationId,
        originator_conversation_id: b2cResponse.OriginatorConversationID,
        status: 'pending',
        metadata: b2cResponse,
      });

    if (error) {
      console.error('Failed to log MPesa payout transaction:', error);
    }

    return NextResponse.json({
      success: true,
      data: {
        conversationId: b2cResponse.ConversationID,
        originatorConversationId: b2cResponse.OriginatorConversationID,
        responseDescription: b2cResponse.ResponseDescription,
      },
    });
  } catch (error) {
    console.error('M-Pesa payout error:', error);
    // Refund on failure
    await supabase.rpc('credit_wallet', {
      p_partner_id: partner.id,
      p_amount: amount,
      p_category: 'payout_refund',
      p_reference: conversationId,
      p_metadata: { reason: 'payout_failed' },
    });
    return NextResponse.json({ error: 'Failed to initiate M-Pesa payout' }, { status: 500 });
  }
}
