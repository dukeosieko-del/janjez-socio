"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import Link from "next/link";

interface Report {
  id: string;
  content: string;
  status: string;
  is_reported: boolean;
  created_at: string;
  author: { full_name: string | null; email: string | null } | null;
  post: { title: string; slug: string } | null;
}

export default function AdminBlogReportsPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);

  useEffect(() => {
    if (!loading && (!user || profile?.role !== "admin")) {
      router.replace("/dashboard");
    }
  }, [user, profile, loading, router]);

  useEffect(() => {
    if (!user || profile?.role !== "admin") return;
    fetchReports();
  }, [user, profile]);

  const fetchReports = async () => {
    setLoadingReports(true);
    try {
      const res = await fetch("/api/admin/blog/reports?type=comments");
      const data = await res.json();
      if (res.ok) setReports(data.reports || []);
    } catch {
      // ignore
    } finally {
      setLoadingReports(false);
    }
  };

  const moderateComment = async (id: string, status: "approved" | "rejected" | "removed") => {
    await fetch(`/api/admin/blog/comments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchReports();
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
              <span className="text-kenya-green font-medium">Reports</span>
            </nav>

            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-kenya-white mb-2">Reported Content</h1>
              <p className="text-kenya-white/60">Review and act on reported comments and content.</p>
            </div>

            {loadingReports ? (
              <div className="text-center py-16">
                <div className="w-8 h-8 border-2 border-kenya-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-kenya-white/60">Loading reports…</p>
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-16 border border-kenya-white/10 rounded-2xl">
                <p className="text-kenya-white/60">No reported content.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="bg-kenya-red/5 border border-kenya-red/20 rounded-2xl p-6">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="text-sm text-kenya-white/50">
                          {report.author?.full_name || report.author?.email || "Anonymous"}
                        </span>
                        <span className="text-xs text-kenya-white/40 ml-2">
                          {new Date(report.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-kenya-red/20 text-kenya-red">Reported</span>
                    </div>
                    <p className="text-kenya-white/80 text-sm mb-3">{report.content}</p>
                    {report.post && (
                      <Link href={`/blog/${report.post.slug}`} className="text-xs text-kenya-green hover:text-kenya-green/80">
                        On: {report.post.title}
                      </Link>
                    )}
                    <div className="flex items-center gap-2 mt-4">
                      <button onClick={() => moderateComment(report.id, "approved")} className="px-4 py-2 bg-kenya-green text-kenya-black text-sm rounded-lg hover:bg-kenya-green/90 transition-colors">
                        Approve
                      </button>
                      <button onClick={() => moderateComment(report.id, "removed")} className="px-4 py-2 bg-kenya-red text-white text-sm rounded-lg hover:bg-kenya-red/90 transition-colors">
                        Remove
                      </button>
                    </div>
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
