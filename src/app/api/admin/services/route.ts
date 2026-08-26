import { NextResponse, NextRequest } from "next/server";
import { listJanjezServices, getJanjezService, createJanjezService, updateJanjezService, deleteJanjezService, normalizeSlug } from "@/lib/janjez-services";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/server/auth-helpers";
import { rateLimitAdmin } from "@/lib/server/rate-limiter";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const rl = rateLimitAdmin(request);
  if (!rl.ok && rl.response) return rl.response;

  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const active = searchParams.get("active");
    const activeOnly = active === "true";

    const services = await listJanjezServices(activeOnly);
    return NextResponse.json({ services, count: services.length });
  } catch (error) {
    console.error("Admin services list error:", error);
    return NextResponse.json({ error: "Failed to load services" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const rl = rateLimitAdmin(request);
  if (!rl.ok && rl.response) return rl.response;

  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const {
      name,
      slug,
      category,
      subcategory,
      description,
      selling_price_ksh,
      provider_service_id,
      min_quantity,
      max_quantity,
      is_active,
      display_order,
      supports_drip_feed,
      supports_refill,
      supports_cancel,
      show_sidebar,
      show_landing,
      show_guarded,
      show_anonymous,
      show_catalogue,
    } = body as Record<string, unknown>;

    const errors: string[] = [];
    if (!name || typeof name !== "string") errors.push("name is required");
    if (!slug || typeof slug !== "string") errors.push("slug is required");
    if (!category || typeof category !== "string") errors.push("category is required");
    if (selling_price_ksh === undefined || Number(selling_price_ksh) <= 0) errors.push("selling_price_ksh must be a positive number");
    if (min_quantity === undefined || Number(min_quantity) <= 0) errors.push("min_quantity must be a positive integer");
    if (max_quantity === undefined || Number(max_quantity) < Number(min_quantity)) errors.push("max_quantity must be >= min_quantity");

    if (errors.length > 0) {
      return NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 });
    }

    let resolvedSellingPrice = Number(selling_price_ksh);
    if (provider_service_id) {
      const supabase = createAdminClient();
      if (supabase) {
        const { data: providerExists } = await supabase
          .from("provider_services")
          .select("id")
          .eq("id", String(provider_service_id))
          .single();
        if (!providerExists) {
          return NextResponse.json({ error: "Referenced provider service not found" }, { status: 400 });
        }

        if (!resolvedSellingPrice || resolvedSellingPrice <= 0) {
          const { data: providerService } = await supabase
            .from("provider_services")
            .select("rate")
            .eq("id", String(provider_service_id))
            .single();
          if (providerService && providerService.rate) {
            resolvedSellingPrice = Math.round(Number(providerService.rate) * 13.7 * 100) / 100;
          }
        }
      }
    }

    if (resolvedSellingPrice <= 0) {
      return NextResponse.json({ error: "selling_price_ksh must be a positive number or a provider_service_id must be provided to auto-derive price" }, { status: 400 });
    }

    const result = await createJanjezService({
      name: String(name),
      slug: normalizeSlug(String(slug)),
      category: String(category),
      subcategory: typeof subcategory === "string" ? subcategory : undefined,
      description: typeof description === "string" ? description : undefined,
      selling_price_ksh: resolvedSellingPrice,
      provider_service_id: provider_service_id ? String(provider_service_id) : null,
      min_quantity: Number(min_quantity),
      max_quantity: Number(max_quantity),
      is_active: is_active === undefined ? true : Boolean(is_active),
      display_order: display_order !== undefined ? Number(display_order) : 0,
      supports_drip_feed: Boolean(supports_drip_feed),
      supports_refill: Boolean(supports_refill),
      supports_cancel: Boolean(supports_cancel),
      show_sidebar: Boolean(show_sidebar),
      show_landing: Boolean(show_landing),
      show_guarded: Boolean(show_guarded),
      show_anonymous: Boolean(show_anonymous),
      show_catalogue: Boolean(show_catalogue),
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ service: result }, { status: 201 });
  } catch (error) {
    console.error("Admin service create error:", error);
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 });
  }
}
