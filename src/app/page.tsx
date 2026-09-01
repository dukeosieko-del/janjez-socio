import AnnouncementBanner from "@/components/AnnouncementBanner";
import LiveTicker from "@/components/LiveTicker";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ServiceCatalogClient from "@/components/ServiceCatalogClient";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import HomeRedirect from "@/components/HomeRedirect";
import { SITE_URL } from "./lib/config";

export const metadata = {
  title: "Buy YouTube Views Kenya — M-Pesa SMM Panel | janjez.social",
  description: "Buy YouTube views, subscribers, and watch time in Kenya. Pay with M-Pesa. Instant delivery from KES 10. Refill guarantee. Pata clout chapchap.",
  keywords: ["SMM panel Kenya", "M-Pesa SMM panel", "buy YouTube views Kenya", "Instagram followers Kenya", "TikTok views Kenya", "WhatsApp channel members Kenya", "cheap SMM panel East Africa", "social media marketing Nairobi", "Pata clout chapchap", "instant SMM delivery", "refill guarantee SMM", "drip-feed social media", "M-Pesa payment SMM", "Kenyan influencer boost", "SMM reseller Kenya"],
  category: "business",
  publisher: "janjez.social",
  applicationName: "janjez.social",
  "geo.region": "KE",
  "geo.placename": "Nairobi",
  rating: "general",
  verification: {
    google: "placeholder",
  },
  openGraph: {
    title: "Buy YouTube Views Kenya — M-Pesa SMM Panel | janjez.social",
    description: "Buy YouTube views, subscribers, and watch time in Kenya. Pay with M-Pesa. Instant delivery from KES 10. Refill guarantee. Pata clout chapchap.",
    url: SITE_URL,
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
    title: "Buy YouTube Views Kenya — M-Pesa SMM Panel | janjez.social",
    description: "Buy YouTube views, subscribers, and watch time in Kenya. Pay with M-Pesa. Instant delivery from KES 10. Refill guarantee. Pata clout chapchap.",
    images: ["/og-image.png"],
    creator: "@janjez_social",
  },
  alternates: {
    canonical: SITE_URL,
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
          "@graph": [
            {
              "@type": "Organization",
              "@id": `${SITE_URL}/#organization`,
              name: "janjez.social",
              url: SITE_URL,
              logo: `${SITE_URL}/og-image.png`,
              sameAs: [
                "https://www.facebook.com/profile.php?id=61592028091844",
                "https://wa.me/2540117546224",
              ],
            },
            {
              "@type": "WebSite",
              "@id": `${SITE_URL}/#website`,
              url: SITE_URL,
              name: "janjez.social",
              description: "Kenya's plug for instant social clout. Automated SMM panel.",
              publisher: { "@id": `${SITE_URL}/#organization` },
              inLanguage: "en-KE",
            },
            {
              "@type": "LocalBusiness",
              "@id": `${SITE_URL}/#localbusiness`,
              name: "janjez.social",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Nairobi",
                addressRegion: "Nairobi County",
                addressCountry: "KE",
              },
              priceRange: "KES",
              openingHours: ["Mo-Su 00:00-23:59"],
              telephone: "+254-011-754-6224",
              url: SITE_URL,
              sameAs: [
                "https://www.facebook.com/profile.php?id=61592028091844",
                "https://wa.me/2540117546224",
              ],
            },
          ],
        }),
      }}
    />
  );
}
export { JsonLd };

export default function Home() {
  return (
    <>
      <HomeRedirect />
      <JsonLd />
      <div className="min-h-screen flex bg-kenya-black">
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
          <AnnouncementBanner />
          <LiveTicker />
          <Header />

          <main className="flex-1">
            <Hero />
            <ServiceCatalogClient />
          </main>

          <Footer />
        </div>
      </div>
    </>
  );
}
