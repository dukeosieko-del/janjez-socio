import AnnouncementBanner from "@/components/AnnouncementBanner";
import LiveTicker from "@/components/LiveTicker";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default function ResellerAndApiPage() {
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
              <span className="text-kenya-green font-medium">Reseller & API</span>
            </nav>
            <h1 className="text-3xl sm:text-4xl font-bold text-kenya-white mb-4">Reseller & API</h1>
            <p className="text-kenya-white/60 text-lg mb-8">Power your business with our API and reseller program.</p>
            <div className="grid gap-6">
              <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6">
                <h2 className="text-kenya-white font-bold text-lg mb-2">🔌 Developer API</h2>
                <p className="text-kenya-white/70 text-sm leading-relaxed">Integrate our services directly into your platform. RESTful API with clear documentation, webhooks, and sandbox testing.</p>
              </div>
              <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6">
                <h2 className="text-kenya-white font-bold text-lg mb-2">🤝 Reseller Program</h2>
                <p className="text-kenya-white/70 text-sm leading-relaxed">Get discounted rates, dedicated support, and a custom dashboard. Perfect for agencies, marketers, and entrepreneurs.</p>
              </div>
              <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6">
                <h2 className="text-kenya-white font-bold text-lg mb-2">📈 Bulk Orders</h2>
                <p className="text-kenya-white/70 text-sm leading-relaxed">Need high volume? We offer tailored pricing for bulk campaigns and enterprise clients.</p>
              </div>
            </div>
            <div className="mt-8">
              <Link href="/contact-us" className="inline-flex items-center gap-2 bg-kenya-green text-kenya-black font-bold text-sm px-6 py-3 rounded-xl hover:bg-kenya-green/90 transition-colors">💬 Contact Sales</Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
