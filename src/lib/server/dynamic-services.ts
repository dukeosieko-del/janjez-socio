import { createAdminClient } from "@/lib/supabase/admin";

export interface JanjezService {
  id: string;
  name: string;
  slug: string;
  category: string;
  subcategory: string | null;
  description: string | null;
  selling_price_ksh: number;
  min_quantity: number;
  max_quantity: number;
  is_active: boolean;
  display_order: number;
  supports_drip_feed: boolean;
  supports_refill: boolean;
  supports_cancel: boolean;
}

export interface OrderFormService {
  id: string;
  categoryId: string;
  name: string;
  serviceId: string;
  rate: number;
  min: number;
  max: number;
  description: string;
  refill: string;
  requiresComments?: boolean;
  supports_drip_feed?: boolean;
  janjez_service_id?: string;
}

export async function getActiveJanjezServices(): Promise<OrderFormService[]> {
  const supabase = createAdminClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("janjez_services")
    .select("id, name, slug, category, subcategory, description, selling_price_ksh, min_quantity, max_quantity, is_active, display_order, supports_drip_feed, supports_refill, supports_cancel")
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });

  if (!data) return [];

  return data.map((s) => ({
    id: s.id,
    categoryId: s.category.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name: s.name,
    serviceId: s.id,
    rate: s.selling_price_ksh,
    min: s.min_quantity,
    max: s.max_quantity,
    description: s.description || "",
    refill: s.supports_refill ? "Refill supported" : "No refill",
    requiresComments: false,
    supports_drip_feed: s.supports_drip_feed,
    janjez_service_id: s.id,
  }));
}

export async function getJanjezServicesByCategory(category: string): Promise<OrderFormService[]> {
  const supabase = createAdminClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("janjez_services")
    .select("id, name, slug, category, subcategory, description, selling_price_ksh, min_quantity, max_quantity, is_active, display_order, supports_drip_feed, supports_refill, supports_cancel")
    .eq("is_active", true)
    .ilike("category", `%${category}%`)
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });

  if (!data) return [];

  return data.map((s) => ({
    id: s.id,
    categoryId: s.category.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name: s.name,
    serviceId: s.id,
    rate: s.selling_price_ksh,
    min: s.min_quantity,
    max: s.max_quantity,
    description: s.description || "",
    refill: s.supports_refill ? "Refill supported" : "No refill",
    requiresComments: false,
    supports_drip_feed: s.supports_drip_feed,
    janjez_service_id: s.id,
  }));
}

export async function getJanjezServiceById(id: string): Promise<OrderFormService | null> {
  const supabase = createAdminClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("janjez_services")
    .select("id, name, slug, category, subcategory, description, selling_price_ksh, min_quantity, max_quantity, is_active, display_order, supports_drip_feed, supports_refill, supports_cancel")
    .eq("id", id)
    .single();

  if (!data) return null;

  return {
    id: data.id,
    categoryId: data.category.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name: data.name,
    serviceId: data.id,
    rate: data.selling_price_ksh,
    min: data.min_quantity,
    max: data.max_quantity,
    description: data.description || "",
    refill: data.supports_refill ? "Refill supported" : "No refill",
    requiresComments: false,
    supports_drip_feed: data.supports_drip_feed,
    janjez_service_id: data.id,
  };
}
