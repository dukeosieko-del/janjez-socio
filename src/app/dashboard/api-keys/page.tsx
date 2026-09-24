"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthContext";
import { ApiKeyList } from "@/components/admin/ApiKeyList";
import { ApiKeyCreateDialog } from "@/components/admin/ApiKeyCreateDialog";
import { ApiKeySecretDisplay } from "@/components/admin/ApiKeySecretDisplay";
import type { CreatedKey } from "@/components/admin/ApiKeySecretDisplay";

export default function ApiKeysPage() {
  const { user, session, loading, isAdmin: contextIsAdmin } = useAuth();
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [createdKey, setCreatedKey] = useState<CreatedKey | null>(null);
  const [revokeVersion, setRevokeVersion] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const sessionToken = session?.access_token ?? "";
  const isAdmin = contextIsAdmin;

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/auth/sign-in?next=%2Fdashboard%2Fapi-keys");
      return;
    }
    if (!isAdmin) {
      setError("Admin access required. Your account does not have admin privileges.");
    }
  }, [loading, user, isAdmin, router]);

  async function handleRevoke(id: string) {
    setError(null);
    try {
      const res = await fetch(`/api/admin/keys/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { message?: string }).message ?? `HTTP ${res.status}`);
      }
      setRevokeVersion((v) => v + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to revoke key");
    }
  }

  async function handleCreate(body: {
    name: string;
    scopes: string[];
    rate_limit: number;
    expires_in_ms: number;
  }): Promise<CreatedKey> {
    setError(null);
    const res = await fetch("/api/admin/keys", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) {
      throw new Error((data as { message?: string }).message ?? `HTTP ${res.status}`);
    }
    return data.data as CreatedKey;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-kenya-black text-kenya-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-kenya-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-kenya-white/60">Loading…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-kenya-black text-kenya-white px-4">
        <div className="max-w-md w-full bg-kenya-white/5 border border-kenya-red/30 rounded-2xl p-8 text-center">
          <h1 className="text-2xl font-bold text-kenya-red mb-2">Access Denied</h1>
          <p className="text-kenya-white/70 mb-6">{error}</p>
          <Link href="/dashboard" className="inline-block bg-kenya-green text-kenya-black font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-kenya-green/90">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-kenya-black">
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-6">
              <Link href="/dashboard" className="text-kenya-white/60 text-sm hover:text-kenya-white">
                ← Back to Dashboard
              </Link>
              <h1 className="text-3xl sm:text-4xl font-bold text-kenya-white mt-2">API Keys</h1>
              <p className="text-kenya-white/60 mt-1">
                Issue and manage API keys for the Janjez Business API.
              </p>
            </div>

            <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-xl p-4 mb-6">
              <p className="text-xs text-kenya-white/50 mb-2">How to use</p>
              <ol className="text-xs text-kenya-white/70 space-y-1 list-decimal list-inside">
                <li>Create a key and copy the token + secret (shown once).</li>
                <li>Send <code className="text-kenya-white/80">Authorization: Bearer {"<token>"}</code>.</li>
                <li>Scopes control which endpoints the key can access.</li>
              </ol>
            </div>

            <div className="flex justify-end mb-6">
              <button
                onClick={() => setCreateOpen(true)}
                className="bg-kenya-green text-kenya-black font-bold text-sm px-4 py-2 rounded-xl hover:bg-kenya-green/90 transition-colors"
              >
                + Create Key
              </button>
            </div>

            <ApiKeyList
              key={revokeVersion}
              sessionToken={sessionToken}
              listEndpoint="/api/admin/keys"
              onRevoke={handleRevoke}
            />
          </div>
        </main>
      </div>

      {createOpen && (
        <ApiKeyCreateDialog
          sessionToken={sessionToken}
          onCreated={(key) => {
            setCreatedKey(key);
            setCreateOpen(false);
            setRevokeVersion((v) => v + 1);
          }}
          onClose={() => setCreateOpen(false)}
        />
      )}

{createdKey && (
        <ApiKeySecretDisplay keyData={createdKey} onClose={() => setCreatedKey(null)} />
      )}
    </div>
  );
}