import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SignJWT } from 'jose';

const ALLOWED_CLIENTS = {
  'ez-business-side': {
    redirectUris: ['https://business.janjez.social/auth/callback'],
  },
};

const CODE_TTL_SECONDS = 300; // 5 minutes

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const clientId = searchParams.get('client_id') || '';
  const redirectUri = searchParams.get('redirect_uri') || '';
  const returnTo = searchParams.get('return_to') || '/dashboard';
  const state = searchParams.get('state') || '';

  const client = ALLOWED_CLIENTS[clientId as keyof typeof ALLOWED_CLIENTS];
  if (!client) {
    return NextResponse.json(
      { error: 'invalid_client', message: 'Unknown client_id.' },
      { status: 400 }
    );
  }
  if (!client.redirectUris.includes(redirectUri)) {
    return NextResponse.json(
      { error: 'invalid_redirect_uri', message: 'redirect_uri not allowed.' },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json(
      { error: 'server_error', message: 'Server misconfigured.' },
      { status: 500 }
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const next = encodeURIComponent(
      request.nextUrl.pathname + request.nextUrl.search
    );
    return NextResponse.redirect(new URL(`/auth/sign-in?next=${next}`, origin));
  }

  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!secret) {
    return NextResponse.json(
      { error: 'server_error', message: 'Server misconfigured.' },
      { status: 500 }
    );
  }

  const jwt = await new SignJWT({
    sub: user.id,
    email: user.email,
    client_id: clientId,
    return_to: returnTo,
    signup_source: (user.user_metadata?.signup_source as string) ?? 'main',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${CODE_TTL_SECONDS}s`)
    .sign(new TextEncoder().encode(secret));

  const redirect = new URL(redirectUri);
  redirect.searchParams.set('code', jwt);
  if (state) redirect.searchParams.set('state', state);

  return NextResponse.redirect(redirect);
}