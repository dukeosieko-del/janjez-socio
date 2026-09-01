/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://janjez.social",
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      { userAgent: "*", allow: "/", disallow: ["/api/", "/admin/", "/dashboard/", "/auth/"] },
      { userAgent: "Googlebot", allow: "/", disallow: ["/api/", "/admin/", "/dashboard/"] },
      { userAgent: "Bingbot", allow: "/", disallow: ["/api/", "/admin/"] },
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "ChatGPT-User", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "anthropic-ai", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
      { userAgent: "CCBot", allow: "/" },
      { userAgent: "Applebot-Extended", allow: "/" },
      { userAgent: "Bytespider", disallow: "/" },
      { userAgent: "FacebookBot", allow: "/" },
    ],
    additionalSitemaps: [],
  },
  exclude: ["/api/*", "/admin/*", "/dashboard/*", "/auth/*"],
  generateIndexSitemap: false,
  outDir: "public",
  sourceDir: ".next/server/app",
};
