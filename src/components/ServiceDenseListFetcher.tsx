"use client";

import { useState, useEffect } from "react";
import ServiceDenseList from "@/components/ServiceDenseList";

export default function ServiceDenseListFetcher() {
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
