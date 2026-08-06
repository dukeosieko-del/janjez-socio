"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import GlobalSearch from "./GlobalSearch";
import CountdownTimer from "./CountdownTimer";
import { useAuth } from "./AuthContext";

const MpesaModal = dynamic(() => import("./MpesaModal"), { ssr: false });
const AuthModal = dynamic(() => import("./AuthModal"), { ssr: false });
const NotificationBell = dynamic(() => import("./NotificationBell"), { ssr: false });

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mpesaOpen, setMpesaOpen] = useState(false);
  const { authModal, openAuth, closeAuth, user, signOut } = useAuth();
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        mobileMenuButtonRef.current?.focus();
      }
    };

    const focusableElements = mobileMenuRef.current?.querySelectorAll(
      'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements && focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-40 bg-kenya-black/95 backdrop-blur-md border-b border-kenya-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <Image src="/janjez-logo.png" alt="janjez.social" width={32} height={32} className="w-8 h-8 object-contain" />
            <span className="text-xl font-bold text-kenya-white">
              janjez<span className="text-kenya-green">.social</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            <Link
              href="/order"
              className="px-4 py-2 text-sm font-medium text-kenya-white hover:text-kenya-green transition-colors rounded-lg hover:bg-kenya-white/5"
            >
              🛒 New Order
            </Link>
            {user && (
              <>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-sm font-medium text-kenya-white hover:text-kenya-green transition-colors rounded-lg hover:bg-kenya-white/5"
                >
                  📊 Dashboard
                </Link>
                <Link
                  href="/orders/all"
                  className="px-4 py-2 text-sm font-medium text-kenya-white hover:text-kenya-green transition-colors rounded-lg hover:bg-kenya-white/5"
                >
                  📦 My Orders
                </Link>
              </>
            )}
            <Link
              href="/blog"
              className="px-4 py-2 text-sm font-medium text-kenya-white hover:text-kenya-green transition-colors rounded-lg hover:bg-kenya-white/5"
            >
              💬 Blog & News
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <a
              href="https://www.facebook.com/profile.php?id=61592028091844"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-kenya-white/5 text-kenya-white/70 hover:bg-blue-600 hover:text-white transition-colors"
              aria-label="Facebook"
            >
              <Image src="/facebook-icon.png" alt="Facebook" width={20} height={20} className="w-5 h-5 object-contain" />
            </a>
            <div className="hidden lg:block">
              <GlobalSearch />
            </div>
            <NotificationBell />
            <CountdownTimer />
            <button
              onClick={() => setMpesaOpen(true)}
              className="hidden sm:flex items-center gap-2 bg-kenya-green text-kenya-black font-bold text-sm px-4 py-2 rounded-lg hover:bg-kenya-green/90 transition-colors animate-pulse-glow"
            >
              <Image src="/mpesa-logo.png" alt="M-Pesa" width={20} height={20} className="w-5 h-5 object-contain" />
              Top Up
            </button>
            <button
              ref={mobileMenuButtonRef}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-kenya-white/10 transition-colors"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <svg className="h-6 w-6 text-kenya-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div
            id="mobile-menu"
            ref={mobileMenuRef}
            className="md:hidden py-4 border-t border-kenya-white/10"
            role="menu"
          >
            <div className="lg:hidden mb-4">
              <GlobalSearch />
            </div>
            <div className="flex flex-col gap-2">
              <Link
                href="/order"
                role="menuitem"
                className="px-4 py-3 text-sm font-medium text-kenya-white hover:text-kenya-green transition-colors rounded-lg hover:bg-kenya-white/5"
                onClick={() => setMobileMenuOpen(false)}
              >
                🛒 New Order
              </Link>
              <Link
                href="/blog"
                role="menuitem"
                className="px-4 py-3 text-sm font-medium text-kenya-white hover:text-kenya-green transition-colors rounded-lg hover:bg-kenya-white/5"
                onClick={() => setMobileMenuOpen(false)}
              >
                💬 Blog & News
              </Link>
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    role="menuitem"
                    className="px-4 py-3 text-sm font-medium text-kenya-white hover:text-kenya-green transition-colors rounded-lg hover:bg-kenya-white/5"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    📊 Dashboard
                  </Link>
                  <Link
                    href="/orders/all"
                    role="menuitem"
                    className="px-4 py-3 text-sm font-medium text-kenya-white hover:text-kenya-green transition-colors rounded-lg hover:bg-kenya-white/5"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    📦 My Orders
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                    role="menuitem"
                    className="text-left px-4 py-3 text-sm font-medium text-kenya-red hover:text-kenya-red transition-colors rounded-lg hover:bg-kenya-white/5"
                  >
                    🚪 Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      openAuth("register");
                      setMobileMenuOpen(false);
                    }}
                    role="menuitem"
                    className="text-left px-4 py-3 text-sm font-medium text-kenya-white hover:text-kenya-green transition-colors rounded-lg hover:bg-kenya-white/5"
                  >
                    📑 Register
                  </button>
                  <button
                    onClick={() => {
                      openAuth("login");
                      setMobileMenuOpen(false);
                    }}
                    role="menuitem"
                    className="text-left px-4 py-3 text-sm font-medium text-kenya-white hover:text-kenya-green transition-colors rounded-lg hover:bg-kenya-white/5"
                  >
                    🔑 Sign In
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  setMpesaOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="sm:hidden flex items-center justify-center gap-2 bg-kenya-green text-kenya-black font-bold text-sm px-4 py-3 rounded-lg"
              >
                <Image src="/mpesa-logo.png" alt="M-Pesa" width={20} height={20} className="w-5 h-5 object-contain" />
                Top Up via M-Pesa
              </button>
            </div>
          </div>
        )}
      </div>

      <MpesaModal isOpen={mpesaOpen} onClose={() => setMpesaOpen(false)} />
      <AuthModal
        isOpen={authModal.open}
        onClose={closeAuth}
        defaultTab={authModal.tab}
      />
    </header>
  );
}
