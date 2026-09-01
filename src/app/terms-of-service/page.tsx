import AnnouncementBanner from "@/components/AnnouncementBanner";
import LiveTicker from "@/components/LiveTicker";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { SITE_URL } from "../lib/config";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Terms of Service — SMM Panel Kenya | janjez.social",
  description: "Terms of Service for janjez.social SMM panel. M-Pesa payments, refill guarantees, and service terms for Kenyan users.",
  keywords: ["SMM panel Kenya", "M-Pesa SMM panel", "social media marketing Nairobi", "refill guarantee SMM", "cheap SMM panel East Africa", "Pata clout chapchap", "instant SMM delivery", "buy YouTube views Kenya", "Instagram followers Kenya", "TikTok views Kenya"],
  category: "business",
  publisher: "janjez.social",
  applicationName: "janjez.social",
  openGraph: {
    title: "Terms of Service — SMM Panel Kenya | janjez.social",
    description: "Terms of Service for janjez.social SMM panel. M-Pesa payments, refill guarantees, and service terms for Kenyan users.",
    url: `${SITE_URL}/terms-of-service`,
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
    title: "Terms of Service — SMM Panel Kenya | janjez.social",
    description: "Terms of Service for janjez.social SMM panel. M-Pesa payments, refill guarantees, and service terms for Kenyan users.",
    images: ["/og-image.png"],
    creator: "@janjez_social",
  },
  alternates: {
    canonical: `${SITE_URL}/terms-of-service`,
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
          "@type": "WebPage",
          name: "Terms of Service",
          description: "Terms of Service for janjez.social SMM panel.",
          url: `${SITE_URL}/terms-of-service`,
          publisher: {
            "@type": "Organization",
            name: "janjez.social",
            url: SITE_URL,
          },
          inLanguage: "en-KE",
        }),
      }}
    />
  );
}
export { JsonLd };

export default function TermsOfServicePage() {
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
              <span className="text-kenya-green font-medium">Terms of Service</span>
            </nav>
            <h1 className="text-3xl sm:text-4xl font-bold text-kenya-white mb-4">Terms of Service</h1>
            <p className="text-kenya-white/60 text-lg mb-8">Last updated: July 2026</p>
            <div className="space-y-6 text-kenya-white/70 text-sm leading-relaxed">
              <section className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6">
                <h2 className="text-kenya-white font-bold text-lg mb-3">1. Acceptance of Terms</h2>
                <p>By accessing or using janjez.social, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use our services.</p>
              </section>
              <section className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6">
                <h2 className="text-kenya-white font-bold text-lg mb-3">2. Services</h2>
                <p>We provide social media engagement services including followers, likes, views, and other promotional services. All services are delivered according to the specifications described on each product page.</p>
              </section>
              <section className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6">
                <h2 className="text-kenya-white font-bold text-lg mb-3">3. Payments</h2>
                <p>All payments are processed securely through M-Pesa or wallet top-ups. Prices are displayed in KES and may be subject to applicable taxes. Happy Hour discounts are time-limited and automatically applied.</p>
              </section>
              <section className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6">
                <h2 className="text-kenya-white font-bold text-lg mb-3">4. Refunds</h2>
                <p>Due to the digital nature of our services, we generally do not offer refunds once an order has been started. However, we provide refill guarantees on select services as described on individual product pages.</p>
              </section>
              <section className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6">
                <h2 className="text-kenya-white font-bold text-lg mb-3">5. Account Responsibility</h2>
                <p>You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account. Ensure your social profiles remain public during fulfillment.</p>
              </section>
              <section className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6">
                <h2 className="text-kenya-white font-bold text-lg mb-3">6. Limitation of Liability</h2>
                <p>janjez.social shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use our services.</p>
              </section>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
