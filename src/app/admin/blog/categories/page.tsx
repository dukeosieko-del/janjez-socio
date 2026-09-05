"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color_hex: string;
  display_order: number;
  is_active: boolean;
}

export default function AdminBlogCategoriesPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#00A859");

  useEffect(() => {
    if (!loading && (!user || profile?.role !== "admin")) {
      router.replace("/dashboard");
    }
  }, [user, profile, loading, router]);

  useEffect(() => {
    if (!user || profile?.role !== "admin") return;
    fetchCategories();
  }, [user, profile]);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const res = await fetch("/api/admin/blog/categories");
      const data = await res.json();
      if (res.ok) setCategories(data.categories || []);
    } catch {
      // ignore
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    const method = editing ? "PATCH" : "POST";
    const body = editing ? { id: editing.id, name, description, color_hex: color } : { name, description, color_hex: color };

    await fetch("/api/admin/blog/categories", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setName("");
    setDescription("");
    setColor("#00A859");
    setEditing(null);
    fetchCategories();
  };

  if (loading || !user || profile?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-kenya-black text-kenya-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-kenya-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-kenya-white/60">Loading admin…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-kenya-black">
      <div className="flex-1 flex flex-col">
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <nav className="flex items-center gap-2 text-sm text-kenya-white/50 mb-6">
              <Link href="/admin" className="hover:text-kenya-green transition-colors">Admin</Link>
              <span>/</span>
              <Link href="/admin/blog" className="hover:text-kenya-green transition-colors">Blog</Link>
              <span>/</span>
              <span className="text-kenya-green font-medium">Categories</span>
            </nav>

            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-kenya-white mb-2">Categories</h1>
              <p className="text-kenya-white/60">Manage blog categories.</p>
            </div>

            <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6 mb-8">
              <h2 className="text-lg font-bold text-kenya-white mb-4">{editing ? "Edit Category" : "Add Category"}</h2>
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Category name"
                  className="flex-1 bg-kenya-white/5 border border-kenya-white/20 rounded-xl px-4 py-2 text-kenya-white placeholder-kenya-white/30 focus:outline-none focus:border-kenya-green"
                />
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description"
                  className="flex-1 bg-kenya-white/5 border border-kenya-white/20 rounded-xl px-4 py-2 text-kenya-white placeholder-kenya-white/30 focus:outline-none focus:border-kenya-green"
                />
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-12 h-10 rounded-lg cursor-pointer"
                />
                <button onClick={handleSave} className="px-6 py-2 bg-kenya-green text-kenya-black font-bold rounded-xl hover:bg-kenya-green/90 transition-colors">
                  {editing ? "Update" : "Add"}
                </button>
                {editing && (
                  <button onClick={() => { setEditing(null); setName(""); setDescription(""); setColor("#00A859"); }} className="px-6 py-2 bg-kenya-white/10 text-kenya-white rounded-xl hover:bg-kenya-white/20 transition-colors">
                    Cancel
                  </button>
                )}
              </div>
            </div>

            {loadingCategories ? (
              <div className="text-center py-16">
                <div className="w-8 h-8 border-2 border-kenya-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-kenya-white/60">Loading categories…</p>
              </div>
            ) : (
              <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-kenya-white/10">
                      <th className="text-left p-4 text-sm font-medium text-kenya-white/50">Name</th>
                      <th className="text-left p-4 text-sm font-medium text-kenya-white/50">Slug</th>
                      <th className="text-left p-4 text-sm font-medium text-kenya-white/50">Color</th>
                      <th className="text-left p-4 text-sm font-medium text-kenya-white/50">Active</th>
                      <th className="text-right p-4 text-sm font-medium text-kenya-white/50">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((cat) => (
                      <tr key={cat.id} className="border-b border-kenya-white/5 hover:bg-kenya-white/3">
                        <td className="p-4 text-sm text-kenya-white">{cat.name}</td>
                        <td className="p-4 text-sm text-kenya-white/70 font-mono">{cat.slug}</td>
                        <td className="p-4">
                          <div className="w-6 h-6 rounded-full" style={{ backgroundColor: cat.color_hex }}></div>
                        </td>
                        <td className="p-4 text-sm text-kenya-white/70">{cat.is_active ? "Yes" : "No"}</td>
                        <td className="p-4 text-right">
                          <button onClick={() => { setEditing(cat); setName(cat.name); setDescription(cat.description || ""); setColor(cat.color_hex); }} className="px-3 py-1 bg-kenya-white/10 text-kenya-white text-sm rounded-lg hover:bg-kenya-white/20 transition-colors">
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
