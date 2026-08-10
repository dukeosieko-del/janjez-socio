import { Suspense } from "react";
import OrderPageClient from "./page-client";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

interface JanjezService {
  id: string;
  name: string;
  slug: string;
  category: string;
  subcategory: string | null;
  description: string | null;
  selling_price_ksh: number;
  min_quantity: number;
  max_quantity: number;
  is_active: boolean;
  display_order: number;
  supports_drip_feed: boolean;
  supports_refill: boolean;
  supports_cancel: boolean;
}

function toOrderFormService(s: JanjezService) {
  return {
    id: s.id,
    categoryId: s.category.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name: s.name,
    serviceId: s.id,
    rate: s.selling_price_ksh,
    min: s.min_quantity,
    max: s.max_quantity,
    description: s.description || "",
    refill: s.supports_refill ? "Refill supported" : "No refill",
    requiresComments: false,
    supports_drip_feed: s.supports_drip_feed,
    janjez_service_id: s.id,
  };
}

export default async function OrderPage() {
  const supabase = createAdminClient();
  let services: JanjezService[] = [];
  if (supabase) {
    const { data } = await supabase
      .from("janjez_services")
      .select("id, name, slug, category, subcategory, description, selling_price_ksh, min_quantity, max_quantity, is_active, display_order, supports_drip_feed, supports_refill, supports_cancel")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .order("name", { ascending: true });
    services = data || [];
  }

  const orderServices = services.map(toOrderFormService);

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-kenya-black text-kenya-white">Loading...</div>}>
      <OrderPageClient services={orderServices} />
    </Suspense>
  );
}