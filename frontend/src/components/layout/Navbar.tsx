"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Terminal, Github, Star } from "lucide-react";
import { UserMenu } from "@/components/auth/UserMenu";

interface NavbarProps {
  showBackHome?: boolean;
}

export function Navbar({ showBackHome }: NavbarProps) {
  const [stars, setStars] = useState<number | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    let isMounted = true;
    fetch("https://api.github.com/repos/paraspathania/repowiki-ai")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data && typeof data.stargazers_count === "number") {
          setStars(data.stargazers_count);
        }
      })
      .catch(() => {
        // Silently catch network or rate limit errors
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const isHome = pathname === "/";
  const isAbout = pathname === "/about";

  return (
    <header className="w-full border-b border-[rgba(232,232,223,0.08)] bg-[#101110]/95 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-13 flex items-center justify-between gap-4">
        
        {/* Left: Brand Identity + Version */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/"
            className="flex items-center gap-2 group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5F467]"
            aria-label="RepoWiki AI Home"
          >
            <div className="w-6 h-6 rounded-sm bg-[#191A18] border border-[rgba(232,232,223,0.12)] flex items-center justify-center text-[#C5F467] group-hover:border-[#C5F467]/60 transition-colors">
              <Terminal className="w-3.5 h-3.5" />
            </div>
            <div className="flex items-baseline font-mono text-xs tracking-tight">
              <span className="font-bold text-[#E8E8DF]">RepoWiki</span>
              <span className="text-[#A1A39B]">.ai</span>
            </div>
          </Link>

          <div className="h-3 w-px bg-[rgba(232,232,223,0.12)] hidden sm:block" />

          {/* Precise Version Indicator */}
          <div className="hidden sm:inline-flex items-center gap-1.5 font-mono text-[11px] text-[#A1A39B] select-none">
            <span className="w-1.5 h-1.5 rounded-none bg-[#C5F467]" />
            <span>v1.0.0</span>
          </div>
        </div>

        {/* Right: Technical Navigation Links, GitHub Star & Auth */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Nav Links */}
          <nav aria-label="Primary" className="flex items-center gap-1">
            <Link
              href="/"
              className={`px-2.5 py-1 text-xs font-mono transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5F467] ${
                isHome
                  ? "text-[#E8E8DF] font-medium border-b border-[#C5F467]"
                  : "text-[#A1A39B] hover:text-[#E8E8DF]"
              }`}
            >
              Home
            </Link>

            <Link
              href="/about"
              className={`px-2.5 py-1 text-xs font-mono transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5F467] ${
                isAbout
                  ? "text-[#E8E8DF] font-medium border-b border-[#C5F467]"
                  : "text-[#A1A39B] hover:text-[#E8E8DF]"
              }`}
            >
              About
            </Link>
          </nav>

          <div className="h-3 w-px bg-[rgba(232,232,223,0.12)]" />

          {/* GitHub Star Button */}
          <a
            href="https://github.com/paraspathania/repowiki-ai"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm border border-[rgba(232,232,223,0.1)] hover:border-[rgba(232,232,223,0.22)] bg-[#191A18]/60 text-xs font-mono text-[#A1A39B] hover:text-[#E8E8DF] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5F467]"
            title="Star RepoWiki AI on GitHub"
            aria-label="Star RepoWiki AI on GitHub"
          >
            <Github className="w-3.5 h-3.5 text-[#A1A39B]" />
            <span className="hidden sm:inline">GitHub</span>
            <span className="inline-flex items-center gap-1 text-[11px] pl-1 border-l border-[rgba(232,232,223,0.1)] text-[#A1A39B]">
              <Star className="w-3 h-3 text-[#C5F467] fill-[#C5F467]" />
              <span>{stars !== null ? stars : "Star"}</span>
            </span>
          </a>

          <div className="h-3 w-px bg-[rgba(232,232,223,0.12)]" />

          <UserMenu />
        </div>
      </div>
    </header>
  );
}
