import AnnouncementBanner from "@/components/AnnouncementBanner";
import LiveTicker from "@/components/LiveTicker";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useMemo } from "react";
import { TAXONOMY_PLATFORMS, isFeaturedPlatform } from "@/lib/taxonomy";
import { getCategoryIcon } from "@/lib/category-icons";
import ProtectedRoute from "@/lib/auth/protected-route";

export default function FullCataloguePage() {
  const featured = useMemo(() => TAXONOMY_PLATFORMS.filter((p) => p.featured), []);
  const others = useMemo(() => TAXONOMY_PLATFORMS.filter((p) => !p.featured), []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex bg-kenya-black">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
          <AnnouncementBanner />
          <LiveTicker />
          <Header />
          <main className="flex-1">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <div className="text-center mb-16">
                <h1 className="text-4xl sm:text-5xl font-bold text-kenya-white mb-4">
                  Full Catalogue
                </h1>
                <p className="text-kenya-white/60 text-lg max-w-2xl mx-auto">
                  Explore every platform, subcategory, and service we offer.
                </p>
              </div>

              <section className="mb-16">
                <h2 className="text-2xl font-bold text-kenya-white mb-6">Featured Platforms</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                  {featured.map((platform) => (
                    <Link
                      key={platform.id}
                      href={`/services/${platform.id}`}
                      className="flex flex-col items-center gap-3 bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-5 text-center hover:-translate-y-1 hover:border-kenya-white/20 transition-all"
                    >
                      <div className="w-12 h-12 flex items-center justify-center">
                        <img src={getCategoryIcon(platform.id)} alt={platform.name} className="w-10 h-10 object-contain" />
                      </div>
                      <div>
                        <h3 className="text-kenya-white font-semibold text-base">{platform.name}</h3>
                        <p className="text-kenya-white/50 text-xs">{platform.subcategories.length} subcategories</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>

              {others.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold text-kenya-white mb-6">Other Networks</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                    {others.map((platform) => (
                      <Link
                        key={platform.id}
                        href={`/services/${platform.id}`}
                        className="flex flex-col items-center gap-3 bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-5 text-center hover:-translate-y-1 hover:border-kenya-white/20 transition-all"
                      >
                        <div className="w-12 h-12 flex items-center justify-center">
                          <img src={getCategoryIcon(platform.id)} alt={platform.name} className="w-10 h-10 object-contain" />
                        </div>
                        <div>
                          <h3 className="text-kenya-white font-semibold text-base">{platform.name}</h3>
                          <p className="text-kenya-white/50 text-xs">{platform.subcategories.length} subcategories</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </ProtectedRoute>
  );
}
