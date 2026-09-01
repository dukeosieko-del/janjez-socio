import AnnouncementBanner from "@/components/AnnouncementBanner";
import LiveTicker from "@/components/LiveTicker";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { SITE_URL } from "../lib/config";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Reseller & API — SMM Panel Kenya Bulk Pricing | janjez.social",
  description: "Power your business with janjez.social API and reseller program. Bulk pricing for agencies, M-Pesa settlements, and dedicated support for Kenyan resellers.",
  keywords: ["SMM reseller Kenya", "SMM panel Kenya", "M-Pesa SMM panel", "cheap SMM panel East Africa", "social media marketing Nairobi", "bulk social media followers", "YouTube monetization subscribers", "TikTok viral boost", "instant SMM delivery", "Pata clout chapchap", "buy YouTube views Kenya", "Instagram followers Kenya", "refill guarantee SMM", "Kenyan influencer boost", "drip-feed social media"],
  category: "business",
  publisher: "janjez.social",
  applicationName: "janjez.social",
  openGraph: {
    title: "Reseller & API — SMM Panel Kenya Bulk Pricing | janjez.social",
    description: "Power your business with janjez.social API and reseller program. Bulk pricing for agencies, M-Pesa settlements, and dedicated support for Kenyan resellers.",
    url: `${SITE_URL}/reseller-and-api`,
    siteName: "janjez.social",
    locale: "en_KE",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "janjez.social — Pata Clout Chapchap",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Reseller & API — SMM Panel Kenya Bulk Pricing | janjez.social",
    description: "Power your business with janjez.social API and reseller program. Bulk pricing for agencies, M-Pesa settlements, and dedicated support for Kenyan resellers.",
    images: ["/og-image.png"],
    creator: "@janjez_social",
  },
  alternates: {
    canonical: `${SITE_URL}/reseller-and-api`,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

function JsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          name: "SMM Reseller & API Program",
          description: "B2B SMM reseller and developer API program for Kenyan agencies and marketers.",
          provider: {
            "@type": "Organization",
            name: "janjez.social",
            url: SITE_URL,
          },
          areaServed: {
            "@type": "Country",
            name: "Kenya",
          },
          offers: [
            {
              "@type": "Offer",
              name: "Developer API Access",
              description: "RESTful API with documentation, webhooks, and sandbox testing.",
              price: "0",
              priceCurrency: "KES",
            },
            {
              "@type": "Offer",
              name: "Reseller Program",
              description: "Discounted rates, dedicated support, and custom dashboard for resellers.",
              price: "0",
              priceCurrency: "KES",
            },
            {
              "@type": "Offer",
              name: "Bulk Orders",
              description: "Tailored pricing for bulk campaigns and enterprise clients.",
              price: "0",
              priceCurrency: "KES",
            },
          ],
        }),
      }}
    />
  );
}
export { JsonLd };

export default function ResellerAndApiPage() {
  return (
    <div className="min-h-screen flex bg-kenya-black">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <AnnouncementBanner />
        <LiveTicker />
        <Header />
        <main className="flex-1">
          <JsonLd />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <nav className="flex items-center gap-2 text-sm text-kenya-white/50 mb-6">
              <Link href="/" className="hover:text-kenya-green transition-colors">Home</Link>
              <span>/</span>
              <span className="text-kenya-green font-medium">Reseller & API</span>
            </nav>
            <h1 className="text-3xl sm:text-4xl font-bold text-kenya-white mb-4">Reseller & API</h1>
            <p className="text-kenya-white/60 text-lg mb-8">Power your business with our API and reseller program.</p>
            <div className="grid gap-6">
              <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6">
                <h2 className="text-kenya-white font-bold text-lg mb-2">🔌 Developer API</h2>
                <p className="text-kenya-white/70 text-sm leading-relaxed">Integrate our services directly into your platform. RESTful API with clear documentation, webhooks, and sandbox testing.</p>
              </div>
              <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6">
                <h2 className="text-kenya-white font-bold text-lg mb-2">🤝 Reseller Program</h2>
                <p className="text-kenya-white/70 text-sm leading-relaxed">Get discounted rates, dedicated support, and a custom dashboard. Perfect for agencies, marketers, and entrepreneurs.</p>
              </div>
              <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6">
                <h2 className="text-kenya-white font-bold text-lg mb-2">📈 Bulk Orders</h2>
                <p className="text-kenya-white/70 text-sm leading-relaxed">Need high volume? We offer tailored pricing for bulk campaigns and enterprise clients.</p>
              </div>
            </div>
            <div className="mt-8">
              <Link href="/contact-us" className="inline-flex items-center gap-2 bg-kenya-green text-kenya-black font-bold text-sm px-6 py-3 rounded-xl hover:bg-kenya-green/90 transition-colors">💬 Contact Sales</Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
