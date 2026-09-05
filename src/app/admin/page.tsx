"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthContext";
import {
  OverviewTab,
  UsersTab,
  OrdersTab,
  LogsTab,
  LedgerTab,
  ServicesTab,
  MappingTab,
  SettingsTab,
  NotificationsTab,
} from "@/components/admin/AdminTabs";

type Tab = "overview" | "users" | "orders" | "services" | "mapping" | "logs" | "ledger" | "settings" | "notifications";

export default function AdminDashboardPage() {
  const { user, profile, loading, isAdmin: contextIsAdmin } = useAuth();
  const [tab, setTab] = useState<Tab>("overview");
  const [authorized, setAuthorized] = useState(false);

  const isAdmin = useMemo(() => {
    const metaRole = (user?.user_metadata as { role?: string } | undefined)?.role;
    const profileRole = profile?.role;
    return metaRole === "admin" || profileRole === "admin" || contextIsAdmin;
  }, [user, profile, contextIsAdmin]);

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    if (!isAdmin) return;
    queueMicrotask(() => setAuthorized(true));
  }, [user, isAdmin, loading]);

  const showLoading = loading;
  const showNotAuthorized = !loading && user && !isAdmin;
  const showSignInPrompt = !loading && !user;

  if (showLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-kenya-black text-kenya-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-kenya-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-kenya-white/60">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (showSignInPrompt) {
    if (typeof window !== "undefined") {
      window.location.replace("/auth/sign-in?next=%2Fadmin");
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-kenya-black text-kenya-white">
        <div className="text-center">
          <p className="text-kenya-white/60">Redirecting to sign-in…</p>
        </div>
      </div>
    );
  }

  if (showNotAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-kenya-black text-kenya-white px-4">
        <div className="max-w-md w-full bg-kenya-white/5 border border-kenya-red/30 rounded-2xl p-8 text-center">
          <h1 className="text-2xl font-bold text-kenya-red mb-2">Admin access required</h1>
          <p className="text-kenya-white/70 mb-4">
            Your account is signed in but does not have admin privileges.
          </p>
          <p className="text-kenya-white/50 text-sm mb-6">
            To request admin access, ask the platform owner to run:
            <br />
            <code className="text-kenya-green text-xs mt-2 inline-block break-all">
              UPDATE public.profiles SET role = &apos;admin&apos; WHERE email = &apos;your@email.com&apos;;
            </code>
          </p>
          <div className="flex gap-2 justify-center">
            <a
              href="/api/auth/check-admin"
              className="px-4 py-2 bg-kenya-white/10 text-kenya-white rounded-lg hover:bg-kenya-white/20 transition-colors text-sm"
            >
              Diagnose
            </a>
            <a
              href="/dashboard"
              className="px-4 py-2 bg-kenya-green text-kenya-black font-bold rounded-lg hover:bg-kenya-green/90 transition-colors text-sm"
            >
              Go to dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  const tabItems: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "users", label: "Users" },
    { key: "orders", label: "Orders" },
    { key: "services", label: "Services" },
    { key: "mapping", label: "Service Mapping" },
    { key: "logs", label: "Activity Logs" },
    { key: "ledger", label: "Ledger" },
    { key: "settings", label: "Settings" },
    { key: "notifications", label: "Notifications" },
  ];

  return (
    <div className="min-h-screen flex bg-kenya-black">
      <div className="flex-1 flex flex-col">
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-kenya-white mb-2">Admin Dashboard</h1>
                <p className="text-kenya-white/60">Platform operations and oversight.</p>
              </div>
              <Link href="/admin/contact" className="inline-flex items-center gap-2 bg-kenya-green text-kenya-black font-bold text-sm px-4 py-2 rounded-xl hover:bg-kenya-green/90 transition-colors">
                Contact Messages
              </Link>
            </div>

            <div className="flex gap-2 mb-8 overflow-x-auto">
              {tabItems.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    tab === t.key
                      ? "bg-kenya-green/20 text-kenya-green border border-kenya-green/30"
                      : "bg-kenya-white/10 text-kenya-white hover:bg-kenya-white/20 border border-kenya-white/10"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {tab === "overview" && <OverviewTab />}
            {tab === "users" && <UsersTab />}
            {tab === "orders" && <OrdersTab />}
            {tab === "services" && <ServicesTab />}
            {tab === "mapping" && <MappingTab />}
            {tab === "logs" && <LogsTab />}
            {tab === "ledger" && <LedgerTab />}
            {tab === "settings" && <SettingsTab />}
            {tab === "notifications" && <NotificationsTab />}
          </div>
        </main>
      </div>
    </div>
  );
}
