"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useMemo } from "react";
import { getPlatformAvatar } from "@/lib/platform-avatars";
import { KNOWN_PLATFORMS, matchPlatform } from "@/lib/service-queries";
import { normalizeSlug } from "@/lib/janjez-services";

interface ServiceDenseItem {
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
}

interface ServiceDenseListProps {
  services: ServiceDenseItem[];
}

export default function ServiceDenseList({ services }: ServiceDenseListProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");

  const grouped = useMemo(() => {
    const map: Record<string, Record<string, ServiceDenseItem[]>> = {};
    for (const svc of services) {
      const platform = matchPlatform(svc.category) || "others";
      const subcategory = svc.subcategory?.trim() || "General";
      if (!map[platform]) map[platform] = {};
      if (!map[platform][subcategory]) map[platform][subcategory] = [];
      map[platform][subcategory].push(svc);
    }
    return map;
  }, [services]);

  const visiblePlatforms = useMemo(() => {
    if (selectedPlatform === "all") return Object.keys(grouped).sort();
    return grouped[selectedPlatform] ? [selectedPlatform] : [];
  }, [selectedPlatform, grouped]);

  const flatCount = useMemo(() => {
    if (selectedPlatform === "all") return services.length;
    const subs = grouped[selectedPlatform];
    if (!subs) return 0;
    return Object.values(subs).reduce((sum, arr) => sum + arr.length, 0);
  }, [selectedPlatform, grouped, services]);

  return (
    <div>
      <div className="mb-6">
        <label className="block text-xs font-semibold text-kenya-white/60 uppercase tracking-wider mb-2">
          Select Category
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedPlatform("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedPlatform === "all"
                ? "bg-kenya-green text-kenya-black"
                : "bg-kenya-white/10 text-kenya-white hover:bg-kenya-white/20"
            }`}
          >
            All
          </button>
          {KNOWN_PLATFORMS.map((platform) => {
            const subs = grouped[platform];
            const count = subs ? Object.values(subs).reduce((sum, arr) => sum + arr.length, 0) : 0;
            return (
              <button
                key={platform}
                onClick={() => setSelectedPlatform(platform)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  selectedPlatform === platform
                    ? "bg-kenya-green text-kenya-black"
                    : "bg-kenya-white/10 text-kenya-white hover:bg-kenya-white/20"
                }`}
              >
                <Image
                  src={getPlatformAvatar(platform)}
                  alt={platform}
                  width={14}
                  height={14}
                  className="w-3.5 h-3.5 object-contain"
                />
                {platform.charAt(0).toUpperCase() + platform.slice(1).replace(/-/g, " ")}
                {count > 0 && (
                  <span className={`ml-0.5 ${selectedPlatform === platform ? "text-kenya-black/70" : "text-kenya-white/50"}`}>
                    ({count})
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {flatCount === 0 ? (
        <div className="text-center text-kenya-white/50 py-12 text-sm">
          No services available for this category yet.
        </div>
      ) : (
        <div className="space-y-8">
          {visiblePlatforms.map((platform) => {
            const subcategories = grouped[platform] || {};
            const sortedSubs = Object.keys(subcategories).sort((a, b) => a.localeCompare(b));

            return (
              <div key={platform}>
                <div className="flex items-center gap-2 mb-3">
                  <Image
                    src={getPlatformAvatar(platform)}
                    alt={platform}
                    width={20}
                    height={20}
                    className="w-5 h-5 object-contain"
                  />
                  <h2 className="text-base font-bold text-kenya-white capitalize">
                    {platform.replace(/-/g, " ")}
                  </h2>
                  <span className="text-xs text-kenya-white/40">
                    {sortedSubs.reduce((sum, sub) => sum + subcategories[sub].length, 0)} service{sortedSubs.reduce((sum, sub) => sum + subcategories[sub].length, 0) !== 1 ? "s" : ""}
                  </span>
                </div>

                {sortedSubs.map((subcategory) => (
                  <div key={subcategory} className="mb-6">
                    <h3 className="text-xs font-bold text-kenya-green uppercase tracking-wider mb-2">
                      {subcategory}
                    </h3>
                    <div className="space-y-1.5">
                      {subcategories[subcategory]
                        .sort((a, b) => a.display_order - b.display_order || a.name.localeCompare(b.name))
                        .map((svc) => {
                          const platformSlug = matchPlatform(svc.category) || "others";
                          const subSlug = normalizeSlug(svc.subcategory || "general");
                          const svcSlug = normalizeSlug(svc.slug);
                          const href = `/services/${platformSlug}/${subSlug}/${svcSlug}`;

                          return (
                            <div
                              key={svc.id}
                              className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 bg-kenya-white/5 border border-kenya-white/10 rounded-lg px-3 py-2.5 hover:border-kenya-white/20 transition-colors"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="text-kenya-white font-medium text-sm truncate">
                                    {svc.name}
                                  </h4>
                                  {svc.supports_refill && (
                                    <span className="text-[10px] font-semibold text-kenya-green bg-kenya-green/10 px-1.5 py-0.5 rounded whitespace-nowrap">
                                      Refill
                                    </span>
                                  )}
                                  {svc.supports_drip_feed && (
                                    <span className="text-[10px] font-semibold text-kenya-white/70 bg-kenya-white/10 px-1.5 py-0.5 rounded whitespace-nowrap">
                                      Drip
                                    </span>
                                  )}
                                </div>
                                {svc.description && (
                                  <p className="text-kenya-white/40 text-xs mt-0.5 line-clamp-1">
                                    {svc.description}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center gap-3 sm:gap-5 text-xs text-kenya-white/60 flex-shrink-0">
                                <div className="text-center">
                                  <span className="block text-kenya-white font-semibold text-sm">
                                    KES {Number(svc.selling_price_ksh).toFixed(2)}
                                  </span>
                                  <span className="text-kenya-white/40">per 1k</span>
                                </div>
                                <div className="text-center hidden sm:block">
                                  <span className="block text-kenya-white">{svc.min_quantity.toLocaleString()}</span>
                                  <span className="text-kenya-white/40">min</span>
                                </div>
                                <div className="text-center hidden sm:block">
                                  <span className="block text-kenya-white">{svc.max_quantity.toLocaleString()}</span>
                                  <span className="text-kenya-white/40">max</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 flex-shrink-0">
                                <Link
                                  href={href}
                                  className="px-3 py-1.5 text-xs font-medium text-kenya-white bg-kenya-white/10 rounded-lg hover:bg-kenya-white/20 transition-colors whitespace-nowrap"
                                >
                                  View
                                </Link>
                                <Link
                                  href={href}
                                  className="px-3 py-1.5 text-xs font-bold text-kenya-black bg-kenya-green rounded-lg hover:bg-kenya-green/90 transition-colors whitespace-nowrap"
                                >
                                  Order Now
                                </Link>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
