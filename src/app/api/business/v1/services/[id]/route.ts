import { NextRequest } from 'next/server';
import { authenticateBusinessSideRequest } from '@/lib/business-side/auth';
import { businessRateLimit } from '@/lib/business-side/rate-limit';
import { businessSuccess, businessError } from '@/lib/business-side/response';
import { toBusinessService } from '@/lib/business-side/services';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateCheck = businessRateLimit(request);
  if (!rateCheck.ok) return rateCheck.response;

  const auth = await authenticateBusinessSideRequest(request);
  if (!auth.ok) return auth.response;

  const { id } = await params;

  const supabase = createAdminClient();
  if (!supabase) {
    return businessError('SERVER_MISCONFIGURED', 'Database client unavailable.', 500);
  }

  const { data, error } = await supabase
    .from('janjez_services')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    return businessError('DB_ERROR', error.message, 500);
  }
  if (!data) {
    return businessError('SERVICE_NOT_FOUND', 'Service not found.', 404);
  }

  return businessSuccess(toBusinessService(data));
}