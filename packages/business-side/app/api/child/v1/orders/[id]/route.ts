import { NextRequest, NextResponse } from 'next/server';
import { verifyApiKey, extractApiKeyFromRequest } from '@/lib/api-keys/verify';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const apiKey = extractApiKeyFromRequest(req);
  if (!apiKey) {
    return NextResponse.json({ error: 'API key required' }, { status: 401 });
  }

  const auth = await verifyApiKey(apiKey);
  if (!auth.valid || !auth.panelId || !auth.childUserId) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
  }

  if (!auth.scopes?.includes('read') && !auth.scopes?.includes('admin')) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  const { id } = await params;
  const supabase = getSupabaseAdmin();
  
  const { data: order } = await supabase
    .from('child_orders')
    .select('*')
    .eq('id', id)
    .eq('panel_id', auth.panelId)
    .eq('child_user_id', auth.childUserId)
    .single();

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: {
      order_id: order.id,
      service_id: order.service_id,
      link: order.link,
      quantity: order.quantity,
      status: order.status,
      start_count: order.start_count,
      remains: order.remains,
      charge: order.charge,
      currency: 'KES',
      created_at: order.created_at,
    },
  });
}
