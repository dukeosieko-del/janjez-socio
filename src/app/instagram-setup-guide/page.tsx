import AnnouncementBanner from "@/components/AnnouncementBanner";
import LiveTicker from "@/components/LiveTicker";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import { SITE_URL } from "../lib/config";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Instagram Flag for Review Guide — SMM Kenya | janjez.social",
  description: "Resolve Instagram 'Flag for Review' notices. Step-by-step guide to configure your account before buying Instagram followers in Kenya. M-Pesa payments.",
  keywords: ["Instagram followers Kenya", "SMM panel Kenya", "M-Pesa SMM panel", "social media marketing Nairobi", "Pata clout chapchap", "cheap SMM panel East Africa", "buy YouTube views Kenya", "TikTok views Kenya", "instant SMM delivery", "refill guarantee SMM", "WhatsApp channel members Kenya", "drip-feed social media", "Kenyan influencer boost", "SMM reseller Kenya", "M-Pesa payment SMM"],
  category: "business",
  publisher: "janjez.social",
  applicationName: "janjez.social",
  openGraph: {
    title: "Instagram Flag for Review Guide — SMM Kenya | janjez.social",
    description: "Resolve Instagram 'Flag for Review' notices. Step-by-step guide to configure your account before buying Instagram followers in Kenya. M-Pesa payments.",
    url: `${SITE_URL}/instagram-setup-guide`,
    siteName: "janjez.social",
    locale: "en_KE",
    type: "article",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Instagram Flag for Review Guide — SMM Kenya | janjez.social",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Instagram Flag for Review Guide — SMM Kenya | janjez.social",
    description: "Resolve Instagram 'Flag for Review' notices. Step-by-step guide to configure your account before buying Instagram followers in Kenya. M-Pesa payments.",
    images: ["/og-image.png"],
    creator: "@janjez_social",
  },
  alternates: {
    canonical: `${SITE_URL}/instagram-setup-guide`,
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
              "@type": "Article",
              headline: "Instagram Account Flag for Review & Resolution Guide",
              description: "Learn how to resolve Instagram 'Flag for Review' notices and properly configure your account before submitting SMM promotion orders.",
              image: `${SITE_URL}/instagram-setup-guide-feature.jpg`,
              datePublished: "2026-07-20",
              author: {
                "@type": "Organization",
                name: "janjez.social",
                url: SITE_URL,
              },
              publisher: {
                "@type": "Organization",
                name: "janjez.social",
                url: SITE_URL,
              },
            },
            {
              "@type": "HowTo",
              name: "How to Resolve Instagram Flag for Review",
              description: "Step-by-step guide to configure your Instagram account before placing SMM orders.",
              step: [
                {
                  "@type": "HowToStep",
                  name: "Check Account Privacy Settings",
                  text: "Ensure your account is set to Public. Private accounts block automated delivery of followers and likes.",
                },
                {
                  "@type": "HowToStep",
                  name: "Clear Platform Restrictions",
                  text: "Check Account Status in Instagram settings to ensure no active community guideline flags or shadowbans.",
                },
                {
                  "@type": "HowToStep",
                  name: "Correct Link Formatting",
                  text: "Use clean profile URLs without tracking parameters or shortened URLs.",
                },
                {
                  "@type": "HowToStep",
                  name: "Avoid Simultaneous Orders",
                  text: "Do not stack multiple providers on the same link concurrently to prevent delivery conflicts.",
                },
              ],
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: SITE_URL,
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Blog & News",
                  item: `${SITE_URL}/blog`,
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: "Instagram Account Flag for Review & Resolution Guide",
                  item: `${SITE_URL}/instagram-setup-guide`,
                },
              ],
            },
          ],
        }),
      }}
    />
  );
}
export { JsonLd };

