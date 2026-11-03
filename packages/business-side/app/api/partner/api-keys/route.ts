import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { createHash } from 'crypto';
import { generateApiKey } from '@/lib/api-keys/generator';

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

export async function GET(req: NextRequest) {
  const partner = await requirePartner(req);
  if (!partner) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data: apiKeys, error } = await supabase
    .from('api_keys')
    .select('id, key_id, key_prefix, name, description, scopes, rate_limit, last_used_at, expires_at, revoked_at, created_at')
    .eq('partner_id', partner.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: apiKeys });
}

export async function POST(req: NextRequest) {
  const partner = await requirePartner(req);
  if (!partner) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { name, description, scopes = ['read'], expires_in_days, rate_limit = 1000 } = body;

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  
  // Get user_id from partner
  const { data: partnerData } = await supabase
    .from('partners')
    .select('id, janjez_user_id')
    .eq('id', partner.id)
    .single();

  if (!partnerData) {
    return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
  }

  const keyPair = generateApiKey('jzb');
  let expires_at = null;
  if (expires_in_days && expires_in_days > 0) {
    const date = new Date();
    date.setDate(date.getDate() + expires_in_days);
    expires_at = date.toISOString();
  }

  const { data: apiKey, error } = await supabase
    .from('api_keys')
    .insert({
      user_id: partnerData.janjez_user_id,
      partner_id: partner.id,
      key_id: keyPair.keyId,
      key_hash: keyPair.keyHash,
      key_prefix: keyPair.prefix,
      name,
      description,
      scopes,
      rate_limit,
      expires_at,
    })
    .select('id, key_id, key_prefix, name, scopes, expires_at, created_at')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    data: {
      ...apiKey,
      key: keyPair.key, // Only shown once
    },
  });
}
