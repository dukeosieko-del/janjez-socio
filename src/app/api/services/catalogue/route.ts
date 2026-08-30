import { NextResponse, NextRequest } from "next/server";
import { listJanjezServices } from "@/lib/janjez-services";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const active = searchParams.get("active") !== "false";
    const placement = searchParams.get("placement") as "show_sidebar" | "show_landing" | "show_guarded" | "show_anonymous" | "show_catalogue" | null;

    const services = await listJanjezServices(active, placement || undefined);

    const formatted = services.map((svc) => ({
      id: svc.id,
      categoryId: svc.category,
      name: svc.name,
      description: svc.description,
      rate: svc.selling_price_ksh,
      min: svc.min_quantity,
      max: svc.max_quantity,
      refill: svc.supports_refill ? "30 Days Refill Guarantee" : "No refill",
      requiresLink: true,
      requiresComments: false,
      speed: "",
      startTime: "",
      notice: svc.description || "",
      monetizable: false,
      slug: svc.slug,
      subcategory: svc.subcategory,
      supports_drip_feed: svc.supports_drip_feed,
      supports_refill: svc.supports_refill,
      supports_cancel: svc.supports_cancel,
      display_order: svc.display_order,
    }));

    return NextResponse.json({ services: formatted, count: formatted.length });
  } catch (error) {
    console.error("Service catalogue error:", error);
    return NextResponse.json({ error: "Failed to load service catalogue" }, { status: 500 });
  }
}
