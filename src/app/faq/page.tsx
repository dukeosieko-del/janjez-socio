import AnnouncementBanner from "@/components/AnnouncementBanner";
import LiveTicker from "@/components/LiveTicker";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import Link from "next/link";

export const dynamic = 'force-dynamic';

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
