import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface AuthedUser {
  id: string;
  email: string | null;
  role: string | null;
  email_confirmed_at: string | null;
}

export interface AuthSuccess {
  user: AuthedUser;
  supabase: SupabaseClient;
}

function extractBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization") || "";
  const match = header.match(/^Bearer\s+(.*)$/i);
  return match ? match[1].trim() : null;
}

export async function getAuthenticatedUser(request: Request): Promise<AuthSuccess | NextResponse> {
  const token = extractBearerToken(request);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, email, email_verified, wallet_balance")
    .eq("id", userData.user.id)
    .single();

  if (profileError || !profile) {
    return {
      user: {
        id: userData.user.id,
        email: userData.user.email ?? null,
        role: null,
        email_confirmed_at: userData.user.email_confirmed_at ?? null,
      },
      supabase,
    };
  }

  return {
    user: {
      id: userData.user.id,
      email: userData.user.email ?? profile.email ?? null,
      role: profile.role ?? null,
      email_confirmed_at: userData.user.email_confirmed_at ?? null,
    },
    supabase,
  };
}

export async function requireAdmin(request: Request): Promise<AuthSuccess | NextResponse> {
  const auth = await getAuthenticatedUser(request);
  if (auth instanceof NextResponse) {
    return auth;
  }

  if (auth.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return auth;
}

export function requireCronSecret(request: Request): NextResponse | null {
  const provided = request.headers.get("x-cron-secret") || "";
  const expected = process.env.CRON_SECRET || "";
  if (!expected || provided !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
