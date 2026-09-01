import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/server/auth-helpers";
import { rateLimit } from "@/lib/server/rate-limiter";
import {
  markRead,
  deleteNotification,
} from "@/lib/notifications";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rl = rateLimit(request, 30);
    if (!rl.ok && rl.response) return rl.response;

    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    let body: Record<string, unknown> = {};
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      body = {};
    }
    const wantsRead = body.read !== false;

    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Server misconfigured" },
        { status: 500 }
      );
    }

    const { data: existing, error: fetchErr } = await supabase
      .from("notifications")
      .select("id, user_id, audience")
      .eq("id", id)
      .single();

    if (fetchErr || !existing) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    if (existing.user_id !== user.id && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!wantsRead) {
      const { error: clearErr } = await supabase
        .from("notifications")
        .update({ read_at: null })
        .eq("id", id);
      if (clearErr) {
        return NextResponse.json(
          { error: clearErr.message },
          { status: 400 }
        );
      }
      return NextResponse.json({ ok: true, id, read: false });
    }

    const ok = await markRead(id, existing.user_id);
    if (!ok) {
      return NextResponse.json(
        { error: "Failed to mark notification read" },
        { status: 500 }
      );
    }
    return NextResponse.json({ ok: true, id, read: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rl = rateLimit(request, 30);
    if (!rl.ok && rl.response) return rl.response;

    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Server misconfigured" },
        { status: 500 }
      );
    }

    const { data: existing, error: fetchErr } = await supabase
      .from("notifications")
      .select("id, user_id")
      .eq("id", id)
      .single();

    if (fetchErr || !existing) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    if (existing.user_id !== user.id && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const ok = await deleteNotification(id, existing.user_id);
    if (!ok) {
      return NextResponse.json(
        { error: "Failed to delete notification" },
        { status: 500 }
      );
    }
    return NextResponse.json({ ok: true, id });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete notification" },
      { status: 500 }
    );
  }
}