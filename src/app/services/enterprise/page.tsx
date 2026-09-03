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
  title: "Enterprise Packages — High-Volume SMM Above KES 6,000 | janjez.social",
  description: "Enterprise packages above KES 6,000. High-volume SMM solutions for Instagram, YouTube, TikTok, WhatsApp, X. Fast delivery, M-Pesa payments.",
  alternates: { canonical: `${SITE_URL}/services/enterprise` },
  openGraph: {
    title: "Enterprise Packages — High-Volume SMM Above KES 6,000 | janjez.social",
    description: "Enterprise packages above KES 6,000. High-volume SMM solutions.",
    url: `${SITE_URL}/services/enterprise`,
    siteName: "janjez.social",
    locale: "en_KE",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "janjez.social" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Enterprise Packages — Above KES 6,000 | janjez.social",
    description: "Enterprise packages above KES 6,000.",
    images: ["/og-image.png"],
    creator: "@janjez_social",
  },
};

export default async function EnterprisePage() {
  const data = await fetchTierData("enterprise");

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
              <span className="text-kenya-red font-medium">Enterprise</span>
            </nav>

            <div className="mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-kenya-red/20 rounded-xl flex items-center justify-center">
                <span className="text-kenya-red font-bold text-xs">{">6k"}</span>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-kenya-white">Enterprise Packages</h1>
                <p className="text-kenya-white/60 text-sm">{data.services.length} service{data.services.length !== 1 ? "s" : ""} available — Above KES 6,000</p>
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
