import { normalizeProviderCategory, inferSubcategoryFromProviderName } from "@/lib/taxonomy";

export interface NormalizedService {
  platform_id: string;
  platform_name: string;
  subcategory: string;
  deliverable_name: string;
  provider_service_id: string;
  provider_rate: string;
  min_quantity: number;
  max_quantity: number;
  refill: boolean;
  cancel: boolean;
  raw_name: string;
  raw_category: string;
}

export function normalizeProviderService(
  providerService: {
    service: number | string;
    name: string;
    category: string;
    rate: string;
    min: string;
    max: string;
    refill: boolean;
    cancel: boolean;
    raw?: Record<string, unknown>;
  }
): NormalizedService | null {
  const platformId = normalizeProviderCategory(providerService.category);

  if (!platformId) return null;

  const platformName = getPlatformDisplayName(platformId, providerService.category);
  const subcategory = inferSubcategoryFromProviderName(platformId, providerService.name);
  const deliverableName = providerService.name;

  const minQty = parseInt(providerService.min, 10) || 10;
  const maxQty = parseInt(providerService.max, 10) || 10000;

  return {
    platform_id: platformId,
    platform_name: platformName,
    subcategory,
    deliverable_name: deliverableName,
    provider_service_id: String(providerService.service),
    provider_rate: providerService.rate,
    min_quantity: Math.max(10, minQty),
    max_quantity: Math.max(minQty, maxQty),
    refill: providerService.refill,
    cancel: providerService.cancel,
    raw_name: providerService.name,
    raw_category: providerService.category,
  };
}

export function normalizeProviderServices(
  services: Array<{
    service: number | string;
    name: string;
    category: string;
    rate: string;
    min: string;
    max: string;
    refill: boolean;
    cancel: boolean;
    raw?: Record<string, unknown>;
  }>
): NormalizedService[] {
  return services
    .map((s) => normalizeProviderService(s))
    .filter((s): s is NormalizedService => s !== null);
}

function getPlatformDisplayName(platformId: string, rawCategory: string): string {
  const displayMap: Record<string, string> = {
    facebook: "Facebook",
    tiktok: "TikTok",
    instagram: "Instagram",
    youtube: "YouTube",
    whatsapp: "WhatsApp",
    telegram: "Telegram",
    x: "X",
    "google-maps": "Google Maps",
  };

  if (displayMap[platformId]) return displayMap[platformId];

  return rawCategory.trim();
}
