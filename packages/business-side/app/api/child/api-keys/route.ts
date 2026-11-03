import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { createHash } from 'crypto';
import { generateApiKey } from '@/lib/api-keys/generator';

async function requireChildUser(req: NextRequest): Promise<{ id: string; panelId: string } | null> {
  const token = req.cookies.get('jez_child_session')?.value;
  if (!token) return null;

  const tokenHash = createHash('sha256').update(token).digest('hex');
  const supabase = getSupabaseAdmin();
  const { data: childUser } = await supabase
    .from('child_users')
    .select('id, panel_id, session_token_hash, session_expires_at')
    .eq('session_token_hash', tokenHash)
    .gt('session_expires_at', new Date().toISOString())
    .maybeSingle();

  return childUser ? { id: childUser.id, panelId: childUser.panel_id } : null;
}

export async function GET(req: NextRequest) {
  const childUser = await requireChildUser(req);
  if (!childUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data: apiKeys, error } = await supabase
    .from('api_keys')
    .select('id, key_id, key_prefix, name, description, scopes, rate_limit, last_used_at, expires_at, revoked_at, created_at')
    .eq('child_user_id', childUser.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: apiKeys });
}

export async function POST(req: NextRequest) {
  const childUser = await requireChildUser(req);
  if (!childUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { name, description, scopes = ['read'], expires_in_days, rate_limit = 1000 } = body;

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const keyPair = generateApiKey('jzc');
  let expires_at = null;
  if (expires_in_days && expires_in_days > 0) {
    const date = new Date();
    date.setDate(date.getDate() + expires_in_days);
    expires_at = date.toISOString();
  }

  const { data: apiKey, error } = await supabase
    .from('api_keys')
    .insert({
      child_user_id: childUser.id,
      panel_id: childUser.panelId,
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
