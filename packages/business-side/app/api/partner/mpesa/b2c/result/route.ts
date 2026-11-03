import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('M-Pesa B2C result:', JSON.stringify(body));
    
    const supabase = getSupabaseAdmin();
    const result = body.Result;
    
    if (!result) {
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    const conversationId = result.OriginatorConversationID || result.ConversationID;
    
    const { data: transaction } = await supabase
      .from('mpesa_transactions')
      .select('*')
      .eq('originator_conversation_id', conversationId)
      .maybeSingle();

    if (!transaction) {
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    if (result.ResultCode === 0) {
      const resultParams = result.ResultParameters?.ResultParameter || [];
      const mpesaReceiptNumber = resultParams.find((p: any) => p.Key === 'TransactionReceipt')?.Value;
      
      await supabase
        .from('mpesa_transactions')
        .update({
          status: 'completed',
          mpesa_receipt_number: mpesaReceiptNumber,
          result_code: result.ResultCode,
          result_desc: result.ResultDesc,
          callback_data: body,
          completed_at: new Date().toISOString(),
        })
        .eq('id', transaction.id);
    } else {
      await supabase
        .from('mpesa_transactions')
        .update({
          status: 'failed',
          result_code: result.ResultCode,
          result_desc: result.ResultDesc,
          callback_data: body,
          failed_at: new Date().toISOString(),
        })
        .eq('id', transaction.id);
      
      // Refund on failure
      if (transaction.transaction_type === 'payout' && transaction.partner_id) {
        await supabase.rpc('credit_wallet', {
          p_partner_id: transaction.partner_id,
          p_amount: transaction.amount,
          p_category: 'payout_refund',
          p_reference: transaction.conversation_id,
          p_metadata: { reason: 'b2c_failed', resultDesc: result.ResultDesc },
        });
      }
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (error) {
    console.error('M-Pesa B2C result error:', error);
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }
}
