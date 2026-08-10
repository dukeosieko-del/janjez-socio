import FulfillmentClient from "./page-client";
import { getJanjezServiceById } from "@/lib/server/dynamic-services";

export const dynamic = "force-dynamic";

export default async function ServiceFulfillmentPage({ params }: { params: { serviceId: string } }) {
  const raw = await getJanjezServiceById(params.serviceId);
  const dynamicService = raw ? {
    id: raw.id,
    name: raw.name,
    category: raw.categoryId,
    selling_price_ksh: raw.rate,
    min_quantity: raw.min,
    max_quantity: raw.max,
    description: raw.description || null,
    supports_drip_feed: raw.supports_drip_feed ?? false,
    supports_refill: raw.refill !== "No refill",
    supports_cancel: false,
  } : null;

  return <FulfillmentClient serviceId={params.serviceId} dynamicService={dynamicService} />;
}