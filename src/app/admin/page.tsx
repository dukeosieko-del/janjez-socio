"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import {
  OverviewTab,
  UsersTab,
  OrdersTab,
  LogsTab,
  LedgerTab,
  ServicesTab,
  SettingsTab,
} from "@/components/admin/AdminTabs";

type Tab = "overview" | "users" | "orders" | "logs" | "ledger" | "services" | "settings";

export default function AdminDashboardPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [authorized, setAuthorized] = useState(false);

  const isAdmin = useMemo(
    () => (user?.user_metadata?.role || profile?.role) === "admin",
    [user, profile]
  );

  useEffect(() => {
    if (loading) return;

    if (!user || !isAdmin) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- required for auth gate redirect
      setAuthorized(false);
      router.replace("/dashboard");
      return;
    }

    setAuthorized(true);
  }, [user, isAdmin, loading, router]);

  if (loading || !authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-kenya-black text-kenya-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-kenya-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-kenya-white/60">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const tabItems: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "users", label: "Users" },
    { key: "orders", label: "Orders" },
    { key: "services", label: "Services" },
    { key: "logs", label: "Activity Logs" },
    { key: "ledger", label: "Ledger" },
    { key: "settings", label: "Settings" },
  ];

  return (
    <div className="min-h-screen flex bg-kenya-black">
      <div className="flex-1 flex flex-col">
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-kenya-white mb-2">Admin Dashboard</h1>
              <p className="text-kenya-white/60">Platform operations and oversight.</p>
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
            {tab === "logs" && <LogsTab />}
            {tab === "ledger" && <LedgerTab />}
            {tab === "settings" && <SettingsTab />}
          </div>
        </main>
      </div>
    </div>
  );
}
