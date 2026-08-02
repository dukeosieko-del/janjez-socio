"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

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
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

  const supabaseError = !createClient()
    ? "Authentication service is temporarily unavailable. Please contact support or try again later."
    : null;

  const supabase = createClient();

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

  useEffect(() => {
    const getSession = async () => {
      const client = supabase;
      if (!client) {
        setLoading(false);
        return;
      }
      const { data: { session } } = await client.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await loadProfile(session.user.id);
      } else {
        setProfile(null);
        setWalletBalance(0);
      }
      setLoading(false);
    };

    getSession();

    let subscription: { unsubscribe: () => void } | null = null;

    const initAuthListener = async () => {
      const client = supabase;
      if (!client) return;

      const { data: { subscription: sub } } = client.auth.onAuthStateChange(async (event, session) => {
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
      });

      subscription = sub;
    };

    initAuthListener();

    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase, loadProfile]);

  const refreshProfile = async () => {
    if (!user) return;
    await loadProfile(user.id);
  };

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

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  const customSignUp = async (email: string, password: string, full_name?: string, phone?: string) => {
    try {
      const res = await fetch("/api/auth/send-verification", {
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
    <AuthContext.Provider value={{ user, session, loading, profile, walletBalance, authModal, openAuth, closeAuth, signUp, customSignUp, signIn, signOut, refreshProfile, supabaseError, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
