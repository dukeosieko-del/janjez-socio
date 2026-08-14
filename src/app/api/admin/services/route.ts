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

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const platformId = searchParams.get("platform_id");
  const subcategory = searchParams.get("subcategory");
  const published = searchParams.get("published");
  const includeProvider = searchParams.get("include_provider") === "true";

  let query = supabase.from("janjez_services").select("*").order("display_order", { ascending: true });

  if (platformId) query = query.eq("platform_id", platformId);
  if (subcategory) query = query.eq("subcategory", subcategory);
  if (published !== null) query = query.eq("published", published === "true");

  const { data: janjezServices, error: janjezError } = await query;

  if (janjezError) {
    return NextResponse.json({ error: janjezError.message }, { status: 400 });
  }

  if (!includeProvider) {
    return NextResponse.json({ services: janjezServices || [] });
  }

  const providerIds = (janjezServices || [])
    .map((s) => s.provider_service_id)
    .filter((id): id is string => Boolean(id));

  let providerServices: Record<string, unknown>[] = [];
  if (providerIds.length > 0) {
    const { data } = await supabase
      .from("provider_services")
      .select("*")
      .in("id", providerIds);
    providerServices = data || [];
  }

  return NextResponse.json({
    services: janjezServices || [],
    provider_services: providerServices,
  });
}

export async function POST(request: NextRequest) {
  const rl = rateLimitAdmin(request);
  if (!rl.ok && rl.response) return rl.response;

  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  try {
    const body = await request.json();
    const {
      platform_id,
      platform_name,
      subcategory,
      deliverable_name,
      provider_service_id,
      selling_price_ksh,
      provider_rate,
      min_quantity,
      max_quantity,
      display_order,
      published,
      supports_drip_feed,
      supports_refill,
      supports_cancel,
      note,
      flag,
    } = body;

    if (!platform_id || !subcategory || !deliverable_name) {
      return NextResponse.json(
        { error: "platform_id, subcategory, and deliverable_name are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("janjez_services")
      .insert({
        platform_id,
        platform_name: platform_name || platform_id,
        subcategory,
        deliverable_name,
        provider_service_id: provider_service_id || null,
        selling_price_ksh: selling_price_ksh ?? 0,
        provider_rate: provider_rate ?? 0,
        min_quantity: min_quantity ?? 10,
        max_quantity: max_quantity ?? 10000,
        display_order: display_order ?? 0,
        published: published ?? false,
        supports_drip_feed: supports_drip_feed ?? false,
        supports_refill: supports_refill ?? false,
        supports_cancel: supports_cancel ?? false,
        note: note || null,
        flag: flag || null,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ service: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  const rl = rateLimitAdmin(request);
  if (!rl.ok && rl.response) return rl.response;

  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("janjez_services")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ service: data });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const rl = rateLimitAdmin(request);
  if (!rl.ok && rl.response) return rl.response;

  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("janjez_services")
    .update({ published: false })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
