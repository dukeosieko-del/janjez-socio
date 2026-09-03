import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let client: ReturnType<typeof createBrowserClient> | null = null;

export function createClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  if (!client && typeof window !== "undefined") {
    client = createBrowserClient(url, key, {
      isSingleton: true,
      auth: {
        detectSessionInUrl: false,
      },
    });
  }

  return client;
}

export function clearClientCache() {
  client = null;
}
