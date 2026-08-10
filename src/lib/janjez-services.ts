export interface JanjezService {
  id: string;
  name: string;
  slug: string;
  category: string;
  subcategory?: string;
  description?: string;
  selling_price_ksh: number;
  provider_service_id: string;
  min_quantity: number;
  max_quantity: number;
  is_active: boolean;
  display_order: number;
  supports_drip_feed: boolean;
  supports_refill: boolean;
  supports_cancel: boolean;
  created_at: string;
  updated_at: string;
  provider_service?: {
    id: string;
    name: string;
    category: string;
    rate: number;
    min_quantity: number;
    max_quantity: number;
    supports_refill: boolean;
    supports_cancel: boolean;
    supports_drip_feed: boolean;
  };
}

export async function fetchJanjezServices(category?: string): Promise<JanjezService[]> {
  const url = new URL("/api/services", window.location.origin);
  if (category) url.searchParams.set("category", category);

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error("Failed to fetch services");
  }

  const data = await res.json();
  return data.services || [];
}

export async function fetchJanjezServiceById(id: string): Promise<JanjezService | null> {
  const res = await fetch(`/api/services/${encodeURIComponent(id)}`);
  if (!res.ok) {
    return null;
  }
  const data = await res.json();
  return data.service || null;
}

export function getServiceById(services: JanjezService[], id: string): JanjezService | undefined {
  return services.find(s => s.id === id);
}

export function getServicesByCategory(services: JanjezService[], category: string): JanjezService[] {
  return services.filter(s => s.category === category || s.category.toLowerCase() === category.toLowerCase());
}
