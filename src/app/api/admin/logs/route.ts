import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) {
      return auth;
    }
    const { supabase } = auth;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "100");
    const action = searchParams.get("action") || "";

    let query = supabase
      .from("admin_activity_logs")
      .select("*", { count: "exact" });

    if (action) {
      query = query.eq("action", action);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error: dbError, count } = await query.order("created_at", { ascending: false }).range(from, to);

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 400 });
    }

    return NextResponse.json({
      logs: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error("Admin logs error:", error);
    return NextResponse.json({ error: "Failed to load logs" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) {
      return auth;
    }
    const { supabase, user } = auth;

    const body = await request.json();
    const { action, target_type, target_id, details, ip_address, user_agent } = body;

    const { data, error: dbError } = await supabase
      .from("admin_activity_logs")
      .insert({
        action,
        target_type,
        target_id,
        details,
        ip_address: ip_address || request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
        user_agent: user_agent || request.headers.get("user-agent"),
        actor_id: user.id,
        actor_email: user.email,
      })
      .select()
      .single();

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 400 });
    }

    return NextResponse.json({ log: data });
  } catch (error) {
    console.error("Admin log create error:", error);
    return NextResponse.json({ error: "Failed to create log" }, { status: 500 });
  }
}
