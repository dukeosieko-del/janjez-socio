"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface JanjezServiceSummary {
  id: string;
  name: string;
  slug: string;
  category: string;
  subcategory: string | null;
}

export default function HappyHourButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/services/happy-hour?count=1");
      if (!res.ok) throw new Error("Failed to find Happy Hour service");
      const { services } = await res.json();
      if (!services || services.length === 0) {
        alert("No Happy Hour services available right now. Check back later!");
        setLoading(false);
        return;
      }
      const svc = services[0] as JanjezServiceSummary;
      const path = svc.subcategory
        ? `/services/${svc.category}/${svc.subcategory}/${svc.slug}`
        : `/services/${svc.category}/${svc.slug}`;
      router.push(path);
    } catch (err) {
      console.error("Happy Hour error:", err);
      alert("Could not find a Happy Hour service. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center gap-2 bg-kenya-red/10 text-kenya-red font-bold text-sm px-4 py-2 rounded-xl hover:bg-kenya-red/20 transition-all border border-kenya-red/30 disabled:opacity-50"
      aria-label="Happy Hour - get a random drip-feed service"
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-kenya-red border-t-transparent rounded-full animate-spin" />
      ) : (
        <span>🎲</span>
      )}
      <span>{loading ? "Picking..." : "Happy Hour"}</span>
    </button>
  );
}
