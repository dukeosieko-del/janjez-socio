import type { MetadataRoute } from "next";

interface SitemapRoute {
  path: string;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
  priority: number;
}

interface Platform {
  slug: string;
  name: string;
  category: string;
}

const PLATFORMS: Platform[] = [
  { slug: "youtube", name: "YouTube", category: "video" },
  { slug: "instagram", name: "Instagram", category: "social" },
  { slug: "tiktok", name: "TikTok", category: "video" },
  { slug: "facebook", name: "Facebook", category: "social" },
  { slug: "x", name: "X (Twitter)", category: "social" },
  { slug: "telegram", name: "Telegram", category: "messaging" },
  { slug: "whatsapp", name: "WhatsApp", category: "messaging" },
  { slug: "google-maps", name: "Google Maps", category: "local" },
  { slug: "snapchat", name: "Snapchat", category: "social" },
  { slug: "linkedin", name: "LinkedIn", category: "professional" },
];

const STATIC_ROUTES: SitemapRoute[] = [
  { path: "/", changeFrequency: "daily", priority: 1.0 },
  { path: "/services", changeFrequency: "daily", priority: 0.9 },
  ...PLATFORMS.map((p): SitemapRoute => ({
    path: `/services/${p.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  })),
  { path: "/how-it-works", changeFrequency: "monthly", priority: 0.7 },
  { path: "/why-choose-us", changeFrequency: "monthly", priority: 0.7 },
  { path: "/faq", changeFrequency: "monthly", priority: 0.7 },
  { path: "/contact-us", changeFrequency: "monthly", priority: 0.7 },
  { path: "/reseller-and-api", changeFrequency: "monthly", priority: 0.7 },
  { path: "/instagram-setup-guide", changeFrequency: "monthly", priority: 0.7 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.7 },
  { path: "/terms-of-service", changeFrequency: "yearly", priority: 0.3 },
  { path: "/privacy-policy", changeFrequency: "yearly", priority: 0.3 },
];

export function getStaticRoutes(): SitemapRoute[] {
  return STATIC_ROUTES;
}

export function getPlatforms(): Platform[] {
  return PLATFORMS;
}

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function generateSitemapXml(routes: SitemapRoute[], baseUrl: string): string {
  const urls = routes
    .map((route) => {
      const loc = escapeXml(`${baseUrl}${route.path}`);
      const lastmod = new Date().toISOString();
      return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${route.changeFrequency}</changefreq>
    <priority>${route.priority.toFixed(1)}</priority>
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}
