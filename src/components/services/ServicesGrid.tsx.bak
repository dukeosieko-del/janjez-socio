import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import SearchBar from "@/components/services/SearchBar";
import PlatformDropdown from "@/components/services/PlatformDropdown";
import ServiceCard from "@/components/services/ServiceCard";
import { SERVICES } from "@/lib/services-data";
import { SERVICE_CATALOG, type ServiceCatalogItem } from "@/lib/service-catalog";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getServiceSlug(id: string) {
  return id.toLowerCase();
}

export function getPlatformSlug(id: string) {
  if (id === "google-maps-reviews") return "google-maps-reviews";
  if (id === "x") return "x";
  return id.toLowerCase();
}

export function getSubcategorySlug(
  platformId: string,
  subcategoryName: string,
  index: number
) {
  const catalogItem = SERVICE_CATALOG.find((c) => c.id === platformId);
  const sub = catalogItem?.subcategories.find((s) => s.name === subcategoryName);
  if (sub && sub.deliverables.length <= 1) {
    return sub.deliverables[0] ? `deliverable-${index}-${slugify(sub.deliverables[0].name)}` : `sub-${slugify(subcategoryName)}`;
  }
  return `sub-${slugify(subcategoryName)}`;
}

export default function ServicesGrid() {
  const router = useRouter();
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

  const handleServiceClick = (id: string) => {
    setSelectedService(id);
    const slug = getPlatformSlug(id);
    router.push(`/services/${slug}`);
  };

  const handleSubcategoryClick = (platformId: string, subcategoryName: string, idx: number) => {
    const platformSlug = getPlatformSlug(platformId);
    const subSlug = getSubcategorySlug(platformId, subcategoryName, idx);
    router.push(`/services/${platformSlug}/${subSlug}`);
  };

  const selectedCatalogItem = selectedService ? (SERVICE_CATALOG.find((c) => c.id === selectedService) as ServiceCatalogItem | undefined) : undefined;

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
            onClick={() => handleServiceClick(service.id)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center text-kenya-white/50 py-12">
          No services found matching your criteria.
        </div>
      )}

      {selectedCatalogItem && (
        <ServiceModal catalog={selectedCatalogItem} onClose={() => setSelectedService(null)} onSubcategoryClick={handleSubcategoryClick} />
      )}
    </div>
  );
}

function ServiceModal({
  catalog,
  onClose,
  onSubcategoryClick,
}: {
  catalog: ServiceCatalogItem;
  onClose: () => void;
  onSubcategoryClick: (platformId: string, subcategoryName: string, idx: number) => void;
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
              <div key={sub.name + idx} className="border border-kenya-white/10 rounded-xl bg-kenya-white/5">
                <button
                  type="button"
                  onClick={() => onSubcategoryClick(catalog.id, sub.name, idx)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-kenya-white/10 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-kenya-white font-medium">{sub.name}</span>
                    <span className="text-kenya-white/40 text-xs">{sub.count}</span>
                  </span>
                  <span className="text-kenya-white/40 text-xs transition-transform duration-200">→</span>
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 rounded-xl bg-kenya-white/10 text-kenya-white text-sm hover:bg-kenya-white/20 transition-colors">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}
