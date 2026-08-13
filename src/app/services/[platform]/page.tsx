import AnnouncementBanner from "@/components/AnnouncementBanner";
import LiveTicker from "@/components/LiveTicker";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { listJanjezServices } from "@/lib/janzeh-services"
import {
  JanjezService,
  getPlatformBucket,
  getSubcategoryKey,
  slugify,
  getServiceDetailPath,
} from "@/lib/janzeh-services"
import { getPlatformAvatar, getPlatformLabel } from "@/lib/platform-avatars";
import type { Metadata } from "next";

export const revalidate = 0;

export async function generateMetadata({ params }: { params: { platform: string } }): Promise<Metadata> {
  const platformName = getPlatformLabel(params.platform);
  const description =
    params.platform === "others"
      ? "Social media services across all platforms not listed above. Fast delivery, 30-day refill guarantee."
      : `Buy ${platformName} followers, likes, views, and more. Fast delivery, 30-day refill guarantee.`;
  return {
    title: `${platformName} Services | Janjez`,
    description,
    alternates: { canonical: `https://janjez.social/services/${params.platform}` },
  };
}

interface PlatformPageProps {
  params: { platform: string };
}

async function getSubcategories(platform: string): Promise<Array<{ name: string; count: number; slug: string }>> {
  const services = await listJanjezServices(true);
  const filtered = services.filter((s) => getPlatformBucket(s.category) === platform);
  const subMap = new Map<string, number>();
  for (const svc of filtered) {
    const key = getSubcategoryKey(svc, platform);
    subMap.set(key, (subMap.get(key) || 0) + 1);
  }
  const result = Array.from(subMap.entries()).map(([name, count]) => ({ name, count, slug: slugify(name) }));
  if (filtered.length > 0 && result.length === 0) {
    result.push({ name: "All Services", count: filtered.length, slug: "all" });
  }
  return result;
}

async function getSubcategoryServices(platform: string, subcategorySlug?: string): Promise<JanjezService[]> {
  const services = await listJanjezServices(true);
  const filtered = services.filter((s) => getPlatformBucket(s.category) === platform);
  if (!subcategorySlug || subcategorySlug === "all") return filtered;
  return filtered.filter((s) => slugify(getSubcategoryKey(s, platform)) === subcategorySlug);
}

export default async function PlatformPage({ params }: PlatformPageProps) {
  const platform = params.platform;
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
                <span className="text-kenya-green font-medium capitalize">{getPlatformLabel(platform)}</span>
              </nav>
              <div className="mb-8 flex items-center gap-4">
                <img src={getPlatformAvatar(platform)} alt={`${getPlatformLabel(platform)} logo`} className="w-12 h-12 object-contain" />
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-kenya-white capitalize">{getPlatformLabel(platform)}</h1>
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
                      href={getServiceDetailPath(svc)}
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
