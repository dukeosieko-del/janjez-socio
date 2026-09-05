"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import Link from "next/link";

export default function AdminBlogRatingsPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [ratings, setRatings] = useState<any[]>([]);
  const [loadingRatings, setLoadingRatings] = useState(true);

  useEffect(() => {
    if (!loading && (!user || profile?.role !== "admin")) {
      router.replace("/dashboard");
    }
  }, [user, profile, loading, router]);

  useEffect(() => {
    if (!user || profile?.role !== "admin") return;
    fetchRatings();
  }, [user, profile]);

  const fetchRatings = async () => {
    setLoadingRatings(true);
    try {
      const res = await fetch("/api/admin/blog/ratings");
      const data = await res.json();
      if (res.ok) setRatings(data.ratings || []);
    } catch {
      // ignore
    } finally {
      setLoadingRatings(false);
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
              <span className="text-kenya-green font-medium">Ratings</span>
            </nav>

            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-kenya-white mb-2">Rating Moderation</h1>
              <p className="text-kenya-white/60">Review and moderate article ratings.</p>
            </div>

            {loadingRatings ? (
              <div className="text-center py-16">
                <div className="w-8 h-8 border-2 border-kenya-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-kenya-white/60">Loading ratings…</p>
              </div>
            ) : ratings.length === 0 ? (
              <div className="text-center py-16 border border-kenya-white/10 rounded-2xl">
                <p className="text-kenya-white/60">No ratings to moderate.</p>
              </div>
            ) : (
              <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-kenya-white/10">
                      <th className="text-left p-4 text-sm font-medium text-kenya-white/50">User</th>
                      <th className="text-left p-4 text-sm font-medium text-kenya-white/50">Post</th>
                      <th className="text-left p-4 text-sm font-medium text-kenya-white/50">Rating</th>
                      <th className="text-left p-4 text-sm font-medium text-kenya-white/50">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ratings.map((rating) => (
                      <tr key={rating.id} className="border-b border-kenya-white/5 hover:bg-kenya-white/3">
                        <td className="p-4 text-sm text-kenya-white/70">{rating.user?.full_name || rating.user?.email || "Unknown"}</td>
                        <td className="p-4 text-sm text-kenya-white/70">{rating.post?.title || "Unknown"}</td>
                        <td className="p-4 text-sm text-kenya-white">{rating.rating}</td>
                        <td className="p-4 text-sm text-kenya-white/50">{new Date(rating.created_at).toLocaleDateString()}</td>
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
