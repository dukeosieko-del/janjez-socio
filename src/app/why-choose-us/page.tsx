import AnnouncementBanner from "@/components/AnnouncementBanner";
import LiveTicker from "@/components/LiveTicker";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { SITE_URL } from "../lib/config";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Why Choose Us — Best SMM Panel Kenya 2026 | janjez.social",
  description: "Kenya's most trusted SMM panel with M-Pesa payments, refill guarantees, and instant delivery. Join thousands of Kenyans growing with janjez.social.",
  keywords: ["best SMM panel 2026", "SMM panel Kenya", "M-Pesa SMM panel", "refill guarantee SMM", "instant SMM delivery", "social media marketing Nairobi", "Kenyan influencer boost", "cheap SMM panel East Africa", "Pata clout chapchap", "YouTube monetization subscribers", "buy YouTube views Kenya", "Instagram followers Kenya", "TikTok views Kenya", "drip-feed social media", "SMM reseller Kenya"],
  category: "business",
  publisher: "janjez.social",
  applicationName: "janjez.social",
  openGraph: {
    title: "Why Choose Us — Best SMM Panel Kenya 2026 | janjez.social",
    description: "Kenya's most trusted SMM panel with M-Pesa payments, refill guarantees, and instant delivery. Join thousands of Kenyans growing with janjez.social.",
    url: `${SITE_URL}/why-choose-us`,
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
    title: "Why Choose Us — Best SMM Panel Kenya 2026 | janjez.social",
    description: "Kenya's most trusted SMM panel with M-Pesa payments, refill guarantees, and instant delivery. Join thousands of Kenyans growing with janjez.social.",
    images: ["/og-image.png"],
    creator: "@janjez_social",
  },
  alternates: {
    canonical: `${SITE_URL}/why-choose-us`,
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
          "@type": "Organization",
          name: "janjez.social",
          url: SITE_URL,
          description: "Kenya's most trusted SMM panel for instant, reliable social growth.",
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.8",
            reviewCount: "1250",
            bestRating: "5",
            worstRating: "1",
          },
          review: [
            {
              "@type": "Review",
              author: { "@type": "Person", name: "James M." },
              datePublished: "2026-07-15",
              reviewBody: "Best SMM panel in Kenya. M-Pesa payments are so convenient and delivery is instant.",
              reviewRating: { "@type": "Rating", ratingValue: "5" },
            },
            {
              "@type": "Review",
              author: { "@type": "Person", name: "Sarah W." },
              datePublished: "2026-07-20",
              reviewBody: "Love the refill guarantee. My Instagram followers have stayed solid for weeks.",
              reviewRating: { "@type": "Rating", ratingValue: "5" },
            },
          ],
          sameAs: [
            "https://www.facebook.com/profile.php?id=61592028091844",
            "https://wa.me/2540117546224",
          ],
        }),
      }}
    />
  );
}
export { JsonLd };

export default function WhyChooseUsPage() {
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
              <span className="text-kenya-green font-medium">Why Choose Us</span>
            </nav>
            <h1 className="text-3xl sm:text-4xl font-bold text-kenya-white mb-4">Why Choose Us</h1>
            <p className="text-kenya-white/60 text-lg mb-8">Kenya&apos;s most trusted SMM panel for instant, reliable social growth.</p>
            <div className="grid gap-6">
              <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6">
                <h2 className="text-kenya-white font-bold text-lg mb-2">⚡ Instant Delivery</h2>
                <p className="text-kenya-white/70 text-sm leading-relaxed">Most orders start within minutes. We use high-speed delivery servers to ensure you get results fast.</p>
              </div>
              <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6">
                <h2 className="text-kenya-white font-bold text-lg mb-2">🔒 Secure Payments</h2>
                <p className="text-kenya-white/70 text-sm leading-relaxed">Pay safely with M-Pesa or wallet top-ups. Your transactions are encrypted and protected.</p>
              </div>
              <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6">
                <h2 className="text-kenya-white font-bold text-lg mb-2">🔄 Refill Guarantees</h2>
                <p className="text-kenya-white/70 text-sm leading-relaxed">Many services come with refill guarantees. If drops occur, we replenish automatically.</p>
              </div>
              <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6">
                <h2 className="text-kenya-white font-bold text-lg mb-2">🇰🇪 Proudly Kenyan</h2>
                <p className="text-kenya-white/70 text-sm leading-relaxed">Built for Kenya by Kenyans. We understand local payment methods, networks, and growth needs better than anyone else.</p>
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
