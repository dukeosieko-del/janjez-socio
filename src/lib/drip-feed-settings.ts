import { createAdminClient } from "@/lib/supabase/admin";

export interface DripFeedLimits {
  enabled: boolean;
  min_runs: number;
  max_runs: number;
  min_interval: number;
  max_interval: number;
}

export async function getDripFeedLimits(): Promise<DripFeedLimits> {
  const supabase = createAdminClient();
  if (!supabase) {
    return { enabled: true, min_runs: 1, max_runs: 20, min_interval: 10, max_interval: 1440 };
  }

  const { data, error } = await supabase
    .from("platform_settings")
    .select("value")
    .eq("key", "drip_feed_limits")
    .single();

  if (error || !data) {
    return { enabled: true, min_runs: 1, max_runs: 20, min_interval: 10, max_interval: 1440 };
  }

  const value = data.value as Record<string, unknown>;
  return {
    enabled: value.enabled !== false,
    min_runs: Number(value.min_runs) || 1,
    max_runs: Number(value.max_runs) || 20,
    min_interval: Number(value.min_interval) || 10,
    max_interval: Number(value.max_interval) || 1440,
  };
}

export function getDripFeedLimitsSync(): DripFeedLimits {
  return { enabled: true, min_runs: 1, max_runs: 20, min_interval: 10, max_interval: 1440 };
}
