import { NextResponse, NextRequest } from "next/server";
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
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const category = searchParams.get("category") || "";
    const isActive = searchParams.get("is_active") || "";
    const search = searchParams.get("search") || "";

    let query = supabase
      .from("janjez_services")
      .select("*, provider_service:provider_services(*)", { count: "exact" });

    if (category) {
      query = query.ilike("category", `%${category}%`);
    }
    if (isActive !== "") {
      query = query.eq("is_active", isActive === "true");
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,slug.ilike.%${search}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query.order("display_order", { ascending: true }).range(from, to);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ services: data || [], total: count || 0 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load services" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const rl = rateLimitAdmin(request);
  if (!rl.ok && rl.response) return rl.response;

  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

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
    } = body;

    if (!name || !slug || !category || selling_price_ksh === undefined || !provider_service_id || !min_quantity || !max_quantity) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("janjez_services")
      .insert({
        name,
        slug,
        category,
        subcategory: subcategory || null,
        description: description || null,
        selling_price_ksh: parseFloat(selling_price_ksh),
        provider_service_id,
        min_quantity: parseInt(min_quantity, 10),
        max_quantity: parseInt(max_quantity, 10),
        is_active: is_active ?? true,
        display_order: parseInt(display_order || "0", 10),
        supports_drip_feed: supports_drip_feed ?? false,
        supports_refill: supports_refill ?? false,
        supports_cancel: supports_cancel ?? false,
      })
      .select("*, provider_service:provider_services(*)")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ service: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 });
  }
}
