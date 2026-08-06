import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSupabaseAdmin() {
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export interface AuthedUser {
  id: string;
  email: string;
  role: string;
}

export async function getUserFromRequest(request: NextRequest): Promise<AuthedUser | null> {
  const header =
    request.headers.get("authorization") ||
    request.headers.get("x-api-key") ||
    "";
  const match = header.match(/^Bearer\s+(.*)$/i);
  if (!match) return null;

  const token = match[1].trim();
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data: userData, error } = await supabase.auth.getUser(token);
  if (error || !userData.user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, role")
    .eq("id", userData.user.id)
    .single();

  if (!profile) return null;

  return {
    id: profile.id,
    email: profile.email,
    role: profile.role || "user",
  };
}

export async function requireAdmin(request: NextRequest): Promise<NextResponse | AuthedUser> {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden — admin access required" }, { status: 403 });
  }
  return user;
}

export async function logAdminAction(params: {
  actorId: string;
  actorEmail: string;
  action: string;
  targetType?: string;
  targetId?: string;
  details?: unknown;
  request?: NextRequest;
}) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;

  const ip =
    params.request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    params.request?.headers.get("x-real-ip") ||
    null;

  const { error } = await supabase.from("admin_activity_logs").insert({
    actor_id: params.actorId,
    actor_email: params.actorEmail,
    action: params.action,
    target_type: params.targetType ?? null,
    target_id: params.targetId ?? null,
    details: params.details ?? null,
    ip_address: ip,
    user_agent: params.request?.headers.get("user-agent") ?? null,
  });

  if (error) {
    console.error("Failed to log admin action:", error.message);
    return false;
  }
  return true;
}

export function requireCronSecret(request: NextRequest): boolean {
  const token =
    request.headers.get("x-cron-secret") ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const expected = process.env.CRON_SECRET;
  if (!expected || !token) return false;
  return token === expected;
}
