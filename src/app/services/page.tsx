"use client";

import { useState, useEffect } from "react";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import LiveTicker from "@/components/LiveTicker";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import ServiceDenseList from "@/components/ServiceDenseList";

export default function ServicesPage() {
  return (
    <div className="min-h-screen flex bg-kenya-black">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <AnnouncementBanner />
        <LiveTicker />
        <Header />
        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-kenya-white mb-2">Services</h1>
              <p className="text-kenya-white/60 text-sm sm:text-base">
                Browse all services across platforms. Select a category to filter.
              </p>
            </div>
            <ServiceDenseListFetcher />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}

function ServiceDenseListFetcher() {
  const [services, setServices] = useState<Array<{
    id: string;
    name: string;
    category: string;
    subcategory: string | null;
    slug: string;
    selling_price_ksh: number;
    min_quantity: number;
    max_quantity: number;
    supports_refill: boolean;
    supports_drip_feed: boolean;
    supports_cancel: boolean;
    description: string | null;
    display_order: number;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/services/catalogue?placement=show_catalogue")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.statusText)))
      .then((data) => {
        if (!cancelled) {
          setServices(data.services || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="text-center text-kenya-white/50 py-12 text-sm">Loading services…</div>
    );
  }

  return <ServiceDenseList services={services} />;
}
