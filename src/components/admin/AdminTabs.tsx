"use client";

import { useEffect, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { useAuth } from "@/components/AuthContext";

interface IntegrationStatus {
  provider: string;
  api_url_configured: boolean;
  api_key_configured: boolean;
  provider_balance: { balance: number; currency: string } | null;
  provider_service_count: number;
  last_catalog_sync: string | null;
}

function authHeaders(session: { access_token?: string } | null): Record<string, string> {
  return session?.access_token
    ? { Authorization: `Bearer ${session.access_token}` }
    : {};
}

interface ProfileShape {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  wallet_balance: number | string;
  role: string | null;
  email_verified: boolean | null;
  created_at: string;
}

interface OrderShape {
  id: string;
  user_id: string;
  service_name?: string;
  service_id?: string;
  link?: string;
  quantity?: number;
  amount?: number | string;
  runs?: number | null;
  interval?: number | null;
  comments?: string | null;
  status?: string;
  payment_status?: string;
  created_at?: string;
  updated_at?: string;
  profiles?: { email?: string; full_name?: string | null } | null;
}

interface LogShape {
  id: string;
  actor_id?: string | null;
  actor_email?: string | null;
  action: string;
  target_type?: string | null;
  target_id?: string | null;
  details?: unknown;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at?: string;
}

interface LedgerShape {
  id: string;
  type: string;
  category: string;
  amount: number | string;
  currency: string;
  user_email?: string;
  user_name?: string;
  description?: string;
  created_at?: string;
}

type TableRow = (string | number | ReactNode)[];

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6">
      <p className="text-kenya-white/70 text-sm">{label}</p>
      <p className="text-3xl font-bold text-kenya-white mt-2">{value}</p>
      {sub && <p className="text-kenya-white/50 text-xs mt-1">{sub}</p>}
    </div>
  );
}

