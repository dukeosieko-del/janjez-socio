export function getCategoryIcon(platformId: string): string {
  const iconMap: Record<string, string> = {
    facebook: "/icons/services/facebook.svg",
    tiktok: "/icons/services/tiktok.svg",
    instagram: "/icons/services/instagram.svg",
    youtube: "/icons/services/youtube.svg",
    whatsapp: "/icons/services/whatsapp.svg",
    telegram: "/icons/services/telegram.svg",
    x: "/icons/services/x.svg",
    "google-maps": "/icons/services/google-maps.svg",
    "google-maps-reviews": "/icons/services/google-reviews-icon.png",
  };

  return iconMap[platformId] || "/globe.svg";
}
