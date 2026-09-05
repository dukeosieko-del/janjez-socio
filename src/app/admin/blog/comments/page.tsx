"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import Link from "next/link";

interface Comment {
  id: string;
  post_id: string;
  content: string;
  status: string;
  is_reported: boolean;
  created_at: string;
  author: { full_name: string | null; email: string | null } | null;
  post: { title: string; slug: string } | null;
}

export default function AdminBlogCommentsPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);

  useEffect(() => {
    if (!loading && (!user || profile?.role !== "admin")) {
      router.replace("/dashboard");
    }
  }, [user, profile, loading, router]);

  useEffect(() => {
    if (!user || profile?.role !== "admin") return;
    fetchComments();
  }, [user, profile]);

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const res = await fetch("/api/admin/blog/comments");
      const data = await res.json();
      if (res.ok) setComments(data.comments || []);
    } catch {
      // ignore
    } finally {
      setLoadingComments(false);
    }
  };

  const moderateComment = async (id: string, status: "approved" | "rejected" | "removed") => {
    await fetch(`/api/admin/blog/comments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchComments();
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
              <span className="text-kenya-green font-medium">Blog Comments</span>
            </nav>

            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-kenya-white mb-2">Comment Moderation</h1>
              <p className="text-kenya-white/60">Review and moderate community comments.</p>
            </div>

            {loadingComments ? (
              <div className="text-center py-16">
                <div className="w-8 h-8 border-2 border-kenya-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-kenya-white/60">Loading comments…</p>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-16 border border-kenya-white/10 rounded-2xl">
                <p className="text-kenya-white/60">No comments to moderate.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="text-sm text-kenya-white/50">
                          {comment.author?.full_name || comment.author?.email || "Anonymous"}
                        </span>
                        <span className="text-xs text-kenya-white/40 ml-2">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                        {comment.is_reported && (
                          <span className="ml-2 text-xs bg-kenya-red/20 text-kenya-red px-2 py-0.5 rounded-full">Reported</span>
                        )}
                      </div>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                        comment.status === "approved" ? "bg-kenya-green/20 text-kenya-green" :
                        comment.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                        "bg-kenya-red/20 text-kenya-red"
                      }`}>
                        {comment.status}
                      </span>
                    </div>
                    <p className="text-kenya-white/80 text-sm mb-3">{comment.content}</p>
                    {comment.post && (
                      <Link href={`/blog/${comment.post.slug}`} className="text-xs text-kenya-green hover:text-kenya-green/80">
                        On: {comment.post.title}
                      </Link>
                    )}
                    {comment.status === "pending" && (
                      <div className="flex items-center gap-2 mt-4">
                        <button onClick={() => moderateComment(comment.id, "approved")} className="px-4 py-2 bg-kenya-green text-kenya-black text-sm rounded-lg hover:bg-kenya-green/90 transition-colors">
                          Approve
                        </button>
                        <button onClick={() => moderateComment(comment.id, "rejected")} className="px-4 py-2 bg-kenya-red text-white text-sm rounded-lg hover:bg-kenya-red/90 transition-colors">
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