export function OverviewTab() {
  const { session } = useAuth();
  const [stats, setStats] = useState<{
    stats: { totalUsers?: number; totalOrders?: number; pendingOrders?: number };
    recentUsers?: ProfileShape[];
    recentOrders?: OrderShape[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats", { headers: authHeaders(session) })
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-kenya-white/60 text-sm">Loading overview...</div>;
  }

  if (!stats) {
    return <div className="text-kenya-red text-sm">Failed to load stats.</div>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Total Users" value={stats.stats?.totalUsers ?? 0} />
      <StatCard label="Total Orders" value={stats.stats?.totalOrders ?? 0} />
      <StatCard label="Pending Orders" value={stats.stats?.pendingOrders ?? 0} sub="Requires action" />
      <StatCard label="Recent Signups" value={stats.recentUsers?.length ?? 0} sub="Last 10 users" />
    </div>
  );
}

function DataTable({ headers, rows }: { headers: string[]; rows: TableRow[] }) {
  return (
    <div className="overflow-x-auto border border-kenya-white/10 rounded-2xl">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-kenya-white/5 text-kenya-white/70">
            {headers.map((h) => (
              <th key={h} className="text-left px-4 py-3">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx} className="border-t border-kenya-white/5 text-kenya-white/80">
              {row.map((cell, i) => (
                <td key={i} className="px-4 py-3">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function UsersTab() {
  const { session } = useAuth();
  const [users, setUsers] = useState<ProfileShape[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/users?limit=50", { headers: authHeaders(session) })
      .then((r) => r.json())
      .then((data) => {
        setUsers(data.users || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-kenya-white/60 text-sm">Loading users...</div>;

  const rows: TableRow[] = (users || []).map((u) => [
    u.email,
    u.full_name || "—",
    u.phone || "—",
    `KES ${Number(u.wallet_balance || 0).toFixed(2)}`,
    u.role || "user",
    u.email_verified ? "Yes" : "No",
    new Date(u.created_at).toLocaleDateString(),
  ]);

  return (
    <div>
      <h2 className="text-xl font-bold text-kenya-white mb-4">Users</h2>
      <DataTable
        headers={["Email", "Name", "Phone", "Wallet", "Role", "Verified", "Joined"]}
        rows={rows}
      />
      {users.length === 0 && <p className="text-kenya-white/50 text-sm mt-4">No users found.</p>}
    </div>
  );
}

export function OrdersTab() {
  const { session } = useAuth();
  const [orders, setOrders] = useState<OrderShape[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/orders?limit=50", { headers: authHeaders(session) })
      .then((r) => r.json())
      .then((data) => {
        setOrders(data.orders || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-kenya-white/60 text-sm">Loading orders...</div>;

  const rows: TableRow[] = (orders || []).map((o) => [
    o.id?.slice(0, 8) || "—",
    o.profiles?.email || "—",
    o.service_name || "—",
    `KES ${Number(o.amount || 0).toFixed(2)}`,
    o.runs && o.interval ? `${o.runs} runs / ${o.interval} min` : "Instant",
    o.status || "—",
    o.created_at ? new Date(o.created_at).toLocaleString() : "—",
  ]);

  return (
    <div>
      <h2 className="text-xl font-bold text-kenya-white mb-4">Orders</h2>
      <DataTable
        headers={["Order ID", "User", "Service", "Amount", "Schedule", "Status", "Created"]}
        rows={rows}
      />
      {orders.length === 0 && <p className="text-kenya-white/50 text-sm mt-4">No orders found.</p>}
    </div>
  );
}

export function LogsTab() {
  const { session } = useAuth();
  const [logs, setLogs] = useState<LogShape[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/logs?limit=100", { headers: authHeaders(session) })
      .then((r) => r.json())
      .then((data) => {
        setLogs(data.logs || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-kenya-white/60 text-sm">Loading logs...</div>;

  const rows: TableRow[] = (logs || []).map((l) => [
    l.id?.slice(0, 8) || "—",
    l.actor_email || "system",
    l.action,
    l.target_type || "—",
    l.target_id || "—",
    l.created_at ? new Date(l.created_at).toLocaleString() : "—",
  ]);

  return (
    <div>
      <h2 className="text-xl font-bold text-kenya-white mb-4">Activity Logs</h2>
      <DataTable
        headers={["ID", "Actor", "Action", "Target Type", "Target ID", "Timestamp"]}
        rows={rows}
      />
      {logs.length === 0 && <p className="text-kenya-white/50 text-sm mt-4">No logs found.</p>}
    </div>
  );
}

export function LedgerTab() {
  const { session } = useAuth();
  const [ledger, setLedger] = useState<LedgerShape[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/ledger?limit=100", { headers: authHeaders(session) })
      .then((r) => r.json())
      .then((data) => {
        setLedger(data.ledger || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-kenya-white/60 text-sm">Loading ledger...</div>;

  const rows: TableRow[] = (ledger || []).map((l) => [
    l.id?.slice(0, 8) || "—",
    l.type,
    l.category,
    l.currency === "KES" ? `KES ${Number(l.amount || 0).toFixed(2)}` : "—",
    l.user_email || "—",
    l.description,
    l.created_at ? new Date(l.created_at).toLocaleString() : "—",
  ]);

  return (
    <div>
      <h2 className="text-xl font-bold text-kenya-white mb-4">Ledger</h2>
      <DataTable
        headers={["ID", "Type", "Category", "Amount", "User", "Description", "Timestamp"]}
        rows={rows}
      />
      {ledger.length === 0 && <p className="text-kenya-white/50 text-sm mt-4">No ledger entries found.</p>}
    </div>
  );
}

interface ProviderServiceShape {
  id: string;
  name: string;
  type: string | null;
  category: string | null;
  rate: number;
  min: number;
  max: number;
  refill: boolean;
  cancel: boolean;
  supports_drip_feed: boolean;
  is_active: boolean;
  fetched_at: string;
}

interface JanjezServiceShape {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  selling_price_ksh: number;
  provider_service_id: string | null;
  min_quantity: number;
  max_quantity: number;
  is_active: boolean;
  supports_drip_feed: boolean;
  supports_refill: boolean;
  created_at: string;
}

export function ServicesTab() {
  const { session } = useAuth();
  const [subTab, setSubTab] = useState<"provider" | "janjez">("janjez");
  const [providerServices, setProviderServices] = useState<ProviderServiceShape[]>([]);
  const [janjezServices, setJanjezServices] = useState<JanjezServiceShape[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    slug: "",
    category: "",
    selling_price_ksh: "",
    provider_service_id: "",
    min_quantity: "",
    max_quantity: "",
    supports_drip_feed: false,
    supports_refill: false,
  });
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const headers = authHeaders(session);
    try {
      const [provRes, janRes] = await Promise.all([
        fetch(`/api/admin/provider-services?search=${encodeURIComponent(search)}`, { headers }),
        fetch(`/api/admin/services`, { headers }),
      ]);
      const provData = await provRes.json();
      const janData = await janRes.json();
      setProviderServices(provData.services || []);
      setJanjezServices(janData.services || []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [session, search]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
    load();
  }, [session, search]);

  const handleSyncCatalog = async () => {
    const headers = authHeaders(session);
    try {
      await fetch("/api/smm/catalog", { method: "POST", headers });
      load();
    } catch {
      /* ignore */
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreateSuccess(false);
    const headers = { ...authHeaders(session), "Content-Type": "application/json" };
    try {
      const res = await fetch("/api/admin/services", {
        method: "POST",
        headers,
        body: JSON.stringify({
          ...createForm,
          selling_price_ksh: Number(createForm.selling_price_ksh),
          min_quantity: Number(createForm.min_quantity),
          max_quantity: Number(createForm.max_quantity),
          provider_service_id: createForm.provider_service_id || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error || "Failed to create service");
      } else {
        setCreateSuccess(true);
        setShowCreate(false);
        setCreateForm({
          name: "",
          slug: "",
          category: "",
          selling_price_ksh: "",
          provider_service_id: "",
          min_quantity: "",
          max_quantity: "",
          supports_drip_feed: false,
          supports_refill: false,
        });
        load();
      }
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to create service");
    }
  };

  if (loading && subTab === "provider") return <div className="text-kenya-white/60 text-sm">Loading catalog...</div>;
  if (loading && subTab === "janjez") return <div className="text-kenya-white/60 text-sm">Loading services...</div>;

  const providerRows: TableRow[] = (providerServices || []).map((s) => [
    s.id,
    s.name,
    s.category || "—",
    `KES ${Number(s.rate).toFixed(4)}`,
    `${s.min} - ${s.max.toLocaleString()}`,
    s.refill ? "Yes" : "No",
    s.supports_drip_feed ? "Yes" : "No",
    s.is_active ? "Active" : "Inactive",
    new Date(s.fetched_at).toLocaleTimeString(),
  ]);

  const janjezRows: TableRow[] = (janjezServices || []).map((s) => [
    s.name,
    s.category,
    `KES ${Number(s.selling_price_ksh).toFixed(2)}`,
    `${s.min_quantity} - ${s.max_quantity.toLocaleString()}`,
    s.supports_drip_feed ? "Yes" : "No",
    s.is_active ? "Active" : "Inactive",
    new Date(s.created_at).toLocaleDateString(),
  ]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setSubTab("provider")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            subTab === "provider"
              ? "bg-kenya-green/20 text-kenya-green border border-kenya-green/30"
              : "bg-kenya-white/10 text-kenya-white hover:bg-kenya-white/20 border border-kenya-white/10"
          }`}
        >
          Provider Catalog
        </button>
        <button
          onClick={() => setSubTab("janjez")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            subTab === "janjez"
              ? "bg-kenya-green/20 text-kenya-green border border-kenya-green/30"
              : "bg-kenya-white/10 text-kenya-white hover:bg-kenya-white/20 border border-kenya-white/10"
          }`}
        >
          Janjez Services
        </button>
      </div>

      {subTab === "provider" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-kenya-white">Provider Services</h2>
            <button
              onClick={handleSyncCatalog}
              className="px-3 py-1.5 bg-kenya-green text-kenya-black font-bold text-sm rounded-lg hover:bg-kenya-green/90 transition-colors"
            >
              Sync Catalog
            </button>
          </div>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by name or id..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-sm bg-kenya-black border border-kenya-white/20 rounded-xl px-4 py-2 text-kenya-white placeholder-kenya-white/30 focus:outline-none focus:border-kenya-green focus:ring-1 focus:ring-kenya-green"
            />
          </div>
          <DataTable
            headers={["Provider ID", "Name", "Category", "Rate", "Min-Max", "Refill", "Drip", "Status", "Last Sync"]}
            rows={providerRows}
          />
          {providerServices.length === 0 && <p className="text-kenya-white/50 text-sm mt-4">No provider services found. Sync the catalog first.</p>}
        </div>
      )}

      {subTab === "janjez" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-kenya-white">Janjez Services</h2>
            <button
              onClick={() => setShowCreate(true)}
              className="px-3 py-1.5 bg-kenya-green text-kenya-black font-bold text-sm rounded-lg hover:bg-kenya-green/90 transition-colors"
            >
              Create Service
            </button>
          </div>

          {showCreate && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
              <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-bold text-kenya-white mb-4">Create Janjez Service</h3>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-kenya-white/70 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-3 py-2 text-kenya-white focus:outline-none focus:border-kenya-green"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-kenya-white/70 mb-1">Slug</label>
                <input
                  type="text"
                  required
                  value={createForm.slug}
                  onChange={(e) => setCreateForm({ ...createForm, slug: e.target.value })}
                  className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-3 py-2 text-kenya-white focus:outline-none focus:border-kenya-green"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-kenya-white/70 mb-1">Category</label>
                <input
                  type="text"
                  required
                  value={createForm.category}
                  onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                  className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-3 py-2 text-kenya-white focus:outline-none focus:border-kenya-green"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-kenya-white/70 mb-1">Selling Price (KES per unit)</label>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  required
                  value={createForm.selling_price_ksh}
                  onChange={(e) => setCreateForm({ ...createForm, selling_price_ksh: e.target.value })}
                  className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-3 py-2 text-kenya-white focus:outline-none focus:border-kenya-green"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-kenya-white/70 mb-1">Provider Service ID</label>
                <input
                  type="text"
                  value={createForm.provider_service_id}
                  onChange={(e) => setCreateForm({ ...createForm, provider_service_id: e.target.value })}
                  placeholder="e.g. 25934"
                  className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-3 py-2 text-kenya-white focus:outline-none focus:border-kenya-green"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-kenya-white/70 mb-1">Min Quantity</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={createForm.min_quantity}
                    onChange={(e) => setCreateForm({ ...createForm, min_quantity: e.target.value })}
                    className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-3 py-2 text-kenya-white focus:outline-none focus:border-kenya-green"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-kenya-white/70 mb-1">Max Quantity</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={createForm.max_quantity}
                    onChange={(e) => setCreateForm({ ...createForm, max_quantity: e.target.value })}
                    className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-3 py-2 text-kenya-white focus:outline-none focus:border-kenya-green"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-kenya-white/70">
                  <input
                    type="checkbox"
                    checked={createForm.supports_drip_feed}
                    onChange={(e) => setCreateForm({ ...createForm, supports_drip_feed: e.target.checked })}
                  />
                  Supports Drip-feed
                </label>
                <label className="flex items-center gap-2 text-sm text-kenya-white/70">
                  <input
                    type="checkbox"
                    checked={createForm.supports_refill}
                    onChange={(e) => setCreateForm({ ...createForm, supports_refill: e.target.checked })}
                  />
                  Supports Refill
                </label>
              </div>
              {createError && <p className="text-kenya-red text-sm">{createError}</p>}
              {createSuccess && <p className="text-kenya-green text-sm">Service created successfully.</p>}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-kenya-green text-kenya-black font-bold rounded-lg hover:bg-kenya-green/90 transition-colors"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 bg-kenya-white/10 text-kenya-white rounded-lg hover:bg-kenya-white/20 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <DataTable
        headers={["Name", "Category", "Price", "Limits", "Drip", "Status", "Created"]}
        rows={janjezRows}
      />
      {janjezServices.length === 0 && <p className="text-kenya-white/50 text-sm mt-4">No Janjez services configured. Create one to get started.</p>}
        </div>
      )}
    </div>
  );
}

export function SettingsTab() {
  const { session } = useAuth();
  const [subTab, setSubTab] = useState<"integrations" | "dripfeed" | "daraja">("integrations");
  const [integrationStatus, setIntegrationStatus] = useState<IntegrationStatus | null>(null);
  const [dripFeedSettings, setDripFeedSettings] = useState<{
    min_runs: number;
    max_runs: number;
    min_interval: number;
    max_interval: number;
  }>({ min_runs: 1, max_runs: 10, min_interval: 1, max_interval: 1440 });
  const [loading, setLoading] = useState(true);
  const headers = authHeaders(session);

  const loadIntegrationStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/integrations", { headers });
      const data = await res.json();
      setIntegrationStatus(data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [headers]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
    if (subTab === "integrations") loadIntegrationStatus();
  }, [subTab]);

  return (
    <div>
      <h2 className="text-xl font-bold text-kenya-white mb-4">Settings</h2>
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setSubTab("integrations")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            subTab === "integrations"
              ? "bg-kenya-green/20 text-kenya-green border border-kenya-green/30"
              : "bg-kenya-white/10 text-kenya-white hover:bg-kenya-white/20 border border-kenya-white/10"
          }`}
        >
          Integrations
        </button>
        <button
          onClick={() => setSubTab("dripfeed")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            subTab === "dripfeed"
              ? "bg-kenya-green/20 text-kenya-green border border-kenya-green/30"
              : "bg-kenya-white/10 text-kenya-white hover:bg-kenya-white/20 border border-kenya-white/10"
          }`}
        >
          Drip Feed
        </button>
        <button
          onClick={() => setSubTab("daraja")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            subTab === "daraja"
              ? "bg-kenya-green/20 text-kenya-green border border-kenya-green/30"
              : "bg-kenya-white/10 text-kenya-white hover:bg-kenya-white/20 border border-kenya-white/10"
          }`}
        >
          Daraja / M-Pesa
        </button>
      </div>

      {subTab === "integrations" && (
        <div className="space-y-4">
          {loading && <p className="text-kenya-white/60 text-sm">Loading integration status…</p>}
          {!loading && integrationStatus && (
            <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-kenya-white mb-3">DripFeedPanel Provider</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-kenya-white/50">API URL</span>
                  <span className="text-kenya-white ml-2">Configured: {integrationStatus.api_url_configured ? "Yes" : "No"}</span>
                </div>
                <div>
                  <span className="text-kenya-white/50">API Key</span>
                  <span className="text-kenya-white ml-2">Configured: {integrationStatus.api_key_configured ? "Yes" : "No"}</span>
                </div>
                <div>
                  <span className="text-kenya-white/50">Provider Service Count</span>
                  <span className="text-kenya-white ml-2">{integrationStatus.provider_service_count as number}</span>
                </div>
                <div>
                  <span className="text-kenya-white/50">Last Catalog Sync</span>
                  <span className="text-kenya-white ml-2">
                    {integrationStatus.last_catalog_sync
                      ? new Date(integrationStatus.last_catalog_sync as string).toLocaleString()
                      : "—"}
                  </span>
                </div>
              </div>
              {integrationStatus.provider_balance && (
                <div className="mt-3 text-sm">
                  <span className="text-kenya-white/50">Provider Balance: </span>
                  <span className="text-kenya-white">{integrationStatus.provider_balance.balance} {integrationStatus.provider_balance.currency}</span>
                </div>
              )}
              <div className="mt-4 flex gap-3">
                <button
                  onClick={async () => {
                    await fetch("/api/smm/catalog", { method: "POST", headers });
                    loadIntegrationStatus();
                  }}
                  className="px-3 py-1.5 bg-kenya-green text-kenya-black font-bold text-sm rounded-lg hover:bg-kenya-green/90 transition-colors"
                >
                  Sync Catalog
                </button>
              </div>
            </div>
          )}
          {!integrationStatus?.api_key_configured && (
            <div className="bg-kenya-red/10 border border-kenya-red/30 rounded-xl p-4">
              <p className="text-kenya-red text-sm">Provider API key is not configured. Set SMM_API_KEY in your environment.</p>
            </div>
          )}
        </div>
      )}

      {subTab === "dripfeed" && (
        <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-kenya-white mb-3">Drip-Feed Schedule Limits</h3>
          <p className="text-kenya-white/50 text-sm mb-4">
            Enforce global bounds on runs and interval. Individual services may further restrict
            whether drip-feed is offered.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-kenya-white/70 mb-1">Minimum Runs</label>
              <input
                type="number"
                min={1}
                value={dripFeedSettings.min_runs}
                onChange={(e) => setDripFeedSettings({ ...dripFeedSettings, min_runs: Number(e.target.value) })}
                className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-3 py-2 text-kenya-white focus:outline-none focus:border-kenya-green"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-kenya-white/70 mb-1">Maximum Runs</label>
              <input
                type="number"
                min={1}
                value={dripFeedSettings.max_runs}
                onChange={(e) => setDripFeedSettings({ ...dripFeedSettings, max_runs: Number(e.target.value) })}
                className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-3 py-2 text-kenya-white focus:outline-none focus:border-kenya-green"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-kenya-white/70 mb-1">Minimum Interval (minutes)</label>
              <input
                type="number"
                min={1}
                value={dripFeedSettings.min_interval}
                onChange={(e) => setDripFeedSettings({ ...dripFeedSettings, min_interval: Number(e.target.value) })}
                className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-3 py-2 text-kenya-white focus:outline-none focus:border-kenya-green"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-kenya-white/70 mb-1">Maximum Interval (minutes)</label>
              <input
                type="number"
                min={1}
                value={dripFeedSettings.max_interval}
                onChange={(e) => setDripFeedSettings({ ...dripFeedSettings, max_interval: Number(e.target.value) })}
                className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-3 py-2 text-kenya-white focus:outline-none focus:border-kenya-green"
              />
            </div>
          </div>
        </div>
      )}

      {subTab === "daraja" && (
        <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-kenya-white mb-3">Daraja / M-Pesa</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-kenya-white/50">Environment</span>
              <span className="text-kenya-white ml-2">{process.env.NEXT_PUBLIC_MPESA_ENV || "sandbox"}</span>
            </div>
            <div>
              <span className="text-kenya-white/50">Consumer Key</span>
              <span className="text-kenya-white ml-2">Configured: {process.env.MPESA_CONSUMER_KEY ? "Yes" : "No"}</span>
            </div>
            <div>
              <span className="text-kenya-white/50">Consumer Secret</span>
              <span className="text-kenya-white ml-2">Configured: {process.env.MPESA_CONSUMER_SECRET ? "Yes" : "No"}</span>
            </div>
            <div>
              <span className="text-kenya-white/50">Shortcode</span>
              <span className="text-kenya-white ml-2">{process.env.MPESA_SHORTCODE ? "Configured" : "Not set"}</span>
            </div>
          </div>
          <p className="text-kenya-white/50 text-xs mt-4">
            Credentials are read from server environment variables and never exposed to the browser.
          </p>
        </div>
      )}
    </div>
  );
}

