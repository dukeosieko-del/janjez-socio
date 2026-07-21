import AnnouncementBanner from "@/components/AnnouncementBanner";
import LiveTicker from "@/components/LiveTicker";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default function WhyChooseUsPage() {
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
