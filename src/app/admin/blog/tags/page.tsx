"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import Link from "next/link";

interface Tag {
  id: string;
  name: string;
  slug: string;
}

export default function AdminBlogTagsPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loadingTags, setLoadingTags] = useState(true);
  const [name, setName] = useState("");

  useEffect(() => {
    if (!loading && (!user || profile?.role !== "admin")) {
      router.replace("/dashboard");
    }
  }, [user, profile, loading, router]);

  useEffect(() => {
    if (!user || profile?.role !== "admin") return;
    fetchTags();
  }, [user, profile]);

  const fetchTags = async () => {
    setLoadingTags(true);
    try {
      const res = await fetch("/api/admin/blog/tags");
      const data = await res.json();
      if (res.ok) setTags(data.tags || []);
    } catch {
      // ignore
    } finally {
      setLoadingTags(false);
    }
  };

  const handleAdd = async () => {
    if (!name.trim()) return;
    await fetch("/api/admin/blog/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setName("");
    fetchTags();
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
              <span className="text-kenya-green font-medium">Tags</span>
            </nav>

            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-kenya-white mb-2">Tags</h1>
              <p className="text-kenya-white/60">Manage blog tags.</p>
            </div>

            <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6 mb-8">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tag name"
                  className="flex-1 bg-kenya-white/5 border border-kenya-white/20 rounded-xl px-4 py-2 text-kenya-white placeholder-kenya-white/30 focus:outline-none focus:border-kenya-green"
                />
                <button onClick={handleAdd} className="px-6 py-2 bg-kenya-green text-kenya-black font-bold rounded-xl hover:bg-kenya-green/90 transition-colors">
                  Add Tag
                </button>
              </div>
            </div>

            {loadingTags ? (
              <div className="text-center py-16">
                <div className="w-8 h-8 border-2 border-kenya-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-kenya-white/60">Loading tags…</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span key={tag.id} className="px-4 py-2 bg-kenya-white/5 border border-kenya-white/10 rounded-xl text-kenya-white text-sm">
                    #{tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
