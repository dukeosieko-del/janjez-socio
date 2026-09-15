import type { JanjezService } from "@/lib/janjez-services";
import type { BusinessService } from "./types";

/**
 * Map a Janjez service to a Business Side service.
 * Strips provider_service_id so it is not exposed to the island.
 */
export function toBusinessService(service: JanjezService): BusinessService {
  const { provider_service_id, ...safeService } = service;
  return {
    ...safeService,
    price: service.selling_price_ksh,
  };
}