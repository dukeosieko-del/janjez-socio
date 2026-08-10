"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";

type SettingsTab = "integrations" | "drip-feed" | "daraja";

export default function AdminSettingsPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<SettingsTab>("integrations");
  const [authorized, setAuthorized] = useState(false);

  const isAdmin = useMemo(
    () => (user?.user_metadata?.role || profile?.role) === "admin",
    [user, profile]
  );

  useEffect(() => {
    if (loading) return;
    if (!user || !isAdmin) {
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
          <p className="text-kenya-white/60">Loading settings...</p>
        </div>
      </div>
    );
  }

  const tabItems: { key: SettingsTab; label: string }[] = [
    { key: "integrations", label: "Integrations" },
    { key: "drip-feed", label: "Drip Feed" },
    { key: "daraja", label: "Daraja / M-Pesa" },
  ];

  return (
    <div className="min-h-screen flex bg-kenya-black">
      <div className="flex-1 flex flex-col">
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-kenya-white mb-2">Settings</h1>
              <p className="text-kenya-white/60">Platform configuration and integrations.</p>
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

            {tab === "integrations" && <IntegrationsTab />}
            {tab === "drip-feed" && <DripFeedSettingsTab />}
            {tab === "daraja" && <DarajaSettingsTab />}
          </div>
        </main>
      </div>
    </div>
  );
}

