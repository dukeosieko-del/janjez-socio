"use client";

import AnnouncementBanner from "@/components/AnnouncementBanner";
import LiveTicker from "@/components/LiveTicker";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useMemo } from "react";
import { TAXONOMY_PLATFORMS, getTaxonomyPlatform } from "@/lib/taxonomy";
import { getCategoryIcon } from "@/lib/category-icons";
import { getPlatformSlug, slugify } from "@/lib/service-routes";

interface PlatformPageProps {
  params: { platform: string };
}

export default function PlatformPage({ params }: PlatformPageProps) {
  const catalogItem = useMemo(() => getTaxonomyPlatform(params.platform), [params.platform]);

  if (!catalogItem) {
    return (
      <div className="min-h-screen flex bg-kenya-black">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
          <AnnouncementBanner />
          <LiveTicker />
          <Header />
          <main className="flex-1">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              <nav className="flex items-center gap-2 text-sm text-kenya-white/50 mb-6">
                <Link href="/services" className="hover:text-kenya-green transition-colors">Services</Link>
                <span>/</span>
                <span className="text-kenya-white font-medium capitalize">{params.platform.replace(/-/g, " ")}</span>
              </nav>
              <h1 className="text-3xl sm:text-4xl font-bold text-kenya-white mb-4">Platform not found</h1>
              <Link href="/services" className="text-kenya-green hover:underline">Back to services</Link>
            </div>
          </main>
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-kenya-black">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <AnnouncementBanner />
        <LiveTicker />
        <Header />
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <nav className="flex items-center gap-2 text-sm text-kenya-white/50 mb-6">
              <Link href="/services" className="hover:text-kenya-green transition-colors">Services</Link>
              <span>/</span>
              <span className="text-kenya-green font-medium">{catalogItem.name}</span>
            </nav>
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-kenya-white mb-2">{catalogItem.name}</h1>
              <p className="text-kenya-white/60">{catalogItem.subcategories.length} subcategories</p>
            </div>

            <div className="flex flex-col gap-4">
              {catalogItem.subcategories.map((sub, idx) => {
                const subSlug = `sub-${slugify(sub.name)}`;
                const href = `/services/${params.platform}/${subSlug}`;

                return (
                  <Link
                    key={sub.name + idx}
                    href={href}
                    className="flex items-center gap-4 bg-kenya-white/5 border border-kenya-white/10 rounded-2xl px-5 py-4 transition-all duration-300 hover:-translate-y-1 hover:border-kenya-white/20"
                  >
                    <div className="w-12 h-12 flex-shrink-0 bg-kenya-white/5 rounded-xl flex items-center justify-center">
                      <span className="text-lg">📦</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-kenya-white font-semibold text-base truncate">{sub.name}</p>
                      <p className="text-kenya-white/50 text-xs">{sub.deliverables.length} deliverable{sub.deliverables.length !== 1 ? "s" : ""}</p>
                    </div>
                    <span className="text-kenya-white/40 text-xs">→</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
