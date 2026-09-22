import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireScope, paginate, ok, err } from '@/lib/business-side/route-helpers';

/**
 * GET /api/business/v1/products
 * Product catalogue — active services with pricing.
 */
export async function GET(req: NextRequest) {
  const ctx = await requireScope(req, 'services:read');
  if (!ctx.ok) return ctx.response;

  const { page, limit, offset } = paginate(req, 50, 200);
  const supabase = createAdminClient();
  if (!supabase) return err('SERVER_MISCONFIGURED', 'Database client unavailable.', 500);

  const { data, error, count } = await supabase
    .from('janjez_services')
    .select('id, name, slug, category, subcategory, description, selling_price_ksh, min_quantity, max_quantity, is_active, display_order, supports_drip_feed, supports_refill, supports_cancel', { count: 'exact', head: false })
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .order('name', { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) return err('FETCH_FAILED', error.message, 500);
  return ok(data ?? [], { page, limit, total: count ?? data?.length ?? 0 });
}