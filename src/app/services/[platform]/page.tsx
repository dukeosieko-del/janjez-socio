import AnnouncementBanner from "@/components/AnnouncementBanner";
import LiveTicker from "@/components/LiveTicker";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { listJanjezServices } from "@/lib/janjez-services";
import { JanjezService } from "@/lib/janjez-services";
import { getPlatformAvatar } from "@/lib/platform-avatars";
import { PLATFORMS } from "@/lib/data";
import { KNOWN_PLATFORMS } from "@/lib/service-queries";
import type { Metadata } from "next";

export const revalidate = 0;

const KNOWN_PLATFORM_IDS = PLATFORMS.map((p) => p.id);

function isKnownPlatform(platform: string): boolean {
  return KNOWN_PLATFORM_IDS.includes(platform);
}

function matchPlatform(category: string): string | null {
  const lower = category.toLowerCase();
  for (const platform of KNOWN_PLATFORMS) {
    if (lower.includes(platform)) {
      return platform;
    }
  }
  return null;
}

export async function generateMetadata({ params }: { params: Promise<{ platform: string }> }): Promise<Metadata> {
  const { platform } = await params;
  const platformName = platform.charAt(0).toUpperCase() + platform.slice(1).replace(/-/g, " ");
  return {
    title: `${platformName} Services | Janjez`,
    description: `Buy ${platformName} followers, likes, views, and more. Fast delivery, 30-day refill guarantee.`,
    alternates: { canonical: `https://janjez.social/services/${platform}` },
  };
}

interface PlatformPageProps {
  params: Promise<{ platform: string }>;
}

async function getSubcategories(platform: string): Promise<Array<{ name: string; count: number; slug: string }>> {
  const services = await listJanjezServices(true, "show_catalogue");
  const filtered = isKnownPlatform(platform)
    ? services.filter((s) => matchPlatform(s.category) === platform)
    : services.filter((s) => !isKnownPlatform(s.category) && !matchPlatform(s.category));
  const subMap = new Map<string, number>();
  for (const svc of filtered) {
    const key = svc.subcategory || "General";
    subMap.set(key, (subMap.get(key) || 0) + 1);
  }
  const result = Array.from(subMap.entries()).map(([name, count]) => ({ name, count, slug: name.toLowerCase().replace(/\s+/g, "-") }));
  if (filtered.length > 0 && result.length === 0) {
    result.push({ name: "All Services", count: filtered.length, slug: "all" });
  }
  return result;
}

async function getSubcategoryServices(platform: string, subcategorySlug?: string): Promise<JanjezService[]> {
  const services = await listJanjezServices(true, "show_catalogue");
  const filtered = isKnownPlatform(platform)
    ? services.filter((s) => matchPlatform(s.category) === platform)
    : services.filter((s) => !isKnownPlatform(s.category) && !matchPlatform(s.category));
  if (!subcategorySlug || subcategorySlug === "all") return filtered;
  return filtered.filter((s) => {
    const sub = s.subcategory || "General";
    return sub.toLowerCase().replace(/\s+/g, "-") === subcategorySlug;
  });
}

export default async function PlatformPage({ params }: PlatformPageProps) {
  const { platform } = await params;
  const subcategories = await getSubcategories(platform);
  const hasSubcategories = subcategories.length > 0;
  const showSubcategoryList = hasSubcategories && subcategories.length > 1;
  const defaultSubSlug = subcategories.length === 1 ? subcategories[0].slug : undefined;
  const services = await getSubcategoryServices(platform, defaultSubSlug);

  return (
    <div className="min-h-screen flex bg-kenya-black">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
          <AnnouncementBanner />
          <LiveTicker />
          <Header />
          <main className="flex-1">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
              <nav className="flex items-center gap-2 text-sm text-kenya-white/50 mb-6">
                <Link href="/services" className="hover:text-kenya-green transition-colors">Services</Link>
                <span>/</span>
                <span className="text-kenya-green font-medium capitalize">{platform.replace(/-/g, " ")}</span>
              </nav>
              <div className="mb-8 flex items-center gap-4">
                <img src={getPlatformAvatar(platform)} alt={`${platform} logo`} className="w-10 h-10 object-contain" />
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-kenya-white capitalize">{platform.replace(/-/g, " ")}</h1>
                  {hasSubcategories ? (
                    <p className="text-kenya-white/60">{subcategories.length} categor{subcategories.length === 1 ? "y" : "ies"} available</p>
                  ) : (
                    <p className="text-kenya-white/60">No services found for this platform.</p>
                  )}
                </div>
              </div>

              {!hasSubcategories ? (
                <p className="text-kenya-white/50 text-sm">No services available for this platform yet.</p>
              ) : showSubcategoryList ? (
                <div className="flex flex-col gap-4">
                  {subcategories.map((sub) => (
                    <Link
                      key={sub.slug}
                      href={`/services/${platform}/${sub.slug}`}
                      className="flex items-center gap-4 bg-kenya-white/5 border border-kenya-white/10 rounded-2xl px-5 py-4 transition-all duration-300 hover:-translate-y-1 hover:border-kenya-white/20"
                    >
                      <div className="w-12 h-12 flex-shrink-0 bg-kenya-white/5 rounded-xl flex items-center justify-center">
                        <span className="text-lg">📦</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-kenya-white font-semibold text-base truncate">{sub.name}</p>
                        <p className="text-kenya-white/50 text-xs">{sub.count} service{sub.count !== 1 ? "s" : ""}</p>
                      </div>
                      <span className="text-kenya-white/40 text-xs">→</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {services.map((svc) => (
                    <Link
                      key={svc.id}
                      href={`/services/${platform}/${subcategories[0]?.slug || "all"}/${svc.slug}`}
                      className="flex items-center gap-4 bg-kenya-white/5 border border-kenya-white/10 rounded-2xl px-5 py-4 transition-all duration-300 hover:-translate-y-1 hover:border-kenya-white/20"
                    >
                      <div className="w-12 h-12 flex-shrink-0 bg-kenya-white/5 rounded-xl flex items-center justify-center">
                        <span className="text-lg">📦</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-kenya-white font-semibold text-base truncate">{svc.name}</p>
                        <p className="text-kenya-green text-sm">KES {Number(svc.selling_price_ksh).toFixed(2)}</p>
                      </div>
                      <span className="text-kenya-white/40 text-xs">→</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </main>
          <Footer />
        </div>
      </div>
  );
}
