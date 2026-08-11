"use client";

import { PLATFORMS } from "@/lib/data";
import Link from "next/link";
import Image from "next/image";

export default function ServiceCatalog() {
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLATFORMS.map((platform) => (
            <Link
              key={platform.id}
              href={platform.href}
              className="group relative bg-kenya-black border border-kenya-white/10 rounded-2xl p-6 hover:border-kenya-green/50 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-xl hover:shadow-kenya-green/5"
            >
              <div className={`absolute inset-0 ${platform.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}></div>

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
                    {platform.services.length} services
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
            🛒 View Full Catalog
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
