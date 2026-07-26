"use client";

import { useState, useMemo } from "react";
import SearchBar from "@/components/services/SearchBar";
import PlatformDropdown from "@/components/services/PlatformDropdown";
import ServiceCard from "@/components/services/ServiceCard";
import { SERVICES } from "@/lib/services-data";

export default function ServicesGrid() {
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    return SERVICES.filter((service) => {
      const matchesSearch = !term || service.name.toLowerCase().includes(term);
      const matchesPlatform = platform === "all" || service.id === platform || service.category === platform;
      return matchesSearch && matchesPlatform;
    });
  }, [search, platform]);

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <SearchBar value={search} onChange={setSearch} />
        <PlatformDropdown value={platform} onChange={setPlatform} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {filtered.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            isSelected={selectedId === service.id}
            onClick={() => setSelectedId(service.id)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center text-kenya-white/50 py-12">
          No services found matching your criteria.
        </div>
      )}
    </div>
  );
}
