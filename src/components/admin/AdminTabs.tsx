"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import type { ReactNode } from "react";
import { useAuth } from "@/components/AuthContext";
import { KNOWN_PLATFORMS } from "@/lib/service-queries";
import { normalizeSlug } from "@/lib/janzez-services";

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
  janjez_service_id?: string | null;
  fulfillment_status?: string;
  provider_status?: string;
  provider_order_id?: string;
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

  const handleAction = async (orderId: string, action: "cancel" | "refill") => {
    const headers = { ...authHeaders(session), "Content-Type": "application/json" };
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/actions`, {
        method: "POST",
        headers,
        body: JSON.stringify({ action, order_id: orderId }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Action result: ${JSON.stringify(data.result)}`);
        loadOrders();
      } else {
        alert(`Error: ${data.error || "Failed to process action"}`);
      }
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : "Failed to process action"}`);
    }
  };

  const loadOrders = () => {
    fetch("/api/admin/orders?limit=50", { headers: authHeaders(session) })
      .then((r) => r.json())
      .then((data) => setOrders(data.orders || []))
      .catch(() => {});
  };

  if (loading) return <div className="text-kenya-white/60 text-sm">Loading orders...</div>;

  const rows: TableRow[] = (orders || []).map((o) => [
    o.id?.slice(0, 8) || "—",
    o.profiles?.email || "—",
    o.service_name || "—",
    `KES ${Number(o.amount || 0).toFixed(2)}`,
    o.runs && o.interval ? `${o.runs} runs / ${o.interval} min` : "Instant",
    o.janjez_service_id ? o.janjez_service_id.slice(0, 8) : "—",
    o.fulfillment_status || "—",
    o.status || "—",
    o.created_at ? new Date(o.created_at).toLocaleString() : "—",
    <div key={o.id} className="flex gap-1">
      {o.fulfillment_status === "processing" && o.provider_order_id && (
        <>
          <button
            onClick={() => { if (confirm("Cancel this order?")) handleAction(o.id, "cancel"); }}
            className="text-xs px-2 py-1 bg-kenya-red/20 text-kenya-red border border-kenya-red/30 rounded hover:bg-kenya-red/30"
          >
            Cancel
          </button>
          <button
            onClick={() => handleAction(o.id, "refill")}
            className="text-xs px-2 py-1 bg-kenya-white/10 text-kenya-white border border-kenya-white/20 rounded hover:bg-kenya-white/20"
          >
            Refill
          </button>
        </>
      )}
      {o.fulfillment_status === "cancelled" && (
        <button
          onClick={() => handleAction(o.id, "refill")}
          className="text-xs px-2 py-1 bg-kenya-white/10 text-kenya-white border border-kenya-white/20 rounded hover:bg-kenya-white/20"
        >
          Refill
        </button>
      )}
    </div>,
  ]);

  return (
    <div>
      <h2 className="text-xl font-bold text-kenya-white mb-4">Orders</h2>
      <DataTable
        headers={["Order ID", "User", "Service", "Amount", "Schedule", "Janjez Service", "Fulfillment", "Status", "Created", "Actions"]}
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
  subcategory: string | null;
  description: string | null;
  selling_price_ksh: number;
  provider_service_id: string | null;
  min_quantity: number;
  max_quantity: number;
  is_active: boolean;
  display_order: number;
  supports_drip_feed: boolean;
  supports_refill: boolean;
  supports_cancel: boolean;
  show_sidebar: boolean;
  show_landing: boolean;
  show_guarded: boolean;
  show_anonymous: boolean;
  show_catalogue: boolean;
  created_at: string;
  updated_at: string;
}

export function ServicesTab() {
  const { session } = useAuth();
  const [subTab, setSubTab] = useState<"provider" | "janjez">("janjez");
  const [providerServices, setProviderServices] = useState<ProviderServiceShape[]>([]);
  const [janjezServices, setJanjezServices] = useState<JanjezServiceShape[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);
  const [form, setForm] = useState<Partial<JanjezServiceShape>>({});
  const [customSubcategory, setCustomSubcategory] = useState("");

  const subcategoryOptions = useMemo(() => {
    if (!form.category) return [];
    const cat = form.category.toLowerCase();
    const subs = new Set<string>();
    for (const svc of janjezServices) {
      if (svc.category && svc.category.toLowerCase() === cat && svc.subcategory) {
        subs.add(svc.subcategory);
      }
    }
    return Array.from(subs).sort();
  }, [form.category, janjezServices]);

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

  const handlePublishToggle = async (svc: JanjezServiceShape) => {
    const headers = { ...authHeaders(session), "Content-Type": "application/json" };
    try {
      await fetch(`/api/admin/services/${svc.id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ is_active: !svc.is_active }),
      });
      load();
    } catch {
      /* ignore */
    }
  };

  const handleEdit = (svc: JanjezServiceShape) => {
    setEditId(svc.id);
    setForm({ ...svc, selling_price_ksh: String(svc.selling_price_ksh) } as unknown as Partial<JanjezServiceShape>);
    setShowForm(true);
    setFormError(null);
    setFormSuccess(false);
  };

  const handleCreateNew = () => {
    setEditId(null);
    setForm({ is_active: true, display_order: 0, supports_drip_feed: false, supports_refill: false, supports_cancel: false, show_sidebar: false, show_landing: false, show_guarded: true, show_anonymous: true, show_catalogue: true });
    setShowForm(true);
    setFormError(null);
    setFormSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(false);
    const headers = { ...authHeaders(session), "Content-Type": "application/json" };

    const payload = {
      name: form.name,
      slug: normalizeSlug(form.slug || ""),
      category: form.category,
      subcategory: form.subcategory || null,
      description: form.description || null,
      selling_price_ksh: Number(form.selling_price_ksh),
      provider_service_id: form.provider_service_id || null,
      min_quantity: Number(form.min_quantity),
      max_quantity: Number(form.max_quantity),
      is_active: form.is_active ?? true,
      display_order: Number(form.display_order) || 0,
      supports_drip_feed: Boolean(form.supports_drip_feed),
      supports_refill: Boolean(form.supports_refill),
      supports_cancel: Boolean(form.supports_cancel),
      show_sidebar: Boolean(form.show_sidebar),
      show_landing: Boolean(form.show_landing),
      show_guarded: Boolean(form.show_guarded),
      show_anonymous: Boolean(form.show_anonymous),
      show_catalogue: Boolean(form.show_catalogue),
    };

    try {
      let res: Response;
      if (editId) {
        res = await fetch(`/api/admin/services/${editId}`, {
          method: "PATCH",
          headers,
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/admin/services", {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });
      }
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Failed to save service");
      } else {
        setFormSuccess(true);
        setShowForm(false);
        setEditId(null);
        load();
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save service");
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
    s.cancel ? "Yes" : "No",
    s.supports_drip_feed ? "Yes" : "No",
    s.is_active ? "Active" : "Inactive",
    new Date(s.fetched_at).toLocaleTimeString(),
  ]);

  const janjezRows: TableRow[] = (janjezServices || []).map((s) => [
    s.name,
    s.category,
    s.subcategory || "—",
    `KES ${Number(s.selling_price_ksh).toFixed(2)}`,
    `${s.min_quantity} - ${s.max_quantity.toLocaleString()}`,
    s.supports_drip_feed ? "Yes" : "No",
    s.supports_cancel ? "Yes" : "No",
    s.provider_service_id ? String(s.provider_service_id) : <span className="text-kenya-red">UNMAPPED</span>,
    s.show_sidebar ? "Yes" : "No",
    s.show_landing ? "Yes" : "No",
    s.show_guarded ? "Yes" : "No",
    s.show_anonymous ? "Yes" : "No",
    s.show_catalogue ? "Yes" : "No",
    s.is_active ? "Published" : "Draft",
    s.display_order,
    new Date(s.created_at).toLocaleDateString(),
    <button
      key={s.id}
      onClick={() => handlePublishToggle(s)}
      className={`text-xs px-2 py-1 rounded ${
        s.is_active
          ? "bg-kenya-red/20 text-kenya-red border border-kenya-red/30"
          : "bg-kenya-green/20 text-kenya-green border border-kenya-green/30"
      }`}
    >
      {s.is_active ? "Unpublish" : "Publish"}
    </button>,
    <button
      key={s.id + "-edit"}
      onClick={() => handleEdit(s)}
      className="text-xs px-2 py-1 ml-1 bg-kenya-white/10 text-kenya-white border border-kenya-white/20 rounded hover:bg-kenya-white/20"
    >
      Edit
    </button>,
  ]);

  const providerOptions = providerServices.filter((s) => s.is_active);

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
            <h2 className="text-xl font-bold text-kenya-white">Provider Catalog</h2>
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
            headers={["Provider ID", "Name", "Category", "Rate", "Min-Max", "Refill", "Cancel", "Drip", "Status", "Last Sync"]}
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
              onClick={handleCreateNew}
              className="px-3 py-1.5 bg-kenya-green text-kenya-black font-bold text-sm rounded-lg hover:bg-kenya-green/90 transition-colors"
            >
              Create Service
            </button>
          </div>

          {showForm && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
              <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-bold text-kenya-white mb-4">{editId ? "Edit" : "Create"} Janjez Service</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-kenya-white/70 mb-1">Name</label>
                      <input
                        type="text"
                        required
                        value={form.name || ""}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-3 py-2 text-kenya-white focus:outline-none focus:border-kenya-green"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-kenya-white/70 mb-1">Slug</label>
                      <input
                        type="text"
                        required
                        value={form.slug || ""}
                        onChange={(e) => setForm({ ...form, slug: e.target.value })}
                        className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-3 py-2 text-kenya-white focus:outline-none focus:border-kenya-green"
                      />
                    </div>
                  </div>

                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="block text-sm font-medium text-kenya-white/70 mb-1">Platform (Category)</label>
                       <select
                         required
                         value={form.category || ""}
                         onChange={(e) => {
  const cat = e.target.value;
  setForm({ ...form, category: cat, subcategory: "" });
  setCustomSubcategory("");
}}
                         className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-3 py-2 text-kenya-white focus:outline-none focus:border-kenya-green"
                       >
                         <option value="">-- Select a platform --</option>
                         {KNOWN_PLATFORMS.map((p) => (
                           <option key={p} value={p}>
                             {p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, " ")}
                           </option>
                         ))}
                         <option value="others">Others</option>
                       </select>
                     </div>
                      <div>
                        <label className="block text-sm font-medium text-kenya-white/70 mb-1">Subcategory</label>
                        {subcategoryOptions.length > 0 || customSubcategory ? (
                          <>
                            <select
                              value={customSubcategory ? "__custom__" : (form.subcategory || "")}
                              onChange={(e) => {
                                if (e.target.value === "__custom__") {
                                  setCustomSubcategory(form.subcategory || "");
                                } else {
                                  setCustomSubcategory("");
                                  setForm({ ...form, subcategory: e.target.value || null });
                                }
                              }}
                              className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-3 py-2 text-kenya-white focus:outline-none focus:border-kenya-green mb-2"
                            >
                              <option value="">-- Select a subcategory --</option>
                              {subcategoryOptions.map((sub) => (
                                <option key={sub} value={sub}>{sub}</option>
                              ))}
                              <option value="__custom__">Custom...</option>
                            </select>
                            {customSubcategory && (
                              <input
                                type="text"
                                value={customSubcategory}
                                onChange={(e) => {
                                  setCustomSubcategory(e.target.value);
                                  setForm({ ...form, subcategory: e.target.value || null });
                                }}
                                placeholder="Enter custom subcategory"
                                className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-3 py-2 text-kenya-white placeholder-kenya-white/30 focus:outline-none focus:border-kenya-green"
                              />
                            )}
                          </>
                        ) : (
                          <input
                            type="text"
                            value={form.subcategory || ""}
                            onChange={(e) => setForm({ ...form, subcategory: e.target.value || null })}
                            placeholder="e.g. Group Members, Likes, Views"
                            className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-3 py-2 text-kenya-white placeholder-kenya-white/30 focus:outline-none focus:border-kenya-green"
                          />
                        )}
                      </div>
                   </div>

                  <div>
                    <label className="block text-sm font-medium text-kenya-white/70 mb-1">Description</label>
                    <textarea
                      value={form.description || ""}
                      onChange={(e) => setForm({ ...form, description: e.target.value || null })}
                      placeholder="Optional customer-facing description"
                      rows={3}
                      className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-3 py-2 text-kenya-white focus:outline-none focus:border-kenya-green resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-kenya-white/70 mb-1">Selling Price (KES per 1k)</label>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      required
                      value={form.selling_price_ksh || ""}
                      onChange={(e) => setForm({ ...form, selling_price_ksh: Number(e.target.value) })}
                      className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-3 py-2 text-kenya-white focus:outline-none focus:border-kenya-green"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-kenya-white/70 mb-1">Provider Service</label>
                    <select
                      value={form.provider_service_id || ""}
                      onChange={(e) => setForm({ ...form, provider_service_id: e.target.value || null })}
                      className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-3 py-2 text-kenya-white focus:outline-none focus:border-kenya-green"
                    >
                      <option value="">— Select a provider service —</option>
                      {providerOptions.map((ps) => (
                        <option key={ps.id} value={ps.id}>
                          #{ps.id} — {ps.name} ({ps.category}) — KES {Number(ps.rate).toFixed(4)}
                        </option>
                      ))}
                    </select>
                    {form.provider_service_id && (
                      <p className="text-kenya-white/50 text-xs mt-1">
                        Mapped to: {providerOptions.find((p) => p.id === form.provider_service_id)?.name || form.provider_service_id}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-kenya-white/70 mb-1">Min Quantity</label>
                      <input
                        type="number"
                        min={1}
                        required
                        value={form.min_quantity || ""}
                        onChange={(e) => setForm({ ...form, min_quantity: Number(e.target.value) })}
                        className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-3 py-2 text-kenya-white focus:outline-none focus:border-kenya-green"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-kenya-white/70 mb-1">Max Quantity</label>
                      <input
                        type="number"
                        min={1}
                        required
                        value={form.max_quantity || ""}
                        onChange={(e) => setForm({ ...form, max_quantity: Number(e.target.value) })}
                        className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-3 py-2 text-kenya-white focus:outline-none focus:border-kenya-green"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-kenya-white/70 mb-1">Display Order</label>
                      <input
                        type="number"
                        min={0}
                        value={form.display_order || 0}
                        onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })}
                        className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-3 py-2 text-kenya-white focus:outline-none focus:border-kenya-green"
                      />
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-2 text-sm text-kenya-white/70">
                        <input
                          type="checkbox"
                          checked={form.is_active ?? true}
                          onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                        />
                        Published (active)
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 text-sm text-kenya-white/70">
                      <input
                        type="checkbox"
                        checked={form.supports_drip_feed || false}
                        onChange={(e) => setForm({ ...form, supports_drip_feed: e.target.checked })}
                      />
                      Supports Drip-feed
                    </label>
                    <label className="flex items-center gap-2 text-sm text-kenya-white/70">
                      <input
                        type="checkbox"
                        checked={form.supports_refill || false}
                        onChange={(e) => setForm({ ...form, supports_refill: e.target.checked })}
                      />
                      Supports Refill
                    </label>
                    <label className="flex items-center gap-2 text-sm text-kenya-white/70">
                      <input
                        type="checkbox"
                        checked={form.supports_cancel || false}
                        onChange={(e) => setForm({ ...form, supports_cancel: e.target.checked })}
                      />
                      Supports Cancel
                    </label>
                  </div>

                  <div className="border-t border-kenya-white/10 pt-4">
                    <p className="text-sm font-medium text-kenya-white/70 mb-2">Placement</p>
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center gap-2 text-sm text-kenya-white/70">
                        <input
                          type="checkbox"
                          checked={form.show_sidebar || false}
                          onChange={(e) => setForm({ ...form, show_sidebar: e.target.checked })}
                        />
                        Sidebar
                      </label>
                      <label className="flex items-center gap-2 text-sm text-kenya-white/70">
                        <input
                          type="checkbox"
                          checked={form.show_landing || false}
                          onChange={(e) => setForm({ ...form, show_landing: e.target.checked })}
                        />
                        Landing / Public
                      </label>
                      <label className="flex items-center gap-2 text-sm text-kenya-white/70">
                        <input
                          type="checkbox"
                          checked={form.show_guarded ?? true}
                          onChange={(e) => setForm({ ...form, show_guarded: e.target.checked })}
                        />
                        Guarded / Authenticated
                      </label>
                      <label className="flex items-center gap-2 text-sm text-kenya-white/70">
                        <input
                          type="checkbox"
                          checked={form.show_anonymous ?? true}
                          onChange={(e) => setForm({ ...form, show_anonymous: e.target.checked })}
                        />
                        Anonymous
                      </label>
                      <label className="flex items-center gap-2 text-sm text-kenya-white/70">
                        <input
                          type="checkbox"
                          checked={form.show_catalogue ?? true}
                          onChange={(e) => setForm({ ...form, show_catalogue: e.target.checked })}
                        />
                        Full Catalogue
                      </label>
                    </div>
                  </div>

                  {formError && <p className="text-kenya-red text-sm">{formError}</p>}
                  {formSuccess && <p className="text-kenya-green text-sm">Service saved successfully.</p>}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-kenya-green text-kenya-black font-bold rounded-lg hover:bg-kenya-green/90 transition-colors"
                    >
                      {editId ? "Update" : "Create"}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowForm(false); setEditId(null); }}
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
            headers={["Name", "Category", "Subcategory", "Price", "Min-Max", "Drip", "Cancel", "Provider", "Sidebar", "Landing", "Guarded", "Anon", "Catalogue", "Status", "Order", "Created", "Actions"]}
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
    enabled: boolean;
    min_runs: number;
    max_runs: number;
    min_interval: number;
    max_interval: number;
  }>({ enabled: true, min_runs: 1, max_runs: 20, min_interval: 10, max_interval: 1440 });
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

  const loadDripFeedSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/settings/drip-feed", { headers });
      const data = await res.json();
      setDripFeedSettings(data);
    } catch {
      /* ignore */
    }
  }, [headers]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
    if (subTab === "integrations") loadIntegrationStatus();
    if (subTab === "dripfeed") loadDripFeedSettings();
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
          <div className="mb-4">
            <label className="flex items-center gap-2 text-sm text-kenya-white/70">
              <input
                type="checkbox"
                checked={dripFeedSettings.enabled}
                onChange={(e) => setDripFeedSettings({ ...dripFeedSettings, enabled: e.target.checked })}
              />
              Enable Drip-Feed
            </label>
          </div>
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
          <button
            onClick={async () => {
              await fetch("/api/admin/settings/drip-feed", {
                method: "PATCH",
                headers: { ...headers, "Content-Type": "application/json" },
                body: JSON.stringify(dripFeedSettings),
              });
              loadDripFeedSettings();
            }}
            className="mt-4 px-3 py-1.5 bg-kenya-green text-kenya-black font-bold text-sm rounded-lg hover:bg-kenya-green/90 transition-colors"
          >
            Save Drip-Feed Settings
          </button>
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

