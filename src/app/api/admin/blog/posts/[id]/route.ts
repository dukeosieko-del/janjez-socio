import { NextResponse, NextRequest } from "next/server";
import { requireAdmin } from "@/lib/server/auth-helpers";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(request);
  if (admin instanceof Response) return admin;

  const { id } = await params;
  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { status, rejection_reason } = body;

    const allowedStatuses = ["draft", "pending", "published", "rejected", "archived"];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updates: Record<string, unknown> = { status };
    if (status === "published") {
      updates.published_at = new Date().toISOString();
      updates.approved_at = new Date().toISOString();
      updates.approved_by = admin.id;
    }
    if (status === "rejected") {
      updates.rejection_reason = rejection_reason || null;
    }

    const { data: post, error: updateError } = await supabase
      .from("blog_posts")
      .update(updates)
      .eq("id", id)
      .select("id, slug, title, status")
      .single();

    if (updateError) {
      return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, post });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}
