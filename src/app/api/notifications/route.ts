import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserFromRequest } from "@/lib/server/auth-helpers";
import { rateLimit } from "@/lib/server/rate-limiter";
import {
  listNotifications,
  createNotification,
  notifyAdmins,
  markAllRead,
  type NotificationAudience,
  type NotificationCategory,
  type NotificationSeverity,
} from "@/lib/notifications";

export const runtime = "nodejs";

const VALID_AUDIENCE: NotificationAudience[] = ["user", "admin"];
const VALID_CATEGORY: NotificationCategory[] = [
  "order",
  "wallet",
  "security",
  "system",
  "admin_alert",
];
const VALID_SEVERITY: NotificationSeverity[] = [
  "info",
  "success",
  "warning",
  "error",
];

function isAdminRole(role: string | undefined): boolean {
  return role === "admin";
}

export async function GET(request: NextRequest) {
  try {
    const rl = rateLimit(request, 60);
    if (!rl.ok && rl.response) return rl.response;

    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const audienceParam = url.searchParams.get("audience");
    const audience: NotificationAudience =
      audienceParam === "admin" && isAdminRole(user.role) ? "admin" : "user";
    const limit = parseInt(url.searchParams.get("limit") || "20", 10);
    const cursor = url.searchParams.get("cursor");

    const result = await listNotifications(user.id, {
      audience,
      limit,
      cursor,
    });

    const unreadCount = result.notifications.filter((n) => !n.read_at).length;

    return NextResponse.json({
      notifications: result.notifications,
      unreadCount,
      nextCursor: result.nextCursor,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load notifications" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const rl = rateLimit(request, 30);
    if (!rl.ok && rl.response) return rl.response;

    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!isAdminRole(user.role)) {
      return NextResponse.json(
        { error: "Forbidden — admin access required" },
        { status: 403 }
      );
    }

    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Server misconfigured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const audience = body.audience as NotificationAudience;
    const category = body.category as NotificationCategory;
    const severity = (body.severity as NotificationSeverity) ?? "info";
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const messageBody = typeof body.body === "string" ? body.body : null;
    const link = typeof body.link === "string" ? body.link : null;
    const targetUserId =
      typeof body.user_id === "string" ? body.user_id : null;

    if (!title) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }
    if (!audience || !VALID_AUDIENCE.includes(audience)) {
      return NextResponse.json(
        { error: "audience must be 'user' or 'admin'" },
        { status: 400 }
      );
    }
    if (!category || !VALID_CATEGORY.includes(category)) {
      return NextResponse.json(
        { error: "category must be one of: order, wallet, security, system, admin_alert" },
        { status: 400 }
      );
    }
    if (!VALID_SEVERITY.includes(severity)) {
      return NextResponse.json(
        { error: "severity must be one of: info, success, warning, error" },
        { status: 400 }
      );
    }

    if (audience === "admin") {
      const created = await notifyAdmins(category, {
        title,
        body: messageBody ?? undefined,
        link,
        severity,
      });
      return NextResponse.json({ ok: true, count: created.length });
    }

    if (!targetUserId) {
      return NextResponse.json(
        { error: "user_id is required for user-audience broadcasts" },
        { status: 400 }
      );
    }

    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", targetUserId)
      .single();
    if (profileErr || !profile) {
      return NextResponse.json(
        { error: "Target user not found" },
        { status: 404 }
      );
    }

    const notif = await createNotification({
      userId: targetUserId,
      audience: "user",
      category,
      title,
      body: messageBody,
      link,
      severity,
    });

    return NextResponse.json({ ok: true, notification: notif });
  } catch {
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const rl = rateLimit(request, 30);
    if (!rl.ok && rl.response) return rl.response;

    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const action = url.searchParams.get("action");

    if (action === "mark-all-read") {
      const count = await markAllRead(user.id);
      return NextResponse.json({ ok: true, count });
    }

    return NextResponse.json(
      { error: "Unsupported action. Use /api/notifications/[id] PATCH for single updates." },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to update notifications" },
      { status: 500 }
    );
  }
}