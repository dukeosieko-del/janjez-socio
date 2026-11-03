import { NextRequest, NextResponse } from 'next/server';
import { verifyApiKey, extractApiKeyFromRequest } from '@/lib/api-keys/verify';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const apiKey = extractApiKeyFromRequest(req);
  if (!apiKey) {
    return NextResponse.json({ error: 'API key required' }, { status: 401 });
  }

  const auth = await verifyApiKey(apiKey);
  if (!auth.valid || !auth.childUserId) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
  }

  if (!auth.scopes?.includes('read') && !auth.scopes?.includes('admin')) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  const supabase = getSupabaseAdmin();
  const { data: childUser } = await supabase
    .from('child_users')
    .select('balance')
    .eq('id', auth.childUserId)
    .single();

  if (!childUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: {
      balance: childUser.balance || 0,
      currency: 'KES',
    },
  });
}
