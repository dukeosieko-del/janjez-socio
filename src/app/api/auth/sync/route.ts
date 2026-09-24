import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { authenticateBusinessSideRequest } from '@/lib/business-side/auth';
import { businessRateLimit } from '@/lib/business-side/rate-limit';
import { businessSuccess, businessError } from '@/lib/business-side/response';

/**
 * POST /api/auth/sync — Business Side ↔ Main Build auth bridge
 *
 * The island build pushes identity + signup_source to the main build on
 * every auth callback (app/auth/callback/route.ts:28) and session check
 * (app/api/auth/check/route.ts:46). This endpoint is the receiver.
 *
 * Main-build schema maps the island `partners` table to `public.profiles`
 * (id, email, full_name, phone, wallet_balance, role, signup_source). The
 * response shape is the partner shape the island callers expect, so the
 * endpoint translates on the way out.
 *
 * Auth: HMAC via authenticateBusinessSideRequest (same as /api/business/v1/*).
 * No JWT path — this is a server-to-server bridge, never a user-facing route.
 */

const VALID_SIGNUP_SOURCES = ['main', 'business-side', 'reseller', 'affiliate', 'child-panel'] as const;

interface SyncBody {
  janjez_user_id?: string;
  email?: string;
  full_name?: string;
  phone?: string;
  signup_source?: string;
}

export async function POST(request: NextRequest) {
  const rateCheck = businessRateLimit(request);
  if (!rateCheck.ok) return rateCheck.response;

  const auth = await authenticateBusinessSideRequest(request);
  if (!auth.ok) return auth.response;

  let body: SyncBody;
  try {
    body = JSON.parse(auth.rawBody) as SyncBody;
  } catch {
    return businessError('INVALID_JSON', 'Request body must be valid JSON.', 400);
  }

  const { janjez_user_id, email, full_name, phone, signup_source } = body;

  if (!janjez_user_id || !email) {
    return businessError('MISSING_FIELDS', 'janjez_user_id and email are required.', 400);
  }

  // Validate signup_source against the known union. Never trust the caller's
  // claim unconditionally — fall back to the safe default.
  const normalizedSource =
    signup_source && (VALID_SIGNUP_SOURCES as readonly string[]).includes(signup_source)
      ? signup_source
      : 'main';

  const supabase = createAdminClient();
  if (!supabase) return businessError('SERVER_MISCONFIGURED', 'Database client unavailable.', 500);

  // Upsert: insert on first sync, update on every subsequent one. This makes
  // the bridge idempotent — a failed callback can be retried safely.
  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      {
        id: janjez_user_id,
        email,
        full_name: full_name ?? email.split('@')[0],
        phone: phone ?? '',
        signup_source: normalizedSource,
      },
      { onConflict: 'id' },
    )
    .select('id, email, full_name, phone, wallet_balance, role, signup_source, created_at')
    .single();

  if (error || !data) {
    return businessError('SYNC_FAILED', error?.message ?? 'Profile sync failed.', 500);
  }

  const r = data as Record<string, unknown>;

  // Translate profile → partner shape for island callers.
  const partner = {
    id: r.id,
    janjez_user_id: r.id,
    janjez_email: r.email ?? null,
    display_name: r.full_name ?? null,
    phone: r.phone ?? null,
    status: 'active',
    onboarding_state: 'completed',
    signup_source: r.signup_source ?? normalizedSource,
  };

  return businessSuccess({ partner });
}