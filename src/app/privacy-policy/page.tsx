import AnnouncementBanner from "@/components/AnnouncementBanner";
import LiveTicker from "@/components/LiveTicker";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex bg-kenya-black">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <AnnouncementBanner />
        <LiveTicker />
        <Header />
        <main className="flex-1">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <nav className="flex items-center gap-2 text-sm text-kenya-white/50 mb-6">
              <Link href="/" className="hover:text-kenya-green transition-colors">Home</Link>
              <span>/</span>
              <span className="text-kenya-green font-medium">Privacy Policy</span>
            </nav>
            <h1 className="text-3xl sm:text-4xl font-bold text-kenya-white mb-4">Privacy Policy</h1>
            <p className="text-kenya-white/60 text-lg mb-8">Last updated: July 2026</p>
            <div className="space-y-6 text-kenya-white/70 text-sm leading-relaxed">
              <section className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6">
                <h2 className="text-kenya-white font-bold text-lg mb-3">1. Information We Collect</h2>
                <p>We collect minimal information necessary to process your orders, including your M-Pesa transaction details, order preferences, and contact information when you reach out to support.</p>
              </section>
              <section className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6">
                <h2 className="text-kenya-white font-bold text-lg mb-3">2. How We Use Your Information</h2>
                <p>Your information is used solely to process orders, deliver services, and provide customer support. We do not sell or share your personal data with third parties for marketing purposes.</p>
              </section>
              <section className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6">
                <h2 className="text-kenya-white font-bold text-lg mb-3">3. Data Security</h2>
                <p>We implement industry-standard security measures to protect your data. All payment processing is encrypted and handled through secure payment providers.</p>
              </section>
              <section className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6">
                <h2 className="text-kenya-white font-bold text-lg mb-3">4. Cookies</h2>
                <p>Our website uses essential cookies to ensure proper functionality. We do not use invasive tracking cookies or share cookie data with advertising networks.</p>
              </section>
              <section className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6">
                <h2 className="text-kenya-white font-bold text-lg mb-3">5. Contact</h2>
                <p>If you have questions about this Privacy Policy, please contact us through our <Link href="/contact-us" className="text-kenya-green hover:underline">Contact Us</Link> page.</p>
              </section>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
