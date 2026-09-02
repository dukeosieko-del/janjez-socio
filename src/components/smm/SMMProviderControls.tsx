"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthContext";
import { fetchWithTimeout } from "@/lib/client/fetchWithTimeout";

export default function SMMProviderControls() {
  const { session } = useAuth();
  const [syncingCatalog, setSyncingCatalog] = useState(false);
  const [syncingStatus, setSyncingStatus] = useState(false);
  const [catalogResult, setCatalogResult] = useState<string | null>(null);
  const [statusResult, setStatusResult] = useState<string | null>(null);

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }

  const handleSyncCatalog = async () => {
    setSyncingCatalog(true);
    setCatalogResult(null);
    try {
      const res = await fetchWithTimeout("/api/smm/catalog", {
        method: "POST",
        headers,
      });
      const data = await res.json();
      if (!res.ok) {
        setCatalogResult(`Failed: ${data.error || "Unknown error"}`);
      } else {
        setCatalogResult(`Success: ${data.added || 0} added, ${data.updated || 0} updated`);
      }
    } catch (err) {
      setCatalogResult(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setSyncingCatalog(false);
    }
  };

  const handleSyncStatus = async () => {
    setSyncingStatus(true);
    setStatusResult(null);
    try {
      const res = await fetchWithTimeout("/api/cron/smm-sync", {
        method: "POST",
        headers,
      });
      const data = await res.json();
      if (!res.ok) {
        setStatusResult(`Failed: ${data.error || "Unknown error"}`);
      } else {
        setStatusResult("Success: statuses synced");
      }
    } catch (err) {
      setStatusResult(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setSyncingStatus(false);
    }
  };

  return (
    <div className="flex gap-3">
      <button
        onClick={handleSyncCatalog}
        disabled={syncingCatalog || !session?.access_token}
        className="inline-flex items-center gap-2 bg-kenya-green text-kenya-black font-bold text-sm px-5 py-3 rounded-xl hover:bg-kenya-green/90 transition-colors disabled:opacity-50"
      >
        {syncingCatalog ? "Syncing…" : "Sync Catalog"}
      </button>
      <button
        onClick={handleSyncStatus}
        disabled={syncingStatus || !session?.access_token}
        className="inline-flex items-center gap-2 bg-kenya-white/10 text-kenya-white font-bold text-sm px-5 py-3 rounded-xl hover:bg-kenya-white/20 transition-colors disabled:opacity-50"
      >
        {syncingStatus ? "Syncing…" : "Sync Statuses"}
      </button>

      {catalogResult && (
        <div className="ml-4 text-xs bg-kenya-white/5 border border-kenya-white/10 rounded-lg px-3 py-1.5">
          {catalogResult}
        </div>
      )}
      {statusResult && (
        <div className="ml-4 text-xs bg-kenya-white/5 border border-kenya-white/10 rounded-lg px-3 py-1.5">
          {statusResult}
        </div>
      )}
    </div>
  );
}
