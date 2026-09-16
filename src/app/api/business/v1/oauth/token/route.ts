import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { authenticateBusinessSideRequest } from '@/lib/business-side/auth';
import { businessRateLimit } from '@/lib/business-side/rate-limit';
import { businessSuccess, businessError } from '@/lib/business-side/response';

export async function POST(request: NextRequest) {
  const rateCheck = businessRateLimit(request);
  if (!rateCheck.ok) return rateCheck.response;

  const auth = await authenticateBusinessSideRequest(request);
  if (!auth.ok) return auth.response;

  let body: { code?: string } = {};
  try {
    body = JSON.parse(auth.rawBody || '{}');
  } catch {
    return businessError('INVALID_BODY', 'Body must be valid JSON.', 400);
  }

  const code = body.code;
  if (!code || typeof code !== 'string') {
    return businessError('MISSING_CODE', 'Authorization code is required.', 400);
  }

  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!secret) {
    return businessError('SERVER_MISCONFIGURED', 'Server misconfigured.', 500);
  }

  try {
    const { payload } = await jwtVerify(code, new TextEncoder().encode(secret));

    if (payload.client_id !== 'ez-business-side') {
      return businessError('INVALID_CODE', 'Code was not issued to this client.', 400);
    }

    return businessSuccess({
      user_id: payload.sub,
      email: payload.email,
      return_to: payload.return_to ?? '/dashboard',
    });
  } catch {
    return businessError('INVALID_CODE', 'Code is invalid or expired.', 400);
  }
}