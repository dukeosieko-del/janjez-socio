import AnnouncementBanner from "@/components/AnnouncementBanner";
import LiveTicker from "@/components/LiveTicker";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTaxonomyPlatform, getTaxonomySubcategory } from "@/lib/taxonomy";
import { getCategoryIcon } from "@/lib/category-icons";
import FulfillmentForm from "@/components/fulfillment/FulfillmentForm";

interface DeliverablePageProps {
  params: { platform: string; subcategory: string; microcategory: string };
}

export default function DeliverablePage({ params }: DeliverablePageProps) {
  const catalogItem = getTaxonomyPlatform(params.platform);
  if (!catalogItem) notFound();

  const subcategory = getTaxonomySubcategory(catalogItem.id, params.subcategory.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()));
  if (!subcategory) notFound();

  const deliverable = subcategory.deliverables.find((d) => {
    const slug = d.name.toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
    return slug === params.microcategory;
  });

  if (!deliverable) notFound();

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
              <Link href={`/services/${params.platform}/${params.subcategory}`} className="hover:text-kenya-green transition-colors">{subcategory.name}</Link>
              <span>/</span>
              <span className="text-kenya-green font-medium">{deliverable.name}</span>
            </nav>
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-kenya-white mb-2">{deliverable.name}</h1>
              <p className="text-kenya-white/60">Deliverable</p>
            </div>

            <FulfillmentForm
              platformId={catalogItem.id}
              platformName={catalogItem.name}
              platformIcon={getCategoryIcon(catalogItem.id)}
              subcategoryName={subcategory.name}
              deliverable={deliverable}
            />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
