import { NextResponse, NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin, logAdminAction } from "@/lib/server/auth-helpers";
import { rateLimitAdmin } from "@/lib/server/rate-limiter";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const rl = rateLimitAdmin(request);
  if (!rl.ok && rl.response) return rl.response;

  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";

    const supabase = createAdminClient();
    if (!supabase) {
  
    await logAdminAction({
      actorId: auth.id,
      actorEmail: auth.email,
      action: "users_viewed",
      request,
    }).catch(() => {});
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    let query = supabase
      .from("profiles")
      .select("id, email, full_name, phone, wallet_balance, role, email_verified, created_at", { count: "exact" });

    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
    }

    if (role) {
      query = query.eq("role", role);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query.order("created_at", { ascending: false }).range(from, to);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      users: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error("Admin users error:", error);
    return NextResponse.json({ error: "Failed to load users" }, { status: 500 });
  }
}
