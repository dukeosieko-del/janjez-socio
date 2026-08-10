import { NextResponse, NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/server/auth-helpers";
import { rateLimitAdmin } from "@/lib/server/rate-limiter";
import { fetchProviderServices } from "@/lib/smm/provider";

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
      .from("provider_services")
      .select("*", { count: "exact" });

    if (category) {
      query = query.ilike("category", `%${category}%`);
    }
    if (isActive !== "") {
      query = query.eq("is_active", isActive === "true");
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,provider_service_id.ilike.%${search}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query.order("rate", { ascending: true }).range(from, to);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ services: data || [], total: count || 0 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load provider services" }, { status: 500 });
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
    const { action } = body || {};

    if (action === "sync") {
      const services = await fetchProviderServices();
      const now = new Date().toISOString();

      const upserted = services.map((s) => ({
        id: String(s.service),
        provider_name: "DripFeedPanel",
        name: s.name,
        type: s.type,
        category: s.category,
        subcategory: s.category,
        rate: parseFloat(s.rate),
        min_quantity: parseInt(s.min, 10),
        max_quantity: parseInt(s.max, 10),
        supports_refill: s.refill,
        supports_cancel: s.cancel,
        supports_drip_feed: true,
        provider_currency: "USD",
        provider_raw_data: s,
        is_active: true,
        last_synced_at: now,
        fetched_at: now,
      }));

      const { error } = await supabase.from("provider_services").upsert(upserted, { onConflict: "id" });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ count: services.length, message: "Provider catalog synced" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to sync provider services";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
