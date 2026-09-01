import { createAdminClient } from "@/lib/supabase/admin";

export type NotificationAudience = "user" | "admin";
export type NotificationSeverity = "info" | "success" | "warning" | "error";
export type NotificationCategory =
  | "order"
  | "wallet"
  | "security"
  | "system"
  | "admin_alert";

export interface Notification {
  id: string;
  user_id: string;
  audience: NotificationAudience;
  category: NotificationCategory;
  title: string;
  body: string | null;
  link: string | null;
  severity: NotificationSeverity;
  read_at: string | null;
  created_at: string;
}

export interface CreateNotificationInput {
  userId: string;
  audience?: NotificationAudience;
  category?: NotificationCategory;
  title: string;
  body?: string | null;
  link?: string | null;
  severity?: NotificationSeverity;
}

export interface NotificationPayload {
  title: string;
  body?: string;
  link?: string | null;
  severity?: NotificationSeverity;
}

export async function createNotification(
  input: CreateNotificationInput
): Promise<Notification | null> {
  const supabase = createAdminClient();
  if (!supabase) return null;

  const row = {
    user_id: input.userId,
    audience: input.audience ?? "user",
    category: input.category ?? "system",
    title: input.title,
    body: input.body ?? null,
    link: input.link ?? null,
    severity: input.severity ?? "info",
  };

  const { data, error } = await supabase
    .from("notifications")
    .insert(row)
    .select("*")
    .single();

  if (error) {
    console.error("createNotification error:", error.message);
    return null;
  }
  return data as Notification;
}

export async function notifyUser(
  userId: string,
  category: NotificationCategory,
  payload: NotificationPayload
): Promise<Notification | null> {
  return createNotification({
    userId,
    audience: "user",
    category,
    title: payload.title,
    body: payload.body ?? null,
    link: payload.link ?? null,
    severity: payload.severity ?? "info",
  });
}

export async function notifyAdmins(
  category: NotificationCategory,
  payload: NotificationPayload
): Promise<Notification[]> {
  const supabase = createAdminClient();
  if (!supabase) return [];

  const { data: admins, error: adminErr } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "admin");

  if (adminErr) {
    console.error("notifyAdmins: failed to load admins", adminErr.message);
    return [];
  }

  if (!admins || admins.length === 0) return [];

  const rows = admins.map((a) => ({
    user_id: a.id,
    audience: "admin" as NotificationAudience,
    category,
    title: payload.title,
    body: payload.body ?? null,
    link: payload.link ?? null,
    severity: payload.severity ?? "info",
  }));

  const { data, error } = await supabase
    .from("notifications")
    .insert(rows)
    .select("*");

  if (error) {
    console.error("notifyAdmins insert error:", error.message);
    return [];
  }
  return (data || []) as Notification[];
}

export async function markRead(
  notificationId: string,
  userId: string
): Promise<boolean> {
  const supabase = createAdminClient();
  if (!supabase) return false;

  const { error: updErr } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId);

  if (updErr) {
    console.error("markRead error:", updErr.message);
    return false;
  }

  const { data: owner, error: ownerErr } = await supabase
    .from("notifications")
    .select("user_id")
    .eq("id", notificationId)
    .single();

  if (ownerErr || !owner || owner.user_id !== userId) {
    console.error("markRead ownership mismatch");
    return false;
  }
  return true;
}

export async function markAllRead(userId: string): Promise<number> {
  const supabase = createAdminClient();
  if (!supabase) return 0;

  const { data, error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", userId)
    .is("read_at", null)
    .select("id");

  if (error) {
    console.error("markAllRead error:", error.message);
    return 0;
  }
  return data?.length ?? 0;
}

export interface ListNotificationsOptions {
  audience?: NotificationAudience;
  limit?: number;
  cursor?: string | null;
  unreadOnly?: boolean;
}

export interface ListNotificationsResult {
  notifications: Notification[];
  nextCursor: string | null;
}

export async function listNotifications(
  userId: string,
  options: ListNotificationsOptions = {}
): Promise<ListNotificationsResult> {
  const supabase = createAdminClient();
  if (!supabase) return { notifications: [], nextCursor: null };

  const limit = Math.min(Math.max(options.limit ?? 20, 1), 100);
  const audience = options.audience ?? "user";

  let query = supabase
    .from("notifications")
    .select("*");

  if (audience === "admin") {
    query = query.eq("audience", "admin");
  } else {
    query = query.eq("audience", "user").eq("user_id", userId);
  }

  if (options.unreadOnly) {
    query = query.is("read_at", null);
  }

  if (options.cursor) {
    query = query.lt("created_at", options.cursor);
  }

  query = query.order("created_at", { ascending: false }).limit(limit + 1);

  const { data, error } = await query;
  if (error) {
    console.error("listNotifications error:", error.message);
    return { notifications: [], nextCursor: null };
  }

  const rows = (data || []) as Notification[];
  const hasMore = rows.length > limit;
  const slice = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore ? slice[slice.length - 1].created_at : null;

  return { notifications: slice, nextCursor };
}

export async function deleteNotification(
  notificationId: string,
  userId: string
): Promise<boolean> {
  const supabase = createAdminClient();
  if (!supabase) return false;

  const { error: ownerErr, data: owner } = await supabase
    .from("notifications")
    .select("user_id")
    .eq("id", notificationId)
    .single();

  if (ownerErr || !owner || owner.user_id !== userId) {
    console.error("deleteNotification ownership mismatch");
    return false;
  }

  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", notificationId);

  if (error) {
    console.error("deleteNotification error:", error.message);
    return false;
  }
  return true;
}