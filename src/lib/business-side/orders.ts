import { calculateOrderCost } from "@/lib/pricing";
import { createAdminClient } from "@/lib/supabase/admin";
import { fulfillOrder, cancelOrder, refillOrder, type JanjezServiceWithProvider } from "@/lib/smm/fulfillment";
import { getBusinessSideAccountId } from "./config";
import { withIdempotency } from "./idempotency";
import type { BusinessOrderInput } from "./types";

function resolveInputService(input: BusinessOrderInput) {
  const janjezServiceId = input.janjezServiceId || input.serviceId || null;
  return {
    janjezServiceId,
    skuId: input.skuId || null,
    catalogCategoryId: input.catalogCategoryId || null,
  };
}

export async function createBusinessOrder(input: BusinessOrderInput, idempotencyKey: string) {
  const accountId = getBusinessSideAccountId();
  if (!accountId) {
    return { ok: false as const, code: "SERVER_MISCONFIGURED", message: "Business Side account is not configured." };
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return { ok: false as const, code: "SERVER_MISCONFIGURED", message: "Server misconfigured." };
  }

  const quantity = Math.trunc(input.quantity);
  if (!Number.isFinite(input.quantity) || quantity !== input.quantity || quantity <= 0) {
    return { ok: false as const, code: "INVALID_QUANTITY", message: "Quantity must be a positive integer." };
  }

  const link = input.link.trim();
  if (!link) {
    return { ok: false as const, code: "INVALID_LINK", message: "Link is required." };
  }

  const service = await import("@/lib/smm/fulfillment").then(({ resolveJanjezService }) =>
    resolveJanjezService(
      resolveInputService(input).skuId,
      resolveInputService(input).catalogCategoryId,
      resolveInputService(input).janjezServiceId,
    ),
  );

  if (!service) {
    return { ok: false as const, code: "SERVICE_NOT_FOUND", message: "Janjez service was not found." };
  }

  if (quantity < service.min_quantity || quantity > service.max_quantity) {
    return { ok: false as const, code: "INVALID_QUANTITY", message: "Quantity is outside the service limits." };
  }

  const existing = await supabase
    .from("orders")
    .select("id, order_id, status, fulfillment_status, provider_status, provider_order_id, quantity, amount, link, link_submitted, created_at, updated_at")
    .eq("user_id", accountId)
    .eq("payment_reference", `business-side:${idempotencyKey}`)
    .maybeSingle();

  if (existing.data) {
    return { ok: true as const, order: existing.data, fulfillment: null, replayed: true };
  }

  const amount = calculateOrderCost(service.selling_price_ksh, quantity);
  const debit = await supabase.rpc("debit_wallet", {
    p_user_id: accountId,
    p_amount: amount,
  });

  if (debit.error || !debit.data?.success) {
    return { ok: false as const, code: "INSUFFICIENT_BALANCE", message: "Business Side wallet has insufficient funds." };
  }

  const orderReference = `business-side:${idempotencyKey}`;
  const inserted = await supabase
    .from("orders")
    .insert({
      user_id: accountId,
      order_id: `BS-${Date.now().toString(36).toUpperCase()}`,
      category: service.category,
      subcategory: service.subcategory,
      sku_id: service.slug,
      catalog_category_id: service.category,
      janjez_service_id: service.id,
      provider_service_id: service.provider_service_id,
      service_name: service.name,
      quantity,
      link_submitted: link,
      link,
      amount,
      amount_paid: amount,
      payment_status: "paid",
      status: "pending",
      fulfillment_status: "pending",
      payment_method: "wallet",
      payment_reference: orderReference,
      quantity_source: "preset",
      runs: input.runs ?? null,
      interval: input.interval ?? null,
    })
    .select("*")
    .single();

  if (inserted.error || !inserted.data) {
    await supabase.rpc("credit_wallet", {
      p_user_id: accountId,
      p_amount: amount,
    });
    return { ok: false as const, code: "SERVER_ERROR", message: inserted.error?.message || "Order could not be created." };
  }

  try {
    const fulfillment = await fulfillOrder(inserted.data.id);
    return { ok: true as const, order: inserted.data, fulfillment, replayed: false };
  } catch (error) {
    const { data: latest } = await supabase
      .from("orders")
      .select("payment_status")
      .eq("id", inserted.data.id)
      .single();

    if (latest?.payment_status === "paid") {
      await supabase.rpc("credit_wallet", {
        p_user_id: accountId,
        p_amount: amount,
      });
      await supabase.from("orders").update({ payment_status: "refunded" }).eq("id", inserted.data.id);
    }

    return {
      ok: false as const,
      code: "PROVIDER_ERROR",
      message: error instanceof Error ? error.message : "Provider fulfillment failed.",
    };
  }
}

export async function getBusinessOrder(orderId: string) {
  const accountId = getBusinessSideAccountId();
  if (!accountId) return null;
  const supabase = createAdminClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .eq("user_id", accountId)
    .single();

  return data;
}

export async function cancelBusinessOrder(orderId: string) {
  const order = await getBusinessOrder(orderId);
  if (!order) return { ok: false as const, code: "ORDER_NOT_FOUND", message: "Order was not found." };
  try {
    const result = await cancelOrder(orderId);
    return { ok: true as const, result };
  } catch (error) {
    return {
      ok: false as const,
      code: "PROVIDER_ERROR",
      message: error instanceof Error ? error.message : "Order cancellation failed.",
    };
  }
}

export async function refillBusinessOrder(orderId: string) {
  const order = await getBusinessOrder(orderId);
  if (!order) return { ok: false as const, code: "ORDER_NOT_FOUND", message: "Order was not found." };
  try {
    const result = await refillOrder(orderId);
    return { ok: true as const, result };
  } catch (error) {
    return {
      ok: false as const,
      code: "PROVIDER_ERROR",
      message: error instanceof Error ? error.message : "Order refill failed.",
    };
  }
}

export function runOrderCreationIdempotent<T>(key: string, operation: () => Promise<T>) {
  return withIdempotency<T>(`business-order:${key}`, 24 * 60 * 60 * 1000, operation);
}

export type { JanjezServiceWithProvider };
