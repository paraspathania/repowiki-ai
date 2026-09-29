"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  provider: "google" | "github";
  role?: string;
  bio?: string;
  githubUsername?: string;
  location?: string;
  website?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  isProfileModalOpen: boolean;
  openProfileModal: () => void;
  closeProfileModal: () => void;
  signIn: (provider: "google" | "github") => void;
  signOut: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

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

  const openProfileModal = useCallback(() => setIsProfileModalOpen(true), []);
  const closeProfileModal = useCallback(() => setIsProfileModalOpen(false), []);

  const signIn = useCallback((provider: "google" | "github") => {
    // Simulated OAuth sign-in — in production this would redirect to your backend OAuth endpoint
    const mockUsers: Record<string, User> = {
      google: {
        id: "g-001",
        name: "Alex Developer",
        email: "alex@gmail.com",
        avatar: "",
        provider: "google",
        role: "Senior Software Engineer",
        bio: "Full-stack engineer passionate about developer tools, distributed systems, and AI code intelligence.",
        githubUsername: "alex-developer",
        location: "San Francisco, CA",
        website: "https://alexdev.io",
        createdAt: "2024-01-15",
      },
      github: {
        id: "gh-001",
        name: "Alex Developer",
        email: "alex@github.com",
        avatar: "",
        provider: "github",
        role: "Lead Systems Architect",
        bio: "Open source maintainer and full-stack engineer building next-gen repo visualization tools.",
        githubUsername: "alex-dev",
        location: "Seattle, WA",
        website: "https://github.com/alex-dev",
        createdAt: "2023-11-20",
      },
    };

    const mockUser = mockUsers[provider];
    setUser(mockUser);
    localStorage.setItem("repowiki_user", JSON.stringify(mockUser));
    setIsAuthModalOpen(false);
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    setIsProfileModalOpen(false);
    localStorage.removeItem("repowiki_user");
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated: User = { ...prev, ...updates };
      try {
        localStorage.setItem("repowiki_user", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        isProfileModalOpen,
        openProfileModal,
        closeProfileModal,
        signIn,
        signOut,
        updateUser,
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
