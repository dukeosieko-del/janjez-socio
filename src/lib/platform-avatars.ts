// Canonical platform-avatar mapping.
//
// This is the SINGLE source of truth for which icon asset represents each
// supported platform across the application (service catalog, platform pages,
// subcategory pages, service detail pages, and navigation/search).
//
// Icons live under /icons/services/ so that every surface resolves the same
// asset path for a given platform and we avoid duplicate avatar systems.
export const PLATFORM_AVATARS: Record<string, string> = {
  facebook: "/icons/services/facebook.svg",
  tiktok: "/icons/services/tiktok.svg",
  instagram: "/icons/services/instagram.svg",
  youtube: "/icons/services/youtube.svg",
  whatsapp: "/icons/services/whatsapp.svg",
  telegram: "/icons/services/telegram.svg",
  x: "/icons/services/x-icon.webp",
  twitter: "/icons/services/x-icon.webp",
  "x-twitter": "/icons/services/x-icon.webp",
  // "Others" is a virtual container, not a mapped social-media platform.
  others: "/janjez-logo.png",
  "google-maps-reviews": "/icons/services/google-reviews-icon.png",
  "google-maps": "/icons/services/google-reviews-icon.png",
  "google-reviews": "/icons/services/google-reviews-icon.png",
};

// Neutral fallback used when a platform slug is unknown or has no dedicated icon.
// Reuses an existing asset so rendering never 404s.
export const DEFAULT_PLATFORM_AVATAR = "/janjez-logo.png";

// Canonical display labels for the seven primary social categories (correct
// brand casing). Used for grid cards, page headings, breadcrumbs, and SEO.
export const PLATFORM_LABELS: Record<string, string> = {
  youtube: "YouTube",
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  telegram: "Telegram",
  x: "X",
  others: "Others",
};

export function getPlatformAvatar(platform: string): string {
  if (!platform) return DEFAULT_PLATFORM_AVATAR;
  const key = platform.toLowerCase();
  return PLATFORM_AVATARS[key] ?? DEFAULT_PLATFORM_AVATAR;
}

export function getPlatformLabel(platform: string): string {
  if (!platform) return "Service";
  const key = platform.toLowerCase();
  if (PLATFORM_LABELS[key]) return PLATFORM_LABELS[key];
  return key.charAt(0).toUpperCase() + key.slice(1).replace(/-/g, " ");
}