export default function InstagramSetupGuidePage() {
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
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-kenya-white/50 mb-6">
              <Link href="/" className="hover:text-kenya-green transition-colors">Home</Link>
              <span>/</span>
              <span className="text-kenya-green font-medium">Instagram Account Flag for Review & Resolution Guide</span>
            </nav>

            {/* Content Heading */}
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-kenya-white mb-3">
                Instagram Account Flag for Review & Resolution Guide
              </h1>
              <p className="text-kenya-white/60 text-lg">
                Learn how to resolve Instagram &quot;Flag for Review&quot; notices and properly configure your account before submitting SMM promotion orders.
              </p>
            </div>

            {/* Featured Blog Image */}
            <div className="mb-8 rounded-2xl overflow-hidden border border-kenya-white/10">
              <div className="relative w-full h-auto">
                <Image
                  src="/instagram-setup-guide-feature.jpg"
                  alt="Instagram Setup Guide Feature"
                  width={1200}
                  height={800}
                  priority
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>

            {/* Critical Warning & Compliance Banner */}
            <div className="bg-kenya-red/10 border border-kenya-red/30 rounded-2xl p-6 mb-8 flex items-start gap-4">
              <div className="w-10 h-10 bg-kenya-red/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="h-6 w-6 text-kenya-red" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h2 className="text-kenya-white font-bold text-lg mb-2">Critical Warning</h2>
                <p className="text-kenya-white/80 text-sm leading-relaxed">
                  Why is your Instagram account or link flagged for review? Learn how to properly configure your profile settings, switch to public mode, and clear restrictions before submitting SMM orders to ensure smooth delivery and avoid service rejection.
                </p>
              </div>
            </div>

            {/* Step-by-Step Resolution Instructions */}
            <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6 sm:p-8 mb-8">
              <h2 className="text-2xl font-bold text-kenya-white mb-6">Step-by-Step Resolution Instructions</h2>

              <div className="space-y-6">
                {/* Step 1 */}
                <div className="bg-kenya-black/40 rounded-xl p-5 border border-kenya-white/5">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-kenya-green text-kenya-black rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0">
                      1
                    </div>
                    <div>
                      <h3 className="text-kenya-white font-bold mb-2">Check Account Privacy Settings</h3>
                      <p className="text-kenya-white/70 text-sm leading-relaxed">
                        Ensure your account is set to <strong className="text-kenya-white">Public</strong>. Private accounts block automated delivery of followers and likes. Go to Settings → Privacy → Account privacy and toggle it to Public.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="bg-kenya-black/40 rounded-xl p-5 border border-kenya-white/5">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-kenya-green text-kenya-black rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0">
                      2
                    </div>
                    <div>
                      <h3 className="text-kenya-white font-bold mb-2">Clear Platform Restrictions</h3>
                      <p className="text-kenya-white/70 text-sm leading-relaxed">
                        Check <strong className="text-kenya-white">Account Status</strong> in Instagram settings to ensure no active community guideline flags or shadowbans. If flagged, submit an appeal immediately and wait for Instagram&apos;s resolution before placing orders.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="bg-kenya-black/40 rounded-xl p-5 border border-kenya-white/5">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-kenya-green text-kenya-black rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0">
                      3
                    </div>
                    <div>
                      <h3 className="text-kenya-white font-bold mb-2">Correct Link Formatting</h3>
                      <p className="text-kenya-white/70 text-sm leading-relaxed">
                        Use clean profile URLs like <code className="bg-kenya-white/10 px-2 py-0.5 rounded text-kenya-green">https://instagram.com/username</code> or direct post links without tracking parameters or shortened URLs.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="bg-kenya-black/40 rounded-xl p-5 border border-kenya-white/5">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-kenya-green text-kenya-black rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0">
                      4
                    </div>
                    <div>
                      <h3 className="text-kenya-white font-bold mb-2">Avoid Simultaneous Orders</h3>
                      <p className="text-kenya-white/70 text-sm leading-relaxed">
                        Do not stack multiple providers on the same link concurrently to prevent delivery conflicts and automated review flags. Wait for one order to complete before placing another service order on the same account or post.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Navigation Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/order?category=instagram"
                className="inline-flex items-center justify-center gap-2 bg-kenya-green text-kenya-black font-bold text-sm px-6 py-3 rounded-xl hover:bg-kenya-green/90 transition-colors"
              >
                🛒 Place Order Now - Instagram Services
              </Link>
              <Link
                href="https://wa.me/2540117546224"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-kenya-white/10 text-kenya-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-kenya-white/20 transition-colors border border-kenya-white/20"
              >
                💬 Contact Support (Direct WhatsApp)
              </Link>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
