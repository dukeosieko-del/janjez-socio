import AnnouncementBanner from "@/components/AnnouncementBanner";
import LiveTicker from "@/components/LiveTicker";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { notFound } from "next/navigation";
import { findCatalogItemBySlug, findSubcategoryBySlug, slugify } from "@/lib/service-routes";
import type { ServiceCatalogItem, Subcategory } from "@/lib/service-catalog";
import FulfillmentForm from "@/components/fulfillment/FulfillmentForm";

interface SubcategoryPageProps {
  params: { platform: string; subcategory: string };
}

export default function SubcategoryPage({ params }: SubcategoryPageProps) {
  const catalogItem = findCatalogItemBySlug(params.platform);
  if (!catalogItem) notFound();

  const subcategory = findSubcategoryBySlug(catalogItem, params.subcategory);
  if (!subcategory) notFound();

  const singleDeliverable = subcategory.deliverables.length === 1 ? subcategory.deliverables[0] : null;

  return (
    <div className="min-h-screen flex bg-kenya-black">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <AnnouncementBanner />
        <LiveTicker />
        <Header />
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <nav className="flex items-center gap-2 text-sm text-kenya-white/50 mb-6">
              <Link href="/services" className="hover:text-kenya-green transition-colors">Services</Link>
              <span>/</span>
              <Link href={`/services/${params.platform}`} className="hover:text-kenya-green transition-colors capitalize">{params.platform.replace(/-/g, " ")}</Link>
              <span>/</span>
              <span className="text-kenya-green font-medium">{subcategory.name}</span>
            </nav>
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-kenya-white mb-2">{subcategory.name}</h1>
              <p className="text-kenya-white/60">{subcategory.deliverables.length} deliverable{subcategory.deliverables.length !== 1 ? "s" : ""} available</p>
            </div>

            {singleDeliverable ? (
              <FulfillmentForm
                platformId={catalogItem.id}
                platformName={catalogItem.name}
                platformIcon={catalogItem.icon}
                subcategoryName={subcategory.name}
                deliverable={singleDeliverable}
              />
            ) : (
              <div className="flex flex-col gap-4">
                {subcategory.deliverables.map((del, idx) => (
                  <Link
                    key={del.name + idx}
                    href={`/services/${params.platform}/${params.subcategory}/deliverable-${slugify(del.name)}`}
                    className="flex items-center gap-4 bg-kenya-white/5 border border-kenya-white/10 rounded-2xl px-5 py-4 transition-all duration-300 hover:-translate-y-1 hover:border-kenya-white/20"
                  >
                    <div className="w-12 h-12 flex-shrink-0 bg-kenya-white/5 rounded-xl flex items-center justify-center">
                      <span className="text-lg">📦</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-kenya-white font-semibold text-base truncate">{del.name}</p>
                      <p className="text-kenya-green text-sm">{del.price}</p>
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
