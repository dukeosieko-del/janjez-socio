"use client";

import { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import { fetchWithTimeout } from "@/lib/client/fetchWithTimeout";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  wallet_balance: number;
  email_verified: boolean;
  role: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: Profile | null;
  walletBalance: number;
  authModal: { open: boolean; tab: "login" | "register" };
  supabaseError: string | null;
  openAuth: (tab?: "login" | "register") => void;
  closeAuth: () => void;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  customSignUp: (email: string, password: string, full_name?: string, phone?: string) => Promise<{ error: Error | null; message?: string }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithOAuth: (provider?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearAllLocalCaches: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;
const ACTIVITY_EVENTS = ["mousedown", "keydown", "touchstart"] as const;
const REFRESH_DEBOUNCE_MS = 500;

async function fetchProfile(supabase: ReturnType<typeof createClient>, userId: string): Promise<Profile | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
  if (error || !data) return null;
  return data as Profile;
}

async function ensureProfile(supabase: ReturnType<typeof createClient>, user: User): Promise<Profile | null> {
  if (!supabase) return null;
  let profile = await fetchProfile(supabase, user.id);
  if (!profile) {
    const { data, error } = await supabase.from("profiles").insert({
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || null,
      phone: user.user_metadata?.phone || null,
      wallet_balance: 0,
      email_verified: false,
    }).select("*").single();
    if (error) return null;
    profile = data as Profile;
  }
  return profile;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [authModal, setAuthModal] = useState<{ open: boolean; tab: "login" | "register" }>({
    open: false,
    tab: "login",
  });
  const [isAdmin, setIsAdmin] = useState(false);

  const supabase = useMemo(() => createClient(), []);
  const supabaseError = !supabase
    ? "Authentication service is temporarily unavailable. Please contact support or try again later."
    : null;

  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activityListenersRef = useRef<boolean>(false);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const signOutRef = useRef<() => Promise<void>>(async () => {});

  const loadProfile = useCallback(async (userId: string) => {
    const client = supabase;
    if (!client) {
      setProfile(null);
      setWalletBalance(0);
      setIsAdmin(false);
      return;
    }
    const prof = await ensureProfile(client, { id: userId, email: "", user_metadata: {} } as User);
    if (prof) {
      setProfile(prof);
      setWalletBalance(Number(prof.wallet_balance) || 0);
      setIsAdmin(prof.role === "admin");
    } else {
      setProfile(null);
      setWalletBalance(0);
      setIsAdmin(false);
    }
  }, [supabase]);

  const clearAllLocalCaches = useCallback(async () => {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error("AuthContext: signOut failed during cache clear", err);
      }
    }
    if (typeof window !== "undefined") {
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < window.localStorage.length; i++) {
          const key = window.localStorage.key(i);
          if (key && key.startsWith("sb-")) keysToRemove.push(key);
        }
        for (const key of keysToRemove) window.localStorage.removeItem(key);
        window.sessionStorage.clear();
      } catch (err) {
        console.error("AuthContext: failed to clear storage", err);
      }
    }
  }, [supabase]);

  const signOut = useCallback(async () => {
    await clearAllLocalCaches();
  }, [clearAllLocalCaches]);

  useEffect(() => {
    signOutRef.current = signOut;
  }, [signOut]);

  useEffect(() => {
    const controller = new AbortController();
    const getSession = async () => {
      const client = supabase;
      if (!client) {
        setLoading(false);
        return;
      }
      try {
        const { data: { session } } = await Promise.race([
          client.auth.getSession(),
          new Promise<{ data: { session: Session | null } }>((_, reject) =>
            setTimeout(() => reject(new Error("getSession timeout")), 5000)
          ),
        ]);
        if (controller.signal.aborted) return;
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadProfile(session.user.id);
        } else {
          setProfile(null);
          setWalletBalance(0);
        }
      } catch {
        if (!controller.signal.aborted) {
          setSession(null);
          setUser(null);
          setProfile(null);
          setWalletBalance(0);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    getSession();

    let subscription: { unsubscribe: () => void } | null = null;

    const initAuthListener = async () => {
      const client = supabase;
      if (!client) return;

      const { data: { subscription: sub } } = client.auth.onAuthStateChange(async (event, session) => {
        if (controller.signal.aborted) return;
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadProfile(session.user.id);
        } else {
          setProfile(null);
          setWalletBalance(0);
          setIsAdmin(false);
        }
        setLoading(false);

        if (event === "SIGNED_OUT") {
          if (typeof window !== "undefined") {
            try {
              const keysToRemove: string[] = [];
              for (let i = 0; i < window.localStorage.length; i++) {
                const key = window.localStorage.key(i);
                if (key && key.startsWith("sb-")) keysToRemove.push(key);
              }
              for (const key of keysToRemove) window.localStorage.removeItem(key);
              window.sessionStorage.clear();
            } catch (err) {
              console.error("AuthContext: failed to clear storage on SIGNED_OUT", err);
            }
          }
        }
      });

      subscription = sub;
    };

    initAuthListener();

    return () => {
      controller.abort();
      subscription?.unsubscribe();
    };
  }, [supabase, loadProfile]);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    inactivityTimerRef.current = setTimeout(() => {
      void signOutRef.current();
    }, INACTIVITY_TIMEOUT_MS);
  }, []);

  const handleActivity = useCallback(() => {
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!user) {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
      if (activityListenersRef.current) {
        for (const ev of ACTIVITY_EVENTS) {
          window.removeEventListener(ev, handleActivity);
        }
        activityListenersRef.current = false;
      }
      return;
    }

    if (!activityListenersRef.current) {
      for (const ev of ACTIVITY_EVENTS) {
        window.addEventListener(ev, handleActivity, { passive: true });
      }
      activityListenersRef.current = true;
    }
    resetInactivityTimer();

    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
      if (activityListenersRef.current) {
        for (const ev of ACTIVITY_EVENTS) {
          window.removeEventListener(ev, handleActivity);
        }
        activityListenersRef.current = false;
      }
    };
  }, [user, handleActivity, resetInactivityTimer]);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const userId = user.id;
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = setTimeout(async () => {
      refreshTimerRef.current = null;
      await loadProfile(userId);
    }, REFRESH_DEBOUNCE_MS);
  }, [user, loadProfile]);

  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, []);

  const openAuth = (tab: "login" | "register" = "login") => {
    setAuthModal({ open: true, tab });
  };

  const closeAuth = () => {
    setAuthModal({ open: false, tab: "login" });
  };

  const signUp = async (email: string, password: string) => {
    if (!supabase) return { error: new Error("Authentication service is temporarily unavailable.") };
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase) return { error: new Error("Authentication service is temporarily unavailable.") };
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signInWithOAuth = async (provider: string = "google") => {
    if (!supabase) return { error: new Error("Authentication service is temporarily unavailable.") };

    if (typeof window === "undefined") {
      return { error: new Error("OAuth sign-in is only available in the browser.") };
    }

    const redirectTo = `${window.location.origin}/auth/callback`;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as "google",
      options: {
        redirectTo,
      },
    });

    if (error) return { error };

    if (data?.url) {
      window.location.assign(data.url);
    }

    return { error: null };
  };

  const customSignUp = async (email: string, password: string, full_name?: string, phone?: string) => {
    try {
      const res = await fetchWithTimeout("/api/auth/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, full_name, phone }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { error: new Error(data?.error || "Failed to create account") };
      }
      return { error: null, message: data?.message };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error("Unexpected error") };
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, profile, walletBalance, authModal, openAuth, closeAuth, signUp, customSignUp, signIn, signInWithOAuth, signOut, refreshProfile, clearAllLocalCaches, supabaseError, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}