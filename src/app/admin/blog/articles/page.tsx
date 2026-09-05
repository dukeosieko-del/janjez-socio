"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import Link from "next/link";

interface AdminPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  status: string;
  created_at: string;
  published_at: string | null;
  author: { id: string; full_name: string | null; email: string | null } | null;
  category: { id: string; name: string; slug: string } | null;
}

export default function AdminBlogPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    if (!loading && (!user || profile?.role !== "admin")) {
      router.replace("/dashboard");
    }
  }, [user, profile, loading, router]);

  useEffect(() => {
    if (!user || profile?.role !== "admin") return;

    const fetchPosts = async () => {
      setLoadingPosts(true);
      try {
        const url = filter === "all" ? "/api/admin/blog/posts" : `/api/admin/blog/posts?status=${filter}`;
        const res = await fetch(url);
        const data = await res.json();
        if (res.ok) {
          setPosts(data.posts || []);
        }
      } catch {
        // ignore
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchPosts();
  }, [user, profile, filter]);

  const handleApprove = async (id: string) => {
    const post = posts.find((p) => p.id === id);
    await fetch(`/api/admin/blog/posts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "published" }),
    });
    if (post) {
      await fetch("/api/admin/blog/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: id, postTitle: post.title, postSlug: post.slug, authorId: post.author?.id, status: "published" }),
      });
    }
    router.refresh();
  };

  const handleReject = async (id: string) => {
    const reason = prompt("Rejection reason (optional):");
    const post = posts.find((p) => p.id === id);
    await fetch(`/api/admin/blog/posts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "rejected", rejection_reason: reason || null }),
    });
    if (post) {
      await fetch("/api/admin/blog/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: id, postTitle: post.title, postSlug: post.slug, authorId: post.author?.id, status: "rejected", rejectionReason: reason || null }),
      });
    }
    router.refresh();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "bg-kenya-white/10 text-kenya-white/60";
      case "pending": return "bg-yellow-500/20 text-yellow-400";
      case "published": return "bg-kenya-green/20 text-kenya-green";
      case "rejected": return "bg-kenya-red/20 text-kenya-red";
      case "archived": return "bg-kenya-white/5 text-kenya-white/40";
      default: return "bg-kenya-white/10 text-kenya-white/60";
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
              <span className="text-kenya-green font-medium">Blog</span>
            </nav>

            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-kenya-white mb-2">Blog Management</h1>
              <p className="text-kenya-white/60">Moderate articles, manage content, and oversee community publications.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold text-kenya-white">{posts.filter(p => p.status === "pending").length}</div>
                <div className="text-sm text-kenya-white/60 mt-1">Pending</div>
              </div>
              <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold text-kenya-green">{posts.filter(p => p.status === "published").length}</div>
                <div className="text-sm text-kenya-white/60 mt-1">Published</div>
              </div>
              <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold text-yellow-400">{posts.filter(p => p.status === "draft").length}</div>
                <div className="text-sm text-kenya-white/60 mt-1">Drafts</div>
              </div>
              <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold text-kenya-red">{posts.filter(p => p.status === "rejected").length}</div>
                <div className="text-sm text-kenya-white/60 mt-1">Rejected</div>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-6">
              {["all", "pending", "published", "draft", "rejected", "archived"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                    filter === status
                      ? "bg-kenya-green text-kenya-black"
                      : "bg-kenya-white/5 text-kenya-white/60 hover:text-kenya-white hover:bg-kenya-white/10"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {loadingPosts ? (
              <div className="text-center py-16">
                <div className="w-8 h-8 border-2 border-kenya-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-kenya-white/60">Loading…</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-16 border border-kenya-white/10 rounded-2xl">
                <p className="text-kenya-white/60">No articles found.</p>
              </div>
            ) : (
              <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-kenya-white/10">
                      <th className="text-left p-4 text-sm font-medium text-kenya-white/50">Title</th>
                      <th className="text-left p-4 text-sm font-medium text-kenya-white/50">Author</th>
                      <th className="text-left p-4 text-sm font-medium text-kenya-white/50">Status</th>
                      <th className="text-left p-4 text-sm font-medium text-kenya-white/50">Date</th>
                      <th className="text-right p-4 text-sm font-medium text-kenya-white/50">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map((post) => (
                      <tr key={post.id} className="border-b border-kenya-white/5 hover:bg-kenya-white/3">
                        <td className="p-4">
                          <div>
                            <div className="font-medium text-kenya-white">{post.title}</div>
                            {post.excerpt && <div className="text-sm text-kenya-white/50 line-clamp-1">{post.excerpt}</div>}
                          </div>
                        </td>
                        <td className="p-4 text-sm text-kenya-white/70">
                          {post.author?.full_name || post.author?.email || "Unknown"}
                        </td>
                        <td className="p-4">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${getStatusColor(post.status)}`}>
                            {post.status}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-kenya-white/50">
                          {new Date(post.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {post.status === "pending" && (
                              <>
                                <button onClick={() => handleApprove(post.id)} className="px-3 py-1 bg-kenya-green text-kenya-black text-sm rounded-lg hover:bg-kenya-green/90 transition-colors">
                                  Approve
                                </button>
                                <button onClick={() => handleReject(post.id)} className="px-3 py-1 bg-kenya-red text-white text-sm rounded-lg hover:bg-kenya-red/90 transition-colors">
                                  Reject
                                </button>
                              </>
                            )}
                            <Link href={`/blog/${post.slug}`} className="px-3 py-1 bg-kenya-white/10 text-kenya-white text-sm rounded-lg hover:bg-kenya-white/20 transition-colors">
                              View
                            </Link>
                          </div>
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
