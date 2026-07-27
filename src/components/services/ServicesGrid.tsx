"use client";

import { useState, useMemo } from "react";
import SearchBar from "@/components/services/SearchBar";
import PlatformDropdown from "@/components/services/PlatformDropdown";
import ServiceCard from "@/components/services/ServiceCard";
import { SERVICES } from "@/lib/services-data";
import { SERVICE_CATALOG, SERVICE_JOURNEY, type ServiceCatalogItem } from "@/lib/service-catalog";

type ExpandedServices = Record<string, boolean>;
type ExpandedSubcategories = Record<string, Set<string>>;

export default function ServicesGrid() {
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState("all");
  const [expandedServices, setExpandedServices] = useState<ExpandedServices>({});
  const [expandedSubcategories, setExpandedSubcategories] = useState<ExpandedSubcategories>({});

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    return SERVICES.filter((service) => {
      const matchesSearch = !term || service.name.toLowerCase().includes(term);
      const matchesPlatform = platform === "all" || service.id === platform || service.category === platform;
      return matchesSearch && matchesPlatform;
    });
  }, [search, platform]);

  const toggleService = (id: string) => {
    setExpandedServices((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSubcategory = (serviceId: string, subName: string) => {
    setExpandedSubcategories((prev) => {
      const current = prev[serviceId] || new Set<string>();
      const next = new Set(current);
      if (next.has(subName)) {
        next.delete(subName);
      } else {
        next.add(subName);
      }
      return { ...prev, [serviceId]: next };
    });
  };

  const getSubcategories = (id: string): ServiceCatalogItem["subcategories"] => {
    const catalogItem = SERVICE_CATALOG.find((c) => c.id === id);
    return catalogItem?.subcategories ?? [];
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <SearchBar value={search} onChange={setSearch} />
        <PlatformDropdown value={platform} onChange={setPlatform} />
      </div>

      <div className="flex flex-col gap-4">
        {filtered.map((service) => {
          const isExpanded = !!expandedServices[service.id];
          const subcategories = getSubcategories(service.id);

          return (
            <div key={service.id} className="w-full">
              <ServiceCard
                service={service}
                isSelected={isExpanded}
                onClick={() => toggleService(service.id)}
              />

              {isExpanded && (
                <div className="mt-4 ml-0 md:ml-16 space-y-4">
                  {subcategories.length === 0 && (
                    <div className="text-kenya-white/50 text-sm py-4">Service catalog is being updated. Please check back later.</div>
                  )}

                  {subcategories.map((sub, idx) => {
                    const isSubOpen = (expandedSubcategories[service.id] || new Set<string>()).has(sub.name);

                    return (
                      <div key={sub.name + idx} className="border border-kenya-white/10 rounded-xl bg-kenya-white/5">
                        <button
                          type="button"
                          onClick={() => toggleSubcategory(service.id, sub.name)}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-kenya-white/10 transition-colors"
                        >
                          <span className="flex items-center gap-3">
                            <span className="text-kenya-white font-medium">{sub.name}</span>
                            <span className="text-kenya-white/40 text-xs">{sub.count}</span>
                          </span>
                          <span className="text-kenya-white/40 text-xs transition-transform duration-200">{isSubOpen ? "▾" : "▸"}</span>
                        </button>

                        {isSubOpen && (
                          <div className="px-4 pb-4 space-y-2">
                            <div className="border-t border-kenya-white/10 pt-3 space-y-2">
                              {sub.deliverables.map((del, i) => (
                                <div key={del.name + i} className="flex items-center justify-between text-sm">
                                  <span className="text-kenya-white/80">{del.name}</span>
                                  <span className="text-kenya-green font-semibold">{del.price}</span>
                                </div>
                              ))}
                            </div>

                            {sub.note && (
                              <p className="text-kenya-white/40 text-xs mt-2 italic">{sub.note}</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-xl p-4">
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
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center text-kenya-white/50 py-12">
          No services found matching your criteria.
        </div>
      )}
    </div>
  );
}
