"use client";

import { useAuth } from "@/lib/auth-context";
import { LogIn, LogOut, User, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function UserMenu() {
  const { user, isAuthenticated, openAuthModal, openProfileModal, signOut } = useAuth();
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
        id="user-menu-signin-btn"
        className="flex items-center gap-1.5 px-3 py-1 bg-[#F5F5F5] hover:bg-[#E0E0E0] text-[#111111] font-semibold text-xs rounded-sm transition duration-150 active:scale-[0.98]"
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

  return (
    <div ref={menuRef} className="relative">
      {/* Avatar Trigger */}
      <button
        id="user-menu-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 group font-mono text-xs"
        aria-label="User Menu"
        aria-expanded={isOpen}
      >
        <div className="w-6 h-6 rounded-sm bg-[#1D1D1D] border border-[#303030] flex items-center justify-center text-[10px] font-bold text-[#F5F5F5] transition duration-150">
          {initials}
        </div>
        <ChevronDown
          className={`w-3 h-3 text-[#737373] transition-transform duration-150 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-52 bg-[#141414] border border-[#303030] rounded-sm shadow-xl overflow-hidden z-50 font-mono">
          {/* User Info */}
          <div className="px-3 py-2.5 border-b border-[#303030]">
            <p className="text-xs font-semibold text-[#F5F5F5] truncate">
              {user?.name}
            </p>
            <p className="text-[10px] text-[#737373] truncate mt-0.5">
              {user?.email}
            </p>
          </div>

          {/* Menu Items */}
          <div className="p-1">
            <button
              id="user-menu-profile-btn"
              onClick={() => {
                openProfileModal();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#1D1D1D] rounded-sm transition duration-150 text-left"
            >
              <User className="w-3.5 h-3.5 text-[#737373]" />
              <span>Profile</span>
            </button>

            <div className="h-px bg-[#303030] my-1" />

            <button
              id="user-menu-signout-btn"
              onClick={() => {
                signOut();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#1D1D1D] rounded-sm transition duration-150 text-left"
            >
              <LogOut className="w-3.5 h-3.5 text-[#737373]" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
