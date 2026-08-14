import { TAXONOMY_PLATFORMS, TaxonomyPlatform, TaxonomySubcategory, TaxonomyDeliverable } from "@/lib/taxonomy";
import { getCategoryIcon } from "@/lib/category-icons";

export interface Deliverable {
  name: string;
  price: string;
  note?: string;
  flag?: string;
  minQty?: number;
  maxQty?: number;
}

export interface Subcategory {
  name: string;
  count: number;
  deliverables: Deliverable[];
  note?: string;
  flag?: string;
  minQty?: number;
  maxQty?: number;
}

export interface ServiceCatalogItem {
  id: string;
  name: string;
  icon: string;
  href: string;
  modalSize: 'small' | 'large';
  subcategories: Subcategory[];
}

export const SERVICE_CATALOG: ServiceCatalogItem[] = TAXONOMY_PLATFORMS.map((platform: TaxonomyPlatform) => ({
  id: platform.id,
  name: platform.name,
  icon: getCategoryIcon(platform.id),
  href: `/services/${platform.id}`,
  modalSize: (platform.id === "youtube" || platform.id === "whatsapp" || platform.id === "telegram") ? "large" : "small",
  subcategories: platform.subcategories.map((sub: TaxonomySubcategory) => ({
    name: sub.name,
    count: sub.deliverables.length,
    deliverables: sub.deliverables.map((del: TaxonomyDeliverable) => ({
      name: del.name,
      price: "0 Ksh",
      note: del.note,
      flag: del.flag,
      minQty: del.minQty,
      maxQty: del.maxQty,
    })),
    note: sub.deliverables[0]?.note,
    flag: sub.deliverables[0]?.flag,
    minQty: sub.deliverables[0]?.minQty,
    maxQty: sub.deliverables[0]?.maxQty,
  })),
}));

export const SERVICE_JOURNEY = [
  { step: 1, title: 'Enter quantity', body: 'Preset buttons (100 / 500 / 1,000 / 2,500 / 5,000) or a custom field. Min 10, max varies by service.' },
  { step: 2, title: 'Paste the link', body: 'Profile, channel, or post URL. For some TikTok/WhatsApp services, this field may ask for a WhatsApp number instead.' },
  { step: 3, title: 'Live price', body: 'Updates as you type, plus disclosure block: start time, speed, quality claim, drop risk, and refill guarantee status.' },
  { step: 4, title: 'Select payment system', body: 'M-Pesa shown first, with card/PayPal/crypto also available depending on flow variant.' },
  { step: 5, title: 'Pay', body: 'For M-Pesa, payment opens in a new tab; the page shows a waiting-for-payment polling screen.' },
  { step: 6, title: 'Redirect to dashboard', body: 'Once payment completes, a link to the personal order-tracking dashboard appears.' },
];
