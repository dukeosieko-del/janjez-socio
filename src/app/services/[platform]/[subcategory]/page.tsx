import AnnouncementBanner from "@/components/AnnouncementBanner";
import LiveTicker from "@/components/LiveTicker";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

interface JanjezService {
  id: string;
  name: string;
  slug: string;
  category: string;
  subcategory: string | null;
  description: string | null;
  selling_price_ksh: number;
  min_quantity: number;
  max_quantity: number;
  is_active: boolean;
  display_order: number;
  supports_drip_feed: boolean;
  supports_refill: boolean;
  supports_cancel: boolean;
}

interface SubcategoryPageProps {
  params: { platform: string; subcategory: string };
}

export default async function SubcategoryPage({ params }: SubcategoryPageProps) {
  const supabase = createAdminClient();
  let services: JanjezService[] = [];
  let platformName = params.platform.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  let subcategoryName = params.subcategory.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  if (supabase) {
    const decodedPlatform = decodeURIComponent(params.platform);
    const decodedSubcategory = decodeURIComponent(params.subcategory);

    const { data } = await supabase
      .from("janjez_services")
      .select("id, name, slug, category, subcategory, description, selling_price_ksh, min_quantity, max_quantity, is_active, display_order, supports_drip_feed, supports_refill, supports_cancel")
      .eq("is_active", true)
      .ilike("category", `%${decodedPlatform}%`)
      .ilike("subcategory", `%${decodedSubcategory}%`)
      .order("display_order", { ascending: true })
      .order("name", { ascending: true });

    services = data || [];
    if (services.length > 0) {
      platformName = services[0].category;
      subcategoryName = services[0].subcategory || subcategoryName;
    }
  }

  if (services.length === 0) {
    notFound();
  }

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
              <Link href={`/services/${params.platform}`} className="hover:text-kenya-green transition-colors capitalize">{platformName}</Link>
              <span>/</span>
              <span className="text-kenya-green font-medium">{subcategoryName}</span>
            </nav>
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-kenya-white mb-2">{subcategoryName}</h1>
              <p className="text-kenya-white/60">{services.length} service{services.length !== 1 ? "s" : ""} available</p>
            </div>

            <div className="flex flex-col gap-4">
              {services.map((service) => (
                <Link
                  key={service.id}
                  href={`/order/${encodeURIComponent(service.category.toLowerCase().replace(/[^a-z0-9]+/g, "-"))}/${encodeURIComponent((service.subcategory || "").toLowerCase().replace(/[^a-z0-9]+/g, "-"))}/${service.id}`}
                  className="flex items-center gap-4 bg-kenya-white/5 border border-kenya-white/10 rounded-2xl px-5 py-4 transition-all duration-300 hover:-translate-y-1 hover:border-kenya-white/20"
                >
                  <div className="w-12 h-12 flex-shrink-0 bg-kenya-white/5 rounded-xl flex items-center justify-center">
                    <span className="text-lg">📦</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-kenya-white font-semibold text-base truncate">{service.name}</p>
                    <p className="text-kenya-green text-sm">KES {service.selling_price_ksh.toFixed(2)}</p>
                    <p className="text-kenya-white/50 text-xs">
                      Min: {service.min_quantity.toLocaleString()} | Max: {service.max_quantity.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {service.supports_drip_feed && (
                      <span className="text-xs bg-kenya-green/20 text-kenya-green px-2 py-1 rounded">Drip-feed</span>
                    )}
                    {service.supports_refill && (
                      <span className="text-xs bg-kenya-white/10 text-kenya-white px-2 py-1 rounded">Refill</span>
                    )}
                  </div>
                  <span className="text-kenya-white/40 text-xs">→</span>
                </Link>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}