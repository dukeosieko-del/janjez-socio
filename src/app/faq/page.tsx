import AnnouncementBanner from "@/components/AnnouncementBanner";
import LiveTicker from "@/components/LiveTicker";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { SITE_URL } from "../lib/config";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "FAQ — SMM Panel Kenya M-Pesa Support | janjez.social",
  description: "Frequently asked questions about janjez.social SMM panel. Learn about M-Pesa payments, delivery times, refill guarantees, and account safety for Kenyan users.",
  keywords: ["SMM panel Kenya", "M-Pesa SMM panel", "refill guarantee SMM", "Instagram followers Kenya", "buy YouTube views Kenya", "TikTok views Kenya", "instant SMM delivery", "social media marketing Nairobi", "Pata clout chapchap", "cheap SMM panel East Africa", "drip-feed social media", "Kenyan influencer boost", "WhatsApp channel members Kenya", "M-Pesa payment SMM", "SMM reseller Kenya"],
  category: "business",
  publisher: "janjez.social",
  applicationName: "janjez.social",
  openGraph: {
    title: "FAQ — SMM Panel Kenya M-Pesa Support | janjez.social",
    description: "Frequently asked questions about janjez.social SMM panel. Learn about M-Pesa payments, delivery times, refill guarantees, and account safety for Kenyan users.",
    url: `${SITE_URL}/faq`,
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
    title: "FAQ — SMM Panel Kenya M-Pesa Support | janjez.social",
    description: "Frequently asked questions about janjez.social SMM panel. Learn about M-Pesa payments, delivery times, refill guarantees, and account safety for Kenyan users.",
    images: ["/og-image.png"],
    creator: "@janjez_social",
  },
  alternates: {
    canonical: `${SITE_URL}/faq`,
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
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "How long does delivery take for SMM services in Kenya?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Delivery times vary by service. Most instant services start within minutes, while gradual packages may take up to 24 hours. We pride ourselves on fast delivery across Kenya.",
              },
            },
            {
              "@type": "Question",
              name: "Do you offer refill guarantees on SMM services?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes, many services come with refill guarantees ranging from 7 to 60 days. Check each service page for specific refill guarantee details before purchasing.",
              },
            },
            {
              "@type": "Question",
              name: "Is my Instagram or TikTok account safe with janjez.social?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "We use real-quality accounts and never ask for your password. Always keep your account public during fulfillment for best results.",
              },
            },
            {
              "@type": "Question",
              name: "What payment methods do you accept in Kenya?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "We accept M-Pesa directly, as well as wallet top-ups for faster checkout. All transactions are secure and encrypted.",
              },
            },
            {
              "@type": "Question",
              name: "Can I buy YouTube views and watch time in Kenya?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes, we offer high-retention YouTube views, subscribers, and watch time services. All views are from real users to help with monetization.",
              },
            },
            {
              "@type": "Question",
              name: "Do you deliver WhatsApp channel members?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes, we offer WhatsApp channel and group member growth services. Delivery is gradual to maintain account safety.",
              },
            },
            {
              "@type": "Question",
              name: "What is drip-feed delivery?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Drip-feed delivery spreads your order over time for a natural growth pattern. This reduces the risk of account flags and looks more organic to platform algorithms.",
              },
            },
            {
              "@type": "Question",
              name: "Can I become an SMM reseller in Kenya?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes, our reseller program is perfect for Kenyan agencies and marketers. Get discounted rates, dedicated support, and a custom dashboard.",
              },
            },
            {
              "@type": "Question",
              name: "Do you support TikTok viral boost services?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes, we offer TikTok views, likes, and engagement services to help boost your videos and increase viral potential on the platform.",
              },
            },
            {
              "@type": "Question",
              name: "How do I contact janjez.social support in Nairobi?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "You can reach us via WhatsApp at +254 011 754 6224, email through our contact form, or visit our office in Nairobi. We typically respond within 24 hours.",
              },
            },
          ],
        }),
      }}
    />
  );
}
export { JsonLd };

export default function FaqPage() {
  const faqs = [
    { q: "How long does delivery take?", a: "Delivery times vary by service. Most instant services start within minutes, while gradual packages may take up to 24 hours." },
    { q: "Do you offer refill guarantees?", a: "Yes, many services come with refill guarantees ranging from 7 to 60 days. Check each service page for details." },
    { q: "Is my account safe?", a: "We use real-quality accounts and never ask for your password. Always keep your account public during fulfillment." },
    { q: "What payment methods do you accept?", a: "We accept M-Pesa directly, as well as wallet top-ups for faster checkout." },
    { q: "Can I place an order without an account?", a: "All orders require a janjez.social account. Signing up takes seconds with email and phone number." },
    { q: "What is Happy Hour?", a: "Happy Hour is our featured service selector. Click the Happy Hour button in the header to be taken to a random drip-feed service." },
  ];
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
              <span className="text-kenya-green font-medium">FAQ</span>
            </nav>
            <h1 className="text-3xl sm:text-4xl font-bold text-kenya-white mb-4">Frequently Asked Questions</h1>
            <p className="text-kenya-white/60 text-lg mb-8">Everything you need to know about janjez.social.</p>
            <div className="space-y-4">
              {faqs.map((item, idx) => (
                <div key={idx} className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6">
                  <h2 className="text-kenya-white font-bold text-lg mb-2">{item.q}</h2>
                  <p className="text-kenya-white/70 text-sm leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Link href="/contact-us" className="inline-flex items-center gap-2 bg-kenya-green text-kenya-black font-bold text-sm px-6 py-3 rounded-xl hover:bg-kenya-green/90 transition-colors">💬 Still have questions?</Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
