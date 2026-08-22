import AnnouncementBanner from "@/components/AnnouncementBanner";
import LiveTicker from "@/components/LiveTicker";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { JanjezService } from "@/lib/janjez-services";
import { getPlatformAvatar } from "@/lib/platform-avatars";
import FulfillmentForm from "@/components/fulfillment/FulfillmentForm";
import type { Metadata } from "next";

export const revalidate = 0;

interface MicrocategoryPageProps {
  params: Promise<{ platform: string; subcategory: string; microcategory: string }>;
}

export async function generateMetadata({ params }: MicrocategoryPageProps): Promise<Metadata> {
  const { platform, subcategory, microcategory } = await params;
  const service = await getService(platform, subcategory, microcategory);
  if (!service) return { title: "Service Not Found | Janjez" };
  const platformName = platform.charAt(0).toUpperCase() + platform.slice(1).replace(/-/g, " ");
  return {
    title: `${service.name} ${platformName} | Janjez`,
    description: service.description || `Buy ${service.name} for ${platformName}. Fast delivery with 30-day refill guarantee on Janjez.`,
    alternates: { canonical: `https://janjez.social/services/${platform}/${subcategory}/${microcategory}` },
  };
}

async function getService(platform: string, subcategorySlug: string, serviceSlug: string): Promise<JanjezService | null> {
  const supabase = createAdminClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("janjez_services")
    .select("*")
    .eq("category", platform)
    .eq("slug", serviceSlug)
    .eq("is_active", true)
    .single();

  if (error || !data) return null;
  return data as unknown as JanjezService;
}

export default async function MicrocategoryPage({ params }: MicrocategoryPageProps) {
  const { platform, subcategory, microcategory } = await params;
  const service = await getService(platform, subcategory, microcategory);

  if (!service) {
    notFound();
  }

  const subcategoryName = service.subcategory || "General";

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
                <Link href={`/services/${platform}`} className="hover:text-kenya-green transition-colors capitalize">{platform.replace(/-/g, " ")}</Link>
                <span>/</span>
                <Link href={`/services/${platform}/${subcategory}`} className="hover:text-kenya-green transition-colors">{subcategoryName}</Link>
                <span>/</span>
                <span className="text-kenya-green font-medium">{service.name}</span>
              </nav>
              <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-kenya-white mb-2">{service.name}</h1>
                <p className="text-kenya-white/60">KES {Number(service.selling_price_ksh).toFixed(2)} per 1k</p>
              </div>

              <FulfillmentForm
                platformId={service.category}
                platformName={service.category}
                platformIcon={getPlatformAvatar(service.category)}
                subcategoryName={subcategoryName}
                service={service}
              />
            </div>
          </main>
          <Footer />
        </div>
      </div>
  );
}
