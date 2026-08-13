/*
 * Migrate static ORDER_SERVICES and SERVICE_CATALOG into janjez_services.
 *
 * This script reconciles static catalog definitions with provider services
 * already synced into the provider_services table. Services that cannot be
 * matched to a provider service are imported as UNMAPPED (provider_service_id
 * left NULL) and must be manually mapped in the admin panel before publication.
 *
 * Run with: npx tsx src/lib/migrate-catalog.ts
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { ORDER_SERVICES } from "@/lib/data";
import { SERVICE_CATALOG } from "@/lib/service-catalog";
import { slugify } from "@/lib/service-routes";
import { JanjezService } from "@/lib/janzeh-services"

interface ProviderServiceRow {
  id: string;
  name: string;
  category: string | null;
  rate: number;
  min: number;
  max: number;
  refill: boolean;
  cancel: boolean;
  supports_drip_feed: boolean;
  is_active: boolean;
}

function parsePrice(price: string): number {
  const match = price.replace(/[^\d.,]/g, "").match(/([\d,.]+)/);
  if (!match) return 0;
  const num = parseFloat(match[1].replace(/,/g, ""));
  return isNaN(num) ? 0 : num;
}

function matchProviderService(
  service: typeof ORDER_SERVICES[number],
  providerServices: ProviderServiceRow[]
): ProviderServiceRow | null {
  const sid = service.serviceId;

  const byId = providerServices.find((p) => p.id === sid);
  if (byId) return byId;

  const categoryMatch = providerServices
    .filter((p) => p.category?.toLowerCase().includes(service.categoryId.toLowerCase()))
     .sort((a, b) => a.rate - b.rate);

  const nameMatch = categoryMatch.find((p) =>
    p.name.toLowerCase().includes(service.name.toLowerCase().split(" ").slice(1).join(" "))
  );

  return nameMatch || categoryMatch[0] || null;
}

export async function migrateCatalog() {
  const supabase = createAdminClient();
  if (!supabase) {
    throw new Error("Supabase admin client not configured");
  }

  const { data: providerServices, error: psError } = await supabase
    .from("provider_services")
    .select("*")
    .eq("is_active", true);

  if (psError) {
    console.error("Failed to load provider services:", psError);
    return { error: psError.message, migrated: 0, unmapped: 0 };
  }

  const providers = (providerServices || []) as unknown as ProviderServiceRow[];
  const existingSlugMap = new Set<string>();

  const { data: existing } = await supabase
    .from("janjez_services")
    .select("slug");
  for (const row of existing || []) {
    existingSlugMap.add((row as { slug: string }).slug);
  }

  const toCreate: Partial<JanjezService>[] = [];
  let unmapped = 0;

  for (const svc of ORDER_SERVICES) {
    const slug = slugify(`${svc.categoryId}-${svc.id}`);

    if (existingSlugMap.has(slug)) {
      continue;
    }

    const provider = svc.serviceId ? matchProviderService(svc, providers) : null;
    if (!provider) {
      unmapped++;
    }

    const sellingPrice = svc.rate;
    const minQty = svc.min;
    const maxQty = svc.max;

    const subcategories: string[] = [];
    for (const catalogItem of SERVICE_CATALOG) {
      if (catalogItem.id === svc.categoryId) {
        for (const sub of catalogItem.subcategories) {
          const match = sub.deliverables.find(
            (d) => d.name === svc.name || d.name === svc.serviceId
          );
          if (match) {
            subcategories.push(sub.name);
          }
        }
      }
    }

    const subcategory = subcategories.length > 0 ? subcategories[0] : null;
    const description = svc.description;

    toCreate.push({
      name: svc.name,
      slug,
      category: svc.categoryId,
      subcategory,
      description,
      selling_price_ksh: sellingPrice,
      provider_service_id: provider ? provider.id : null,
      min_quantity: minQty,
      max_quantity: maxQty,
      is_active: false,
      display_order: 0,
      supports_drip_feed: provider ? provider.supports_drip_feed : false,
      supports_refill: provider ? provider.refill : svc.refill !== "No refill",
      supports_cancel: provider ? provider.cancel : false,
    });
  }

  if (toCreate.length > 0) {
    const { error } = await supabase.from("janjez_services").insert(toCreate);
    if (error) {
      console.error("Failed to insert services:", error);
      return { error: error.message, migrated: 0, unmapped };
    }
    console.log(`Migrated ${toCreate.length} services (${unmapped} unmapped).`);
    return { migrated: toCreate.length, unmapped };
  }

  console.log("No new services to migrate.");
  return { migrated: 0, unmapped };
}

export default migrateCatalog;
