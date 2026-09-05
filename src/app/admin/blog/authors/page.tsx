"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import Link from "next/link";

interface Author {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string;
  post_count: number;
}

export default function AdminBlogAuthorsPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loadingAuthors, setLoadingAuthors] = useState(true);

  useEffect(() => {
    if (!loading && (!user || profile?.role !== "admin")) {
      router.replace("/dashboard");
    }
  }, [user, profile, loading, router]);

  useEffect(() => {
    if (!user || profile?.role !== "admin") return;
    fetchAuthors();
  }, [user, profile]);

  const fetchAuthors = async () => {
    setLoadingAuthors(true);
    try {
      const res = await fetch("/api/admin/blog/authors");
      const data = await res.json();
      if (res.ok) setAuthors(data.authors || []);
    } catch {
      // ignore
    } finally {
      setLoadingAuthors(false);
    }
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
              <span className="text-kenya-green font-medium">Authors</span>
            </nav>

            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-kenya-white mb-2">Authors</h1>
              <p className="text-kenya-white/60">Manage blog authors and contributors.</p>
            </div>

            {loadingAuthors ? (
              <div className="text-center py-16">
                <div className="w-8 h-8 border-2 border-kenya-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-kenya-white/60">Loading authors…</p>
              </div>
            ) : (
              <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-kenya-white/10">
                      <th className="text-left p-4 text-sm font-medium text-kenya-white/50">Name</th>
                      <th className="text-left p-4 text-sm font-medium text-kenya-white/50">Email</th>
                      <th className="text-left p-4 text-sm font-medium text-kenya-white/50">Role</th>
                      <th className="text-left p-4 text-sm font-medium text-kenya-white/50">Posts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {authors.map((author) => (
                      <tr key={author.id} className="border-b border-kenya-white/5 hover:bg-kenya-white/3">
                        <td className="p-4 text-sm text-kenya-white">{author.full_name || "Unknown"}</td>
                        <td className="p-4 text-sm text-kenya-white/70">{author.email || "—"}</td>
                        <td className="p-4 text-sm text-kenya-white/70 capitalize">{author.role}</td>
                        <td className="p-4 text-sm text-kenya-white/70">{author.post_count}</td>
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
