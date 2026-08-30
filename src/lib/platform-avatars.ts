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
  "google-maps-reviews": "/icons/services/google-reviews-icon.png",
  "google-maps": "/icons/services/google-reviews-icon.png",
  "google-reviews": "/icons/services/google-reviews-icon.png",
  snapchat: "/icons/services/snapchat.svg",
  linkedin: "/icons/services/linkedin.svg",
};

// Neutral fallback used when a platform slug is unknown or has no dedicated icon.
// Reuses an existing asset so rendering never 404s.
export const DEFAULT_PLATFORM_AVATAR = "/janjez-logo.png";

export function getPlatformAvatar(platform: string): string {
  if (!platform) return DEFAULT_PLATFORM_AVATAR;
  const key = platform.toLowerCase();
  return PLATFORM_AVATARS[key] ?? DEFAULT_PLATFORM_AVATAR;
}
