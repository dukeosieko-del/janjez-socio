"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { getPlatformAvatar } from "@/lib/platform-avatars";

interface LandingService {
  id: string;
  category: string;
  name: string;
  selling_price_ksh: number;
  slug: string;
}

export default function ServiceCatalog() {
  const [platforms, setPlatforms] = useState<Array<{ id: string; name: string; icon: string; href: string; description: string; count: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch("/api/services/catalogue?placement=show_landing&active=true")
      .then((r) => r.ok ? r.json() : Promise.reject(r.statusText))
      .then((data) => {
        if (!cancelled) {
          const services = (data.services || []) as LandingService[];
          const platformMap = new Map<string, { id: string; name: string; icon: string; href: string; description: string; count: number }>();
          for (const svc of services) {
            const existing = platformMap.get(svc.category) || {
              id: svc.category,
              name: svc.category.charAt(0).toUpperCase() + svc.category.slice(1),
              icon: getPlatformAvatar(svc.category),
              href: `/services/${svc.category}`,
              description: svc.name,
              count: 0,
            };
            existing.count += 1;
            platformMap.set(svc.category, existing);
          }
          setPlatforms(Array.from(platformMap.values()));
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="py-20 bg-kenya-black" id="catalog">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-kenya-white mb-4">
            Service Catalog
          </h2>
          <p className="text-kenya-white/60 text-lg max-w-2xl mx-auto">
            Choose your platform and boost your social media presence with our
            premium services. All orders delivered instantly via secure API.
          </p>
        </div>

        {loading && (
          <div className="text-center text-kenya-white/50 py-12">Loading services…</div>
        )}

        {!loading && platforms.length === 0 && (
          <div className="text-center text-kenya-white/50 py-12">No services available. Check back soon!</div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {platforms.map((platform) => (
            <Link
              key={platform.id}
              href={platform.href}
              className="group relative bg-kenya-black border border-kenya-white/10 rounded-2xl p-6 hover:border-kenya-green/50 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-xl hover:shadow-kenya-green/5"
            >
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <Image src={platform.icon} alt={platform.name} width={32} height={32} className="w-8 h-8 object-contain" />
                  <h3 className="text-lg font-bold text-kenya-white group-hover:text-kenya-green transition-colors">
                    {platform.name}
                  </h3>
                </div>

                <p className="text-sm text-kenya-white/50 mb-4 line-clamp-2">
                  {platform.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-kenya-white/40 font-medium">
                    {platform.count} service{platform.count !== 1 ? "s" : ""}
                  </span>
                  <svg
                    className="h-5 w-5 text-kenya-green opacity-0 group-hover:opacity-100 transition-opacity"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link
            href="/services"
            className="inline-flex items-center gap-3 bg-kenya-green text-kenya-black font-bold text-lg px-10 py-4 rounded-xl hover:bg-kenya-green/90 transition-all hover:scale-105 shadow-lg shadow-kenya-green/20"
          >
            View Full Catalog
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}