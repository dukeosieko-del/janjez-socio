"use client";

import { useState, useMemo } from "react";
import SearchBar from "@/components/services/SearchBar";
import PlatformDropdown from "@/components/services/PlatformDropdown";
import ServiceCard from "@/components/services/ServiceCard";
import { SERVICES } from "@/lib/services-data";
import { SERVICE_CATALOG, SERVICE_JOURNEY, type ServiceCatalogItem } from "@/lib/service-catalog";
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
  const catalogItem = selected ? (SERVICE_CATALOG.find((c) => c.id === selected.id) as ServiceCatalogItem | undefined) : undefined;

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

      {selected && catalogItem && (
        <ServiceModal
          service={selected}
          catalog={catalogItem}
          onClose={() => setSelectedService(null)}
        />
      )}
    </div>
  );
}

function ServiceModal({
  service,
  catalog,
  onClose,
}: {
  service: { id: string; name: string; icon: string; href: string; modalSize?: string };
  catalog: ServiceCatalogItem;
  onClose: () => void;
}) {
  const isLarge = catalog.modalSize === 'large';

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
              <img src={catalog.icon} alt={catalog.name} className="w-10 h-10 object-contain" />
            </div>
            <div>
              <h2 className="text-kenya-white font-bold text-xl">{catalog.name}</h2>
              <p className="text-kenya-white/50 text-sm">{catalog.subcategories.length} subcategories</p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {catalog.subcategories.map((sub, idx) => (
              <details key={sub.name + idx} className="bg-kenya-white/5 border border-kenya-white/10 rounded-xl">
                <summary className="flex items-center justify-between p-3 text-sm font-medium text-kenya-white cursor-pointer select-none">
                  <span className="flex items-center gap-2">
                    <span>{sub.name}</span>
                    <span className="text-kenya-white/40 text-xs">{sub.count}</span>
                  </span>
                  <span className="text-kenya-white/40 text-xs">▸</span>
                </summary>
                <div className="px-3 pb-3 pt-1 space-y-2">
                  {sub.deliverables.map((del, i) => (
                    <div key={del.name + i} className="flex items-center justify-between text-sm">
                      <span className="text-kenya-white/80">{del.name}</span>
                      <span className="text-kenya-green font-semibold">{del.price}</span>
                    </div>
                  ))}
                  {sub.note && (
                    <p className="text-kenya-white/40 text-xs mt-2 italic">{sub.note}</p>
                  )}
                </div>
              </details>
            ))}

            {catalog.subcategories.length === 0 && (
              <div className="text-kenya-white/50 text-sm py-6 text-center">
                Service catalog is being updated. Please check back later.
              </div>
            )}
          </div>

          <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-xl p-4 mb-6">
            <h3 className="text-kenya-white font-bold text-sm mb-3">Order Journey</h3>
            <div className="space-y-2">
              {SERVICE_JOURNEY.map((item) => (
                <div key={item.step} className="flex gap-3 text-sm">
                  <div className="w-6 h-6 rounded-full bg-kenya-green/20 text-kenya-green flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    {item.step}
                  </div>
                  <div>
                    <p className="text-kenya-white font-medium">{item.title}</p>
                    <p className="text-kenya-white/50 text-xs">{item.body}</p>
                  </div>
                </div>
              ))}
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
              href={catalog.href}
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
