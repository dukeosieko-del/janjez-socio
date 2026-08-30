import { SERVICE_CATALOG, type ServiceCatalogItem } from "./service-catalog";

export interface OrderLogPayload {
  categoryId: string;
  serviceId: string;
  quantity: number;
  link: string;
  amountPaid: number;
  paymentReference?: string;
  quantitySource: "preset" | "custom";
  selectedSkuId?: string;
  runs?: number | null;
  interval?: number | null;
  janjezServiceId?: string | null;
  categoryName?: string | null;
  subcategoryName?: string | null;
  refillGuarantee?: string | null;
}

export interface AnonymousOrderPayload {
  janjezServiceId: string;
  link: string;
  quantity: number;
  phoneNumber: string;
  runs?: number | null;
  interval?: number | null;
}

export async function submitAnonymousOrder(payload: AnonymousOrderPayload) {
  const quantitySource: "preset" | "custom" = /^\d+$/.test(String(payload.quantity)) ? "preset" : "custom";

  const res = await fetch("/api/orders/anonymous", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      janjez_service_id: payload.janjezServiceId,
      link_submitted: payload.link,
      quantity: payload.quantity,
      phone_number: payload.phoneNumber,
      quantity_source: quantitySource,
      runs: payload.runs ?? null,
      interval: payload.interval ?? null,
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { ok: false as const, error: data?.error || "Failed to start anonymous order." };
  }

  const data = await res.json();
  return { ok: true as const, data };
}

function getCatalogItem(categoryId: string): ServiceCatalogItem | undefined {
  return SERVICE_CATALOG.find((c) => c.id === categoryId);
}

export function resolveCategoryName(categoryId: string): string {
  const item = getCatalogItem(categoryId);
  return item?.name ?? categoryId;
}

export function resolveSubcategoryName(categoryId: string, serviceId: string): string {
  const item = getCatalogItem(categoryId);
  if (!item) return serviceId;
  for (const sub of item.subcategories) {
    const match = sub.deliverables.find((d) => d.name === serviceId);
    if (match) return sub.name;
  }
  return serviceId;
}

export function resolveSkuId(categoryId: string, serviceId: string): string {
  return serviceId;
}

export function resolveRefillGuarantee(categoryId: string, serviceId: string): string | null {
  const item = getCatalogItem(categoryId);
  if (!item) return null;
  for (const sub of item.subcategories) {
    const match = sub.deliverables.find((d) => d.name === serviceId);
    if (match) {
      if (match.name.toLowerCase().includes("no warranty") || match.name.toLowerCase().includes("no refill")) {
        return "none";
      }
      if (match.name.toLowerCase().includes("lifetime")) {
        return "lifetime";
      }
      if (match.name.toLowerCase().includes("30-day") || match.name.toLowerCase().includes("30 day")) {
        return "30-day";
      }
      return "standard";
    }
  }
  return null;
}

export function requiresSkuSelection(categoryId: string): boolean {
  const item = getCatalogItem(categoryId);
  if (!item) return false;
  for (const sub of item.subcategories) {
    if (sub.deliverables.length > 1) {
      return true;
    }
  }
  return false;
}

async function getSessionToken(): Promise<string | null> {
  try {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    if (!supabase) return null;
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  } catch {
    return null;
  }
}

export async function submitOrder(payload: OrderLogPayload) {
  const categoryName = payload.categoryName ?? resolveCategoryName(payload.categoryId);
  const subcategoryName = payload.subcategoryName ?? resolveSubcategoryName(payload.categoryId, payload.serviceId);
  const skuId = payload.selectedSkuId ?? resolveSkuId(payload.categoryId, payload.serviceId);
  const refillGuarantee = payload.refillGuarantee ?? resolveRefillGuarantee(payload.categoryId, payload.serviceId);

  if (requiresSkuSelection(payload.categoryId) && !payload.selectedSkuId) {
    return { ok: false as const, error: "Please select a service package before continuing." };
  }

  const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;
  const timestamp = new Date().toISOString();
  const token = await getSessionToken();

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch("/api/orders", {
    method: "POST",
    headers,
     body: JSON.stringify({
     catalog_category_id: payload.categoryId,
   order_id: orderId,
     category: categoryName,
       subcategory: subcategoryName,
       sku_id: payload.selectedSkuId ?? skuId ?? null,
       quantity: payload.quantity,
       link_submitted: payload.link,
       amount_paid: payload.amountPaid,
       payment_reference: payload.paymentReference || null,
       timestamp,
       refill_guarantee: refillGuarantee,
       quantity_source: payload.quantitySource,
       runs: payload.runs ?? null,
       interval: payload.interval ?? null,
       janjez_service_id: payload.janjezServiceId || null,
     }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { ok: false as const, error: data?.error || "Failed to record order." };
  }

  const data = await res.json();
  return { ok: true as const, order: data.order };
}
