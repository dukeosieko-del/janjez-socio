import { NextResponse, NextRequest } from "next/server";
import { requireAdmin } from "@/lib/server/auth-helpers";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (admin instanceof Response) return admin;

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  try {
    const { data, error } = await supabase
      .from("blog_categories")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, categories: data || [] });
  } catch {
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (admin instanceof Response) return admin;

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { name, description, color_hex, id } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    let result;
    if (id) {
      result = await supabase.from("blog_categories").update({ name, description, color_hex }).eq("id", id).select().single();
    } else {
      result = await supabase.from("blog_categories").insert({ name, description, color_hex }).select().single();
    }

    if (result.error) {
      return NextResponse.json({ error: "Failed to save category" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, category: result.data });
  } catch {
    return NextResponse.json({ error: "Failed to save category" }, { status: 500 });
  }
}
