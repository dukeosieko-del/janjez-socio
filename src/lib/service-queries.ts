const SERVICES_CACHE_KEY = "janjez-service-catalogue";
const CACHE_TTL_MS = 60_000;

export async function getServiceCatalogue(placement?: string): Promise<Array<{
  id: string;
  serviceId: string;
  categoryId: string;
  name: string;
  description: string;
  rate: number;
  min: number;
  max: number;
  refill: string;
  requiresLink: boolean;
  requiresComments: boolean;
  speed: string;
  startTime: string;
  notice: string;
  monetizable: boolean;
  slug: string;
  subcategory: string | null;
  provider_service_id: string | null;
  supports_drip_feed: boolean;
  supports_refill: boolean;
  supports_cancel: boolean;
  display_order: number;
}>> {
  const cached = typeof window !== "undefined" ? sessionStorage.getItem(SERVICES_CACHE_KEY) : null;
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (parsed.timestamp && Date.now() - parsed.timestamp < CACHE_TTL_MS) {
        return parsed.services;
      }
    } catch {
      // ignore parse errors
    }
  }

  const url = new URL("/api/services/catalogue", window.location.origin);
  if (placement) {
    url.searchParams.set("placement", placement);
  }

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Failed to load service catalogue");
  }

  const data = await res.json();
  const services = data.services || [];

  if (typeof window !== "undefined") {
    sessionStorage.setItem(SERVICES_CACHE_KEY, JSON.stringify({ services, timestamp: Date.now() }));
  }

  return services;
}

export function getServicesByCategory(services: Array<{ categoryId: string; id: string; name: string }>, categoryId: string) {
  return services.filter((s) => s.categoryId === categoryId);
}

export function getServicesByPlatform(services: Array<{ categoryId: string; id: string; name: string }>, platformSlug: string) {
  const slug = platformSlug.toLowerCase();
  return services.filter((s) => s.categoryId.toLowerCase().includes(slug));
}

export function getServicesBySubcategory(services: Array<{ categoryId: string; subcategory: string | null; id: string; name: string }>, subcategorySlug: string) {
  const slug = subcategorySlug.toLowerCase().replace(/-/g, " ");
  return services.filter((s) => {
    const cat = s.categoryId.toLowerCase();
    const sub = (s.subcategory || "").toLowerCase();
    return cat.includes(slug) || sub.includes(slug);
  });
}

export const KNOWN_PLATFORMS = [
  "youtube",
  "whatsapp",
  "instagram",
  "facebook",
  "tiktok",
  "telegram",
  "google-maps-reviews",
  "x",
];

export function isKnownPlatform(platform: string): boolean {
  return KNOWN_PLATFORMS.includes(platform);
}

export function matchPlatform(category: string): string | null {
  const lower = category.toLowerCase();
  const aliases: Record<string, string> = {
    "google-maps": "google-maps-reviews",
    "x-twitter": "x",
  };
  if (aliases[lower]) {
    return aliases[lower];
  }
  for (const platform of KNOWN_PLATFORMS) {
    if (lower === platform || lower.includes(platform)) {
      return platform;
    }
  }
  return null;
}

export function categorizeServices(services: Array<{ category: string; id: string; name: string }>): Record<string, Array<{ category: string; id: string; name: string }>> {
  const categorized: Record<string, Array<{ category: string; id: string; name: string }>> = {};
  const others: Array<{ category: string; id: string; name: string }> = [];

  for (const svc of services) {
    const catLower = svc.category.toLowerCase();
    const matched = KNOWN_PLATFORMS.find((p) => catLower.includes(p));
    if (matched) {
      if (!categorized[matched]) categorized[matched] = [];
      categorized[matched].push(svc);
    } else {
      others.push(svc);
    }
  }

  if (others.length > 0) {
    categorized["others"] = others;
  }

  return categorized;
}

export function getServiceById<T extends { id: string }>(services: Array<T>, id: string): T | null {
  return services.find((s) => s.id === id) || null;
}

export async function getAnonymousServices(): Promise<Array<{
  id: string;
  serviceId: string;
  categoryId: string;
  name: string;
  description: string;
  rate: number;
  min: number;
  max: number;
  refill: string;
  requiresLink: boolean;
  requiresComments: boolean;
  speed: string;
  startTime: string;
  notice: string;
  monetizable: boolean;
  slug: string;
  subcategory: string | null;
  supports_drip_feed: boolean;
  supports_refill: boolean;
  supports_cancel: boolean;
  display_order: number;
}>> {
  return getServiceCatalogue("show_anonymous");
}
