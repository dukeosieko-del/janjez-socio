"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthContext";
import { useNotifications } from "@/lib/supabase/realtime";

export default function NotificationBell() {
  const { user, session, isAdmin } = useAuth();
  const pathname = usePathname() ?? "";
  const [isOpen, setIsOpen] = useState(false);

  const audience: "user" | "admin" = pathname.startsWith("/admin") ? "admin" : "user";
  const viewAllHref = audience === "admin" ? "/admin/notifications" : "/dashboard/notifications";

  const { notifications, unreadCount, markAllRead, markRead } = useNotifications(
    user?.id ?? null,
    session?.access_token ?? null,
    { audience, limit: 8 }
  );

  const handleOpen = async () => {
    setIsOpen(true);
    if (unreadCount > 0) {
      await markAllRead();
    }
  };

  const close = () => setIsOpen(false);

  if (!user) {
    return null;
  }

  const severityDot = (severity: string | undefined, read: boolean) => {
    if (read) return "bg-kenya-white/20";
    switch (severity) {
      case "success":
        return "bg-kenya-green";
      case "warning":
        return "bg-yellow-500";
      case "error":
        return "bg-kenya-red";
      default:
        return "bg-kenya-white/40";
    }
  };

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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={close}
        >
          <div
            className="bg-kenya-black border border-kenya-white/10 rounded-2xl w-full max-w-md mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-kenya-white/10">
              <h2 className="text-xl font-bold text-kenya-white">
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 text-sm font-normal text-kenya-white/50">
                    ({unreadCount} new)
                  </span>
                )}
              </h2>
              <button
                onClick={close}
                className="text-kenya-white/50 hover:text-kenya-white transition-colors"
                aria-label="Close"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 && (
                <div className="p-8 text-center text-kenya-white/50 text-sm">
                  No notifications yet.
                </div>
              )}
              {notifications.map((notif) => (
                <Link
                  key={notif.id}
                  href={notif.link || "/orders/all"}
                  onClick={(e) => {
                    close();
                    if (!notif.read_at) {
                      void markRead(notif.id);
                    }
                    if (notif.link) {
                      // let navigation happen
                    } else {
                      e.preventDefault();
                    }
                  }}
                  className="block p-4 hover:bg-kenya-white/5 transition-colors border-b border-kenya-white/5 last:border-0"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${severityDot(
                        notif.severity,
                        !!notif.read_at
                      )}`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3
                          className={`font-semibold text-sm ${
                            notif.read_at
                              ? "text-kenya-white/50"
                              : "text-kenya-white"
                          }`}
                        >
                          {notif.title}
                        </h3>
                        <span className="text-xs text-kenya-white/40 flex-shrink-0">
                          {new Date(notif.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      {notif.body && (
                        <p className="text-sm text-kenya-white/60 mt-1 line-clamp-2">
                          {notif.body}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="p-4 border-t border-kenya-white/10 flex gap-2">
              <Link
                href={viewAllHref}
                onClick={close}
                className="flex-1 text-center py-2.5 bg-kenya-green text-kenya-black font-bold rounded-lg hover:bg-kenya-green/90 transition-colors"
              >
                View All
              </Link>
              <button
                onClick={() => void markAllRead()}
                disabled={unreadCount === 0}
                className="px-4 py-2.5 bg-kenya-white/10 text-kenya-white rounded-lg hover:bg-kenya-white/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Mark all read
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}