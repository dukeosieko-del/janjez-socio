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
  title: "Champion Packages — Budget SMM Under KES 2,000 | janjez.social",
  description: "Affordable Champion packages under KES 2,000. Instagram followers, TikTok views, YouTube likes. Fast delivery, M-Pesa payments.",
  alternates: { canonical: `${SITE_URL}/services/champion` },
  openGraph: {
    title: "Champion Packages — Budget SMM Under KES 2,000 | janjez.social",
    description: "Affordable Champion packages under KES 2,000. Instagram followers, TikTok views, YouTube likes. Fast delivery, M-Pesa payments.",
    url: `${SITE_URL}/services/champion`,
    siteName: "janjez.social",
    locale: "en_KE",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "janjez.social" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Champion Packages — Budget SMM Under KES 2,000 | janjez.social",
    description: "Affordable Champion packages under KES 2,000.",
    images: ["/og-image.png"],
    creator: "@janjez_social",
  },
};

export default async function ChampionPage() {
  const data = await fetchTierData("champion");

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
              <span className="text-kenya-green font-medium">Champion</span>
            </nav>

            <div className="mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-kenya-green/20 rounded-xl flex items-center justify-center">
                <span className="text-kenya-green font-bold text-xs">{"<2k"}</span>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-kenya-white">Champion Packages</h1>
                <p className="text-kenya-white/60 text-sm">{data.services.length} service{data.services.length !== 1 ? "s" : ""} available — Under KES 2,000</p>
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
