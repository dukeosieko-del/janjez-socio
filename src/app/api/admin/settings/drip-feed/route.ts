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

    const { data, error } = await supabase
      .from("drip_feed_settings")
      .select("*")
      .limit(1)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ settings: data });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load drip-feed settings" }, { status: 500 });
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
    const { enabled, min_runs, max_runs, min_interval, max_interval } = body as {
      enabled?: boolean;
      min_runs?: number;
      max_runs?: number;
      min_interval?: number;
      max_interval?: number;
    };

    if (enabled === undefined) {
      return NextResponse.json({ error: "enabled is required" }, { status: 400 });
    }

    const settings: Record<string, unknown> = { enabled };

    if (min_runs !== undefined) settings.min_runs = Math.max(1, min_runs);
    if (max_runs !== undefined) settings.max_runs = Math.max(1, max_runs);
    if (min_interval !== undefined) settings.min_interval = Math.max(1, min_interval);
    if (max_interval !== undefined) settings.max_interval = Math.max(1, max_interval);

    if (settings.min_runs && settings.max_runs && (settings.min_runs as number) > (settings.max_runs as number)) {
      return NextResponse.json({ error: "min_runs cannot be greater than max_runs" }, { status: 400 });
    }

    if (settings.min_interval && settings.max_interval && (settings.min_interval as number) > (settings.max_interval as number)) {
      return NextResponse.json({ error: "min_interval cannot be greater than max_interval" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("drip_feed_settings")
      .update(settings)
      .eq("id", (await supabase.from("drip_feed_settings").select("id").limit(1).single()).data?.id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ settings: data });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update drip-feed settings" }, { status: 500 });
  }
}
