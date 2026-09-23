"use client";

import { GitBranch, ExternalLink, Search, Star, GitFork, Sparkles, Loader2, Check } from "lucide-react";
import Link from "next/link";
import { UserMenu } from "@/components/auth/UserMenu";
import { useState, useEffect, useRef } from "react";
import { repoService } from "@/lib/api/client";

interface RepositoryHeaderProps {
  repoId?: string;
  repoName: string;
  branch?: string;
  githubUrl?: string;
  stars?: number;
  forks?: number;
  onOpenSearch?: () => void;
  onBranchChange?: (branch: string) => void;
}

export function RepositoryHeader({
  repoId,
  repoName,
  branch = "main",
  githubUrl,
  stars = 0,
  forks = 0,
  onOpenSearch,
  onBranchChange,
}: RepositoryHeaderProps) {
  const [selectedBranch, setSelectedBranch] = useState(branch);
  const [branches, setBranches] = useState<string[]>([branch]);
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (branch) setSelectedBranch(branch);
  }, [branch]);

  // Fetch real-time branches from GitHub API via backend
  useEffect(() => {
    if (!repoId) return;
    setIsLoadingBranches(true);
    repoService.getBranches(repoId).then((data: any) => {
      const list = Array.isArray(data) ? data : (data?.value ?? []);
      if (list.length > 0) {
        const names = list.map((b: any) => (typeof b === "string" ? b : b.name));
        setBranches(names);
        // If current selectedBranch is not in list, keep default branch
      }
      setIsLoadingBranches(false);
    });
  }, [repoId]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsBranchDropdownOpen(false);
      }
    };
    if (isBranchDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isBranchDropdownOpen]);

  // Ensure GitHub link points to this repository, never fallback to the app itself
  const actualGithubUrl =
    githubUrl && !githubUrl.includes("paraspathania/repowiki-ai")
      ? githubUrl
      : repoName && repoName.includes("/")
      ? `https://github.com/${repoName}`
      : "https://github.com";

  return (
    <header className="h-14 bg-black border-b border-white/[0.08] px-4 md:px-6 flex items-center justify-between text-xs sticky top-0 z-40 select-none">
      {/* Left section */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-1.5 font-bold text-white text-sm hover:text-indigo-400 transition duration-200 tracking-tight"
        >
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>RepoWiki AI</span>
        </Link>
        <span className="text-slate-700">/</span>
        <span className="text-slate-200 font-semibold text-xs tracking-tight truncate max-w-[200px]" title={repoName}>
          {repoName}
        </span>

        {/* Real-time Branch selector */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] rounded-lg text-slate-300 transition duration-150 active:scale-95"
            title="Switch git branch"
          >
            <GitBranch className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
            <span className="font-mono text-[11px] font-medium max-w-[100px] truncate">{selectedBranch}</span>
          </button>

          {isBranchDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-[#141722] border border-white/[0.12] rounded-xl shadow-2xl z-50 py-1.5 animate-fade-in">
              <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-white/[0.06] flex items-center justify-between">
                <span>Repository Branches</span>
                <span className="text-[9px] font-mono text-slate-500">
                  {isLoadingBranches ? "loading..." : `${branches.length} total`}
                </span>
              </div>

              {isLoadingBranches ? (
                <div className="p-3 flex items-center justify-center gap-2 text-slate-500 text-xs font-mono">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Fetching branches...</span>
                </div>
              ) : (
                <div className="max-h-56 overflow-y-auto custom-scrollbar py-1">
                  {branches.map((b) => (
                    <button
                      key={b}
                      onClick={() => {
                        setSelectedBranch(b);
                        setIsBranchDropdownOpen(false);
                        onBranchChange?.(b);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-white/[0.06] transition-colors ${
                        selectedBranch === b ? "text-indigo-400 font-bold bg-indigo-600/10" : "text-slate-300"
                      }`}
                    >
                      <span className="font-mono truncate">{b}</span>
                      {selectedBranch === b && <Check className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Live Repo metadata badges */}
        <div className="hidden md:flex items-center gap-2 text-[11px] text-slate-400">
          <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/[0.03] border border-white/[0.06]" title="GitHub Stars">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400/20" />
            {stars.toLocaleString()}
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/[0.03] border border-white/[0.06]" title="GitHub Forks">
            <GitFork className="w-3 h-3 text-slate-400" />
            {forks.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3">
        {/* Semantic search launcher button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] rounded-xl text-slate-400 hover:text-slate-200 transition duration-150 text-xs"
        >
          <Search className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Search Code / AI Semantic...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white/[0.08] rounded text-slate-400 border border-white/[0.1]">
            ⌘K
          </kbd>
        </button>

        {/* GitHub link button — accurately points to this repository */}
        <a
          href={actualGithubUrl}
          target="_blank"
          rel="noreferrer"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 rounded-xl transition duration-200 font-medium text-xs active:scale-95"
          title={`Open ${actualGithubUrl} on GitHub`}
        >
          <span>GitHub</span>
          <ExternalLink className="w-3 h-3" />
        </a>

        <div className="w-px h-5 bg-white/[0.08]" />
        <UserMenu />
      </div>
    </header>
  );
}
