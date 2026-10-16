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
    <header className="h-12 bg-[#0A0A0A] border-b border-[#303030] px-4 md:px-6 flex items-center justify-between text-xs sticky top-0 z-40 select-none">
      {/* Left section: Identity, Branch, Meta */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-[#F5F5F5] text-xs hover:text-[#A3A3A3] transition-colors tracking-tight uppercase font-mono"
        >
          <span className="w-2 h-2 bg-[#F5F5F5] inline-block rounded-none" />
          <span>RepoWiki AI</span>
        </Link>

        <span className="text-[#303030]">/</span>

        <span className="text-[#F5F5F5] font-medium text-xs tracking-tight truncate max-w-[200px] font-mono" title={repoName}>
          {repoName}
        </span>

        {/* Real-time Branch selector */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
            className="flex items-center gap-1.5 px-2 py-1 bg-[#141414] hover:bg-[#1D1D1D] border border-[#303030] rounded-sm text-[#A3A3A3] hover:text-[#F5F5F5] transition duration-150 active:scale-95 text-xs font-mono"
            title="Switch git branch"
          >
            <GitBranch className="w-3 h-3 text-[#737373] flex-shrink-0" />
            <span className="text-[11px] font-medium max-w-[100px] truncate">{selectedBranch}</span>
          </button>

          {isBranchDropdownOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-56 bg-[#141414] border border-[#303030] rounded-sm shadow-xl z-50 py-1 font-mono">
              <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-[#737373] border-b border-[#303030] flex items-center justify-between">
                <span>Branches</span>
                <span className="text-[9px] text-[#737373]">
                  {isLoadingBranches ? "loading..." : `${branches.length} total`}
                </span>
              </div>

              {isLoadingBranches ? (
                <div className="p-3 flex items-center justify-center gap-2 text-[#737373] text-xs">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Fetching...</span>
                </div>
              ) : (
                <div className="max-h-56 overflow-y-auto custom-scrollbar py-1 divide-y divide-[#303030]/40">
                  {branches.map((b) => (
                    <button
                      key={b}
                      onClick={() => {
                        setSelectedBranch(b);
                        setIsBranchDropdownOpen(false);
                        onBranchChange?.(b);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-[#1D1D1D] transition-colors ${
                        selectedBranch === b ? "text-[#F5F5F5] font-semibold bg-[#1D1D1D]" : "text-[#A3A3A3]"
                      }`}
                    >
                      <span className="truncate">{b}</span>
                      {selectedBranch === b && <Check className="w-3 h-3 text-[#F5F5F5] flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Live Repo metadata badges - only on desktop to prevent collision on tablet */}
        <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-mono text-[#737373]">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-[#141414] border border-[#303030]" title="GitHub Stars">
            <Star className="w-3 h-3 text-[#737373]" />
            <span className="text-[#A3A3A3]">{stars.toLocaleString()}</span>
          </span>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-[#141414] border border-[#303030]" title="GitHub Forks">
            <GitFork className="w-3 h-3 text-[#737373]" />
            <span className="text-[#A3A3A3]">{forks.toLocaleString()}</span>
          </span>
        </div>
      </div>

      {/* Right section: Search, GitHub, UserMenu */}
      <div className="flex items-center gap-2">
        {/* Semantic search launcher button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 bg-[#141414] hover:bg-[#1D1D1D] border border-[#303030] rounded-sm text-[#737373] hover:text-[#A3A3A3] transition text-xs font-mono"
          title="Search Code / AI"
        >
          <Search className="w-3.5 h-3.5 text-[#737373]" />
          <span className="hidden md:inline text-[#A3A3A3]">Search...</span>
          <kbd className="hidden md:inline-block px-1 py-0.2 text-[9px] font-mono bg-[#1D1D1D] rounded-none text-[#737373] border border-[#303030]">
            ⌘K
          </kbd>
        </button>

        {/* GitHub link button */}
        <a
          href={actualGithubUrl}
          target="_blank"
          rel="noreferrer"
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-[#141414] hover:bg-[#1D1D1D] text-[#A3A3A3] hover:text-[#F5F5F5] border border-[#303030] rounded-sm transition font-mono text-xs"
          title={`Open ${actualGithubUrl} on GitHub`}
        >
          <span>GitHub</span>
          <ExternalLink className="w-3 h-3 text-[#737373]" />
        </a>

        <div className="w-px h-4 bg-[#303030] hidden sm:block" />
        <UserMenu />
      </div>
    </header>
  );
}
