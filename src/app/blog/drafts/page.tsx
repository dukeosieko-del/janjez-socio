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
}

export default function BlogDraftsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPostSummary[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

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
        const res = await fetch("/api/blog/posts?status=draft");
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
  }, [user]);

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
              <span className="text-kenya-green font-medium">Drafts</span>
            </nav>

            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-kenya-white mb-2">Drafts</h1>
                <p className="text-kenya-white/60">Continue working on your unpublished articles.</p>
              </div>
              <Link href="/blog/write" className="px-4 py-2 bg-kenya-green text-kenya-black font-bold rounded-xl hover:bg-kenya-green/90 transition-colors">
                + New Article
              </Link>
            </div>

            {loadingPosts ? (
              <div className="text-center py-16">
                <div className="w-8 h-8 border-2 border-kenya-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-kenya-white/60">Loading drafts…</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-16 border border-kenya-white/10 rounded-2xl">
                <p className="text-kenya-white/60 mb-4">No drafts yet.</p>
                <Link href="/blog/write" className="text-kenya-green hover:text-kenya-green/80">
                  Start writing your first article
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post.id} className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6 hover:border-kenya-green/50 transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-kenya-white font-bold text-lg">{post.title}</h3>
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-yellow-500/20 text-yellow-400 capitalize">
                        {post.status}
                      </span>
                    </div>
                    {post.excerpt && (
                      <p className="text-kenya-white/70 text-sm mb-3 line-clamp-2">{post.excerpt}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-kenya-white/50">
                      <span>Last edited: {new Date(post.updated_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <Link href={`/blog/${post.slug}/edit`} className="px-4 py-2 bg-kenya-white/10 text-kenya-white text-sm rounded-lg hover:bg-kenya-white/20 transition-colors">
                        Continue Editing
                      </Link>
                      <Link href={`/blog/${post.slug}`} className="px-4 py-2 text-kenya-white/60 text-sm hover:text-kenya-white transition-colors">
                        Preview
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
