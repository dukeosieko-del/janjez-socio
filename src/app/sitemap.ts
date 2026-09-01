import type { MetadataRoute } from "next";
import { SITE_URL } from "@/app/lib/config";
import { getStaticRoutes } from "@/lib/seo/sitemap-helpers";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = getStaticRoutes();
  return routes.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
