import AnnouncementBanner from "@/components/AnnouncementBanner";
import LiveTicker from "@/components/LiveTicker";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { SERVICES_CATEGORIES } from "@/lib/services-data";
import { KNOWN_PLATFORMS } from "@/lib/service-queries";
import { listJanjezServices } from "@/lib/janjez-services";
import { getPlatformAvatar } from "@/lib/platform-avatars";
import { categorizeServices } from "@/lib/service-queries";

export const revalidate = 0;

interface PlatformCard {
  id: string;
  name: string;
  icon: string;
  href: string;
  serviceCount: number;
}

async function getPlatforms(): Promise<PlatformCard[]> {
  const services = await listJanjezServices(true, "show_catalogue");
  const categorized = categorizeServices(services);
  const platforms: PlatformCard[] = [];

  for (const platform of KNOWN_PLATFORMS) {
    const svcs = categorized[platform] || [];
    platforms.push({
      id: platform,
      name: platform.charAt(0).toUpperCase() + platform.slice(1).replace(/-/g, " "),
      icon: getPlatformAvatar(platform),
      href: `/services/${platform}`,
      serviceCount: svcs.length,
    });
  }

  const dbOnly = Object.keys(categorized).filter((id) => !KNOWN_PLATFORMS.includes(id as typeof KNOWN_PLATFORMS[number]) && id !== "others");
  for (const id of dbOnly) {
    const svcs = categorized[id];
    platforms.push({
      id,
      name: id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, " "),
      icon: getPlatformAvatar(id),
      href: `/services/${id}`,
      serviceCount: svcs.length,
    });
  }

  if (categorized.others && categorized.others.length > 0) {
    platforms.push({
      id: "others",
      name: "Others",
      icon: getPlatformAvatar("others"),
      href: "/services/others",
      serviceCount: categorized.others.length,
    });
  }

  return platforms.sort((a, b) => a.name.localeCompare(b.name));
}

export default async function ServicesPage() {
  const platforms = await getPlatforms();

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
                    <p className="text-kenya-white/50 text-xs">{platform.serviceCount} service{platform.serviceCount !== 1 ? "s" : ""}</p>
                  </div>
                </Link>
              ))}
            </div>

            {platforms.length === 0 && (
              <p className="text-kenya-white/50 text-center py-12">No services available. Check back soon!</p>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
