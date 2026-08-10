import AnnouncementBanner from "@/components/AnnouncementBanner";
import LiveTicker from "@/components/LiveTicker";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import FulfillmentForm from "@/components/fulfillment/FulfillmentForm";

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

interface MicrocategoryPageProps {
  params: { platform: string; subcategory: string; microcategory: string };
}

export default async function MicrocategoryPage({ params }: MicrocategoryPageProps) {
  const supabase = createAdminClient();
  let service: JanjezService | null = null;
  let platformName = params.platform.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  let subcategoryName = params.subcategory.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  const microSlug = decodeURIComponent(params.microcategory);

  if (supabase) {
    const query = supabase
      .from("janjez_services")
      .select("id, name, slug, category, subcategory, description, selling_price_ksh, min_quantity, max_quantity, is_active, display_order, supports_drip_feed, supports_refill, supports_cancel")
      .eq("is_active", true);

    if (microSlug.startsWith("microcategory-")) {
      const possibleId = microSlug.replace("microcategory-", "");
      const { data: bySlug } = await query.or(`slug.eq.${possibleId},id.eq.${possibleId}`).limit(1);
      if (bySlug && bySlug.length > 0) {
        service = bySlug[0] as JanjezService;
      }
    } else {
      const { data: bySlug } = await query.eq("slug", microSlug).limit(1);
      if (bySlug && bySlug.length > 0) {
        service = bySlug[0] as JanjezService;
      }
    }

    if (!service) {
      const { data: byName } = await supabase
        .from("janjez_services")
        .select("*")
        .eq("is_active", true)
        .ilike("name", `%${microSlug.replace(/-/g, " ")}%`)
        .limit(1);
      if (byName && byName.length > 0) {
        service = byName[0] as JanjezService;
      }
    }

    if (service) {
      platformName = service.category;
      subcategoryName = service.subcategory || subcategoryName;
    }
  }

  if (!service) {
    notFound();
  }

  const deliverable = {
    name: service.name,
    price: `${service.selling_price_ksh.toFixed(2)} Ksh`,
    note: service.description || undefined,
    minQty: service.min_quantity,
    maxQty: service.max_quantity,
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
              <Link href={`/services/${encodeURIComponent(platformName.toLowerCase().replace(/[^a-z0-9]+/g, "-"))}`} className="hover:text-kenya-green transition-colors capitalize">{platformName}</Link>
              <span>/</span>
              <Link href={`/services/${encodeURIComponent(platformName.toLowerCase().replace(/[^a-z0-9]+/g, "-"))}/${encodeURIComponent(subcategoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-"))}`} className="hover:text-kenya-green transition-colors">{subcategoryName}</Link>
              <span>/</span>
              <span className="text-kenya-green font-medium">{service.name}</span>
            </nav>
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-kenya-white mb-2">{service.name}</h1>
              <p className="text-kenya-white/60">KES {service.selling_price_ksh.toFixed(2)}</p>
              {service.description && (
                <div className="mt-3 bg-kenya-white/5 border border-kenya-white/10 rounded-xl p-3">
                  <p className="text-kenya-white/50 text-xs italic">{service.description}</p>
                </div>
              )}
            </div>

            <FulfillmentForm
              platformId={platformName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
              platformName={platformName}
              platformIcon={`/icons/services/${platformName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.svg`}
              subcategoryName={subcategoryName}
              deliverable={deliverable}
              janjezService={{
                id: service.id,
                name: service.name,
                selling_price_ksh: service.selling_price_ksh,
                min_quantity: service.min_quantity,
                max_quantity: service.max_quantity,
                supports_drip_feed: service.supports_drip_feed,
                supports_refill: service.supports_refill,
                supports_cancel: service.supports_cancel,
              }}
            />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}