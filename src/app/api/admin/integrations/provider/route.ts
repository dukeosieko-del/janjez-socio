import { NextResponse, NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/server/auth-helpers";
import { rateLimitAdmin } from "@/lib/server/rate-limiter";
import { getProviderBalance, fetchProviderServices } from "@/lib/smm/provider";

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

    const apiUrl = process.env.SMM_API_URL || "";
    const apiKey = process.env.SMM_API_KEY || "";

    const { data: providerServices, error } = await supabase
      .from("provider_services")
      .select("id, name, category, rate, min_quantity, max_quantity, supports_refill, supports_cancel, supports_drip_feed, is_active, last_synced_at, fetched_at")
      .order("category", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const totalServices = providerServices?.length || 0;
    const activeServices = providerServices?.filter(s => s.is_active).length || 0;

    return NextResponse.json({
      provider: {
        name: "DripFeedPanel",
        apiUrl: apiUrl ? "configured" : "missing",
        apiKey: apiKey ? "configured" : "missing",
      },
      catalog: {
        totalServices,
        activeServices,
        lastSync: providerServices?.[0]?.last_synced_at || null,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load integration status" }, { status: 500 });
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

    if (action === "test") {
      try {
        const services = await fetchProviderServices();
        return NextResponse.json({ ok: true, count: services.length, message: "Connection successful" });
      } catch (error) {
        return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Connection failed" }, { status: 400 });
      }
    }

    if (action === "balance") {
      try {
        const balance = await getProviderBalance();
        return NextResponse.json({ ok: true, balance: balance.balance || "0", currency: balance.currency || "USD" });
      } catch (error) {
        return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Balance check failed" }, { status: 400 });
      }
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to process integration request" }, { status: 500 });
  }
}
