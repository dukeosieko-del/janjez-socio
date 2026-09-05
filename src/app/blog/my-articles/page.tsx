"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import LiveTicker from "@/components/LiveTicker";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import Link from "next/link";

interface BlogPostSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export default function BlogDraftsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPostSummary[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [filter, setFilter] = useState<string>("draft");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/sign-in");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    const fetchPosts = async () => {
      setLoadingPosts(true);
      try {
        const res = await fetch(`/api/blog/posts?status=${filter}`);
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
  }, [user, filter]);

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

  return (
    <div className="min-h-screen flex bg-kenya-black">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <AnnouncementBanner />
        <LiveTicker />
        <Header />
        <main className="flex-1">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <nav className="flex items-center gap-2 text-sm text-kenya-white/50 mb-6">
              <Link href="/blog" className="hover:text-kenya-green transition-colors">Blog</Link>
              <span>/</span>
              <span className="text-kenya-green font-medium">My Articles</span>
            </nav>

            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-kenya-white mb-2">My Articles</h1>
                <p className="text-kenya-white/60">Manage your drafts, submissions, and published articles.</p>
              </div>
              <Link href="/blog/write" className="px-4 py-2 bg-kenya-green text-kenya-black font-bold rounded-xl hover:bg-kenya-green/90 transition-colors">
                + New Article
              </Link>
            </div>

            <div className="flex items-center gap-2 mb-6">
              {["draft", "pending", "published", "rejected", "archived"].map((status) => (
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
                <p className="text-kenya-white/60">Loading articles…</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-16 border border-kenya-white/10 rounded-2xl">
                <p className="text-kenya-white/60 mb-4">No articles found in this category.</p>
                <Link href="/blog/write" className="text-kenya-green hover:text-kenya-green/80">
                  Write your first article
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post.id} className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6 hover:border-kenya-green/50 transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-kenya-white font-bold text-lg">{post.title}</h3>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${getStatusColor(post.status)}`}>
                        {post.status}
                      </span>
                    </div>
                    {post.excerpt && (
                      <p className="text-kenya-white/70 text-sm mb-3 line-clamp-2">{post.excerpt}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-kenya-white/50">
                      <span>Created: {new Date(post.created_at).toLocaleDateString()}</span>
                      {post.published_at && (
                        <span>Published: {new Date(post.published_at).toLocaleDateString()}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <Link href={`/blog/${post.slug}/edit`} className="px-4 py-2 bg-kenya-white/10 text-kenya-white text-sm rounded-lg hover:bg-kenya-white/20 transition-colors">
                        Edit
                      </Link>
                      <Link href={`/blog/${post.slug}`} className="px-4 py-2 text-kenya-white/60 text-sm hover:text-kenya-white transition-colors">
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
