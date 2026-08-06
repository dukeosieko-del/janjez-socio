import {
  resolveCategoryName,
  resolveSubcategoryName,
  resolveSkuId,
  resolveRefillGuarantee,
  requiresSkuSelection,
} from "@/lib/services";

export interface OrderLogPayload {
  categoryId: string;
  serviceId: string;
  quantity: number;
  link: string;
  amountPaid: number;
  paymentReference?: string;
  quantitySource: "preset" | "custom";
  selectedSkuId?: string;
}

export {
  resolveCategoryName,
  resolveSubcategoryName,
  resolveSkuId,
  resolveRefillGuarantee,
  requiresSkuSelection,
};

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
  const categoryName = resolveCategoryName(payload.categoryId);
  const subcategoryName = resolveSubcategoryName(payload.categoryId, payload.serviceId);
  const skuId = resolveSkuId(payload.selectedSkuId ?? payload.serviceId);
  const refillGuarantee = resolveRefillGuarantee(payload.categoryId, payload.serviceId);

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
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { ok: false as const, error: data?.error || "Failed to record order." };
  }

  const data = await res.json();
  return { ok: true as const, order: data.order };
}
