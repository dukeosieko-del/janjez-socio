import AnnouncementBanner from "@/components/AnnouncementBanner";
import LiveTicker from "@/components/LiveTicker";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Blog & News — janjez.social",
  description: "Latest updates, guides, and insights from the janjez.social team. Tips on SMM, Instagram, YouTube, WhatsApp, and M-Pesa payments.",
};

export default function BlogPage() {
  const posts = [
    {
      title: "How to Avoid Instagram Flag for Review",
      excerpt: "Learn the best practices to keep your Instagram account safe while using SMM services.",
      date: "July 20, 2026",
      href: "/instagram-setup-guide",
    },
    {
      title: "Maximizing Your YouTube Watch Time",
      excerpt: "Tips and tricks to increase watch time organically while using our high-retention view services.",
      date: "July 18, 2026",
      href: "/services/youtube/watch-time",
    },
    {
      title: "Why WhatsApp Channel Reactions Are Trending",
      excerpt: "Discover why channel post reactions are becoming the go-to growth metric for WhatsApp creators.",
      date: "July 15, 2026",
      href: "/services/whatsapp/channel-post-reactions",
    },
    {
      title: "Happy Hour: Get 5% Off Every Order",
      excerpt: "Our Happy Hour promotion is live! Use the countdown timer in the header to catch limited-time discounts.",
      date: "July 12, 2026",
      href: "/services",
    },
    {
      title: "How M-Pesa Top-Up Works on janjez.social",
      excerpt: "Step-by-step guide on funding your janjez wallet via M-Pesa, minimum top-up amounts, and wallet remainder handling.",
      date: "July 10, 2026",
      href: "/how-it-works",
    },
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
              <span className="text-kenya-green font-medium">Blog & News</span>
            </nav>
            <h1 className="text-3xl sm:text-4xl font-bold text-kenya-white mb-4">Blog & News</h1>
            <p className="text-kenya-white/60 text-lg mb-8">Latest updates, guides, and insights from the janjez.social team.</p>
            <div className="grid gap-6">
              {posts.map((post, idx) => (
                <Link
                  key={idx}
                  href={post.href}
                  className="group bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6 hover:border-kenya-green/50 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h2 className="text-kenya-white font-bold text-lg group-hover:text-kenya-green transition-colors">{post.title}</h2>
                    <span className="text-xs text-kenya-white/40 flex-shrink-0 ml-4">{post.date}</span>
                  </div>
                  <p className="text-kenya-white/70 text-sm leading-relaxed">{post.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
