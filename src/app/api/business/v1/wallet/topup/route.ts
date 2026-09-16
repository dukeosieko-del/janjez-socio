import { NextRequest } from 'next/server';
import { authenticateBusinessSideRequest } from '@/lib/business-side/auth';
import { businessRateLimit } from '@/lib/business-side/rate-limit';
import { businessSuccess, businessError } from '@/lib/business-side/response';
import { topUpBusinessWallet } from '@/lib/business-side/wallet';

export async function POST(request: NextRequest) {
  const rateCheck = businessRateLimit(request);
  if (!rateCheck.ok) return rateCheck.response;

  const auth = await authenticateBusinessSideRequest(request);
  if (!auth.ok) return auth.response;

  let body: { amount?: number; phoneNumber?: string } = {};
  try {
    body = JSON.parse(auth.rawBody || '{}');
  } catch {
    return businessError('INVALID_BODY', 'Body must be valid JSON.', 400);
  }

  const idempotencyKey = request.headers.get('idempotency-key') || '';
  if (!idempotencyKey) {
    return businessError(
      'MISSING_IDEMPOTENCY_KEY',
      'Idempotency-Key header required.',
      400
    );
  }

  if (!body.amount || !body.phoneNumber) {
    return businessError(
      'MISSING_FIELDS',
      'amount and phoneNumber are required.',
      400
    );
  }

  const result = await topUpBusinessWallet({
    amount: body.amount,
    phoneNumber: body.phoneNumber,
    idempotencyKey,
  });

  if (!result.ok) {
    return businessError(result.code, result.message, 400);
  }

  return businessSuccess({
    checkoutRequestId: result.checkoutRequestId,
    status: result.status,
    amount: result.amount,
    replayed: result.replayed,
  });
}