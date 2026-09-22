import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireScope, paginate, ok, err } from '@/lib/business-side/route-helpers';

/**
 * GET /api/business/v1/categories
 * Service categories available for browsing and import.
 *
 * Aggregated from janjez_services.category (the main-build catalogue table).
 */
export async function GET(req: NextRequest) {
  const ctx = await requireScope(req, 'services:read');
  if (!ctx.ok) return ctx.response;

  const supabase = createAdminClient();
  if (!supabase) return err('SERVER_MISCONFIGURED', 'Database client unavailable.', 500);

  const { data, error } = await supabase
    .from('janjez_services')
    .select('category, name, slug, selling_price_ksh, min_quantity, max_quantity, is_active')
    .eq('is_active', true)
    .order('category', { ascending: true })
    .order('name', { ascending: true });

  if (error) return err('FETCH_FAILED', error.message, 500);

  const byCategory: Record<string, unknown[]> = {};
  for (const row of data ?? []) {
    const r = row as Record<string, unknown>;
    const cat = (r.category as string) ?? 'uncategorized';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(row);
  }

  return ok({ categories: byCategory, flat: data ?? [] });
}