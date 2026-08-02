import { createAdminClient } from "@/lib/supabase/admin";
import {
  fetchProviderServices,
  placeProviderOrder,
  getProviderStatus,
  getProviderMultipleStatus,
  createProviderRefill,
  createProviderCancel,
  getProviderBalance,
} from "./provider";
import type { ProviderService } from "./provider";

export interface ServiceMatch {
  providerService: ProviderService;
  score: number;
  reason: "cheapest" | "manual";
}

export async function syncProviderCatalog() {
  const supabase = createAdminClient();
  if (!supabase) {
    throw new Error("Server misconfigured");
  }

  const services = await fetchProviderServices();
  const { error } = await supabase.from("provider_services").upsert(
    services.map((s) => ({
      id: String(s.service),
      name: s.name,
      type: s.type,
      category: s.category,
      rate: parseFloat(s.rate),
      min: parseInt(s.min, 10),
      max: parseInt(s.max, 10),
      refill: s.refill,
      cancel: s.cancel,
      raw: s,
      fetched_at: new Date().toISOString(),
    })),
    { onConflict: "id" }
  );

  if (error) {
    throw new Error(error.message);
  }

  return { count: services.length };
}

export async function findCheapestProviderService(category: string, name: string): Promise<ProviderService | null> {
  const supabase = createAdminClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("provider_services")
    .select("*")
    .ilike("category", `%${category}%`)
    .ilike("name", `%${name}%`)
    .order("rate", { ascending: true })
    .limit(1);

  if (data && data.length > 0) {
    return {
      service: parseInt(data[0].id, 10),
      name: data[0].name,
      type: data[0].type,
      category: data[0].category,
      rate: String(data[0].rate),
      min: String(data[0].min),
      max: String(data[0].max),
      refill: data[0].refill,
      cancel: data[0].cancel,
    };
  }

  const fallback = await fetchProviderServices();
  const matched = fallback
    .filter(
      (s) =>
        s.category.toLowerCase().includes(category.toLowerCase()) ||
        s.name.toLowerCase().includes(name.toLowerCase())
    )
    .sort((a, b) => parseFloat(a.rate) - parseFloat(b.rate));

  return matched[0] || null;
}

