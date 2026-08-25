"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import type { SidebarItem } from "@/lib/data";
import { useAuth } from "./AuthContext";

function SidebarIcon({ icon, label }: { icon: string; label: string }) {
  if (icon.startsWith("/") || icon.startsWith("http")) {
    return (
      <Image src={icon} alt={label} width={20} height={20} className="w-5 h-5 object-contain" />
    );
  }
  return <span className="text-lg">{icon}</span>;
}

function SidebarNavItem({ item, depth = 0 }: { item: SidebarItem; depth?: number }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { openAuth } = useAuth();

  if (item.trigger) {
    return (
      <button
        onClick={() => openAuth(item.trigger as "login" | "register" | undefined)}
        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all text-kenya-white/70 hover:text-kenya-white hover:bg-kenya-white/5"
        style={{ paddingLeft: `${12 + depth * 12}px` }}
      >
        {item.icon && <SidebarIcon icon={item.icon} label={item.label} />}
        <span>{item.label}</span>
      </button>
    );
  }

  if (item.children && item.children.length > 0) {
    return (
      <div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
            item.active
              ? "bg-kenya-green/10 text-kenya-green border border-kenya-green/20"
              : "text-kenya-white/70 hover:text-kenya-white hover:bg-kenya-white/5"
          }`}
        >
          {item.icon && <SidebarIcon icon={item.icon} label={item.label} />}
          <span className="flex-1 text-left">{item.label}</span>
          <svg
            className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children.map((child, idx) => (
              <SidebarNavItem key={child.label + idx} item={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href || "#"}
      className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
        item.active
          ? "bg-kenya-green/10 text-kenya-green border border-kenya-green/20"
          : "text-kenya-white/70 hover:text-kenya-white hover:bg-kenya-white/5"
      }`}
      style={{ paddingLeft: `${12 + depth * 12}px` }}
    >
      {item.icon && <SidebarIcon icon={item.icon} label={item.label} />}
      <span>{item.label}</span>
    </Link>
  );
}

export default function Sidebar() {
  const { user, signOut } = useAuth();
  const [sidebarItems, setSidebarItems] = useState<SidebarItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/services/sidebar")
      .then((r) => r.ok ? r.json() : Promise.reject(r.statusText))
      .then((data) => {
        if (!cancelled) {
          setSidebarItems(data.items || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const expandableItems = useMemo(() => sidebarItems.filter((item) => item.children && item.children.length > 0), [sidebarItems]);

  const navItems = useMemo(() => {
    const baseItems = [
      { label: "New Order", href: "/services", icon: "🛒", active: true },
      { label: "Blog & News", href: "/blog", icon: "💬" },
    ];

    if (user) {
      return [
        { label: "Dashboard", href: "/dashboard", icon: "📊" },
        ...baseItems,
        { label: "My Orders", href: "/orders/all", icon: "📦" },
        ...expandableItems,
      ];
    }
    return [
      ...baseItems,
      { label: "Sign Up", href: "/auth/sign-in#", icon: "📑", trigger: "register" as const },
      { label: "Sign In", href: "/auth/sign-in#", icon: "🔑", trigger: "login" as const },
      ...expandableItems,
    ];
  }, [user, expandableItems]);

  return (
    <>
      {/* Sidebar - desktop only */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen bg-kenya-black border-r border-kenya-white/10 transition-transform duration-300 w-64 hidden lg:block`}>
        <div className="flex flex-col h-full">
          {/* Logo area */}
          <div className="flex items-center justify-between p-4 border-b border-kenya-white/10">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/janjez-logo.png" alt="janjez.social" width={32} height={32} className="w-8 h-8 object-contain" />
              <span className="text-lg font-bold text-kenya-white">
                janjez<span className="text-kenya-green">.social</span>
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {loading && (
              <p className="text-kenya-white/40 text-xs px-3 py-2">Loading menu…</p>
            )}
            {!loading && navItems.map((item, idx) => (
              <SidebarNavItem key={item.label + idx} item={item} />
            ))}
          </nav>

          {/* Bottom CTA */}
          <div className="p-4 border-t border-kenya-white/10">
            {user ? (
              <button
                onClick={() => signOut()}
                className="flex items-center justify-center gap-2 w-full bg-kenya-red/10 text-kenya-red font-bold text-sm py-3 rounded-xl hover:bg-kenya-red/20 transition-colors border border-kenya-red/20"
              >
                Sign Out
              </button>
            ) : (
              <Link
                href="/services"
                className="flex items-center justify-center gap-2 w-full bg-kenya-green text-kenya-black font-bold text-sm py-3 rounded-xl hover:bg-kenya-green/90 transition-colors"
              >
                Start Order
              </Link>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}