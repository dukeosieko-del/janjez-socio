"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import { JanjezService } from "@/lib/janjez-services";
import type { ProviderService } from "@/lib/smm/provider";

type Tab = "janjez" | "provider";

function authHeaders(session: { access_token?: string } | null): Record<string, string> {
  return session?.access_token
    ? { Authorization: `Bearer ${session.access_token}` }
    : {};
}

export default function AdminServicesPage() {
  const { user, profile, loading, session } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("janjez");
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
          <p className="text-kenya-white/60">Loading services...</p>
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
              <h1 className="text-3xl sm:text-4xl font-bold text-kenya-white mb-2">Services</h1>
              <p className="text-kenya-white/60">Manage provider catalog and Janjez customer services.</p>
            </div>

            <div className="flex gap-2 mb-8">
              <button
                onClick={() => setTab("janjez")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  tab === "janjez"
                    ? "bg-kenya-green/20 text-kenya-green border border-kenya-green/30"
                    : "bg-kenya-white/10 text-kenya-white hover:bg-kenya-white/20 border border-kenya-white/10"
                }`}
              >
                Janjez Services
              </button>
              <button
                onClick={() => setTab("provider")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  tab === "provider"
                    ? "bg-kenya-green/20 text-kenya-green border border-kenya-green/30"
                    : "bg-kenya-white/10 text-kenya-white hover:bg-kenya-white/20 border border-kenya-white/10"
                }`}
              >
                Provider Catalog
              </button>
            </div>

            {tab === "janjez" && <JanjezServicesTab session={session} />}
            {tab === "provider" && <ProviderServicesTab session={session} />}
          </div>
        </main>
      </div>
    </div>
  );
}