export async function fulfillOrder(orderId: string) {
  const supabase = createAdminClient();
  if (!supabase) {
    throw new Error("Server misconfigured");
  }

  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (error || !order) {
    throw new Error(error?.message || "Order not found");
  }

  if (order.provider_order_id) {
    return { status: "already_fulfilled", providerOrderId: order.provider_order_id };
  }

  const category = order.category || "";
  const subcategory = order.subcategory || "";
  const sku = order.sku_id || order.service_name || "";

  const providerService = await findCheapestProviderService(category, sku || subcategory);

  if (!providerService) {
    await logFulfillment(supabase, order.id, "place", "failed", null, null, "No matching provider service found");
    await supabase
      .from("orders")
      .update({ fulfillment_status: "failed", fulfillment_error: "No matching provider service found" })
      .eq("id", order.id);
    return { status: "failed", error: "No matching provider service" };
  }

  const quantity = Math.min(
    Math.max(order.quantity || 1, parseInt(providerService.min, 10)),
    parseInt(providerService.max, 10)
  );

  let response: { order?: number; error?: string } = {};
  try {
    response = await placeProviderOrder({
      service: providerService.service,
      link: order.link_submitted || "",
      quantity,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Provider request failed";
    await logFulfillment(supabase, order.id, "place", "error", null, null, message);
    await supabase
      .from("orders")
      .update({ fulfillment_status: "failed", fulfillment_error: message })
      .eq("id", order.id);
    return { status: "error", error: message };
  }

  if (response.order) {
    await supabase
      .from("orders")
      .update({
        provider_service_id: String(providerService.service),
        provider_order_id: String(response.order),
        provider_status: "pending",
         provider_charge: (parseFloat(providerService.rate) * quantity) / 1000,
        provider_currency: "USD",
        fulfillment_status: "processing",
        fulfilled_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    await logFulfillment(supabase, order.id, "place", "processing", { order: response.order }, { service: providerService.service });
    return { status: "processing", providerOrderId: String(response.order) };
  }

  const message = response.error || "Provider returned no order ID";
  await logFulfillment(supabase, order.id, "place", "failed", null, null, message);
  await supabase
    .from("orders")
    .update({ fulfillment_status: "failed", fulfillment_error: message })
    .eq("id", order.id);

  return { status: "failed", error: message };
}

export async function syncOrderStatuses(orderIds?: string[]) {
  const supabase = createAdminClient();
  if (!supabase) return;

   let query = supabase
     .from("orders")
     .select("id, order_id, user_id, provider_order_id, fulfillment_status, provider_status")
    .not("provider_order_id", "is", null);

  if (orderIds && orderIds.length > 0) {
    query = query.in("id", orderIds);
  } else {
    query = query.in("fulfillment_status", ["pending", "processing"]);
  }

  const { data } = await query;
  if (!data || data.length === 0) return;

  const statuses = await getProviderMultipleStatus(
    data.map((o) => o.provider_order_id as string)
  );

  for (const order of data) {
    const status = statuses[order.provider_order_id as string];
    if (!status) continue;

    const updates: Record<string, unknown> = {
      provider_status: status.status || null,
      provider_start_count: status.start_count || null,
      provider_remains: status.remains || null,
      provider_charge: status.charge ? parseFloat(status.charge) : null,
      provider_currency: status.currency || "USD",
    };

     if (status.status === "Completed") {
       updates.fulfillment_status = "fulfilled";
     } else if (status.status === "Cancelled" || status.status === "Refunded") {
       updates.fulfillment_status = "cancelled";
     } else if (status.status === "Partial") {
       updates.fulfillment_status = "processing";
     } else {
       updates.fulfillment_status = "processing";
     }

     const prevStatus = order.fulfillment_status;
     const newStatus = updates.fulfillment_status as string;
     if (prevStatus !== newStatus || status.status !== order.provider_status) {
       await supabase.from("notifications").insert({
         user_id: order.user_id,
         type: "order_update",
         title: `Order ${order.order_id || order.id.slice(0, 8)} status updated`,
         message: `Status changed from ${prevStatus || "pending"} to ${newStatus}. Provider: ${status.status || "unknown"}.`,
         link: "/orders/all",
       });
     }

     await supabase.from("orders").update(updates).eq("id", order.id);
    await logFulfillment(supabase, order.id, "status", "synced", null, status);
  }
}

export async function requestRefill(orderId: string) {
  const supabase = createAdminClient();
  if (!supabase) throw new Error("Server misconfigured");

  const { data: order } = await supabase
    .from("orders")
    .select("provider_order_id, provider_service_id")
    .eq("id", orderId)
    .single();

  if (!order?.provider_order_id) {
    throw new Error("Order not fulfilled yet");
  }

  const result = await createProviderRefill([order.provider_order_id]);
  const refillResult = result[0];

  if (refillResult && typeof refillResult.refill === "number") {
    await supabase
      .from("orders")
      .update({
        fulfillment_status: "processing",
        provider_status: "refilled",
        fulfilled_at: new Date().toISOString(),
      })
      .eq("id", orderId);
    await logFulfillment(supabase, orderId, "refill", "requested", { order: order.provider_order_id }, refillResult);
    return { refillId: refillResult.refill };
  }

  const message =
    typeof refillResult?.refill === "object" && refillResult.refill && "error" in refillResult.refill
      ? refillResult.refill.error
      : "Refill failed";

  await logFulfillment(supabase, orderId, "refill", "failed", { order: order.provider_order_id }, refillResult, message);
  throw new Error(message);
}

export async function requestCancel(orderId: string) {
  const supabase = createAdminClient();
  if (!supabase) throw new Error("Server misconfigured");

  const { data: order } = await supabase
    .from("orders")
    .select("provider_order_id")
    .eq("id", orderId)
    .single();

  if (!order?.provider_order_id) {
    throw new Error("Order not fulfilled yet");
  }

  const result = await createProviderCancel([order.provider_order_id]);
  const cancelResult = result[0];

  if (cancelResult && typeof cancelResult.cancel === "number") {
    await supabase
      .from("orders")
      .update({
        fulfillment_status: "cancelled",
        provider_status: "cancelled",
      })
      .eq("id", orderId);
    await logFulfillment(supabase, orderId, "cancel", "cancelled", { order: order.provider_order_id }, cancelResult);
    return { cancelId: cancelResult.cancel };
  }

  const message =
    typeof cancelResult?.cancel === "object" && cancelResult.cancel && "error" in cancelResult.cancel
      ? cancelResult.cancel.error
      : "Cancel failed";

  await logFulfillment(supabase, orderId, "cancel", "failed", { order: order.provider_order_id }, cancelResult, message);
  throw new Error(message);
}

async function logFulfillment(
  supabase: NonNullable<ReturnType<typeof createAdminClient>>,
  orderId: string,
  action: string,
  status: string,
  requestPayload: Record<string, unknown> | null,
  responsePayload: unknown,
  error?: string
) {
  await supabase.from("fulfillment_logs").insert({
    order_id: orderId,
    action,
    status,
    request_payload: requestPayload,
    response_payload: responsePayload,
    error: error || null,
  });
}
