import AnnouncementBanner from "@/components/AnnouncementBanner";
import LiveTicker from "@/components/LiveTicker";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { listJanjezServices } from "@/lib/janjez-services";
import { JanjezService } from "@/lib/janjez-services";
import { getPlatformAvatar } from "@/lib/platform-avatars";
import { PLATFORMS } from "@/lib/data";
import { KNOWN_PLATFORMS, matchPlatform } from "@/lib/service-queries";
import ServiceDenseList from "@/components/ServiceDenseList";
import type { Metadata } from "next";

export const revalidate = 0;

const KNOWN_PLATFORM_IDS = PLATFORMS.map((p) => p.id);

function isKnownPlatform(platform: string): boolean {
  return KNOWN_PLATFORM_IDS.includes(platform);
}

export async function generateMetadata({ params }: { params: Promise<{ platform: string }> }): Promise<Metadata> {
  const { platform } = await params;
  const platformName = platform.charAt(0).toUpperCase() + platform.slice(1).replace(/-/g, " ");
  return {
    title: `${platformName} Services | Janjez`,
    description: `Buy ${platformName} followers, likes, views, and more. Fast delivery, 30-day refill guarantee.`,
    alternates: { canonical: `https://janjez.social/services/${platform}` },
  };
}

interface PlatformPageProps {
  params: Promise<{ platform: string }>;
}

async function getServices(platform: string): Promise<JanjezService[]> {
  const services = await listJanjezServices(true, "show_catalogue");
  const filtered = isKnownPlatform(platform)
    ? services.filter((s) => matchPlatform(s.category) === platform)
    : services.filter((s) => !isKnownPlatform(s.category) && !matchPlatform(s.category));
  return filtered;
}

export default async function PlatformPage({ params }: PlatformPageProps) {
  const { platform } = await params;
  const services = await getServices(platform);
  const platformName = platform.charAt(0).toUpperCase() + platform.slice(1).replace(/-/g, " ");

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
              <span className="text-kenya-green font-medium capitalize">{platform.replace(/-/g, " ")}</span>
            </nav>
            <div className="mb-6 flex items-center gap-3">
              <img src={getPlatformAvatar(platform)} alt={`${platform} logo`} className="w-8 h-8 object-contain" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-kenya-white capitalize">{platform.replace(/-/g, " ")}</h1>
                <p className="text-kenya-white/60 text-sm">{services.length} service{services.length !== 1 ? "s" : ""} available</p>
              </div>
            </div>

            {services.length === 0 ? (
              <p className="text-kenya-white/50 text-sm">No services available for this platform yet.</p>
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
