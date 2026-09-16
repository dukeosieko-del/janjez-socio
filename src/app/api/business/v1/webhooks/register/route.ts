import { NextRequest } from 'next/server';
import { authenticateBusinessSideRequest } from '@/lib/business-side/auth';
import { businessRateLimit } from '@/lib/business-side/rate-limit';
import { businessError } from '@/lib/business-side/response';

export async function POST(request: NextRequest) {
  const rateCheck = businessRateLimit(request);
  if (!rateCheck.ok) return rateCheck.response;

  const auth = await authenticateBusinessSideRequest(request);
  if (!auth.ok) return auth.response;

  // Stage 2.4 will implement webhook registration
  return businessError('NOT_IMPLEMENTED', 'Webhook registration is scheduled for Stage 2.4.', 501);
}