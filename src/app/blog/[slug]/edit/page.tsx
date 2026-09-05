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

interface BlogPostFormData {
  title: string;
  excerpt: string;
  content: string;
  category_id: string;
  cover_image_url: string;
  tags: string[];
}

import type { BlogPost } from "@/lib/blog/types";

export default function BlogEditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loadingPost, setLoadingPost] = useState(true);
  const [formData, setFormData] = useState<BlogPostFormData>({
    title: "",
    excerpt: "",
    content: "",
    category_id: "",
    cover_image_url: "",
    tags: [],
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/sign-in");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const loadPost = async () => {
      const { slug } = await params;
      try {
        const res = await fetch(`/api/blog/posts/${slug}`);
        const data = await res.json();
        if (res.ok && data.post) {
          setPost(data.post);
          setFormData({
            title: data.post.title || "",
            excerpt: data.post.excerpt || "",
            content: data.post.content || "",
            category_id: data.post.category_id || "",
            cover_image_url: data.post.cover_image_url || "",
            tags: data.post.tags?.map((t: { id: string }) => t.id) || [],
          });
        } else {
          router.push("/blog");
        }
      } catch {
        router.push("/blog");
      } finally {
        setLoadingPost(false);
      }
    };

    if (user) {
      loadPost();
    }
  }, [user, params, router]);

  const handleSaveDraft = async () => {
    if (!post) return;
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/blog/posts/${post.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, status: "draft" }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save draft");
        return;
      }

      router.refresh();
    } catch {
      setError("Failed to save draft");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!post) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/blog/posts/${post.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, status: "pending" }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit article");
        return;
      }

      router.push("/blog/drafts");
    } catch {
      setError("Failed to submit article");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || loadingPost) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-kenya-black text-kenya-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-kenya-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-kenya-white/60">Loading editor…</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-kenya-black">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <AnnouncementBanner />
        <LiveTicker />
        <Header />
        <main className="flex-1">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <nav className="flex items-center gap-2 text-sm text-kenya-white/50 mb-6">
              <Link href="/blog" className="hover:text-kenya-green transition-colors">Blog</Link>
              <span>/</span>
              <Link href="/blog/drafts" className="hover:text-kenya-green transition-colors">Drafts</Link>
              <span>/</span>
              <span className="text-kenya-green font-medium">Edit</span>
            </nav>

            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-kenya-white mb-2">Edit Article</h1>
              <p className="text-kenya-white/60">Update your article and resubmit for review.</p>
            </div>

            {error && (
              <div className="bg-kenya-red/10 border border-kenya-red/30 rounded-xl p-4 mb-6">
                <p className="text-kenya-red text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-kenya-white/70 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter article title..."
                  className="w-full bg-kenya-white/5 border border-kenya-white/20 rounded-xl px-4 py-3 text-kenya-white placeholder-kenya-white/30 focus:outline-none focus:border-kenya-green focus:ring-1 focus:ring-kenya-green transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-kenya-white/70 mb-2">Excerpt</label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Brief summary..."
                  rows={2}
                  className="w-full bg-kenya-white/5 border border-kenya-white/20 rounded-xl px-4 py-3 text-kenya-white placeholder-kenya-white/30 focus:outline-none focus:border-kenya-green focus:ring-1 focus:ring-kenya-green transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-kenya-white/70 mb-2">Content</label>
                <div className="bg-kenya-white/5 border border-kenya-white/20 rounded-xl overflow-hidden">
                  <div className="flex items-center gap-1 p-2 border-b border-kenya-white/10">
                    <button type="button" onClick={() => document.execCommand('bold')} className="p-1.5 text-kenya-white/60 hover:text-kenya-white hover:bg-kenya-white/10 rounded">
                      <strong>B</strong>
                    </button>
                    <button type="button" onClick={() => document.execCommand('italic')} className="p-1.5 text-kenya-white/60 hover:text-kenya-white hover:bg-kenya-white/10 rounded">
                      <em>I</em>
                    </button>
                    <button type="button" onClick={() => document.execCommand('underline')} className="p-1.5 text-kenya-white/60 hover:text-kenya-white hover:bg-kenya-white/10 rounded">
                      <u>U</u>
                    </button>
                    <div className="w-px h-4 bg-kenya-white/10 mx-1"></div>
                    <button type="button" onClick={() => document.execCommand('insertUnorderedList')} className="p-1.5 text-kenya-white/60 hover:text-kenya-white hover:bg-kenya-white/10 rounded">
                      • List
                    </button>
                    <button type="button" onClick={() => document.execCommand('insertOrderedList')} className="p-1.5 text-kenya-white/60 hover:text-kenya-white hover:bg-kenya-white/10 rounded">
                      1. List
                    </button>
                  </div>
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    onInput={(e) => setFormData({ ...formData, content: (e.target as HTMLDivElement).innerHTML })}
                    className="min-h-[300px] p-4 text-kenya-white focus:outline-none prose prose-invert prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: formData.content }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-kenya-white/70 mb-2">Cover Image URL</label>
                <input
                  type="text"
                  value={formData.cover_image_url}
                  onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="w-full bg-kenya-white/5 border border-kenya-white/20 rounded-xl px-4 py-3 text-kenya-white placeholder-kenya-white/30 focus:outline-none focus:border-kenya-green focus:ring-1 focus:ring-kenya-green transition-all"
                />
              </div>

              <div className="flex items-center gap-4 pt-4">
                <button
                  onClick={handleSaveDraft}
                  disabled={saving}
                  className="px-6 py-3 bg-kenya-white/10 text-kenya-white font-bold rounded-xl hover:bg-kenya-white/20 transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save Draft"}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-6 py-3 bg-kenya-green text-kenya-black font-bold rounded-xl hover:bg-kenya-green/90 transition-colors disabled:opacity-50"
                >
                  {submitting ? "Submitting…" : "Submit for Review"}
                </button>
                <Link href="/blog/drafts" className="px-6 py-3 text-kenya-white/60 hover:text-kenya-white transition-colors">
                  Cancel
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
