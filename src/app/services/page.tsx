import AnnouncementBanner from "@/components/AnnouncementBanner";
import LiveTicker from "@/components/LiveTicker";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";
import { TAXONOMY_PLATFORMS } from "@/lib/taxonomy";
import { getCategoryIcon } from "@/lib/category-icons";
import ProtectedRoute from "@/lib/auth/protected-route";

export default function ServicesPage() {
  const platforms = useMemo(() => {
    return TAXONOMY_PLATFORMS.map((item) => ({
      id: item.id,
      name: item.name,
      icon: getCategoryIcon(item.id),
      category: item.id,
      description: `${item.subcategories.length} subcategories`,
      href: `/services/${item.id}`,
      status: "active" as const,
      modalSize: item.id === "youtube" || item.id === "whatsapp" || item.id === "telegram" ? "large" : "small",
    }));
  }, []);

  return (
    <ProtectedRoute>
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
                      <Image src={platform.icon} alt={platform.name} width={40} height={40} className="w-10 h-10 object-contain" />
                    </div>
                    <div>
                      <h3 className="text-kenya-white font-semibold text-base">{platform.name}</h3>
                      <p className="text-kenya-white/50 text-xs">{platform.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </ProtectedRoute>
  );
}
