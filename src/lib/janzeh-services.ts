import { createAdminClient } from "@/lib/supabase/admin";
import { fetchProviderServices } from "@/lib/smm/provider";

export interface JanjezService {
  id: string;
  name: string;
  slug: string;
  category: string;
  subcategory: string | null;
  description: string | null;
  selling_price_ksh: number;
  provider_service_id: string | null;
  min_quantity: number;
  max_quantity: number;
  is_active: boolean;
  display_order: number;
  supports_drip_feed: boolean;
  supports_refill: boolean;
  supports_cancel: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProviderServiceRow {
  id: string;
  name: string;
  type: string | null;
  category: string | null;
  rate: number;
  min: number;
  max: number;
  refill: boolean;
  cancel: boolean;
  supports_drip_feed: boolean;
  is_active: boolean;
  fetched_at: string;
  raw: unknown;
}

export async function listProviderServices(params: {
  search?: string;
  category?: string;
  supportsDripFeed?: boolean;
}): Promise<ProviderServiceRow[]> {
  const supabase = createAdminClient();
  if (!supabase) return [];

  let query = supabase
    .from("provider_services")
    .select("*");

  if (params.search) {
    query = query.or(`name.ilike.%${params.search}%,id.ilike.%${params.search}%`);
  }

  if (params.category) {
    query = query.ilike("category", `%${params.category}%`);
  }

  if (params.supportsDripFeed) {
    query = query.eq("supports_drip_feed", true);
  }

  const { data, error } = await query.order("rate", { ascending: true });
  if (error) {
    console.error("listProviderServices error:", error);
    return [];
  }

  return (data || []) as unknown as ProviderServiceRow[];
}

export async function listJanjezServices(activeOnly: boolean = false): Promise<JanjezService[]> {
  const supabase = createAdminClient();
  if (!supabase) return [];

  let query = supabase
    .from("janjeh_services")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (activeOnly) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;
  if (error) {
    console.error("listJanjezServices error:", error);
    return [];
  }

  return (data || []) as unknown as JanjezService[];
}

export async function getJanjezService(id: string): Promise<JanjezService | null> {
  const supabase = createAdminClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("janjeh_services")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as unknown as JanjezService;
}

// Canonical list of the seven primary social-media service categories.
// Order preserves the existing platform-grid ordering. Any Admin-published
// category outside this set is grouped under the virtual "Others" bucket.
export const PRIMARY_SOCIAL_CATEGORIES: readonly string[] = [
  "youtube",
  "whatsapp",
  "instagram",
  "facebook",
  "tiktok",
  "telegram",
  "x",
];

export function isPrimaryCategory(category: string): boolean {
  return PRIMARY_SOCIAL_CATEGORIES.includes(category);
}

// Resolves the canonical platform bucket for a service's category.
export function getPlatformBucket(category: string): string {
  return isPrimaryCategory(category) ? category : "others";
}

// The grouping key used within a platform bucket's subcategory navigation.
// Primary platforms group by their `subcategory` (defaulting to "General");
// "Others" groups by the service's raw `category` so each non-primary
// platform surfaces as its own subcategory row.
export function getSubcategoryKey(service: JanjezService, platform: string): string {
  if (platform === "others") return service.category;
  return service.subcategory && service.subcategory.trim() !== "" ? service.subcategory : "General";
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, "-");
}

// Canonical detail URL for a Janjeh service record. Routing is driven by the
// service `id` (UUID, unique, canonical) so clicks never 404 on slug/empty-key
// mismatches or on the virtual "others" bucket.
export function getServiceDetailPath(service: JanjezService): string {
  const platform = getPlatformBucket(service.category);
  const subKey = getSubcategoryKey(service, platform);
  return `/services/${platform}/${slugify(subKey)}/${service.id}`;
}

// Resolve a single active Janjeh service by its canonical `id`.
export async function getActiveJanjezService(id: string): Promise<JanjezService | null> {
  const supabase = createAdminClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("janjeh_services")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (error || !data) return null;
  return data as unknown as JanjezService;
}

export async function createJanjezService(input: {
  name: string;
  slug: string;
  category: string;
  subcategory?: string;
  description?: string;
  selling_price_ksh: number;
  provider_service_id?: string | null;
  min_quantity: number;
  max_quantity: number;
  is_active?: boolean;
  display_order?: number;
  supports_drip_feed?: boolean;
  supports_refill?: boolean;
  supports_cancel?: boolean;
}): Promise<JanjezService | { error: string }> {
  const supabase = createAdminClient();
  if (!supabase) return { error: "Server misconfigured" };

  const { data, error } = await supabase
    .from("janjeh_services")
    .insert({
      name: input.name,
      slug: input.slug,
      category: input.category,
      subcategory: input.subcategory || null,
      description: input.description || null,
      selling_price_ksh: input.selling_price_ksh,
      provider_service_id: input.provider_service_id || null,
      min_quantity: input.min_quantity,
      max_quantity: input.max_quantity,
      is_active: input.is_active ?? true,
      display_order: input.display_order ?? 0,
      supports_drip_feed: input.supports_drip_feed ?? false,
      supports_refill: input.supports_refill ?? false,
      supports_cancel: input.supports_cancel ?? false,
    })
    .select("*")
    .single();

  if (error) return { error: error.message };
  return data as unknown as JanjezService;
}

export async function updateJanjezService(id: string, input: Partial<{
  name: string;
  slug: string;
  category: string;
  subcategory: string | null;
  description: string | null;
  selling_price_ksh: number;
  provider_service_id: string | null;
  min_quantity: number;
  max_quantity: number;
  is_active: boolean;
  display_order: number;
  supports_drip_feed: boolean;
  supports_refill: boolean;
  supports_cancel: boolean;
}>): Promise<JanjezService | { error: string }> {
  const supabase = createAdminClient();
  if (!supabase) return { error: "Server misconfigured" };

  const { data, error } = await supabase
    .from("janjeh_services")
    .update(input)
    .eq("id", id)
    .select("*")
    .single();

  if (error) return { error: error.message };
  return data as unknown as JanjezService;
}

export async function deleteJanjezService(id: string): Promise<void | { error: string }> {
  const supabase = createAdminClient();
  if (!supabase) return { error: "Server misconfigured" };

  const { error } = await supabase
    .from("janjeh_services")
    .update({ is_active: false })
    .eq("id", id);

  if (error) return { error: error.message };
}

export async function getProviderCatalogFresh(): Promise<ProviderServiceRow[]> {
  const services = await fetchProviderServices();
  return services.map((s) => ({
    id: String(s.service),
    name: s.name,
    type: s.type,
    category: s.category,
    rate: parseFloat(s.rate),
    min: parseInt(s.min, 10),
    max: parseInt(s.max, 10),
    refill: s.refill,
    cancel: s.cancel,
    supports_drip_feed: s.dripfeed === true,
    is_active: true,
    fetched_at: new Date().toISOString(),
    raw: s,
  }));
}
