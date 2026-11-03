import { getSupabaseAdmin } from '@/lib/supabase/server';
import { hashApiKey, validateApiKeyFormat } from './generator';
import { NextRequest } from 'next/server';

export interface ApiKeyAuth {
  valid: boolean;
  keyId?: string;
  scopes?: string[];
  partnerId?: string;
  childUserId?: string;
  panelId?: string;
  rateLimit?: number;
}

export async function verifyApiKey(key: string): Promise<ApiKeyAuth> {
  if (!validateApiKeyFormat(key)) {
    return { valid: false };
  }

  const supabase = getSupabaseAdmin();
  const keyHash = hashApiKey(key);

  const { data: apiKey, error } = await supabase
    .from('api_keys')
    .select('key_id, scopes, partner_id, child_user_id, panel_id, rate_limit, expires_at, revoked_at')
    .eq('key_hash', keyHash)
    .single();

  if (error || !apiKey) {
    return { valid: false };
  }

  if (apiKey.revoked_at) {
    return { valid: false };
  }

  if (apiKey.expires_at && new Date(apiKey.expires_at) < new Date()) {
    return { valid: false };
  }

  // Update last used
  await supabase
    .from('api_keys')
    .update({ 
      last_used_at: new Date().toISOString(),
    })
    .eq('key_id', apiKey.key_id);

  return {
    valid: true,
    keyId: apiKey.key_id,
    scopes: apiKey.scopes,
    partnerId: apiKey.partner_id,
    childUserId: apiKey.child_user_id,
    panelId: apiKey.panel_id,
    rateLimit: apiKey.rate_limit,
  };
}

export function extractApiKeyFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  const apiKeyHeader = req.headers.get('x-api-key');
  if (apiKeyHeader) {
    return apiKeyHeader;
  }

  const queryKey = req.nextUrl.searchParams.get('api_key');
  if (queryKey) {
    return queryKey;
  }

  return null;
}
