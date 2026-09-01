"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import AdminNotifications from "@/components/admin/AdminNotifications";

export default function AdminNotificationsPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
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
          <p className="text-kenya-white/60">Loading admin notifications…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-kenya-black">
      <div className="flex-1 flex flex-col">
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-kenya-white mb-2">
                Admin Notifications
              </h1>
              <p className="text-kenya-white/60">
                Send broadcasts and review recent admin alerts.
              </p>
            </div>
            <AdminNotifications />
          </div>
        </main>
      </div>
    </div>
  );
}