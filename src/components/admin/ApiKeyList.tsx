"use client";

import { useEffect, useState } from "react";
import { fetchWithTimeout } from "@/lib/client/fetchWithTimeout";

export interface ApiKeyRow {
  id: string;
  key_id: string;
  name: string;
  scopes: string[];
  rate_limit: number;
  last_used_at: string | null;
  expires_at: string | null;
  revoked_at: string | null;
  created_at: string;
}

interface ApiKeyListProps {
  sessionToken: string;
  listEndpoint?: string;
  revokeEndpoint?: (id: string) => string;
  onRevoke: (id: string) => Promise<void>;
}

export function ApiKeyList({
  sessionToken,
  listEndpoint = "/api/business/v1/keys",
  onRevoke,
}: ApiKeyListProps) {
  const [keys, setKeys] = useState<ApiKeyRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchWithTimeout(listEndpoint, {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = await res.json();
      setKeys(Array.isArray(body.data) ? body.data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load keys");
      setKeys([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionToken]);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 bg-kenya-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-kenya-red text-sm bg-kenya-red/10 border border-kenya-red/30 rounded-xl p-4">
        {error}
      </div>
    );
  }

  if (!keys || keys.length === 0) {
    return (
      <div className="text-kenya-white/60 text-sm bg-kenya-white/5 border border-kenya-white/10 rounded-xl p-6 text-center">
        No active API keys. Create one to integrate with the Janjez API.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {keys.map((k) => (
        <div
          key={k.id}
          className="bg-kenya-white/5 border border-kenya-white/10 rounded-xl p-4 flex items-center justify-between gap-4"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-kenya-white font-medium truncate">{k.name}</p>
              <code className="text-xs text-kenya-white/50 font-mono">{k.key_id}</code>
            </div>
            <p className="text-xs text-kenya-white/50 mt-1">
              {k.scopes.join(", ")} · limit {k.rate_limit}/min
              {k.last_used_at ? ` · last used ${new Date(k.last_used_at).toLocaleString()}` : " · never used"}
              {k.expires_at ? ` · expires ${new Date(k.expires_at).toLocaleDateString()}` : ""}
            </p>
          </div>
          <button
            onClick={async () => {
              setRevokingId(k.id);
              try {
                await onRevoke(k.id);
                await load();
              } finally {
                setRevokingId(null);
              }
            }}
            disabled={revokingId === k.id}
            className="shrink-0 text-kenya-red text-sm font-medium hover:text-kenya-red/80 disabled:opacity-50"
          >
            {revokingId === k.id ? "Revoking..." : "Revoke"}
          </button>
        </div>
      ))}
    </div>
  );
}