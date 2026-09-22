import { getSupabaseAdmin } from '@/lib/supabase/server';

export interface WholesaleTier {
  id: string;
  name: string;
  min_quantity: number;
  max_quantity: number | null;
  discount_percent: number;
  applies_to_category: string | null;
}

/**
 * Fetch all wholesale tiers, ordered by min_quantity ascending.
 */
export async function getWholesaleTiers(): Promise<WholesaleTier[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('wholesale_tiers')
    .select('*')
    .order('min_quantity', { ascending: true });

  if (error) throw error;
  return (data ?? []) as WholesaleTier[];
}

/**
 * Find the applicable tier for a given quantity, optionally scoped to a
 * service category. Category-scoped tiers take precedence over global ones.
 */
export function findApplicableTier(
  tiers: WholesaleTier[],
  quantity: number,
  category?: string | null
): WholesaleTier | null {
  if (quantity <= 0) return null;

  // Prefer category-scoped matches, fall back to global.
  const categoryMatch = category
    ? tiers
        .filter(t => t.applies_to_category === category)
        .sort((a, b) => b.min_quantity - a.min_quantity)
        .find(t => quantity >= t.min_quantity && (t.max_quantity === null || quantity <= t.max_quantity)) ?? null
    : null;

  if (categoryMatch) return categoryMatch;

  return (
    tiers
      .filter(t => t.applies_to_category === null)
      .sort((a, b) => b.min_quantity - a.min_quantity)
      .find(t => quantity >= t.min_quantity && (t.max_quantity === null || quantity <= t.max_quantity)) ?? null
  );
}

/**
 * Compute the wholesale price for a given base (retail) price and quantity.
 * Returns the base price unchanged when no tier applies (quantity below the
 * lowest band).
 */
export function applyWholesaleTier(basePrice: number, quantity: number, tiers: WholesaleTier[], category?: string | null): number {
  const tier = findApplicableTier(tiers, quantity, category);
  if (!tier) return basePrice;
  return Math.round(basePrice * (1 - tier.discount_percent / 100) * 100) / 100;
}

/**
 * Convenience: load tiers and compute wholesale price in one call.
 */
export async function getWholesalePrice(serviceId: string, quantity: number): Promise<number> {
  const supabase = getSupabaseAdmin();
  const { data: service } = await supabase
    .from('child_services')
    .select('child_price')
    .eq('id', serviceId)
    .maybeSingle();

  const basePrice = Number(service?.child_price ?? 0);
  const tiers = await getWholesaleTiers();
  return applyWholesaleTier(basePrice, quantity, tiers);
}