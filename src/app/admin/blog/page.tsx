"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import Link from "next/link";

export default function AdminBlogDashboardPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || profile?.role !== "admin")) {
      router.replace("/dashboard");
    }
  }, [user, profile, loading, router]);

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

  const sections = [
    { href: "/admin/blog/articles", title: "Articles", desc: "All articles with status management", icon: "📝" },
    { href: "/admin/blog/pending", title: "Pending Review", desc: "Articles awaiting moderation", icon: "⏳" },
    { href: "/admin/blog/comments", title: "Comments", desc: "Comment moderation queue", icon: "💬" },
    { href: "/admin/blog/reports", title: "Reports", desc: "Reported content review", icon: "🚩" },
    { href: "/admin/blog/ratings", title: "Ratings", desc: "Rating moderation", icon: "⭐" },
    { href: "/admin/blog/categories", title: "Categories", desc: "Manage blog categories", icon: "📁" },
    { href: "/admin/blog/tags", title: "Tags", desc: "Manage blog tags", icon: "🏷️" },
    { href: "/admin/blog/authors", title: "Authors", desc: "Author and contributor management", icon: "👥" },
  ];

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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {sections.map((section) => (
                <Link
                  key={section.href}
                  href={section.href}
                  className="group bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6 hover:border-kenya-green/50 transition-all duration-300"
                >
                  <div className="text-3xl mb-4">{section.icon}</div>
                  <h3 className="text-lg font-bold text-kenya-white group-hover:text-kenya-green transition-colors mb-1">
                    {section.title}
                  </h3>
                  <p className="text-sm text-kenya-white/60">{section.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
