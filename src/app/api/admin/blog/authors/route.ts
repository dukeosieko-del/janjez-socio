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
      .from("profiles")
      .select("id, full_name, email, role")
      .order("full_name", { ascending: true });

    if (error) {
      return NextResponse.json({ error: "Failed to fetch authors" }, { status: 500 });
    }

    const authors = (data || []).map((author: any) => ({
      ...author,
      post_count: 0,
    }));

    return NextResponse.json({ ok: true, authors });
  } catch {
    return NextResponse.json({ error: "Failed to fetch authors" }, { status: 500 });
  }
}
