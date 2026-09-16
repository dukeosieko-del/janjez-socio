import { NextRequest } from 'next/server';
import { authenticateBusinessSideRequest } from '@/lib/business-side/auth';
import { businessRateLimit } from '@/lib/business-side/rate-limit';
import { businessSuccess, businessError } from '@/lib/business-side/response';
import { getBusinessSideAccount } from '@/lib/business-side/account';

export async function GET(request: NextRequest) {
  const rateCheck = businessRateLimit(request);
  if (!rateCheck.ok) return rateCheck.response;

  const auth = await authenticateBusinessSideRequest(request);
  if (!auth.ok) return auth.response;

  const result = await getBusinessSideAccount();
  if (!result.ok) {
    return businessError(result.code, 'Business Side account not found.', 404);
  }

  return businessSuccess({
    balance: result.account.wallet_balance ?? 0,
    currency: 'KES',
  });
}