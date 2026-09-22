import { NextRequest } from 'next/server';
import { authenticateBusinessSideRequest } from '@/lib/business-side/auth';
import { businessRateLimit } from '@/lib/business-side/rate-limit';
import { businessSuccess, businessError } from '@/lib/business-side/response';
import { toBusinessService } from '@/lib/business-side/services';
import { createAdminClient } from '@/lib/supabase/admin';

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 200;

export async function GET(request: NextRequest) {
  const rateCheck = businessRateLimit(request);
  if (!rateCheck.ok) return rateCheck.response;

  const auth = await authenticateBusinessSideRequest(request);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, parseInt(searchParams.get('page_size') ?? String(DEFAULT_PAGE_SIZE), 10))
  );
  const category = searchParams.get('category') ?? '';
  const search = searchParams.get('search') ?? '';
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const supabase = createAdminClient();
  if (!supabase) {
    return businessError('SERVER_MISCONFIGURED', 'Database client unavailable.', 500);
  }

  let query = supabase
    .from('janjez_services')
    .select('*', { count: 'exact' })
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .order('name', { ascending: true })
    .range(from, to);

  if (category) {
    query = query.eq('category', category);
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    return businessError('DB_ERROR', error.message, 500);
  }

  const services = (data ?? []).map(toBusinessService);
  const totalPages = count ? Math.ceil(count / pageSize) : 0;

  return businessSuccess({
    services,
    pagination: {
      page,
      page_size: pageSize,
      total: count ?? 0,
      total_pages: totalPages,
      has_next: page < totalPages,
      has_prev: page > 1,
    },
  });
}