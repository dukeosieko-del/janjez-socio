import AnnouncementBanner from "@/components/AnnouncementBanner";
import LiveTicker from "@/components/LiveTicker";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { notFound } from "next/navigation";
import { listJanjezServices } from "@/lib/janjez-services";
import { JanjezService } from "@/lib/janjez-services";
import { getPlatformAvatar } from "@/lib/platform-avatars";
import { isKnownPlatform, matchPlatform } from "@/lib/service-queries";
import { normalizeSlug } from "@/lib/janzez-services";
import ServiceDenseList from "@/components/ServiceDenseList";
import FulfillmentForm from "@/components/fulfillment/FulfillmentForm";
import type { Metadata } from "next";

export const revalidate = 0;

interface SubcategoryPageProps {
  params: Promise<{ platform: string; subcategory: string }>;
}

export async function generateMetadata({ params }: SubcategoryPageProps): Promise<Metadata> {
  const { platform, subcategory } = await params;
  const { services, subcategoryName } = await getSubcategoryServices(platform, subcategory);
  const platformName = platform.charAt(0).toUpperCase() + platform.slice(1).replace(/-/g, " ");
  const title = `${subcategoryName} ${platformName} Services | Janjez`;
  return {
    title,
    description: `Buy ${subcategoryName} for ${platformName}. Fast delivery with 30-day refill guarantee on Janjez.`,
    alternates: { canonical: `https://janjez.social/services/${platform}/${subcategory}` },
  };
}

async function getSubcategoryServices(platform: string, subcategorySlug: string): Promise<{ services: JanjezService[]; subcategoryName: string }> {
  const all = await listJanjezServices(true, "show_catalogue");
  const filtered = isKnownPlatform(platform)
    ? all.filter((s) => matchPlatform(s.category) === platform)
    : all.filter((s) => !isKnownPlatform(s.category) && !matchPlatform(s.category));
  const inSubcategory = filtered.filter((s) => {
    const sub = s.subcategory || "General";
    return normalizeSlug(sub) === subcategorySlug;
  });
  const subName = inSubcategory.length > 0 ? (inSubcategory[0].subcategory || "General") : subcategorySlug;
  return { services: inSubcategory, subcategoryName: subName };
}

export default async function SubcategoryPage({ params }: SubcategoryPageProps) {
  const { platform, subcategory } = await params;
  const { services, subcategoryName } = await getSubcategoryServices(platform, subcategory);

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
            <nav className="flex items-center gap-2 text-sm text-kenya-white/50 mb-4">
              <Link href="/services" className="hover:text-kenya-green transition-colors">Services</Link>
              <span>/</span>
              <Link href={`/services/${platform}`} className="hover:text-kenya-green transition-colors capitalize">{platform.replace(/-/g, " ")}</Link>
              <span>/</span>
              <span className="text-kenya-green font-medium">{subcategoryName}</span>
            </nav>
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-kenya-white mb-1">{subcategoryName}</h1>
              <p className="text-kenya-white/60 text-sm">{services.length} deliverable{services.length !== 1 ? "s" : ""} available</p>
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
              <ServiceDenseList services={services} />
            )}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
