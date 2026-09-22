import 'server-only';
import { callJanjez } from '@/lib/janjez-api/client';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { getWholesaleTiers, applyWholesaleTier } from '@/lib/reseller/wholesale';

export interface JanjezService {
  id: string;
  name: string;
  description: string | null;
  price: number;
  min_quantity: number;
  max_quantity: number;
  category: string | null;
}

export interface ImportedService {
  janjez_service_id: string;
  panel_id: string;
  child_price: number;
  child_min_quantity: number;
  child_max_quantity: number;
  custom_name: string | null;
  custom_description: string | null;
  is_visible: boolean;
  is_drip_feed_enabled: boolean;
  display_order: number;
}

// A6e — default markup when no wholesale tier matches the import quantity.
// 50% is within the A5c 100% cap and gives resellers meaningful margin without
// hitting the boundary. A tiered import (bulk quantities) gets a better rate.
const DEFAULT_MARKUP_PERCENT = 50;
// A5c — resellers may not more than double the wholesale base price.
const MAX_MARKUP_PERCENT = 100;

/**
 * Compute the child (reseller) price for a service at a given quantity.
 *
 * A6e alignment with A5:
 *   1. Pull the A5 wholesale tier for the quantity → wholesale base price.
 *   2. Apply the default markup (50%), clamped to the A5c 100% cap.
 *
 * This replaces the old `basePrice * 2` (200% markup) which silently
 * violated the A5c rule and ignored the A5a wholesale tiers entirely.
 *
 * @param basePrice  The Janjez retail price (service.price).
 * @param quantity   The import quantity — determines the wholesale tier.
 */
export async function applyMarkup(basePrice: number, quantity: number): Promise<number> {
  const tiers = await getWholesaleTiers();
  const wholesaleBase = applyWholesaleTier(basePrice, quantity, tiers);
  const markup = Math.min(DEFAULT_MARKUP_PERCENT, MAX_MARKUP_PERCENT);
  return Math.round(wholesaleBase * (1 + markup / 100) * 100) / 100;
}

export async function importServices(
  panelId: string,
  serviceIds?: string[]
): Promise<ImportedService[]> {
  let services: JanjezService[];
  if (serviceIds && serviceIds.length > 0) {
    services = await Promise.all(
      serviceIds.map((id) => callJanjez<JanjezService>({ method: 'GET', path: `/services/${id}` }))
    );
  } else {
    services = await callJanjez<JanjezService[]>({ method: 'GET', path: '/services' });
  }

  const supabase = getSupabaseAdmin();

  // A6e — price each imported service against the wholesale tier for its
  // max_quantity, so bulk imports get the better rate automatically.
  const imported: ImportedService[] = await Promise.all(
    services.map(async (service, index) => ({
      janjez_service_id: service.id ?? '',
      panel_id: panelId,
      child_price: await applyMarkup(service.price ?? 1000, service.max_quantity ?? 10000),
      child_min_quantity: service.min_quantity ?? 10,
      child_max_quantity: service.max_quantity ?? 10000,
      custom_name: null,
      custom_description: null,
      is_visible: false,
      is_drip_feed_enabled: false,
      display_order: index,
    }))
  );

  const { error } = await supabase.from('child_services').insert(imported);
  if (error) {
    throw new Error(`Service import failed: ${error.message}`);
  }

  return imported;
}