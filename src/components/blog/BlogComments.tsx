"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/AuthContext";
import CommentCard from "./CommentCard";
import type { BlogComment } from "@/lib/blog/types";

interface BlogCommentsProps {
  postSlug: string;
}

export default function BlogComments({ postSlug }: BlogCommentsProps) {
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/blog/posts/${postSlug}/comments`);
      const data = await res.json();
      if (data.ok) {
        setComments(data.comments || []);
      }
    } catch (err) {
      console.error("Failed to load comments:", err);
    } finally {
      setLoading(false);
    }
  }, [postSlug]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- required for fetch on slug change
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setPosting(true);
    setError(null);
    try {
      const res = await fetch(`/api/blog/posts/${postSlug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to post comment");
        return;
      }
      setNewComment("");
      await fetchComments();
    } catch {
      setError("Failed to post comment");
    } finally {
      setPosting(false);
    }
  };

  const handleReply = async (parentId: string) => {
    if (!user) {
      setError("Please sign in to reply.");
      return;
    }

    const content = prompt("Enter your reply:");
    if (!content || !content.trim()) return;

    setPosting(true);
    setError(null);
    try {
      const res = await fetch(`/api/blog/comments/${parentId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error || "Failed to post reply");
      }
      await fetchComments();
    } catch {
      setError("Failed to post reply");
    } finally {
      setPosting(false);
    }
  };

  const handleReport = async (commentId: string) => {
    if (!user) {
      setError("Please sign in to report comments.");
      return;
    }

    try {
      const res = await fetch(`/api/blog/comments/${commentId}/report`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.ok) {
        alert("Comment reported for moderation.");
      } else {
        alert(data.error || "Failed to report comment.");
      }
    } catch {
      alert("Failed to report comment.");
    }
  };

  const totalComments = comments.reduce(
    (acc, c) => acc + 1 + (c.replies?.length || 0),
    0
  );

  return (
    <div className="border-t border-kenya-white/10 pt-8 mt-12">
      <h2 className="text-2xl font-bold text-kenya-white mb-6">
        Discussion ({totalComments})
      </h2>

      {error && (
        <p className="text-sm text-kenya-red mb-4">{error}</p>
      )}

      <div className="mb-6">
        {user ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="w-full bg-kenya-white/5 border border-kenya-white/20 rounded-xl px-4 py-3 text-kenya-white placeholder-kenya-white/40 focus:outline-none focus:border-kenya-green focus:ring-1 focus:ring-kenya-green transition-all min-h-[80px] resize-y"
              maxLength={5000}
            />
            <button
              type="submit"
              disabled={posting || !newComment.trim()}
              className="px-4 py-2 bg-kenya-green text-kenya-black font-bold rounded-lg hover:bg-kenya-green/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {posting ? "Posting..." : "Post Comment"}
            </button>
          </form>
        ) : (
          <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-xl p-4 text-center">
            <p className="text-kenya-white/60 text-sm mb-3">
              Sign in to join the discussion.
            </p>
            <a
              href="/auth/sign-in?next=/blog"
              className="inline-block px-4 py-2 bg-kenya-green text-kenya-black font-bold rounded-lg hover:bg-kenya-green/90 transition-colors text-sm"
            >
              Sign In to Comment
            </a>
          </div>
        )}
        <p className="text-xs text-kenya-white/40 mt-2">
          Comments are moderated before appearing publicly.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-kenya-white/3 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-kenya-white/40 py-8 text-center">
          No comments yet. Be the first to share your thoughts!
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              currentUserId={user?.id || null}
              onReply={handleReply}
              onReport={handleReport}
            />
          ))}
        </div>
      )}
    </div>
  );
}
