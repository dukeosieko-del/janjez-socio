import { NextResponse, NextRequest } from "next/server";
import { getProviderBalance } from "@/lib/smm/provider";
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

  try {
    const { count: providerServiceCount } = await supabase
      .from("provider_services")
      .select("*", { count: "exact", head: true });

    const { data: latest } = await supabase
      .from("provider_services")
      .select("fetched_at")
      .order("fetched_at", { ascending: false })
      .limit(1)
      .single();

    let balance = null;
    try {
      balance = await getProviderBalance();
    } catch (err) {
      console.error("Provider balance check failed:", err);
    }

    const apiKeyConfigured = Boolean(process.env.SMM_API_KEY);
    const apiUrlConfigured = Boolean(process.env.SMM_API_URL);

    return NextResponse.json({
      provider: "DripFeedPanel",
      api_url_configured: apiUrlConfigured,
      api_key_configured: apiKeyConfigured,
      provider_balance: balance,
      provider_service_count: providerServiceCount || 0,
      last_catalog_sync: latest?.fetched_at || null,
    });
  } catch (error) {
    console.error("Integrations status error:", error);
    return NextResponse.json({ error: "Failed to load integration status" }, { status: 500 });
  }
}
