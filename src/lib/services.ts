import { ORDER_SERVICES } from "./data";
import { SERVICE_CATALOG, type ServiceCatalogItem } from "./service-catalog";

export const HAPPY_HOUR_DISCOUNT = 0.95;

export const CATEGORY_TO_PLATFORM: Record<string, string> = {
  youtube: "youtube",
  "youtube-views": "youtube",
  "youtube-likes": "youtube",
  "youtube-subscribers-2": "youtube",
  "youtube-watch-time": "youtube",
  "youtube-ai-generated-comment-boost-ranking-amp-interaction": "youtube",
  x: "x",
  "x-twitter": "x",
  whatsapp: "whatsapp",
  "whatsapp-channel-followers": "whatsapp",
  "whatsapp-poll-votes": "whatsapp",
  "whatsapp-channel-post-reactions-cheap-slow-server": "whatsapp",
  "whatsapp-channel-post-reactions-instant-server-complete-in-1-minute": "whatsapp",
  "whatsapp-channel-auto-future-post-reactions": "whatsapp",
  facebook: "facebook",
  tiktok: "tiktok",
  instagram: "instagram",
  "google-maps": "google-maps",
  telegram: "telegram",
};

export const CATEGORY_TO_SUBCATEGORY: Record<string, string> = {
  "youtube-views": "Views 👀",
  "youtube-likes": "Likes",
  "youtube-subscribers-2": "Subscribers",
  "youtube-watch-time": "Watch Time",
  "youtube-ai-generated-comment-boost-ranking-amp-interaction": "AI-Generated Comment",
  "whatsapp-channel-followers": "Channel Followers",
  "whatsapp-poll-votes": "Poll Votes",
  "whatsapp-channel-post-reactions-cheap-slow-server": "Channel Post Reactions (instant, 1 min)",
  "whatsapp-channel-post-reactions-instant-server-complete-in-1-minute": "Channel Post Reactions (instant, 1 min)",
  "whatsapp-channel-auto-future-post-reactions": "Channel Auto Future Post Reactions",
};

export function calculatePrice(rate: number, quantity: number): number {
  return rate * quantity * HAPPY_HOUR_DISCOUNT;
}

export function parsePrice(priceString: string): number {
  const match = priceString.match(/([\d,.]+)/);
  if (!match) return 0;
  return parseFloat(match[1].replace(/,/g, ""));
}

export function resolvePlatformId(categoryId: string): string {
  return CATEGORY_TO_PLATFORM[categoryId] ?? categoryId;
}

export function resolveCategoryName(categoryId: string): string {
  const platformId = resolvePlatformId(categoryId);
  const catalogItem = SERVICE_CATALOG.find((c) => c.id === platformId);
  if (catalogItem) return catalogItem.name;
  return categoryId.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

export function resolveSubcategoryName(categoryId: string, serviceId: string): string {
  const catalogItem = SERVICE_CATALOG.find((c) => c.id === categoryId);
  if (catalogItem) {
    for (const sub of catalogItem.subcategories) {
      const match = sub.deliverables.find((d) => d.name === serviceId);
      if (match) return sub.name;
    }
  }

  const mapped = CATEGORY_TO_SUBCATEGORY[categoryId];
  if (mapped) return mapped;

  const platformId = resolvePlatformId(categoryId);
  const platformItem = SERVICE_CATALOG.find((c) => c.id === platformId);
  if (platformItem) {
    for (const sub of platformItem.subcategories) {
      const match = sub.deliverables.find((d) => d.name === serviceId);
      if (match) return sub.name;
    }
  }

  return categoryId.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

export function resolveSkuId(skuId?: string): string | null {
  return skuId ?? null;
}

function normalizeRefill(refill: string | undefined): string {
  if (!refill) return "none";
  const lower = refill.toLowerCase();
  if (lower.includes("no refill") || lower.includes("no warranty")) return "none";
  if (lower.includes("lifetime")) return "lifetime";
  if (lower.includes("30-day") || lower.includes("30 day")) return "30-day";
  if (lower.includes("60 day")) return "60-day";
  return "standard";
}

export function resolveRefillGuarantee(categoryId: string, serviceId: string): string {
  const service = ORDER_SERVICES.find(
    (s) =>
      s.categoryId === categoryId &&
      (s.id === serviceId || s.serviceId === serviceId || s.name === serviceId)
  );
  if (service) {
    return normalizeRefill(service.refill);
  }

  const anyService = ORDER_SERVICES.find(
    (s) => s.id === serviceId || s.serviceId === serviceId || s.name === serviceId
  );
  if (anyService) {
    return normalizeRefill(anyService.refill);
  }

  const platformId = resolvePlatformId(categoryId);
  const catalogItem = SERVICE_CATALOG.find((c) => c.id === platformId);
  if (catalogItem) {
    for (const sub of catalogItem.subcategories) {
      const match = sub.deliverables.find((d) => d.name === serviceId);
      if (match) {
        return normalizeRefill(match.name);
      }
    }
  }

  return "none";
}

export function requiresSkuSelection(categoryId: string): boolean {
  const platformId = resolvePlatformId(categoryId);
  const catalogItem = SERVICE_CATALOG.find((c) => c.id === platformId);
  if (!catalogItem) return false;
  return catalogItem.subcategories.some((s) => s.deliverables.length > 1);
}

export function findServiceRate(
  catalogCategoryId: string | undefined,
  skuId: string | null | undefined
): number | null {
  if (!catalogCategoryId) return null;

  if (skuId) {
    const service = ORDER_SERVICES.find(
      (s) =>
        s.categoryId === catalogCategoryId &&
        (s.id === skuId || s.serviceId === skuId || s.name === skuId)
    );
    if (service) return service.rate;
  }

  const platformId = resolvePlatformId(catalogCategoryId);
  const catalogItem = SERVICE_CATALOG.find((c) => c.id === platformId);
  if (catalogItem && skuId) {
    for (const sub of catalogItem.subcategories) {
      const match = sub.deliverables.find((d) => d.name === skuId);
      if (match) {
        const rate = parsePrice(match.price);
        if (rate > 0) return rate;
      }
    }
  }

  if (ORDER_SERVICES.length > 0) {
    const catServices = ORDER_SERVICES.filter((s) => s.categoryId === catalogCategoryId);
    if (catServices.length === 1) return catServices[0].rate;
  }

  return null;
}

export function calculateExpectedAmount(
  catalogCategoryId: string | undefined,
  skuId: string | null | undefined,
  quantity: number
): number {
  const rate = findServiceRate(catalogCategoryId, skuId);
  if (rate === null) return NaN;
  return calculatePrice(rate, quantity);
}

export type { ServiceCatalogItem };
export { SERVICE_CATALOG, ORDER_SERVICES };
