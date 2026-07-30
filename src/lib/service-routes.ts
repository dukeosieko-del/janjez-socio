import { SERVICE_CATALOG, type ServiceCatalogItem, type Subcategory } from "./service-catalog";

export interface DeliverableLike {
  name: string;
  price: string;
  note?: string;
  flag?: string;
  minQty?: number;
  maxQty?: number;
}

export function getPlatformSlug(id: string) {
  if (id === "google-maps-reviews") return "google-maps-reviews";
  if (id === "x") return "x";
  return id.toLowerCase();
}

export function getServiceSlug(id: string) {
  return id.toLowerCase();
}

export function slugify(text: string) {
  return text.toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}

export function getSubcategorySlug(platformId: string, subcategoryName: string) {
  const catalogItem = SERVICE_CATALOG.find((c) => c.id === platformId);
  const sub = catalogItem?.subcategories.find((s) => s.name === subcategoryName);
  if (sub && sub.deliverables.length === 1) {
    const deliverable = sub.deliverables[0];
    return `microcategory-${slugify(deliverable.name)}`;
  }
  return `sub-${slugify(subcategoryName)}`;
}

export function findCatalogItemBySlug(platformSlug: string): ServiceCatalogItem | undefined {
  if (platformSlug === "google-maps-reviews") return SERVICE_CATALOG.find((c) => c.id === "google-maps-reviews");
  if (platformSlug === "x") return SERVICE_CATALOG.find((c) => c.id === "x");
  return SERVICE_CATALOG.find((c) => c.id === platformSlug || getPlatformSlug(c.id) === platformSlug);
}

export function findSubcategoryBySlug(catalog: ServiceCatalogItem, subSlug: string): Subcategory | undefined {
  return catalog.subcategories.find((sub) => {
    const candidate = getSubcategorySlug(catalog.id, sub.name);
    return candidate === subSlug;
  });
}

export function findMicrocategoryBySlug(sub: { name: string; deliverables: DeliverableLike[] }, microcategorySlug: string): DeliverableLike | undefined {
  return sub.deliverables.find((del) => `microcategory-${slugify(del.name)}` === microcategorySlug);
}
