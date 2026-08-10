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

function getPlatformSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default async function ServicesPage() {
  const supabase = createAdminClient();
  let services: JanjezService[] = [];
  if (supabase) {
    const { data } = await supabase
      .from("janjez_services")
      .select("id, name, slug, category, subcategory, description, selling_price_ksh, min_quantity, max_quantity, is_active, display_order, supports_drip_feed, supports_refill, supports_cancel")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .order("name", { ascending: true });
    services = data || [];
  }

  const categories = Array.from(
    new Map(
      services
        .filter((s) => s.category)
        .map((s) => [s.category.toLowerCase(), { name: s.category, slug: getPlatformSlug(s.category) }])
    ).values()
  );

  const platforms = categories.map((cat) => {
    const count = services.filter((s) => s.category.toLowerCase() === cat.name.toLowerCase()).length;
    return {
      id: cat.slug,
      name: cat.name,
      icon: `/icons/services/${cat.slug}.svg`,
      category: cat.name,
      description: `${count} service${count !== 1 ? "s" : ""}`,
      href: `/services/${cat.slug}`,
      status: "active" as const,
    };
  });

  return (
    <div className="min-h-screen flex bg-kenya-black">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <AnnouncementBanner />
        <LiveTicker />
        <Header />
        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-12">
              <h1 className="text-4xl sm:text-5xl font-bold text-kenya-white mb-4">Services</h1>
              <p className="text-kenya-white/60 text-lg max-w-2xl mx-auto">
                Choose a platform to view services
              </p>
            </div>

            {platforms.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-kenya-white/60 text-lg">No services available at the moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {platforms.map((platform) => (
                  <Link
                    key={platform.id}
                    href={platform.href}
                    className="flex flex-col items-center gap-3 bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-5 text-center hover:-translate-y-1 hover:border-kenya-white/20 transition-all"
                  >
                    <div className="w-12 h-12 flex items-center justify-center">
                      <img src={platform.icon} alt={platform.name} className="w-10 h-10 object-contain" />
                    </div>
                    <div>
                      <h3 className="text-kenya-white font-semibold text-base">{platform.name}</h3>
                      <p className="text-kenya-white/50 text-xs">{platform.description}</p>
                    </div>
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