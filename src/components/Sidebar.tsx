"use client";

import { useState } from "react";
import Link from "next/link";
import { SIDEBAR_ITEMS, type SidebarItem } from "@/lib/data";
import { useAuth } from "./AuthContext";

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
        {item.icon && <span className="text-lg">{item.icon}</span>}
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
          {item.icon && <span className="text-lg">{item.icon}</span>}
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
      {item.icon && <span className="text-lg">{item.icon}</span>}
      <span>{item.label}</span>
    </Link>
  );
}

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen bg-kenya-black border-r border-kenya-white/10 transition-transform duration-300 w-64 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo area */}
          <div className="flex items-center justify-between p-4 border-b border-kenya-white/10">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-kenya-green rounded-lg flex items-center justify-center">
                <span className="text-kenya-black font-bold text-lg">J</span>
              </div>
              <span className="text-lg font-bold text-kenya-white">
                janjez<span className="text-kenya-green">.social</span>
              </span>
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-kenya-white/10 transition-colors text-kenya-white/60 hover:text-kenya-white"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {SIDEBAR_ITEMS.map((item, idx) => (
              <SidebarNavItem key={item.label + idx} item={item} />
            ))}
          </nav>

          {/* Bottom CTA */}
          <div className="p-4 border-t border-kenya-white/10">
            <a
              href="/order"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 w-full bg-kenya-green text-kenya-black font-bold text-sm py-3 rounded-xl hover:bg-kenya-green/90 transition-colors"
            >
              🛒 Start Order
            </a>
          </div>
        </div>
      </aside>

      {/* Mobile toggle button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-30 lg:hidden w-12 h-12 bg-kenya-green text-kenya-black rounded-full shadow-lg flex items-center justify-center hover:bg-kenya-green/90 transition-colors"
        aria-label="Open menu"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </>
  );
}
