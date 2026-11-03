import { NextRequest, NextResponse } from 'next/server';
import { verifyApiKey, extractApiKeyFromRequest } from '@/lib/api-keys/verify';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { randomUUID } from 'crypto';

export async function GET(req: NextRequest) {
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

  const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '50');
  const offset = (page - 1) * limit;

  const supabase = getSupabaseAdmin();
  const { data: orders, count } = await supabase
    .from('child_orders')
    .select('id, service_id, link, quantity, status, charge, start_count, remains, created_at', { count: 'exact' })
    .eq('panel_id', auth.panelId)
    .eq('child_user_id', auth.childUserId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  return NextResponse.json({
    success: true,
    data: orders || [],
    pagination: {
      page,
      limit,
      total: count || 0,
      pages: Math.ceil((count || 0) / limit),
    },
  });
}

export async function POST(req: NextRequest) {
  const apiKey = extractApiKeyFromRequest(req);
  if (!apiKey) {
    return NextResponse.json({ error: 'API key required' }, { status: 401 });
  }

  const auth = await verifyApiKey(apiKey);
  if (!auth.valid || !auth.panelId || !auth.childUserId) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
  }

  if (!auth.scopes?.includes('write') && !auth.scopes?.includes('admin')) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  const body = await req.json();
  const { service_id, link, quantity } = body;

  if (!service_id || !link || !quantity) {
    return NextResponse.json({ error: 'service_id, link, and quantity are required' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  
  const { data: service } = await supabase
    .from('child_services')
    .select('*')
    .eq('id', service_id)
    .eq('panel_id', auth.panelId)
    .single();

  if (!service) {
    return NextResponse.json({ error: 'Service not found' }, { status: 404 });
  }

  if (quantity < service.child_min_quantity || quantity > service.child_max_quantity) {
    return NextResponse.json({ error: `Quantity must be between ${service.child_min_quantity} and ${service.child_max_quantity}` }, { status: 400 });
  }

  const charge = service.child_price * quantity;

  const { data: childUser } = await supabase
    .from('child_users')
    .select('balance')
    .eq('id', auth.childUserId)
    .single();

  if (!childUser || (childUser.balance || 0) < charge) {
    return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
  }

  const idempotencyKey = randomUUID();
  
  const { data: order, error } = await supabase
    .from('child_orders')
    .insert({
      panel_id: auth.panelId,
      child_user_id: auth.childUserId,
      service_id: service_id,
      janjez_service_id: service.janjez_service_id,
      link,
      quantity,
      charge,
      status: 'pending',
      payment_method: 'api_key',
      idempotency_key: idempotencyKey,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Deduct balance
  await supabase.rpc('debit_child_wallet', {
    p_child_user_id: auth.childUserId,
    p_amount: charge,
    p_order_id: order.id,
  });

  return NextResponse.json({
    success: true,
    data: {
      order_id: order.id,
      status: order.status,
      charge: order.charge,
      currency: 'KES',
    },
  });
}
