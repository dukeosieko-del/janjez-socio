import { NextRequest } from 'next/server';
import { authenticateBusinessSideRequest } from '@/lib/business-side/auth';
import { businessRateLimit } from '@/lib/business-side/rate-limit';
import { businessSuccess, businessError } from '@/lib/business-side/response';

export async function GET(request: NextRequest) {
  const rateCheck = businessRateLimit(request);
  if (!rateCheck.ok) return rateCheck.response;

  const auth = await authenticateBusinessSideRequest(request);
  if (!auth.ok) return auth.response;

  return businessSuccess({
    status: 'ok',
    service: 'janjez-main-business-api',
    version: 'v1',
    timestamp: new Date().toISOString(),
  });
}