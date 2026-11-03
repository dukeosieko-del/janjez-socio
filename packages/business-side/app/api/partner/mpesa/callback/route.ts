import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('M-Pesa callback received:', JSON.stringify(body));
    
    const supabase = getSupabaseAdmin();
    const callbackData = body.Body?.stkCallback;
    
    if (!callbackData) {
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    const checkoutRequestId = callbackData.CheckoutRequestID;
    const resultCode = callbackData.ResultCode;
    const resultDesc = callbackData.ResultDesc;

    const { data: transaction } = await supabase
      .from('mpesa_transactions')
      .select('*')
      .eq('merchant_request_id', callbackData.MerchantRequestID)
      .maybeSingle();

    if (!transaction) {
      console.error('Transaction not found for callback');
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    if (resultCode === 0) {
      const callbackMetadata = callbackData.CallbackMetadata?.Item || [];
      const amount = callbackMetadata.find((item: any) => item.Name === 'Amount')?.Value;
      const mpesaReceiptNumber = callbackMetadata.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value;
      const phoneNumber = callbackMetadata.find((item: any) => item.Name === 'PhoneNumber')?.Value;

      await supabase
        .from('mpesa_transactions')
        .update({
          status: 'completed',
          mpesa_receipt_number: mpesaReceiptNumber,
          result_code: resultCode,
          result_desc: resultDesc,
          callback_data: body,
          completed_at: new Date().toISOString(),
        })
        .eq('id', transaction.id);

      if (transaction.transaction_type === 'deposit' && transaction.partner_id) {
        await supabase.rpc('credit_wallet', {
          p_partner_id: transaction.partner_id,
          p_amount: amount || transaction.amount,
          p_category: 'mpesa_deposit',
          p_reference: mpesaReceiptNumber || checkoutRequestId,
          p_metadata: { mpesaReceiptNumber, phoneNumber },
        });
      }
    } else {
      await supabase
        .from('mpesa_transactions')
        .update({
          status: 'failed',
          result_code: resultCode,
          result_desc: resultDesc,
          callback_data: body,
          failed_at: new Date().toISOString(),
        })
        .eq('id', transaction.id);
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (error) {
    console.error('M-Pesa callback error:', error);
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }
}
