import AnnouncementBanner from "@/components/AnnouncementBanner";
import LiveTicker from "@/components/LiveTicker";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import Link from "next/link";
import ServiceDenseList from "@/components/ServiceDenseList";
import { TIER_TITLES, fetchTierData } from "@/lib/service-tiers";
import type { Metadata } from "next";
import { SITE_URL } from "../../lib/config";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Premium Packages — KES 2,000 to KES 6,000 SMM | janjez.social",
  description: "Premium packages from KES 2,000 to KES 6,000. Mid-tier SMM services for Instagram, YouTube, TikTok, WhatsApp. Fast delivery, M-Pesa payments.",
  alternates: { canonical: `${SITE_URL}/services/premium` },
  openGraph: {
    title: "Premium Packages — KES 2,000 to KES 6,000 SMM | janjez.social",
    description: "Premium packages from KES 2,000 to KES 6,000. Mid-tier SMM services.",
    url: `${SITE_URL}/services/premium`,
    siteName: "janjez.social",
    locale: "en_KE",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "janjez.social" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Premium Packages — KES 2,000 to KES 6,000 SMM | janjez.social",
    description: "Premium packages from KES 2,000 to KES 6,000.",
    images: ["/og-image.png"],
    creator: "@janjez_social",
  },
};

export default async function PremiumPage() {
  const data = await fetchTierData("premium");

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
              <span className="text-blue-400 font-medium">Premium</span>
            </nav>

            <div className="mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <span className="text-blue-400 font-bold text-sm">KES 6,000</span>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-kenya-white">Premium Packages</h1>
                <p className="text-kenya-white/60 text-sm">{data.services.length} service{data.services.length !== 1 ? "s" : ""} available — {data.description}</p>
              </div>
            </div>

            {data.services.length === 0 ? (
              <p className="text-kenya-white/50 text-sm">No services available in this tier yet.</p>
            ) : (
              <ServiceDenseList services={data.services} />
            )}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
