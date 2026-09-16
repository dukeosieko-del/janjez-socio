import { NextRequest } from 'next/server';
import { authenticateBusinessSideRequest } from '@/lib/business-side/auth';
import { businessRateLimit } from '@/lib/business-side/rate-limit';
import { businessSuccess, businessError } from '@/lib/business-side/response';
import { getBusinessOrder } from '@/lib/business-side/orders';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateCheck = businessRateLimit(request);
  if (!rateCheck.ok) return rateCheck.response;

  const auth = await authenticateBusinessSideRequest(request);
  if (!auth.ok) return auth.response;

  const { id } = await params;

  const order = await getBusinessOrder(id);
  if (!order) {
    return businessError('ORDER_NOT_FOUND', 'Order not found.', 404);
  }

  // Strip provider_service_id before returning to island
  const { provider_service_id, ...safeOrder } = order as Record<string, unknown>;

  return businessSuccess(safeOrder);
}