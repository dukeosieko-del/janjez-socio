import { createAdminClient } from "@/lib/supabase/admin";
import { fetchProviderServices } from "@/lib/smm/provider";
import { getJanjezSellingPrice } from "@/lib/pricing";

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
  show_sidebar: boolean;
  show_landing: boolean;
  show_guarded: boolean;
  show_anonymous: boolean;
  show_catalogue: boolean;
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

export async function listJanjezServices(activeOnly: boolean = false, placement?: keyof Pick<JanjezService, "show_sidebar" | "show_landing" | "show_guarded" | "show_anonymous" | "show_catalogue">): Promise<JanjezService[]> {
  const supabase = createAdminClient();
  if (!supabase) return [];

  let query = supabase
    .from("janjez_services")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (activeOnly) {
    query = query.eq("is_active", true);
  }

  if (placement) {
    query = query.eq(placement, true);
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
    .from("janjez_services")
    .select("*")
    .eq("id", id)
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
  show_sidebar?: boolean;
  show_landing?: boolean;
  show_guarded?: boolean;
  show_anonymous?: boolean;
  show_catalogue?: boolean;
}): Promise<JanjezService | { error: string }> {
  const supabase = createAdminClient();
  if (!supabase) return { error: "Server misconfigured" };

  const { data, error } = await supabase
    .from("janjez_services")
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
      show_sidebar: input.show_sidebar ?? false,
      show_landing: input.show_landing ?? false,
      show_guarded: input.show_guarded ?? true,
      show_anonymous: input.show_anonymous ?? true,
      show_catalogue: input.show_catalogue ?? true,
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
  show_sidebar: boolean;
  show_landing: boolean;
  show_guarded: boolean;
  show_anonymous: boolean;
  show_catalogue: boolean;
}>): Promise<JanjezService | { error: string }> {
  const supabase = createAdminClient();
  if (!supabase) return { error: "Server misconfigured" };

  const { data, error } = await supabase
    .from("janjez_services")
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
    .from("janjez_services")
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
