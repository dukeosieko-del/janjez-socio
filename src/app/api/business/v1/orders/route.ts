import { NextRequest } from 'next/server';
import { authenticateBusinessSideRequest } from '@/lib/business-side/auth';
import { businessRateLimit } from '@/lib/business-side/rate-limit';
import { businessSuccess, businessError } from '@/lib/business-side/response';
import { createBusinessOrder } from '@/lib/business-side/orders';
import type { BusinessOrderInput } from '@/lib/business-side/types';

export async function POST(request: NextRequest) {
  const rateCheck = businessRateLimit(request);
  if (!rateCheck.ok) return rateCheck.response;

  const auth = await authenticateBusinessSideRequest(request);
  if (!auth.ok) return auth.response;

  let input: BusinessOrderInput;
  try {
    input = JSON.parse(auth.rawBody || '{}');
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

  const result = await createBusinessOrder(input, idempotencyKey);

  if (!result.ok) {
    return businessError(result.code, result.message, 400);
  }

  const { provider_service_id, ...safeOrder } = result.order as Record<string, unknown>;

  return businessSuccess({
    order: safeOrder,
    fulfillment: result.fulfillment,
    replayed: result.replayed,
  });
}