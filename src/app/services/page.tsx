"use client";

import Link from "next/link";
import { PLATFORMS } from "@/lib/data";

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-kenya-black">
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-14">
          <h1 className="text-4xl sm:text-5xl font-bold text-kenya-white mb-4">Services</h1>
          <p className="text-kenya-white/60 text-lg max-w-2xl mx-auto">
            Browse all available social media growth services. Choose a platform and service to place your order.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PLATFORMS.map((platform) => (
            <div
              key={platform.id}
              className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6 hover:border-kenya-white/20 transition-colors"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl ${platform.color} flex items-center justify-center overflow-hidden`}>
                  {platform.icon ? (
                    <img src={platform.icon} alt={platform.name} className="w-6 h-6 object-contain" />
                  ) : (
                    <span className="text-white font-bold text-sm">{platform.name[0]}</span>
                  )}
                </div>
                <div>
                  <h2 className="text-kenya-white font-bold text-lg">{platform.name}</h2>
                  <p className="text-kenya-white/50 text-sm">{platform.services.length} services</p>
                </div>
              </div>

              <p className="text-kenya-white/70 text-sm mb-5">{platform.description}</p>

              <ul className="space-y-2 mb-6">
                {platform.services.map((service) => (
                  <li key={service.name + service.href}>
                    <Link
                      href={service.href}
                      className="text-kenya-green hover:text-kenya-green/80 text-sm font-medium transition-colors"
                    >
                      {service.name}
                    </Link>
                  </li>
                ))}
              </ul>

              <Link
                href={platform.href}
                className="inline-flex items-center justify-center gap-2 w-full bg-kenya-green text-kenya-black font-bold text-sm px-4 py-3 rounded-xl hover:bg-kenya-green/90 transition-colors"
              >
                Order {platform.name}
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
