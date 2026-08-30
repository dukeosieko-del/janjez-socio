import { NextResponse, NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/server/auth-helpers";
import { rateLimitAdmin } from "@/lib/server/rate-limiter";

export const runtime = "nodejs";

interface DripFeedLimits {
  enabled: boolean;
  min_runs: number;
  max_runs: number;
  min_interval: number;
  max_interval: number;
}

export async function GET(request: NextRequest) {
  const rl = rateLimitAdmin(request);
  if (!rl.ok && rl.response) return rl.response;

  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });

  const { data, error } = await supabase
    .from("platform_settings")
    .select("value")
    .eq("key", "drip_feed_limits")
    .single();

  if (error) {
    return NextResponse.json({
      enabled: true,
      min_runs: 1,
      max_runs: 20,
      min_interval: 10,
      max_interval: 1440,
    });
  }

  return NextResponse.json(data?.value || {});
}

export async function PATCH(request: NextRequest) {
  const rl = rateLimitAdmin(request);
  if (!rl.ok && rl.response) return rl.response;

  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });

  try {
    const body = (await request.json()) as Partial<DripFeedLimits>;
    const { data, error } = await supabase
      .from("platform_settings")
      .update({ value: body })
      .eq("key", "drip_feed_limits")
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data?.value);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}
