"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/components/AuthContext";
import { TAXONOMY_PLATFORMS, getTaxonomyPlatform, normalizeProviderCategory, inferSubcategoryFromProviderName } from "@/lib/taxonomy";
import { getCategoryIcon } from "@/lib/category-icons";

interface ProviderService {
  id: string;
  name: string;
  category: string;
  type?: string;
  rate: string;
  min: string;
  max: string;
  refill: boolean;
  cancel: boolean;
}

interface JanjezService {
  id: string;
  platform_id: string;
  platform_name: string;
  subcategory: string;
  deliverable_name: string;
  provider_service_id: string | null;
  selling_price_ksh: number;
  provider_rate: number;
  min_quantity: number;
  max_quantity: number;
  display_order: number;
  published: boolean;
  supports_drip_feed: boolean;
  supports_refill: boolean;
  supports_cancel: boolean;
  note: string | null;
  flag: string | null;
  raw: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

type ModalMode = "create" | "edit" | null;

const EMPTY_FORM = {
  platform_id: "",
  platform_name: "",
  subcategory: "",
  deliverable_name: "",
  provider_service_id: "",
  selling_price_ksh: "",
  provider_rate: "",
  min_quantity: "10",
  max_quantity: "10000",
  display_order: "0",
  published: false,
  supports_drip_feed: false,
  supports_refill: false,
  supports_cancel: false,
  note: "",
  flag: "",
};

export default function ServiceManager() {
  const { session } = useAuth();
  const [janjezServices, setJanjezServices] = useState<JanjezService[]>([]);
  const [providerServices, setProviderServices] = useState<ProviderService[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [publishedFilter, setPublishedFilter] = useState<string>("all");
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingService, setEditingService] = useState<JanjezService | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [janjezRes, providerRes] = await Promise.all([
      fetch("/api/admin/services?include_provider=true", {
        headers: authHeaders(session),
        cache: "no-store",
      }),
      fetch("/api/smm/catalog", {
        headers: authHeaders(session),
        cache: "no-store",
      }),
    ]);

    if (!janjezRes.ok) {
      setError("Failed to load Janjez services");
      setLoading(false);
      return;
    }

    const janjezData = await janjezRes.json();
    setJanjezServices(janjezData.services || []);

    if (providerRes.ok) {
      const providerData = await providerRes.json();
      setProviderServices(providerData.services || []);
    }

    setLoading(false);
  }, [session]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- required for data fetch on mount / session change
    load();
  }, [load]);

  const filtered = janjezServices.filter((s) => {
    const term = search.toLowerCase().trim();
    const matchesSearch =
      !term ||
      s.deliverable_name.toLowerCase().includes(term) ||
      s.subcategory.toLowerCase().includes(term) ||
      s.platform_name.toLowerCase().includes(term) ||
      (s.provider_service_id && s.provider_service_id.includes(term));
    const matchesPlatform = platformFilter === "all" || s.platform_id === platformFilter;
    const matchesPublished =
      publishedFilter === "all" ||
      (publishedFilter === "published" && s.published) ||
      (publishedFilter === "unpublished" && !s.published);
    return matchesSearch && matchesPlatform && matchesPublished;
  });

  const openCreate = () => {
    setEditingService(null);
    setForm(EMPTY_FORM);
    setModalMode("create");
  };

  const openEdit = (service: JanjezService) => {
    setEditingService(service);
    setForm({
      platform_id: service.platform_id,
      platform_name: service.platform_name,
      subcategory: service.subcategory,
      deliverable_name: service.deliverable_name,
      provider_service_id: service.provider_service_id || "",
      selling_price_ksh: String(service.selling_price_ksh),
      provider_rate: String(service.provider_rate),
      min_quantity: String(service.min_quantity),
      max_quantity: String(service.max_quantity),
      display_order: String(service.display_order),
      published: service.published,
      supports_drip_feed: service.supports_drip_feed,
      supports_refill: service.supports_refill,
      supports_cancel: service.supports_cancel,
      note: service.note || "",
      flag: service.flag || "",
    });
    setModalMode("edit");
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingService(null);
    setForm(EMPTY_FORM);
    setError(null);
  };

  const handlePlatformChange = (platformId: string) => {
    const platform = getTaxonomyPlatform(platformId);
    setForm((prev) => ({
      ...prev,
      platform_id: platformId,
      platform_name: platform?.name || platformId,
      subcategory: "",
      deliverable_name: "",
    }));
  };

  const handleProviderChange = (providerId: string) => {
    const provider = providerServices.find((p) => p.id === providerId);
    if (!provider) return;

    const platformId = normalizeProviderCategory(provider.category);
    const platform = getTaxonomyPlatform(platformId);
    const subcategory = inferSubcategoryFromProviderName(platformId, provider.name);

    setForm((prev) => ({
      ...prev,
      provider_service_id: providerId,
      platform_id: platformId,
      platform_name: platform?.name || provider.category,
      subcategory,
      deliverable_name: provider.name,
      provider_rate: provider.rate,
      min_quantity: String(Math.max(10, parseInt(provider.min, 10) || 10)),
      max_quantity: String(Math.max(10, parseInt(provider.max, 10) || 10000)),
      supports_refill: provider.refill,
      supports_cancel: provider.cancel,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    if (!form.platform_id || !form.subcategory || !form.deliverable_name) {
      setError("Platform, subcategory, and deliverable name are required.");
      setSaving(false);
      return;
    }

    const payload = {
      platform_id: form.platform_id,
      platform_name: form.platform_name || form.platform_id,
      subcategory: form.subcategory,
      deliverable_name: form.deliverable_name,
      provider_service_id: form.provider_service_id || null,
      selling_price_ksh: parseFloat(form.selling_price_ksh) || 0,
      provider_rate: parseFloat(form.provider_rate) || 0,
      min_quantity: parseInt(form.min_quantity, 10) || 10,
      max_quantity: parseInt(form.max_quantity, 10) || 10000,
      display_order: parseInt(form.display_order, 10) || 0,
      published: form.published,
      supports_drip_feed: form.supports_drip_feed,
      supports_refill: form.supports_refill,
      supports_cancel: form.supports_cancel,
      note: form.note || null,
      flag: form.flag || null,
    };

    const url = modalMode === "edit" && editingService
      ? `/api/admin/services?id=${editingService.id}`
      : "/api/admin/services";
    const method = modalMode === "edit" ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(session),
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to save service.");
      setSaving(false);
      return;
    }

    await load();
    closeModal();
    setSaving(false);
  };

  const handleTogglePublish = async (service: JanjezService) => {
    setSaving(true);
    const res = await fetch(`/api/admin/services?id=${service.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(session),
      },
      body: JSON.stringify({ published: !service.published }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to update service.");
      setSaving(false);
      return;
    }

    await load();
    setSaving(false);
  };

  const handleDelete = async (service: JanjezService) => {
    if (!confirm(`Unpublish "${service.deliverable_name}"? This will hide it from the customer catalogue.`)) return;
    setSaving(true);
    const res = await fetch(`/api/admin/services?id=${service.id}`, {
      method: "DELETE",
      headers: authHeaders(session),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to delete service.");
      setSaving(false);
      return;
    }

    await load();
    setSaving(false);
  };

  const platformOptions = [
    { value: "all", label: "All Networks" },
    ...TAXONOMY_PLATFORMS.map((p) => ({ value: p.id, label: p.name })),
  ];

  const getProviderById = (id: string) => providerServices.find((p) => p.id === id);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-kenya-white">Service Catalogue</h2>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-kenya-green text-kenya-black font-bold text-sm rounded-xl hover:bg-kenya-green/90 transition-colors"
        >
          + New Service
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search services..."
          className="flex-1 bg-kenya-black border border-kenya-white/20 rounded-xl px-4 py-2 text-kenya-white placeholder-kenya-white/30 focus:outline-none focus:border-kenya-green focus:ring-1 focus:ring-kenya-green"
        />
        <select
          value={platformFilter}
          onChange={(e) => setPlatformFilter(e.target.value)}
          className="bg-kenya-black border border-kenya-white/20 rounded-xl px-4 py-2 text-kenya-white focus:outline-none focus:border-kenya-green"
        >
          {platformOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <select
          value={publishedFilter}
          onChange={(e) => setPublishedFilter(e.target.value)}
          className="bg-kenya-black border border-kenya-white/20 rounded-xl px-4 py-2 text-kenya-white focus:outline-none focus:border-kenya-green"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="unpublished">Unpublished</option>
        </select>
      </div>

      {error && (
        <div className="bg-kenya-red/10 border border-kenya-red/30 rounded-xl p-4 mb-4">
          <p className="text-kenya-red text-sm">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="text-kenya-white/60 text-sm">Loading services...</div>
      ) : filtered.length === 0 ? (
        <div className="text-kenya-white/50 text-sm">No services found.</div>
      ) : (
        <div className="overflow-x-auto border border-kenya-white/10 rounded-2xl">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-kenya-white/5 text-kenya-white/70">
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Network</th>
                <th className="text-left px-4 py-3">Subcategory</th>
                <th className="text-left px-4 py-3">Deliverable</th>
                <th className="text-left px-4 py-3">Provider ID</th>
                <th className="text-left px-4 py-3">Price (KES)</th>
                <th className="text-left px-4 py-3">Min / Max</th>
                <th className="text-left px-4 py-3">Capabilities</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((service) => {
                const provider = service.provider_service_id ? getProviderById(service.provider_service_id) : null;
                return (
                  <tr key={service.id} className="border-t border-kenya-white/5 text-kenya-white/80">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleTogglePublish(service)}
                        disabled={saving}
                        className={`px-2 py-1 rounded-lg text-xs font-bold transition-colors ${
                          service.published
                            ? "bg-kenya-green/20 text-kenya-green border border-kenya-green/30"
                            : "bg-kenya-white/10 text-kenya-white/60 border border-kenya-white/10"
                        }`}
                      >
                        {service.published ? "Published" : "Unpublished"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={getCategoryIcon(service.platform_id)}
                          alt={service.platform_name}
                          className="w-5 h-5 object-contain"
                        />
                        <span className="font-medium">{service.platform_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{service.subcategory}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{service.deliverable_name}</p>
                        {service.note && <p className="text-kenya-white/40 text-xs">{service.note}</p>}
                        {service.flag && <p className="text-kenya-red text-xs">{service.flag}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {provider ? (
                        <div>
                          <p className="font-mono text-xs">{service.provider_service_id}</p>
                          <p className="text-kenya-white/40 text-xs truncate max-w-[120px]">{provider.name}</p>
                        </div>
                      ) : (
                        <span className="text-kenya-white/40">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {service.selling_price_ksh > 0 ? `KES ${service.selling_price_ksh.toFixed(2)}` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {service.min_quantity.toLocaleString()} / {service.max_quantity.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {service.supports_refill && <span className="px-1.5 py-0.5 bg-kenya-white/5 rounded text-xs">Refill</span>}
                        {service.supports_cancel && <span className="px-1.5 py-0.5 bg-kenya-white/5 rounded text-xs">Cancel</span>}
                        {service.supports_drip_feed && <span className="px-1.5 py-0.5 bg-kenya-white/5 rounded text-xs">Drip</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(service)}
                          className="px-2 py-1 bg-kenya-white/10 text-kenya-white text-xs rounded-lg hover:bg-kenya-white/20 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(service)}
                          disabled={saving}
                          className="px-2 py-1 bg-kenya-red/10 text-kenya-red text-xs rounded-lg hover:bg-kenya-red/20 transition-colors disabled:opacity-50"
                        >
                          Unpublish
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {modalMode && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-kenya-black border border-kenya-white/10 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-kenya-white">
                  {modalMode === "create" ? "New Service" : "Edit Service"}
                </h3>
                <button onClick={closeModal} className="text-kenya-white/60 hover:text-kenya-white text-2xl leading-none">&times;</button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-kenya-white/70 mb-2">Provider Service</label>
                  <select
                    value={form.provider_service_id}
                    onChange={(e) => handleProviderChange(e.target.value)}
                    className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-4 py-2.5 text-kenya-white focus:outline-none focus:border-kenya-green focus:ring-1 focus:ring-kenya-green"
                  >
                    <option value="">— Select a provider service —</option>
                    {providerServices.map((p) => (
                      <option key={p.id} value={p.id}>
                        [{p.id}] {p.name} ({p.category})
                      </option>
                    ))}
                  </select>
                  <p className="text-kenya-white/40 text-xs mt-1">Selecting a provider service auto-fills taxonomy, pricing, and limits.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-kenya-white/70 mb-2">Platform / Network</label>
                    <select
                      value={form.platform_id}
                      onChange={(e) => handlePlatformChange(e.target.value)}
                      className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-4 py-2.5 text-kenya-white focus:outline-none focus:border-kenya-green focus:ring-1 focus:ring-kenya-green"
                    >
                      <option value="">— Select platform —</option>
                      {TAXONOMY_PLATFORMS.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-kenya-white/70 mb-2">Subcategory</label>
                    <input
                      type="text"
                      value={form.subcategory}
                      onChange={(e) => setForm((prev) => ({ ...prev, subcategory: e.target.value }))}
                      placeholder="e.g. Followers"
                      className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-4 py-2.5 text-kenya-white placeholder-kenya-white/30 focus:outline-none focus:border-kenya-green focus:ring-1 focus:ring-kenya-green"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-kenya-white/70 mb-2">Deliverable / Display Name</label>
                  <input
                    type="text"
                    value={form.deliverable_name}
                    onChange={(e) => setForm((prev) => ({ ...prev, deliverable_name: e.target.value }))}
                    placeholder="e.g. Recommended"
                    className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-4 py-2.5 text-kenya-white placeholder-kenya-white/30 focus:outline-none focus:border-kenya-green focus:ring-1 focus:ring-kenya-green"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-kenya-white/70 mb-2">Selling Price (KES per unit)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.selling_price_ksh}
                      onChange={(e) => setForm((prev) => ({ ...prev, selling_price_ksh: e.target.value }))}
                      className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-4 py-2.5 text-kenya-white placeholder-kenya-white/30 focus:outline-none focus:border-kenya-green focus:ring-1 focus:ring-kenya-green"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-kenya-white/70 mb-2">Provider Rate (USD per 1k)</label>
                    <input
                      type="number"
                      step="0.0001"
                      min="0"
                      value={form.provider_rate}
                      onChange={(e) => setForm((prev) => ({ ...prev, provider_rate: e.target.value }))}
                      className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-4 py-2.5 text-kenya-white placeholder-kenya-white/30 focus:outline-none focus:border-kenya-green focus:ring-1 focus:ring-kenya-green"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-kenya-white/70 mb-2">Min Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={form.min_quantity}
                      onChange={(e) => setForm((prev) => ({ ...prev, min_quantity: e.target.value }))}
                      className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-4 py-2.5 text-kenya-white placeholder-kenya-white/30 focus:outline-none focus:border-kenya-green focus:ring-1 focus:ring-kenya-green"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-kenya-white/70 mb-2">Max Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={form.max_quantity}
                      onChange={(e) => setForm((prev) => ({ ...prev, max_quantity: e.target.value }))}
                      className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-4 py-2.5 text-kenya-white placeholder-kenya-white/30 focus:outline-none focus:border-kenya-green focus:ring-1 focus:ring-kenya-green"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-kenya-white/70 mb-2">Display Order</label>
                  <input
                    type="number"
                    value={form.display_order}
                    onChange={(e) => setForm((prev) => ({ ...prev, display_order: e.target.value }))}
                    className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-4 py-2.5 text-kenya-white placeholder-kenya-white/30 focus:outline-none focus:border-kenya-green focus:ring-1 focus:ring-kenya-green"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-kenya-white/70 mb-2">Note</label>
                  <textarea
                    value={form.note}
                    onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
                    rows={2}
                    className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-4 py-2.5 text-kenya-white placeholder-kenya-white/30 focus:outline-none focus:border-kenya-green focus:ring-1 focus:ring-kenya-green"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-kenya-white/70 mb-2">Flag</label>
                  <input
                    type="text"
                    value={form.flag}
                    onChange={(e) => setForm((prev) => ({ ...prev, flag: e.target.value }))}
                    placeholder="e.g. No refill, No warranty"
                    className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-4 py-2.5 text-kenya-white placeholder-kenya-white/30 focus:outline-none focus:border-kenya-green focus:ring-1 focus:ring-kenya-green"
                  />
                </div>

                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 text-sm text-kenya-white/70 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.published}
                      onChange={(e) => setForm((prev) => ({ ...prev, published: e.target.checked }))}
                      className="w-4 h-4 rounded border-kenya-white/20 bg-kenya-black text-kenya-green focus:ring-kenya-green"
                    />
                    Published
                  </label>
                  <label className="flex items-center gap-2 text-sm text-kenya-white/70 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.supports_drip_feed}
                      onChange={(e) => setForm((prev) => ({ ...prev, supports_drip_feed: e.target.checked }))}
                      className="w-4 h-4 rounded border-kenya-white/20 bg-kenya-black text-kenya-green focus:ring-kenya-green"
                    />
                    Drip Feed
                  </label>
                  <label className="flex items-center gap-2 text-sm text-kenya-white/70 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.supports_refill}
                      onChange={(e) => setForm((prev) => ({ ...prev, supports_refill: e.target.checked }))}
                      className="w-4 h-4 rounded border-kenya-white/20 bg-kenya-black text-kenya-green focus:ring-kenya-green"
                    />
                    Refill
                  </label>
                  <label className="flex items-center gap-2 text-sm text-kenya-white/70 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.supports_cancel}
                      onChange={(e) => setForm((prev) => ({ ...prev, supports_cancel: e.target.checked }))}
                      className="w-4 h-4 rounded border-kenya-white/20 bg-kenya-black text-kenya-green focus:ring-kenya-green"
                    />
                    Cancel
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button onClick={closeModal} className="px-4 py-2 rounded-xl bg-kenya-white/10 text-kenya-white text-sm hover:bg-kenya-white/20 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-kenya-green text-kenya-black font-bold text-sm hover:bg-kenya-green/90 transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving..." : modalMode === "create" ? "Create Service" : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function authHeaders(session: { access_token?: string } | null): Record<string, string> {
  return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};
}
