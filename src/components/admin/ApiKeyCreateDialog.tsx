"use client";

import { useState } from "react";
import { fetchWithTimeout } from "@/lib/client/fetchWithTimeout";

const DEFAULT_SCOPES = [
  "services:read",
  "orders:read",
  "orders:write",
  "wallet:read",
  "analytics:read",
  "users:read",
  "webhooks:read",
];

interface CreatedKey {
  id: string;
  key_id: string;
  name: string;
  scopes: string[];
  rate_limit: number;
  expires_at: string | null;
  created_at: string;
  token: string;
  secret: string;
}

interface ApiKeyCreateDialogProps {
  sessionToken: string;
  onCreated: (key: CreatedKey) => void;
  onClose: () => void;
}

export function ApiKeyCreateDialog({ sessionToken, onCreated, onClose }: ApiKeyCreateDialogProps) {
  const [name, setName] = useState("");
  const [scopes, setScopes] = useState<string[]>([...DEFAULT_SCOPES]);
  const [rateLimit, setRateLimit] = useState(60);
  const [expiresInDays, setExpiresInDays] = useState(90);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleScope(s: string) {
    setScopes((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetchWithTimeout("/api/business/v1/keys", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sessionToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim() || "Default key",
          scopes,
          rate_limit: rateLimit,
          expires_in_ms: expiresInDays * 24 * 60 * 60 * 1000,
        }),
      });
      const body = await res.json();
      if (!res.ok || !body.success) {
        throw new Error(body?.error?.message ?? body?.message ?? `HTTP ${res.status}`);
      }
      onCreated(body.data as CreatedKey);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create key");
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-kenya-black/70 p-4">
      <div className="bg-kenya-black border border-kenya-white/20 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-kenya-white/10">
          <h2 className="text-kenya-white font-bold text-lg">Create API Key</h2>
          <p className="text-kenya-white/60 text-sm mt-1">
            The token and secret are shown once. Copy them now — they cannot be retrieved later.
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs text-kenya-white/60 mb-1">Key name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Default key"
              className="w-full bg-kenya-white/5 border border-kenya-white/10 rounded-lg px-3 py-2 text-kenya-white text-sm focus:outline-none focus:border-kenya-green"
            />
          </div>

          <div>
            <label className="block text-xs text-kenya-white/60 mb-2">Scopes</label>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_SCOPES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleScope(s)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                    scopes.includes(s)
                      ? "bg-kenya-green/20 border-kenya-green/50 text-kenya-green"
                      : "bg-kenya-white/5 border-kenya-white/10 text-kenya-white/60"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-kenya-white/60 mb-1">Rate limit / min</label>
              <input
                type="number"
                value={rateLimit}
                onChange={(e) => setRateLimit(parseInt(e.target.value, 10) || 60)}
                min={1}
                className="w-full bg-kenya-white/5 border border-kenya-white/10 rounded-lg px-3 py-2 text-kenya-white text-sm focus:outline-none focus:border-kenya-green"
              />
            </div>
            <div>
              <label className="block text-xs text-kenya-white/60 mb-1">Expires in (days)</label>
              <input
                type="number"
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(parseInt(e.target.value, 10) || 90)}
                min={1}
                className="w-full bg-kenya-white/5 border border-kenya-white/10 rounded-lg px-3 py-2 text-kenya-white text-sm focus:outline-none focus:border-kenya-green"
              />
            </div>
          </div>

          {error && (
            <div className="text-kenya-red text-sm bg-kenya-red/10 border border-kenya-red/30 rounded-lg p-3">
              {error}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-kenya-white/10 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="text-kenya-white/70 text-sm font-medium hover:text-kenya-white disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={submitting || scopes.length === 0}
            className="bg-kenya-green text-kenya-black font-bold text-sm px-5 py-2 rounded-xl hover:bg-kenya-green/90 disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create Key"}
          </button>
        </div>
      </div>
    </div>
  );
}