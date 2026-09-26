"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, Github, Star, ExternalLink } from "lucide-react";
import { UserMenu } from "@/components/auth/UserMenu";

interface NavbarProps {
  showBackHome?: boolean;
}

export function Navbar({ showBackHome = false }: NavbarProps) {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    fetch("https://api.github.com/repos/paraspathania/repowiki-ai")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data.stargazers_count === "number") {
          setStars(data.stargazers_count);
        }
      })
      .catch(() => {
        // Silently catch network or rate limit errors
      });
  }, []);

  return (
    <header className="relative z-30 w-full max-w-5xl mx-auto pt-2 pb-4 px-2 sm:px-0">
      <nav className="flex items-center justify-between px-3.5 py-2.5 sm:px-5 sm:py-3 bg-[#0a0a0c]/90 border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/60 backdrop-blur-md transition-all duration-200 hover:border-white/[0.14]">
        {/* Left: Brand Identity + System Status */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-neutral-900 border border-white/[0.12] flex items-center justify-center text-white group-hover:border-white/30 group-hover:scale-105 transition-all duration-200 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex items-baseline gap-1 font-mono font-bold tracking-tight text-white text-sm">
              <span>RepoWiki</span>
              <span className="text-slate-500 font-normal text-xs">.ai</span>
            </div>
          </Link>

          {/* Cursor-style System Status Indicator */}
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400 select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>v1.0 • active</span>
          </div>
        </div>

        {/* Right: Navigation Links, GitHub Star & Auth */}
        <div className="flex items-center gap-2 sm:gap-3">
          {showBackHome && (
            <Link
              href="/"
              className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.04] transition-all duration-200 font-medium"
            >
              Home
            </Link>
          )}

          <Link
            href="/about"
            className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.04] transition-all duration-200 font-medium"
          >
            About
          </Link>

          <div className="w-px h-4 bg-white/[0.08]" />

          {/* GitHub Repository Star Button */}
          <a
            href="https://github.com/paraspathania/repowiki-ai"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.08] hover:border-white/[0.18] text-xs font-medium text-slate-300 hover:text-white transition-all duration-200 active:scale-95 group shadow-sm"
            title="Star RepoWiki AI on GitHub"
          >
            <Github className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
            <span className="hidden sm:inline">GitHub</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400 pl-1.5 border-l border-white/10 group-hover:text-amber-300 transition-colors">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400/20 group-hover:fill-amber-400" />
              <span>{stars !== null ? stars : "Star"}</span>
            </span>
          </a>

          <div className="w-px h-4 bg-white/[0.08]" />

          <UserMenu />
        </div>
      </nav>
    </header>
  );
}
