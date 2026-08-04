"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  provider: "google" | "github" | "microsoft";
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  signIn: (provider: "google" | "github" | "microsoft") => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Restore user from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("repowiki_user");
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const openAuthModal = useCallback(() => setIsAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), []);

  const signIn = useCallback((provider: "google" | "github" | "microsoft") => {
    // Simulated OAuth sign-in — in production this would redirect to your backend OAuth endpoint
    const mockUsers: Record<string, User> = {
      google: {
        id: "g-001",
        name: "Alex Developer",
        email: "alex@gmail.com",
        avatar: "",
        provider: "google",
      },
      github: {
        id: "gh-001",
        name: "Alex Developer",
        email: "alex@github.com",
        avatar: "",
        provider: "github",
      },
      microsoft: {
        id: "ms-001",
        name: "Alex Developer",
        email: "alex@outlook.com",
        avatar: "",
        provider: "microsoft",
      },
    };

    const mockUser = mockUsers[provider];
    setUser(mockUser);
    localStorage.setItem("repowiki_user", JSON.stringify(mockUser));
    setIsAuthModalOpen(false);
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    localStorage.removeItem("repowiki_user");
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
