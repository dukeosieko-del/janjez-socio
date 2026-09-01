"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useAuth } from "./AuthContext";
import { useNotifications } from "@/lib/supabase/realtime";
import type { Notification } from "@/lib/notifications";

interface NotificationCenterProps {
  audience?: "user" | "admin";
  title?: string;
  emptyMessage?: string;
}

const SEVERITY_BADGES: Record<string, { bg: string; text: string; label: string }> = {
  info: { bg: "bg-kenya-white/10", text: "text-kenya-white/80", label: "Info" },
  success: { bg: "bg-kenya-green/20", text: "text-kenya-green", label: "Success" },
  warning: { bg: "bg-yellow-500/20", text: "text-yellow-400", label: "Warning" },
  error: { bg: "bg-kenya-red/20", text: "text-kenya-red", label: "Error" },
};

export default function NotificationCenter({
  audience = "user",
  title = "Notifications",
  emptyMessage = "You have no notifications yet.",
}: NotificationCenterProps) {
  const { user, session } = useAuth();

  const { notifications, unreadCount, loading, error, markAllRead, markRead } =
    useNotifications(user?.id ?? null, session?.access_token ?? null, {
      audience,
      limit: 50,
    });

  const grouped = useMemo(() => {
    const today: Notification[] = [];
    const earlier: Notification[] = [];
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    for (const n of notifications) {
      if (new Date(n.created_at) >= startOfToday) today.push(n);
      else earlier.push(n);
    }
    return { today, earlier };
  }, [notifications]);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-kenya-white">{title}</h1>
          <p className="text-sm text-kenya-white/50 mt-1">
            {unreadCount > 0
              ? `${unreadCount} unread of ${notifications.length}`
              : `${notifications.length} total`}
          </p>
        </div>
        <button
          onClick={() => void markAllRead()}
          disabled={unreadCount === 0}
          className="px-4 py-2 bg-kenya-green text-kenya-black font-bold rounded-lg hover:bg-kenya-green/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Mark all read
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-kenya-red/10 border border-kenya-red/30 rounded-xl text-kenya-red text-sm">
          {error}
        </div>
      )}

      {loading && notifications.length === 0 && (
        <div className="p-8 text-center text-kenya-white/50 text-sm">
          Loading notifications…
        </div>
      )}

      {!loading && notifications.length === 0 && (
        <div className="p-12 text-center bg-kenya-white/5 border border-kenya-white/10 rounded-2xl text-kenya-white/50">
          {emptyMessage}
        </div>
      )}

      {grouped.today.length > 0 && (
        <Section title="Today">
          {grouped.today.map((n) => (
            <NotificationRow
              key={n.id}
              notif={n}
              onRead={() => !n.read_at && void markRead(n.id)}
            />
          ))}
        </Section>
      )}

      {grouped.earlier.length > 0 && (
        <Section title="Earlier">
          {grouped.earlier.map((n) => (
            <NotificationRow
              key={n.id}
              notif={n}
              onRead={() => !n.read_at && void markRead(n.id)}
            />
          ))}
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="text-xs uppercase tracking-wider text-kenya-white/50 font-semibold mb-2 px-1">
        {title}
      </h2>
      <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl overflow-hidden">
        {children}
      </div>
    </section>
  );
}

function NotificationRow({
  notif,
  onRead,
}: {
  notif: Notification;
  onRead: () => void;
}) {
  const isRead = !!notif.read_at;
  const severity = SEVERITY_BADGES[notif.severity] ?? SEVERITY_BADGES.info;
  const linkHref = notif.link || "#";
  const inner = (
    <div className="flex items-start gap-3 p-4">
      <div
        className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
          isRead ? "bg-kenya-white/20" : "bg-kenya-green"
        }`}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h3
            className={`font-semibold text-sm ${
              isRead ? "text-kenya-white/60" : "text-kenya-white"
            }`}
          >
            {notif.title}
          </h3>
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${severity.bg} ${severity.text}`}
            >
              {severity.label}
            </span>
            <span className="text-xs text-kenya-white/40">
              {new Date(notif.created_at).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
        {notif.body && (
          <p className="text-sm text-kenya-white/60 mt-1 whitespace-pre-wrap">
            {notif.body}
          </p>
        )}
        {notif.category && (
          <p className="text-[11px] text-kenya-white/40 mt-2">
            Category: {notif.category}
          </p>
        )}
      </div>
    </div>
  );

  return notif.link ? (
    <Link
      href={linkHref}
      onClick={onRead}
      className={`block border-b border-kenya-white/5 last:border-0 hover:bg-kenya-white/5 transition-colors ${
        isRead ? "opacity-70" : ""
      }`}
    >
      {inner}
    </Link>
  ) : (
    <div
      onClick={onRead}
      className={`block border-b border-kenya-white/5 last:border-0 hover:bg-kenya-white/5 transition-colors cursor-pointer ${
        isRead ? "opacity-70" : ""
      }`}
    >
      {inner}
    </div>
  );
}