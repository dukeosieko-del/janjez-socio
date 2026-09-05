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
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 25));
  const status = searchParams.get("status") || "";
  const department = searchParams.get("department") || "";

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("contact_messages")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (status) {
    query = query.eq("status", status);
  }
  if (department) {
    query = query.eq("department", department);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("Admin contact messages fetch error:", error.message);
    return NextResponse.json({ error: "Failed to fetch contact messages" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    messages: data || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { id, status } = body as { id: string; status: string };

    if (!id || !status) {
      return NextResponse.json({ error: "id and status are required" }, { status: 400 });
    }

    const validStatuses = ["new", "read", "in_progress", "resolved", "spam"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("contact_messages")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("id, status, updated_at")
      .single();

    if (error || !data) {
      console.error("Contact message update error:", error?.message);
      return NextResponse.json({ error: "Failed to update contact message" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: data });
  } catch (error) {
    console.error("Contact message PATCH error:", error);
    return NextResponse.json({ error: "Failed to update contact message" }, { status: 500 });
  }
}
