"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "./AuthContext";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  created_at: string;
}

export default function NotificationBell() {
  const { user, session } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!user || !session?.access_token) return;
    setLoading(true);
    try {
      const res = await fetch("/api/notifications", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // Silently fail - notifications are non-critical
    } finally {
      setLoading(false);
    }
  }, [user, session]);

  useEffect(() => {
    if (!user || !session?.access_token) return;
    let cancelled = false;
    void (async () => {
      await fetchNotifications();
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
    };
  }, [user, session?.access_token, fetchNotifications]);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [isOpen, fetchNotifications]);

  const markAllRead = useCallback(async () => {
    if (!session?.access_token) return;
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;

    await fetch("/api/notifications", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ ids: unreadIds, read: true }),
    });

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, [notifications, session]);

  const handleOpen = () => {
    setIsOpen(true);
    markAllRead();
  };

  const close = () => setIsOpen(false);

  if (!user) {
    return null;
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-lg hover:bg-kenya-white/10 transition-colors"
        aria-label="Notifications"
      >
        <svg
          className="h-6 w-6 text-kenya-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-kenya-red text-xs font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={close}>
          <div
            className="bg-kenya-black border border-kenya-white/10 rounded-2xl w-full max-w-md mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-kenya-white/10">
              <h2 className="text-xl font-bold text-kenya-white">Notifications</h2>
              <button
                onClick={close}
                className="text-kenya-white/50 hover:text-kenya-white transition-colors"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {loading && notifications.length === 0 && (
                <div className="p-8 text-center text-kenya-white/50 text-sm">Loading notifications…</div>
              )}
              {!loading && notifications.length === 0 && (
                <div className="p-8 text-center text-kenya-white/50 text-sm">No notifications yet.</div>
              )}
              {notifications.map((notif) => (
                <Link
                  key={notif.id}
                  href={notif.link || "/orders/all"}
                  onClick={close}
                  className="block p-4 hover:bg-kenya-white/5 transition-colors border-b border-kenya-white/5 last:border-0"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                        notif.read
                          ? "bg-kenya-white/20"
                          : notif.type === "topup" || notif.type === "success"
                          ? "bg-kenya-green"
                          : notif.type === "order_failed" || notif.type === "order_update"
                          ? "bg-yellow-500"
                          : "bg-kenya-white/40"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className={`font-semibold text-sm ${notif.read ? "text-kenya-white/50" : "text-kenya-white"}`}>
                          {notif.title}
                        </h3>
                        <span className="text-xs text-kenya-white/40 flex-shrink-0">
                          {new Date(notif.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                      <p className="text-sm text-kenya-white/60 mt-1 line-clamp-2">{notif.message}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="p-4 border-t border-kenya-white/10">
              <Link
                href="/orders/all"
                onClick={close}
                className="block w-full text-center py-2.5 bg-kenya-green text-kenya-black font-bold rounded-lg hover:bg-kenya-green/90 transition-colors"
              >
                View All Orders
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
