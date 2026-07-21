"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface AuthContextType {
  authModal: { open: boolean; tab: "login" | "register" };
  openAuth: (tab?: "login" | "register") => void;
  closeAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authModal, setAuthModal] = useState<{ open: boolean; tab: "login" | "register" }>({
    open: false,
    tab: "login",
  });

  const openAuth = (tab: "login" | "register" = "login") => {
    setAuthModal({ open: true, tab });
  };

  const closeAuth = () => {
    setAuthModal({ open: false, tab: "login" });
  };

  return (
    <AuthContext.Provider value={{ authModal, openAuth, closeAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
