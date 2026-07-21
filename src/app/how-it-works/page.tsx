import AnnouncementBanner from "@/components/AnnouncementBanner";
import LiveTicker from "@/components/LiveTicker";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default function HowItWorksPage() {
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
