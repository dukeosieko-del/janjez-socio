import { NextResponse, NextRequest } from "next/server";
import { listJanjezServices } from "@/lib/janzez-services";
import { getPlatformAvatar } from "@/lib/platform-avatars";
import { matchPlatform } from "@/lib/service-queries";
import { normalizeSlug } from "@/lib/janzez-services";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const placement = searchParams.get("placement") as "show_sidebar" | "show_landing" | "show_guarded" | "show_anonymous" | "show_catalogue" | null;
    const services = await listJanjezServices(true, placement || "show_sidebar");

    const categoryMap = new Map<string, { name: string; icon: string; href: string; subcategories: Map<string, { name: string; href: string; count: number }> }>();

    for (const svc of services) {
      const platformSlug = matchPlatform(svc.category) || svc.category.toLowerCase();
      const catKey = platformSlug;
      if (!categoryMap.has(catKey)) {
        categoryMap.set(catKey, {
          name: platformSlug.charAt(0).toUpperCase() + platformSlug.slice(1).replace(/-/g, " "),
          icon: getPlatformAvatar(platformSlug),
          href: `/services/${platformSlug}`,
          subcategories: new Map(),
        });
      }

      const category = categoryMap.get(catKey)!;
      const subName = svc.subcategory || "General";
      const subKey = normalizeSlug(subName);

      if (!category.subcategories.has(subKey)) {
        category.subcategories.set(subKey, {
          name: subName,
          href: `/services/${platformSlug}/${subKey}`,
          count: 0,
        });
      }

      category.subcategories.get(subKey)!.count += 1;
    }

    const items = Array.from(categoryMap.values()).map((cat) => ({
      label: cat.name,
      icon: cat.icon,
      href: cat.href,
      children: Array.from(cat.subcategories.values())
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((sub) => ({
          label: `${sub.name} (${sub.count})`,
          href: sub.href,
        })),
    }));

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Sidebar catalogue error:", error);
    return NextResponse.json({ error: "Failed to load sidebar" }, { status: 500 });
  }
}
