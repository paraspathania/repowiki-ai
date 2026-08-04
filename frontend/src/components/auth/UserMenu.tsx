"use client";

import { useAuth } from "@/lib/auth-context";
import { LogIn, LogOut, User, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function UserMenu() {
  const { user, isAuthenticated, openAuthModal, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isAuthenticated) {
    return (
      <button
        onClick={openAuthModal}
        className="flex items-center gap-2 px-3.5 py-1.5 bg-white hover:bg-gray-100 text-gray-900 font-semibold text-xs rounded-lg transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.97]"
      >
        <LogIn className="w-3.5 h-3.5" />
        <span>Sign In</span>
      </button>
    );
  }

  // Generate initials from name
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const providerColors: Record<string, string> = {
    google: "from-blue-500 to-red-500",
    github: "from-gray-600 to-gray-800",
    microsoft: "from-blue-500 to-green-500",
  };

  return (
    <div ref={menuRef} className="relative">
      {/* Avatar Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 group"
      >
        <div
          className={`w-7 h-7 rounded-full bg-gradient-to-br ${
            providerColors[user?.provider || "github"]
          } flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-white/[0.1] group-hover:ring-white/[0.2] transition-all duration-200`}
        >
          {initials}
        </div>
        <ChevronDown
          className={`w-3 h-3 text-slate-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-[#0f1117] border border-white/[0.1] rounded-xl shadow-2xl shadow-black/50 overflow-hidden animate-fade-in z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-white/[0.06]">
            <p className="text-sm font-semibold text-white truncate">
              {user?.name}
            </p>
            <p className="text-[11px] text-slate-500 truncate mt-0.5">
              {user?.email}
            </p>
          </div>

          {/* Menu Items */}
          <div className="p-1.5">
            <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-white/[0.04] rounded-lg transition-all duration-150">
              <User className="w-3.5 h-3.5" />
              <span>Profile</span>
            </button>

            <div className="h-px bg-white/[0.06] my-1" />

            <button
              onClick={() => {
                signOut();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/[0.06] rounded-lg transition-all duration-150"
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
