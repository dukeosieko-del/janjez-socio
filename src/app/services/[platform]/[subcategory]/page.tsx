import AnnouncementBanner from "@/components/AnnouncementBanner";
import LiveTicker from "@/components/LiveTicker";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { notFound } from "next/navigation";
import { listJanjezServices } from "@/lib/janjez-services";
import {
  JanjezService,
  getPlatformBucket,
  getSubcategoryKey,
  slugify,
  getServiceDetailPath,
} from "@/lib/janjez-services";
import { getPlatformAvatar, getPlatformLabel } from "@/lib/platform-avatars";
import FulfillmentForm from "@/components/fulfillment/FulfillmentForm";
import type { Metadata } from "next";

export const revalidate = 0;

interface SubcategoryPageProps {
  params: { platform: string; subcategory: string };
}

export async function generateMetadata({ params }: SubcategoryPageProps): Promise<Metadata> {
  const { services, subcategoryName } = await getSubcategoryServices(params.platform, params.subcategory);
  const platformName = getPlatformLabel(params.platform);
  const title = `${subcategoryName} ${platformName} Services | Janjez`;
  return {
    title,
    description: `Buy ${subcategoryName} for ${platformName}. Fast delivery with 30-day refill guarantee on Janjez.`,
    alternates: { canonical: `https://janjez.social/services/${params.platform}/${params.subcategory}` },
  };
}

async function getSubcategoryServices(platform: string, subcategorySlug: string): Promise<{ services: JanjezService[]; subcategoryName: string }> {
  const all = await listJanjezServices(true);
  const filtered = all.filter((s) => getPlatformBucket(s.category) === platform);
  const inSubcategory = filtered.filter((s) => slugify(getSubcategoryKey(s, platform)) === subcategorySlug);
  const subName = inSubcategory.length > 0 ? getSubcategoryKey(inSubcategory[0], platform) : subcategorySlug;
  return { services: inSubcategory, subcategoryName: subName };
}

export default async function SubcategoryPage({ params }: SubcategoryPageProps) {
  const { services, subcategoryName } = await getSubcategoryServices(params.platform, params.subcategory);

  if (services.length === 0) {
    notFound();
  }

  const singleService = services.length === 1 ? services[0] : null;

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
                <Link href={`/services/${params.platform}`} className="hover:text-kenya-green transition-colors capitalize">{getPlatformLabel(params.platform)}</Link>
                <span>/</span>
                <span className="text-kenya-green font-medium">{subcategoryName}</span>
              </nav>
              <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-kenya-white mb-2">{subcategoryName}</h1>
                <p className="text-kenya-white/60">{services.length} deliverable{services.length !== 1 ? "s" : ""} available</p>
              </div>

              {singleService ? (
                <FulfillmentForm
                  platformId={singleService.category}
                  platformName={singleService.category}
                  platformIcon={getPlatformAvatar(singleService.category)}
                  subcategoryName={subcategoryName}
                  service={singleService}
                />
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
