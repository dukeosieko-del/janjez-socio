import AnnouncementBanner from "@/components/AnnouncementBanner";
import LiveTicker from "@/components/LiveTicker";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import Link from "next/link";
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

interface PlatformPageProps {
  params: { platform: string };
}

export default async function PlatformPage({ params }: PlatformPageProps) {
  const supabase = createAdminClient();
  let services: JanjezService[] = [];
  let categoryName = params.platform.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  if (supabase) {
    const { data } = await supabase
      .from("janjez_services")
      .select("id, name, slug, category, subcategory, description, selling_price_ksh, min_quantity, max_quantity, is_active, display_order, supports_drip_feed, supports_refill, supports_cancel")
      .eq("is_active", true)
      .ilike("category", `%${params.platform.replace(/-/g, " ")}%`)
      .order("display_order", { ascending: true })
      .order("name", { ascending: true });

    services = data || [];
    if (services.length > 0 && services[0].category) {
      categoryName = services[0].category;
    }
  }

  const subcategories = Array.from(
    new Map(
      services
        .filter((s) => s.subcategory)
        .map((s) => [s.subcategory!.toLowerCase(), { name: s.subcategory!, count: 1 }])
    ).values()
  );

  const subcategoriesWithCounts = subcategories.map((sub) => ({
    ...sub,
    count: services.filter((s) => s.subcategory?.toLowerCase() === sub.name.toLowerCase()).length,
  }));

  const getSubcategorySlug = (subcategory: string): string => {
    return subcategory.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  };

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
              <span className="text-kenya-green font-medium">{categoryName}</span>
            </nav>
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-kenya-white mb-2">{categoryName}</h1>
              <p className="text-kenya-white/60">{services.length} service{services.length !== 1 ? "s" : ""} available</p>
            </div>

            {services.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-kenya-white/60 text-lg">No services found for this platform.</p>
                <Link href="/services" className="text-kenya-green hover:underline mt-4 inline-block">Back to services</Link>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {subcategoriesWithCounts.map((sub, idx) => {
                  const href = `/services/${params.platform}/${getSubcategorySlug(sub.name)}`;

                  return (
                    <Link
                      key={sub.name + idx}
                      href={href}
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
                  );
                })}
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}