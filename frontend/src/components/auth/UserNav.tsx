"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { LogOut, User as UserIcon, ChevronDown, Sparkles } from "lucide-react";

export function UserNav() {
  const { user, loading, openLoginModal, openSignupModal, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) {
    return <div className="w-16 h-7 bg-white/[0.05] rounded-xl animate-pulse" />;
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={openLoginModal}
          className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.05] rounded-xl transition"
        >
          Sign In
        </button>
        <button
          onClick={openSignupModal}
          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition shadow-md shadow-indigo-600/20"
        >
          Sign Up
        </button>
      </div>
    );
  }

  const initials = (user.display_name || user.email || "U")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 p-1.5 pl-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] transition"
      >
        <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
          {initials}
        </div>
        <span className="text-xs font-medium text-slate-200 max-w-[120px] truncate">
          {user.display_name || user.email?.split("@")[0]}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 glass-panel rounded-2xl p-2 border border-white/[0.1] shadow-2xl z-50 bg-slate-950/90 animate-fade-in-up">
          <div className="px-3 py-2 border-b border-white/[0.06] mb-1">
            <p className="text-xs font-semibold text-white truncate">{user.display_name || "User"}</p>
            <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
          </div>

          <div className="p-1">
            <button
              onClick={() => {
                setDropdownOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-xl transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