function IntegrationsTab() {
  const [status, setStatus] = useState<any>(null);
  const [balance, setBalance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [checkingBalance, setCheckingBalance] = useState(false);
  const { session } = useAuth();

  const loadStatus = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/integrations/provider", { headers: { Authorization: `Bearer ${session?.access_token || ""}` } });
    const data = await res.json();
    setStatus(data);
    setLoading(false);
  };

  useEffect(() => { loadStatus(); }, [session]);

  const testConnection = async () => {
    setTesting(true);
    const res = await fetch("/api/admin/integrations/provider", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token || ""}` },
      body: JSON.stringify({ action: "test" }),
    });
    const data = await res.json();
    alert(data.ok ? "Connection successful" : `Connection failed: ${data.error}`);
    setTesting(false);
  };

  const checkBalance = async () => {
    setCheckingBalance(true);
    const res = await fetch("/api/admin/integrations/provider", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token || ""}` },
      body: JSON.stringify({ action: "balance" }),
    });
    const data = await res.json();
    setBalance(data);
    setCheckingBalance(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-xl p-6">
        <h3 className="text-lg font-bold text-kenya-white mb-4">Provider Integration</h3>
        {loading ? (
          <p className="text-kenya-white/60 text-sm">Loading...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-kenya-white/70">Provider</p>
              <p className="text-kenya-white font-medium">{status?.provider?.name || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-kenya-white/70">API URL</p>
              <p className="text-kenya-white font-medium">{status?.provider?.apiUrl || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-kenya-white/70">API Key</p>
              <p className="text-kenya-white font-medium">{status?.provider?.apiKey ? "••••••••" : "—"}</p>
            </div>
            <div>
              <p className="text-sm text-kenya-white/70">Catalog Services</p>
              <p className="text-kenya-white font-medium">{status?.catalog?.totalServices || 0} total, {status?.catalog?.activeServices || 0} active</p>
            </div>
            <div>
              <p className="text-sm text-kenya-white/70">Last Sync</p>
              <p className="text-kenya-white font-medium">{status?.catalog?.lastSync ? new Date(status.catalog.lastSync).toLocaleString() : "Never"}</p>
            </div>
          </div>
        )}
        <div className="flex gap-2 mt-6">
          <button onClick={testConnection} disabled={testing} className="bg-kenya-green text-kenya-black px-4 py-2 rounded-xl text-sm font-medium hover:bg-kenya-green/90 disabled:opacity-50">
            {testing ? "Testing..." : "Test Connection"}
          </button>
          <button onClick={checkBalance} disabled={checkingBalance} className="bg-kenya-white/10 text-kenya-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-kenya-white/20 disabled:opacity-50">
            {checkingBalance ? "Checking..." : "Check Balance"}
          </button>
        </div>
        {balance && (
          <div className="mt-4 bg-kenya-black/50 rounded-xl p-4">
            <p className="text-sm text-kenya-white/70">Provider Balance</p>
            <p className="text-2xl font-bold text-kenya-white">{balance.balance} {balance.currency}</p>
            {parseFloat(balance.balance) === 0 && (
              <p className="text-red-400 text-sm mt-1">Warning: Provider balance is insufficient for fulfillment.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function DripFeedSettingsTab() {
  const [settings, setSettings] = useState({
    enabled: true,
    minRuns: 1,
    maxRuns: 10,
    minInterval: 1,
    maxInterval: 1440,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 500));
    alert("Settings saved (placeholder)");
    setSaving(false);
  };

  return (
    <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-xl p-6">
      <h3 className="text-lg font-bold text-kenya-white mb-4">Drip-Feed Settings</h3>
      <p className="text-kenya-white/60 text-sm mb-6">Janjez-level drip-feed configuration. Provider capabilities are checked per-service.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="flex items-center gap-2 text-sm text-kenya-white/70">
            <input type="checkbox" checked={settings.enabled} onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })} />
            Enable Drip-Feed Globally
          </label>
        </div>
        <div>
          <label className="block text-sm text-kenya-white/70 mb-1">Minimum Runs</label>
          <input type="number" className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-3 py-2 text-kenya-white text-sm" value={settings.minRuns} onChange={(e) => setSettings({ ...settings, minRuns: parseInt(e.target.value) || 1 })} />
        </div>
        <div>
          <label className="block text-sm text-kenya-white/70 mb-1">Maximum Runs</label>
          <input type="number" className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-3 py-2 text-kenya-white text-sm" value={settings.maxRuns} onChange={(e) => setSettings({ ...settings, maxRuns: parseInt(e.target.value) || 10 })} />
        </div>
        <div>
          <label className="block text-sm text-kenya-white/70 mb-1">Minimum Interval (minutes)</label>
          <input type="number" className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-3 py-2 text-kenya-white text-sm" value={settings.minInterval} onChange={(e) => setSettings({ ...settings, minInterval: parseInt(e.target.value) || 1 })} />
        </div>
        <div>
          <label className="block text-sm text-kenya-white/70 mb-1">Maximum Interval (minutes)</label>
          <input type="number" className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-3 py-2 text-kenya-white text-sm" value={settings.maxInterval} onChange={(e) => setSettings({ ...settings, maxInterval: parseInt(e.target.value) || 1440 })} />
        </div>
      </div>
      <div className="mt-6">
        <button onClick={handleSave} disabled={saving} className="bg-kenya-green text-kenya-black px-4 py-2 rounded-xl text-sm font-medium hover:bg-kenya-green/90 disabled:opacity-50">
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}

function DarajaSettingsTab() {
  const [config, setConfig] = useState({
    env: "sandbox",
    shortcode: "",
    passkey: "••••••••",
    consumerKey: "••••••••",
    consumerSecret: "••••••••",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 500));
    alert("Settings saved (placeholder)");
    setSaving(false);
  };

  return (
    <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-xl p-6">
      <h3 className="text-lg font-bold text-kenya-white mb-4">Daraja / M-Pesa Settings</h3>
      <p className="text-kenya-white/60 text-sm mb-6">Configure Safaricom Daraja integration. Credentials are stored server-side and never exposed to the browser.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-kenya-white/70 mb-1">Environment</label>
          <select className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-3 py-2 text-kenya-white text-sm" value={config.env} onChange={(e) => setConfig({ ...config, env: e.target.value })}>
            <option value="sandbox">Sandbox</option>
            <option value="production">Production</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-kenya-white/70 mb-1">Business Shortcode</label>
          <input type="text" className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-3 py-2 text-kenya-white text-sm" value={config.shortcode} onChange={(e) => setConfig({ ...config, shortcode: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm text-kenya-white/70 mb-1">Passkey</label>
          <input type="password" className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-3 py-2 text-kenya-white text-sm" value={config.passkey} onChange={(e) => setConfig({ ...config, passkey: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm text-kenya-white/70 mb-1">Consumer Key</label>
          <input type="password" className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-3 py-2 text-kenya-white text-sm" value={config.consumerKey} onChange={(e) => setConfig({ ...config, consumerKey: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm text-kenya-white/70 mb-1">Consumer Secret</label>
          <input type="password" className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-3 py-2 text-kenya-white text-sm" value={config.consumerSecret} onChange={(e) => setConfig({ ...config, consumerSecret: e.target.value })} />
        </div>
      </div>
      <div className="mt-6">
        <button onClick={handleSave} disabled={saving} className="bg-kenya-green text-kenya-black px-4 py-2 rounded-xl text-sm font-medium hover:bg-kenya-green/90 disabled:opacity-50">
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
