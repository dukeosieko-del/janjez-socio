import AnnouncementBanner from "@/components/AnnouncementBanner";
import LiveTicker from "@/components/LiveTicker";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import Link from "next/link";
import {
  EMAIL_DEPARTMENTS,
  SITE_URL,
  SUPPORT_PHONE,
  SUPPORT_WHATSAPP,
} from "@/lib/email/config";
import ContactForm from "./ContactForm";

export const metadata = {
  title: "Contact Us — SMM Support Nairobi Kenya | janjez.social",
  description:
    "Contact janjez.social support in Nairobi. Email, WhatsApp, or call us for help with M-Pesa payments, orders, and SMM services in Kenya.",
  keywords: [
    "SMM panel Kenya",
    "M-Pesa SMM panel",
    "social media marketing Nairobi",
    "cheap SMM panel East Africa",
    "Instagram followers Kenya",
    "buy YouTube views Kenya",
    "instant SMM delivery",
    "Kenyan influencer boost",
    "Pata clout chapchap",
    "refill guarantee SMM",
    "TikTok views Kenya",
    "WhatsApp channel members Kenya",
    "drip-feed social media",
    "SMM reseller Kenya",
    "M-Pesa payment SMM",
  ],
  category: "business",
  publisher: "janjez.social",
  applicationName: "janjez.social",
  openGraph: {
    title: "Contact Us — SMM Support Nairobi Kenya | janjez.social",
    description:
      "Contact janjez.social support in Nairobi. Email, WhatsApp, or call us for help with M-Pesa payments, orders, and SMM services in Kenya.",
    url: `${SITE_URL}/contact-us`,
    siteName: "janjez.social",
    locale: "en_KE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us — SMM Support Nairobi Kenya | janjez.social",
    description:
      "Email, WhatsApp, or call janjez.social support in Nairobi for M-Pesa payments, orders, and SMM service help.",
  },
  alternates: {
    canonical: `${SITE_URL}/contact-us`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact janjez.social",
    description:
      "Reach the janjez.social support team in Nairobi for help with M-Pesa payments, SMM orders, and reseller onboarding.",
    url: `${SITE_URL}/contact-us`,
    publisher: {
      "@type": "Organization",
      name: "janjez.social",
      url: SITE_URL,
      logo: `${SITE_URL}/icons/icon-512.png`,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Nairobi",
        addressCountry: "KE",
      },
    },
    contactPoint: EMAIL_DEPARTMENTS.map((dept) => ({
      "@type": "ContactPoint",
      contactType: "customer support",
      areaServed: "KE",
      availableLanguage: ["English", "Swahili"],
      email: dept.address,
    })),
    telephone: SUPPORT_PHONE,
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function ContactUsPage() {
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
              <Link href="/" className="hover:text-kenya-green transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-kenya-green font-medium">Contact Us</span>
            </nav>
            <h1 className="text-3xl sm:text-4xl font-bold text-kenya-white mb-4">Contact Us</h1>
            <p className="text-kenya-white/60 text-lg mb-8">
              Have a question or need help? We&apos;re here for you.
            </p>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <ContactForm />
              </div>

              <div className="space-y-6">
                <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6">
                  <h3 className="text-kenya-white font-semibold mb-4">Department Emails</h3>
                  <ul className="space-y-3 text-sm">
                    {EMAIL_DEPARTMENTS.map((dept) => (
                      <li key={dept.address} className="flex flex-col">
                        <span className="text-kenya-white/80 font-medium">{dept.label}</span>
                        <a href={`mailto:${dept.address}`} className="text-kenya-green hover:underline">
                          {dept.address}
                        </a>
                        <span className="text-kenya-white/50 text-xs">{dept.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6">
                  <h3 className="text-kenya-white font-semibold mb-3">Direct Channels</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-kenya-white/70 block mb-1">WhatsApp</span>
                      <a
                        href={SUPPORT_WHATSAPP}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-kenya-green hover:underline"
                      >
                        Chat with us
                      </a>
                    </div>
                    <div>
                      <span className="text-kenya-white/70 block mb-1">Phone</span>
                      <a
                        href={`tel:${SUPPORT_PHONE.replace(/\s/g, "")}`}
                        className="text-kenya-green font-mono hover:underline"
                      >
                        {SUPPORT_PHONE}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
