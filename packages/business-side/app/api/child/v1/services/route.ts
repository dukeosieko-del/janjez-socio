import { NextRequest, NextResponse } from 'next/server';
import { verifyApiKey, extractApiKeyFromRequest } from '@/lib/api-keys/verify';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const apiKey = extractApiKeyFromRequest(req);
  if (!apiKey) {
    return NextResponse.json({ error: 'API key required' }, { status: 401 });
  }

  const auth = await verifyApiKey(apiKey);
  if (!auth.valid || !auth.panelId) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
  }

  if (!auth.scopes?.includes('read') && !auth.scopes?.includes('admin')) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  const supabase = getSupabaseAdmin();
  const { data: services } = await supabase
    .from('child_services')
    .select('id, custom_name, custom_description, child_price, child_min_quantity, child_max_quantity, janjez_service_id')
    .eq('panel_id', auth.panelId)
    .eq('is_visible', true)
    .order('display_order');

  return NextResponse.json({
    success: true,
    data: (services || []).map(s => ({
      service_id: s.id,
      name: s.custom_name,
      description: s.custom_description,
      price: s.child_price,
      min_quantity: s.child_min_quantity,
      max_quantity: s.child_max_quantity,
    })),
  });
}