function JanjezServicesTab({ session }: { session: { access_token?: string } | null }) {
  const [services, setServices] = useState<JanjezService[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "", slug: "", category: "", subcategory: "", description: "",
    selling_price_ksh: "", provider_service_id: "", min_quantity: "", max_quantity: "",
    is_active: true, display_order: "0", supports_drip_feed: false, supports_refill: false, supports_cancel: false,
  });
  const [providerServices, setProviderServices] = useState<ProviderService[]>([]);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/services?limit=100&search=${encodeURIComponent(search)}`, {
      headers: authHeaders(session),
    });
    const data = await res.json();
    setServices(data.services || []);
    setLoading(false);
  }, [session, search]);

  const loadProviderServices = useCallback(async () => {
    const res = await fetch("/api/admin/provider-services?limit=200&is_active=true", {
      headers: authHeaders(session),
    });
    const data = await res.json();
    setProviderServices(data.services || []);
  }, [session]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- required for janjez service catalog load
    load();
  }, [load]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- required for provider catalog load
    loadProviderServices();
  }, [loadProviderServices]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/admin/services/${editingId}` : "/api/admin/services";
    const method = editingId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", ...authHeaders(session) },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setShowCreate(false);
      setEditingId(null);
      setForm({
        name: "", slug: "", category: "", subcategory: "", description: "",
        selling_price_ksh: "", provider_service_id: "", min_quantity: "", max_quantity: "",
        is_active: true, display_order: "0", supports_drip_feed: false, supports_refill: false, supports_cancel: false,
      });
      load();
    }
  };

  const handleEdit = (service: JanjezService) => {
    setEditingId(service.id);
    setForm({
      name: service.name, slug: service.slug, category: service.category, subcategory: service.subcategory || "",
      description: service.description || "", selling_price_ksh: String(service.selling_price_ksh),
      provider_service_id: service.provider_service_id, min_quantity: String(service.min_quantity),
      max_quantity: String(service.max_quantity), is_active: service.is_active, display_order: String(service.display_order),
      supports_drip_feed: service.supports_drip_feed, supports_refill: service.supports_refill, supports_cancel: service.supports_cancel,
    });
    setShowCreate(true);
  };

  const handleDeactivate = async (id: string) => {
    await fetch(`/api/admin/services/${id}`, {
      method: "DELETE",
      headers: authHeaders(session),
    });
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <input
          type="text"
          placeholder="Search services..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-kenya-black border border-kenya-white/20 rounded-xl px-4 py-2 text-kenya-white text-sm"
        />
        <button
          onClick={() => { setShowCreate(true); setEditingId(null); }}
          className="bg-kenya-green text-kenya-black px-4 py-2 rounded-xl text-sm font-medium hover:bg-kenya-green/90"
        >
          Create Service
        </button>
      </div>

      {showCreate && (
        <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-bold text-kenya-white mb-4">{editingId ? "Edit Service" : "Create Service"}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-kenya-white/70 mb-1">Name *</label>
              <input className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-3 py-2 text-kenya-white text-sm" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm text-kenya-white/70 mb-1">Slug *</label>
              <input className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-3 py-2 text-kenya-white text-sm" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm text-kenya-white/70 mb-1">Category *</label>
              <input className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-3 py-2 text-kenya-white text-sm" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm text-kenya-white/70 mb-1">Subcategory</label>
              <input className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-3 py-2 text-kenya-white text-sm" value={form.subcategory} onChange={(e) => setForm({ ...form, subcategory: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-kenya-white/70 mb-1">Description</label>
              <textarea className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-3 py-2 text-kenya-white text-sm" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>
            <div>
              <label className="block text-sm text-kenya-white/70 mb-1">Selling Price (KES) *</label>
              <input type="number" step="0.01" className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-3 py-2 text-kenya-white text-sm" value={form.selling_price_ksh} onChange={(e) => setForm({ ...form, selling_price_ksh: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm text-kenya-white/70 mb-1">Provider Service *</label>
              <select className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-3 py-2 text-kenya-white text-sm" value={form.provider_service_id} onChange={(e) => {
                const ps = providerServices.find(p => p.id === e.target.value);
                setForm({
                  ...form, provider_service_id: e.target.value,
                  min_quantity: ps ? String(ps.min_quantity) : form.min_quantity,
                  max_quantity: ps ? String(ps.max_quantity) : form.max_quantity,
                  supports_drip_feed: ps ? ps.supports_drip_feed ?? false : form.supports_drip_feed,
                  supports_refill: ps ? ps.supports_refill ?? false : form.supports_refill,
                  supports_cancel: ps ? ps.supports_cancel ?? false : form.supports_cancel,
                });
              }} required>
                <option value="">Select provider service</option>
                {providerServices.map(ps => (
                  <option key={ps.id} value={ps.id}>[{ps.id}] {ps.name} — {ps.category} — Rate: {ps.rate}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-kenya-white/70 mb-1">Min Quantity *</label>
              <input type="number" className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-3 py-2 text-kenya-white text-sm" value={form.min_quantity} onChange={(e) => setForm({ ...form, min_quantity: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm text-kenya-white/70 mb-1">Max Quantity *</label>
              <input type="number" className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-3 py-2 text-kenya-white text-sm" value={form.max_quantity} onChange={(e) => setForm({ ...form, max_quantity: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm text-kenya-white/70 mb-1">Display Order</label>
              <input type="number" className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-3 py-2 text-kenya-white text-sm" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: e.target.value })} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm text-kenya-white/70">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
                Active
              </label>
              <label className="flex items-center gap-2 text-sm text-kenya-white/70">
                <input type="checkbox" checked={form.supports_drip_feed} onChange={(e) => setForm({ ...form, supports_drip_feed: e.target.checked })} />
                Supports Drip Feed
              </label>
              <label className="flex items-center gap-2 text-sm text-kenya-white/70">
                <input type="checkbox" checked={form.supports_refill} onChange={(e) => setForm({ ...form, supports_refill: e.target.checked })} />
                Supports Refill
              </label>
              <label className="flex items-center gap-2 text-sm text-kenya-white/70">
                <input type="checkbox" checked={form.supports_cancel} onChange={(e) => setForm({ ...form, supports_cancel: e.target.checked })} />
                Supports Cancel
              </label>
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" className="bg-kenya-green text-kenya-black px-4 py-2 rounded-xl text-sm font-medium hover:bg-kenya-green/90">
                {editingId ? "Update" : "Create"}
              </button>
              <button type="button" onClick={() => { setShowCreate(false); setEditingId(null); }} className="bg-kenya-white/10 text-kenya-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-kenya-white/20">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p className="text-kenya-white/60 text-sm">Loading...</p>
      ) : (
        <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-kenya-white/10">
              <tr>
                <th className="px-4 py-3 text-left text-kenya-white/70">Name</th>
                <th className="px-4 py-3 text-left text-kenya-white/70">Category</th>
                <th className="px-4 py-3 text-left text-kenya-white/70">Price (KES)</th>
                <th className="px-4 py-3 text-left text-kenya-white/70">Provider</th>
                <th className="px-4 py-3 text-left text-kenya-white/70">Limits</th>
                <th className="px-4 py-3 text-left text-kenya-white/70">Active</th>
                <th className="px-4 py-3 text-left text-kenya-white/70">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-kenya-white/10">
              {services.map((s) => (
                <tr key={s.id} className="hover:bg-kenya-white/5">
                  <td className="px-4 py-3 text-kenya-white">{s.name}</td>
                  <td className="px-4 py-3 text-kenya-white/70">{s.category}</td>
                  <td className="px-4 py-3 text-kenya-white/70">{Number(s.selling_price_ksh).toFixed(2)}</td>
                  <td className="px-4 py-3 text-kenya-white/70 font-mono text-xs">{s.provider_service_id}</td>
                  <td className="px-4 py-3 text-kenya-white/70">{s.min_quantity} – {s.max_quantity}</td>
                  <td className="px-4 py-3 text-kenya-white/70">{s.is_active ? "Yes" : "No"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(s)} className="text-kenya-green text-xs hover:underline">Edit</button>
                      <button onClick={() => handleDeactivate(s.id)} className="text-red-400 text-xs hover:underline">Deactivate</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {services.length === 0 && <p className="text-kenya-white/50 text-sm p-4">No services found.</p>}
        </div>
      )}
    </div>
  );
}

function ProviderServicesTab({ session }: { session: { access_token?: string } | null }) {
  const [services, setServices] = useState<ProviderService[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "200", search, category: categoryFilter, is_active: statusFilter });
    const res = await fetch(`/api/admin/provider-services?${params}`, {
      headers: authHeaders(session),
    });
    const data = await res.json();
    setServices(data.services || []);
    setLoading(false);
  }, [session, search, categoryFilter, statusFilter]);

  const sync = async () => {
    setSyncing(true);
    await fetch("/api/admin/provider-services", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders(session) },
      body: JSON.stringify({ action: "sync" }),
    });
    setSyncing(false);
    load();
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect -- required for provider catalog load
  useEffect(() => { load(); }, [load]);

  const categories = Array.from(new Set(services.map(s => s.category).filter(Boolean)));

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search provider services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-kenya-black border border-kenya-white/20 rounded-xl px-4 py-2 text-kenya-white text-sm"
          />
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="bg-kenya-black border border-kenya-white/20 rounded-xl px-3 py-2 text-kenya-white text-sm">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-kenya-black border border-kenya-white/20 rounded-xl px-3 py-2 text-kenya-white text-sm">
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
        <button
          onClick={sync}
          disabled={syncing}
          className="bg-kenya-green text-kenya-black px-4 py-2 rounded-xl text-sm font-medium hover:bg-kenya-green/90 disabled:opacity-50"
        >
          {syncing ? "Syncing..." : "Sync Provider Services"}
        </button>
      </div>

      {loading ? (
        <p className="text-kenya-white/60 text-sm">Loading...</p>
      ) : (
        <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-kenya-white/10">
              <tr>
                <th className="px-4 py-3 text-left text-kenya-white/70">Provider ID</th>
                <th className="px-4 py-3 text-left text-kenya-white/70">Name</th>
                <th className="px-4 py-3 text-left text-kenya-white/70">Category</th>
                <th className="px-4 py-3 text-left text-kenya-white/70">Rate</th>
                <th className="px-4 py-3 text-left text-kenya-white/70">Min / Max</th>
                <th className="px-4 py-3 text-left text-kenya-white/70">Refill</th>
                <th className="px-4 py-3 text-left text-kenya-white/70">Drip Feed</th>
                <th className="px-4 py-3 text-left text-kenya-white/70">Status</th>
                <th className="px-4 py-3 text-left text-kenya-white/70">Last Synced</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-kenya-white/10">
              {services.map((s) => (
                <tr key={s.id} className="hover:bg-kenya-white/5">
                  <td className="px-4 py-3 text-kenya-white font-mono text-xs">{s.id}</td>
                  <td className="px-4 py-3 text-kenya-white">{s.name}</td>
                  <td className="px-4 py-3 text-kenya-white/70">{s.category}</td>
                  <td className="px-4 py-3 text-kenya-white/70">{Number(s.rate).toFixed(4)}</td>
                  <td className="px-4 py-3 text-kenya-white/70">{s.min_quantity} – {s.max_quantity}</td>
                  <td className="px-4 py-3 text-kenya-white/70">{s.supports_refill ? "Yes" : "No"}</td>
                  <td className="px-4 py-3 text-kenya-white/70">{s.supports_drip_feed ? "Yes" : "No"}</td>
                  <td className="px-4 py-3 text-kenya-white/70">{s.is_active ? "Active" : "Inactive"}</td>
                  <td className="px-4 py-3 text-kenya-white/70">{s.last_synced_at ? new Date(s.last_synced_at).toLocaleString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {services.length === 0 && <p className="text-kenya-white/50 text-sm p-4">No provider services found.</p>}
        </div>
      )}
    </div>
  );
}
