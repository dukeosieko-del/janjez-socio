import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "100");
    const action = searchParams.get("action") || "";

    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    let query = supabase
      .from("admin_activity_logs")
      .select("*", { count: "exact" });

    if (action) {
      query = query.eq("action", action);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query.order("created_at", { ascending: false }).range(from, to);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
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
    const body = await request.json();
    const { action, target_type, target_id, details, ip_address, user_agent } = body;

    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    const { data, error } = await supabase
      .from("admin_activity_logs")
      .insert({
        action,
        target_type,
        target_id,
        details,
        ip_address,
        user_agent,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ log: data });
  } catch (error) {
    console.error("Admin log create error:", error);
    return NextResponse.json({ error: "Failed to create log" }, { status: 500 });
  }
}
