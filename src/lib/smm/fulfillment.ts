import { createAdminClient } from "@/lib/supabase/admin";
import {
  fetchProviderServices,
  placeProviderOrder,
  getProviderMultipleStatus,
  createProviderRefill,
  createProviderCancel,
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

  if (process.env.SMM_FULFILLMENT_ENABLED === "false") {
    const message = "Fulfillment is disabled";
    await logFulfillment(supabase, orderId, "place", "failed", null, null, message);
    await supabase
      .from("orders")
      .update({ fulfillment_status: "failed", fulfillment_error: message })
      .eq("id", orderId);
    throw new Error(message);
  }

  const category = order.category || "";
  const subcategory = order.subcategory || "";
  const sku = order.sku_id || order.service_name || "";

<<<<<<< ours
  const providerService = await findCheapestProviderService(category, sku || subcategory);
=======
  let providerService: ProviderService | null = null;
  let resolvedService: JanjezServiceWithProvider | null = null;
  let quantity = order.quantity || 1;
  let providerRate = 0;

  const janjezService = await resolveJanjezService(order.sku_id, order.catalog_category_id, order.janjez_service_id);
  if (janjezService && janjezService.provider_service_id) {
    resolvedService = janjezService;
    const { data: providerData } = await supabase
      .from("provider_services")
      .select("*")
      .eq("id", janjezService.provider_service_id)
      .single();

    if (providerData) {
      providerService = {
        service: parseInt(providerData.id, 10),
        name: providerData.name,
        type: providerData.type,
        category: providerData.category,
        rate: String(providerData.rate),
        min: String(providerData.min),
        max: String(providerData.max),
        refill: providerData.refill,
        cancel: providerData.cancel,
        dripfeed: providerData.supports_drip_feed,
      };
      providerRate = parseFloat(providerData.rate);
      quantity = Math.min(
        Math.max(order.quantity || 1, parseInt(providerData.min, 10)),
        parseInt(providerData.max, 10)
      );
    }
  }
>>>>>>> theirs

  if (!providerService) {
    await logFulfillment(supabase, order.id, "place", "failed", null, null, "No matching provider service found");
    await supabase
      .from("orders")
      .update({ fulfillment_status: "failed", fulfillment_error: "No matching provider service found" })
      .eq("id", order.id);
<<<<<<< ours
    return { status: "failed", error: "No matching provider service" };
=======
    throw new Error("No provider mapping found for this service");
>>>>>>> theirs
  }

  const quantity = Math.min(
    Math.max(order.quantity || 1, parseInt(providerService.min, 10)),
    parseInt(providerService.max, 10)
  );

  const expectedCharge = (providerRate * quantity) / 1000;
  try {
    const balance = await getProviderBalance();
    const providerBalance = parseFloat((balance as { balance?: string } | undefined)?.balance || "0");
    if (providerBalance < expectedCharge) {
      const message = `Insufficient provider balance: ${providerBalance} USD (need ${expectedCharge} USD)`;
      await logFulfillment(supabase, order.id, "place", "failed", null, null, message);
      await supabase
        .from("orders")
        .update({ fulfillment_status: "failed", fulfillment_error: message })
        .eq("id", order.id);
      throw new Error(message);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Provider balance check failed";
    await logFulfillment(supabase, order.id, "place", "error", null, null, message);
    await supabase
      .from("orders")
      .update({ fulfillment_status: "failed", fulfillment_error: message })
      .eq("id", order.id);
    throw new Error(message);
  }

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
    throw new Error(message);
  }

  if (response.order) {
    await supabase
      .from("orders")
      .update({
        provider_service_id: String(providerService.service),
        provider_order_id: String(response.order),
        provider_status: "pending",
<<<<<<< ours
         provider_charge: (parseFloat(providerService.rate) * quantity) / 1000,
=======
        provider_charge: expectedCharge,
>>>>>>> theirs
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

  throw new Error(message);
}

<<<<<<< ours
=======
export async function cancelOrder(orderId: string) {
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

  if (!order.provider_order_id) {
    return { status: "not_fulfilled", error: "Order has no provider order to cancel" };
  }

  const janjezServiceId = order.janjez_service_id;
  let resolvedService: JanjezServiceWithProvider | null = null;

  if (janjezServiceId) {
    resolvedService = await resolveJanjezService(null, null, janjezServiceId);
  }

  if (!resolvedService) {
    return { status: "error", error: "Unable to resolve service for cancellation" };
  }

  if (!resolvedService.supports_cancel) {
    return { status: "cancel_not_supported", error: "This service does not support cancellation" };
  }

  try {
    await createProviderCancel([String(order.provider_order_id)]);
    await supabase
      .from("orders")
      .update({
        fulfillment_status: "cancelled",
        provider_status: "Cancelled",
        status: "cancelled",
      })
      .eq("id", order.id);
    await logFulfillment(supabase, order.id, "cancel", "cancelled", { order_id: order.provider_order_id }, null);
    return { status: "cancelled" };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Provider cancellation failed";
    await logFulfillment(supabase, order.id, "cancel", "error", { order_id: order.provider_order_id }, null, message);
    return { status: "error", error: message };
  }
}

export async function refillOrder(orderId: string) {
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

  if (!order.provider_order_id) {
    return { status: "not_fulfilled", error: "Order has no provider order to refill" };
  }

  const janjezServiceId = order.janjez_service_id;
  let resolvedService: JanjezServiceWithProvider | null = null;

  if (janjezServiceId) {
    resolvedService = await resolveJanjezService(null, null, janjezServiceId);
  }

  if (!resolvedService) {
    return { status: "error", error: "Unable to resolve service for refill" };
  }

  if (!resolvedService.supports_refill) {
    return { status: "refill_not_supported", error: "This service does not support refill" };
  }

  try {
    await createProviderRefill([String(order.provider_order_id)]);
    await supabase
      .from("orders")
      .update({ provider_status: "Pending" })
      .eq("id", order.id);
    await logFulfillment(supabase, order.id, "refill", "processing", { order_id: order.provider_order_id }, null);
    return { status: "refill_submitted" };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Provider refill failed";
    await logFulfillment(supabase, order.id, "refill", "error", { order_id: order.provider_order_id }, null, message);
    return { status: "error", error: message };
  }
}

function mapProviderStatus(status: string | null | undefined): "fulfilled" | "cancelled" | "processing" {
  if (!status) return "processing";
  const upper = status.trim();
  if (upper === "Completed") return "fulfilled";
  if (upper === "Cancelled" || upper === "Refunded") return "cancelled";
  if (upper === "Partial") return "processing";
  if (upper === "Pending" || upper === "In Progress" || upper === "Processing") return "processing";
  return "processing";
}

export { mapProviderStatus };

>>>>>>> theirs
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
