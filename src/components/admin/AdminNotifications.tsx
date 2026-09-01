"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthContext";
import { useNotifications } from "@/lib/supabase/realtime";
import { fetchWithTimeout } from "@/lib/client/fetchWithTimeout";

interface BroadcastForm {
  title: string;
  body: string;
  link: string;
  audience: "user" | "admin";
  category: "order" | "wallet" | "security" | "system" | "admin_alert";
  severity: "info" | "success" | "warning" | "error";
  user_id: string;
}

const DEFAULT_FORM: BroadcastForm = {
  title: "",
  body: "",
  link: "",
  audience: "admin",
  category: "system",
  severity: "info",
  user_id: "",
};

export default function AdminNotifications() {
  const { session } = useAuth();
  const [form, setForm] = useState<BroadcastForm>(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { notifications, loading, refresh } = useNotifications(
    session?.user?.id ?? null,
    session?.access_token ?? null,
    { audience: "admin", limit: 25 }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }
    if (form.audience === "user" && !form.user_id.trim()) {
      setError("user_id is required for user-audience broadcasts");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetchWithTimeout("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token ?? ""}`,
        },
        body: JSON.stringify({
          audience: form.audience,
          category: form.category,
          severity: form.severity,
          title: form.title.trim(),
          body: form.body.trim() || null,
          link: form.link.trim() || null,
          user_id: form.audience === "user" ? form.user_id.trim() : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send notification");
        return;
      }
      setSuccess(
        form.audience === "admin"
          ? `Broadcast sent to ${data.count ?? 0} admins`
          : "Notification sent to user"
      );
      setForm(DEFAULT_FORM);
      void refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-kenya-white mb-4">
        Notification Broadcasts
      </h2>

      <form
        onSubmit={handleSubmit}
        className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6 mb-8 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-kenya-white/70 mb-1">
            Title *
          </label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-3 py-2 text-kenya-white focus:outline-none focus:border-kenya-green"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-kenya-white/70 mb-1">
            Body
          </label>
          <textarea
            rows={3}
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-3 py-2 text-kenya-white focus:outline-none focus:border-kenya-green resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-kenya-white/70 mb-1">
            Link (optional)
          </label>
          <input
            type="text"
            value={form.link}
            onChange={(e) => setForm({ ...form, link: e.target.value })}
            placeholder="/dashboard/orders/123"
            className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-3 py-2 text-kenya-white placeholder-kenya-white/30 focus:outline-none focus:border-kenya-green"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-kenya-white/70 mb-1">
              Audience
            </label>
            <select
              value={form.audience}
              onChange={(e) =>
                setForm({ ...form, audience: e.target.value as "user" | "admin" })
              }
              className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-3 py-2 text-kenya-white focus:outline-none focus:border-kenya-green"
            >
              <option value="admin">All admins</option>
              <option value="user">Specific user</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-kenya-white/70 mb-1">
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) =>
                setForm({
                  ...form,
                  category: e.target.value as BroadcastForm["category"],
                })
              }
              className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-3 py-2 text-kenya-white focus:outline-none focus:border-kenya-green"
            >
              <option value="system">System</option>
              <option value="order">Order</option>
              <option value="wallet">Wallet</option>
              <option value="security">Security</option>
              <option value="admin_alert">Admin alert</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-kenya-white/70 mb-1">
              Severity
            </label>
            <select
              value={form.severity}
              onChange={(e) =>
                setForm({
                  ...form,
                  severity: e.target.value as BroadcastForm["severity"],
                })
              }
              className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-3 py-2 text-kenya-white focus:outline-none focus:border-kenya-green"
            >
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>
          {form.audience === "user" && (
            <div>
              <label className="block text-sm font-medium text-kenya-white/70 mb-1">
                Target user UUID *
              </label>
              <input
                type="text"
                required
                value={form.user_id}
                onChange={(e) => setForm({ ...form, user_id: e.target.value })}
                placeholder="00000000-0000-0000-0000-000000000000"
                className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-3 py-2 text-kenya-white placeholder-kenya-white/30 focus:outline-none focus:border-kenya-green"
              />
            </div>
          )}
        </div>

        {error && <p className="text-kenya-red text-sm">{error}</p>}
        {success && <p className="text-kenya-green text-sm">{success}</p>}

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-kenya-green text-kenya-black font-bold rounded-lg hover:bg-kenya-green/90 transition-colors disabled:opacity-50"
          >
            {submitting ? "Sending…" : "Send broadcast"}
          </button>
          <button
            type="button"
            onClick={() => setForm(DEFAULT_FORM)}
            className="px-4 py-2 bg-kenya-white/10 text-kenya-white rounded-lg hover:bg-kenya-white/20 transition-colors"
          >
            Reset
          </button>
        </div>
      </form>

      <h3 className="text-lg font-bold text-kenya-white mb-3">
        Recent admin broadcasts
      </h3>
      <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl overflow-hidden">
        {loading && notifications.length === 0 ? (
          <div className="p-6 text-center text-kenya-white/50 text-sm">
            Loading…
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-6 text-center text-kenya-white/50 text-sm">
            No admin broadcasts yet.
          </div>
        ) : (
          <ul className="divide-y divide-kenya-white/5">
            {notifications.map((n) => (
              <li key={n.id} className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="font-semibold text-sm text-kenya-white">
                    {n.title}
                  </h4>
                  <span className="text-xs text-kenya-white/40">
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                </div>
                {n.body && (
                  <p className="text-sm text-kenya-white/60 mt-1 line-clamp-2">
                    {n.body}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-kenya-white/10 text-kenya-white/70">
                    {n.category}
                  </span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-kenya-white/10 text-kenya-white/70">
                    {n.severity}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}