"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Notification } from "@/lib/notifications";

export interface UseNotificationsResult {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  markAllRead: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
}

export function useNotifications(
  userId: string | null | undefined,
  accessToken: string | null | undefined,
  options: { audience?: "user" | "admin"; limit?: number } = {}
): UseNotificationsResult {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<ReturnType<NonNullable<ReturnType<typeof createClient>>["channel"]> | null>(null);

  const audience = options.audience ?? "user";
  const limit = options.limit ?? 20;

  const refresh = useCallback(async () => {
    if (!userId || !accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ audience, limit: String(limit) });
      const res = await fetch(`/api/notifications?${params.toString()}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.status === 401) {
        setError("Session expired. Please sign in again.");
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const notifications: Notification[] = Array.isArray(data?.notifications)
        ? data.notifications
        : [];
      setNotifications(notifications);
      setUnreadCount(typeof data?.unreadCount === "number" ? data.unreadCount : 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [userId, accessToken, audience, limit]);

  const markAllRead = useCallback(async () => {
    if (!accessToken) return;
    try {
      await fetch(`/api/notifications?action=mark-all-read`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      setNotifications((prev) =>
        prev.map((n) => (n.read_at ? n : { ...n, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch {
      /* ignore */
    }
  }, [accessToken]);

  const markRead = useCallback(
    async (id: string) => {
      if (!accessToken) return;
      try {
        await fetch(`/api/notifications/${id}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ read: true }),
        });
        setNotifications((prev) =>
          prev.map((n) => (n.id === id && !n.read_at ? { ...n, read_at: new Date().toISOString() } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch {
        /* ignore */
      }
    },
    [accessToken]
  );

  useEffect(() => {
    if (!userId || !accessToken) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- required for fetch on user change
    refresh();
  }, [userId, accessToken, refresh]);

  useEffect(() => {
    if (!userId) return;
    const supabase = createClient();
    if (!supabase) return;

    void supabase.removeChannel(channelRef.current);
    channelRef.current = null;

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes" as never,
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        (payload: { new: Notification }) => {
          const row = payload.new;
          setNotifications((prev) => {
            if (audience !== "admin" && row.audience === "admin") return prev;
            if (audience === "admin" && row.audience !== "admin") return prev;
            if (prev.some((n) => n.id === row.id)) return prev;
            return [row, ...prev].slice(0, limit);
          });
          if (!row.read_at) setUnreadCount((c) => c + 1);
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      void supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [userId, audience, limit]);

  return { notifications, unreadCount, loading, error, refresh, markAllRead, markRead };
}