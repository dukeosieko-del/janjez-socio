"use client";

import { useState, useMemo } from "react";
import SearchBar from "@/components/services/SearchBar";
import PlatformDropdown from "@/components/services/PlatformDropdown";
import ServiceCard from "@/components/services/ServiceCard";
import { SERVICES } from "@/lib/services-data";
import Link from "next/link";

export default function ServicesGrid() {
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState("all");
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    return SERVICES.filter((service) => {
      const matchesSearch = !term || service.name.toLowerCase().includes(term);
      const matchesPlatform = platform === "all" || service.id === platform || service.category === platform;
      return matchesSearch && matchesPlatform;
    });
  }, [search, platform]);

  const selected = filtered.find((s) => s.id === selectedService) || null;

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <SearchBar value={search} onChange={setSearch} />
        <PlatformDropdown value={platform} onChange={setPlatform} />
      </div>

      <div className="flex flex-col gap-4">
        {filtered.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            isSelected={selectedService === service.id}
            onClick={() => setSelectedService(service.id)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center text-kenya-white/50 py-12">
          No services found matching your criteria.
        </div>
      )}

      {selected && (
        <ServiceModal
          service={selected}
          onClose={() => setSelectedService(null)}
        />
      )}
    </div>
  );
}

function ServiceModal({ service, onClose }: { service: { id: string; name: string; icon: string; href: string; modalSize?: string }; onClose: () => void }) {
  const isLarge = service.modalSize === 'large';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div
        className={`
          bg-kenya-black border border-kenya-white/10 rounded-2xl shadow-2xl relative
          w-full overflow-hidden
          ${isLarge ? 'max-w-5xl ml-[-10vw]' : 'max-w-2xl'}
        `}
      >
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 flex items-center justify-center">
              <img src={service.icon} alt={service.name} className="w-10 h-10 object-contain" />
            </div>
            <div>
              <h2 className="text-kenya-white font-bold text-xl">{service.name}</h2>
              <p className="text-kenya-white/50 text-sm">Service details coming soon</p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-kenya-white/10 text-kenya-white text-sm hover:bg-kenya-white/20 transition-colors"
            >
              Close
            </button>
            <Link
              href={service.href}
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-kenya-green text-kenya-black font-bold text-sm hover:bg-kenya-green/90 transition-colors"
            >
              Continue
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
