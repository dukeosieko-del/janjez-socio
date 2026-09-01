import AnnouncementBanner from "@/components/AnnouncementBanner";
import LiveTicker from "@/components/LiveTicker";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { SITE_URL } from "../lib/config";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "How It Works — M-Pesa SMM Panel Kenya | janjez.social",
  description: "Buy Instagram followers, YouTube views, TikTok likes in Kenya. 3 simple steps: choose service, place order, pay with M-Pesa. Instant delivery from KES 10.",
  keywords: ["SMM panel Kenya", "M-Pesa SMM panel", "buy YouTube views Kenya", "Instagram followers Kenya", "TikTok views Kenya", "instant SMM delivery", "M-Pesa payment SMM", "social media marketing Nairobi", "Pata clout chapchap", "cheap SMM panel East Africa", "refill guarantee SMM", "drip-feed social media", "Kenyan influencer boost", "WhatsApp channel members Kenya", "SMM reseller Kenya"],
  category: "business",
  publisher: "janjez.social",
  applicationName: "janjez.social",
  openGraph: {
    title: "How It Works — M-Pesa SMM Panel Kenya | janjez.social",
    description: "Buy Instagram followers, YouTube views, TikTok likes in Kenya. 3 simple steps: choose service, place order, pay with M-Pesa. Instant delivery from KES 10.",
    url: `${SITE_URL}/how-it-works`,
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
    title: "How It Works — M-Pesa SMM Panel Kenya | janjez.social",
    description: "Buy Instagram followers, YouTube views, TikTok likes in Kenya. 3 simple steps: choose service, place order, pay with M-Pesa. Instant delivery from KES 10.",
    images: ["/og-image.png"],
    creator: "@janjez_social",
  },
  alternates: {
    canonical: `${SITE_URL}/how-it-works`,
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
          "@type": "HowTo",
          name: "How to Buy SMM Services on janjez.social",
          description: "3 simple steps to buy Instagram followers, YouTube views, TikTok likes, and more with M-Pesa in Kenya.",
          step: [
            {
              "@type": "HowToStep",
              name: "Choose Service",
              text: "Browse our catalog of Instagram, YouTube, TikTok, X (Twitter), and WhatsApp growth services. Choose the exact package that fits your needs.",
            },
            {
              "@type": "HowToStep",
              name: "Place Your Order",
              text: "Enter your profile or post link, select quantity, and checkout securely with M-Pesa or wallet balance.",
            },
            {
              "@type": "HowToStep",
              name: "Pay with M-Pesa",
              text: "Complete payment via M-Pesa and watch your social media grow with instant delivery.",
            },
          ],
        }),
      }}
    />
  );
}
export { JsonLd };

export default function HowItWorksPage() {
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
              <span className="text-kenya-green font-medium">How It Works</span>
            </nav>
            <h1 className="text-3xl sm:text-4xl font-bold text-kenya-white mb-4">How It Works</h1>
            <p className="text-kenya-white/60 text-lg mb-8">Get started with janjez.social in 3 simple steps.</p>
            <div className="grid gap-6">
              <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-kenya-green text-kenya-black rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0">1</div>
                  <div>
                    <h2 className="text-kenya-white font-bold text-lg mb-2">Browse Services</h2>
                    <p className="text-kenya-white/70 text-sm leading-relaxed">Explore our catalog of Instagram, YouTube, TikTok, X (Twitter), and WhatsApp growth services. Choose the exact package that fits your needs.</p>
                  </div>
                </div>
              </div>
              <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-kenya-green text-kenya-black rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0">2</div>
                  <div>
                    <h2 className="text-kenya-white font-bold text-lg mb-2">Place Your Order</h2>
                    <p className="text-kenya-white/70 text-sm leading-relaxed">Enter your profile or post link, select quantity, and checkout securely with M-Pesa or wallet balance. Happy Hour discounts apply automatically.</p>
                  </div>
                </div>
              </div>
              <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-kenya-green text-kenya-black rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0">3</div>
                  <div>
                    <h2 className="text-kenya-white font-bold text-lg mb-2">Watch It Grow</h2>
                    <p className="text-kenya-white/70 text-sm leading-relaxed">Sit back while we deliver real, high-retention engagement to your account. Track progress in real time and enjoy the clout.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <Link href="/order" className="inline-flex items-center gap-2 bg-kenya-green text-kenya-black font-bold text-sm px-6 py-3 rounded-xl hover:bg-kenya-green/90 transition-colors">🛒 Start Order</Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
