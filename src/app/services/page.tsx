import AnnouncementBanner from "@/components/AnnouncementBanner";
import LiveTicker from "@/components/LiveTicker";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { listJanjezServices } from "@/lib/janjez-services";
import ServiceDenseList from "@/components/ServiceDenseList";
import { SITE_URL } from "../lib/config";

export const revalidate = 0;

export const metadata = {
  title: "SMM Services Kenya — M-Pesa Social Media Panel | janjez.social",
  description: "Explore all SMM services for Instagram, YouTube, TikTok, WhatsApp, X. Buy followers, likes, views in Kenya. M-Pesa payments. Instant delivery.",
  keywords: ["SMM panel Kenya", "Instagram followers Kenya", "YouTube views Kenya", "TikTok views Kenya", "WhatsApp channel members Kenya", "M-Pesa SMM panel", "cheap SMM panel East Africa", "social media marketing Nairobi", "drip-feed social media", "instant SMM delivery", "refill guarantee SMM", "Pata clout chapchap", "buy YouTube views Kenya", "Kenyan influencer boost", "TikTok viral boost"],
  category: "business",
  publisher: "janjez.social",
  applicationName: "janjez.social",
  openGraph: {
    title: "SMM Services Kenya — M-Pesa Social Media Panel | janjez.social",
    description: "Explore all SMM services for Instagram, YouTube, TikTok, WhatsApp, X. Buy followers, likes, views in Kenya. M-Pesa payments. Instant delivery.",
    url: `${SITE_URL}/services`,
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
    title: "SMM Services Kenya — M-Pesa Social Media Panel | janjez.social",
    description: "Explore all SMM services for Instagram, YouTube, TikTok, WhatsApp, X. Buy followers, likes, views in Kenya. M-Pesa payments. Instant delivery.",
    images: ["/og-image.png"],
    creator: "@janjez_social",
  },
  alternates: {
    canonical: `${SITE_URL}/services`,
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
          name: "Social Media Marketing Services",
          description: "SMM services for Instagram, YouTube, TikTok, WhatsApp, X and more.",
          provider: {
            "@type": "Organization",
            name: "janjez.social",
            url: SITE_URL,
          },
          areaServed: {
            "@type": "Country",
            name: "Kenya",
          },
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: "SMM Services",
            itemListElement: [
              { "@type": "Offer", itemOffered: { "@type": "Service", name: "Instagram Followers & Likes" } },
              { "@type": "Offer", itemOffered: { "@type": "Service", name: "YouTube Views & Subscribers" } },
              { "@type": "Offer", itemOffered: { "@type": "Service", name: "TikTok Views & Likes" } },
              { "@type": "Offer", itemOffered: { "@type": "Service", name: "WhatsApp Channel Members" } },
              { "@type": "Offer", itemOffered: { "@type": "Service", name: "X (Twitter) Followers" } },
              { "@type": "Offer", itemOffered: { "@type": "Service", name: "Facebook Likes & Shares" } },
            ],
          },
        }),
      }}
    />
  );
}
export { JsonLd };

export default async function ServicesPage() {
  const services = await listJanjezServices(true, "show_catalogue");

  return (
    <div className="min-h-screen flex bg-kenya-black">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <AnnouncementBanner />
        <LiveTicker />
        <Header />
        <main className="flex-1">
          <JsonLd />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-kenya-white mb-2">Services</h1>
              <p className="text-kenya-white/60 text-sm sm:text-base">
                Browse all services across platforms. Select a category to filter.
              </p>
            </div>
            <ServiceDenseList services={services} />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
