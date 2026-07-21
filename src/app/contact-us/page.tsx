import AnnouncementBanner from "@/components/AnnouncementBanner";
import LiveTicker from "@/components/LiveTicker";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default function ContactUsPage() {
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
              <span className="text-kenya-green font-medium">Contact Us</span>
            </nav>
            <h1 className="text-3xl sm:text-4xl font-bold text-kenya-white mb-4">Contact Us</h1>
            <p className="text-kenya-white/60 text-lg mb-8">Have a question or need help? We&apos;re here for you.</p>
            <div className="grid gap-6">
              <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6">
                <h2 className="text-kenya-white font-bold text-lg mb-2">💬 WhatsApp Support</h2>
                <p className="text-kenya-white/70 text-sm leading-relaxed mb-4">Chat with us directly on WhatsApp for instant support.</p>
                <a href="https://wa.link/cvhal8" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-kenya-green text-kenya-black font-bold text-sm px-6 py-3 rounded-xl hover:bg-kenya-green/90 transition-colors">Open WhatsApp</a>
              </div>
              <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6">
                <h2 className="text-kenya-white font-bold text-lg mb-2">📧 Email</h2>
                <p className="text-kenya-white/70 text-sm leading-relaxed">Send us an email and we&apos;ll respond within 24 hours.</p>
                <p className="text-kenya-green font-mono text-sm mt-2">support@janjez.social</p>
              </div>
              <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6">
                <h2 className="text-kenya-white font-bold text-lg mb-2">📱 Phone</h2>
                <p className="text-kenya-white/70 text-sm leading-relaxed">Call or text us for urgent issues.</p>
                <p className="text-kenya-green font-mono text-sm mt-2">+254 700 000 000</p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
