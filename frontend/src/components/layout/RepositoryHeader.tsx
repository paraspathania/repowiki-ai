"use client";

import { GitBranch, ExternalLink, Search, Star, GitFork, Sparkles } from "lucide-react";
import Link from "next/link";
import { UserMenu } from "@/components/auth/UserMenu";
import { useState } from "react";

interface RepositoryHeaderProps {
  repoName: string;
  branch: string;
  githubUrl: string;
  stars?: number;
  forks?: number;
  onOpenSearch?: () => void;
}

export function RepositoryHeader({
  repoName,
  branch,
  githubUrl,
  stars = 1240,
  forks = 182,
  onOpenSearch,
}: RepositoryHeaderProps) {
  const [selectedBranch, setSelectedBranch] = useState(branch);
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const branches = ["main", "develop", "feature/rag-pipeline", "v1.0-release"];

  return (
    <header className="h-14 bg-[#0d0f18]/80 backdrop-blur-md border-b border-white/[0.08] px-4 md:px-6 flex items-center justify-between text-xs sticky top-0 z-40">
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
        <span className="text-slate-200 font-semibold text-xs tracking-tight truncate max-w-[200px]">
          {repoName}
        </span>

        {/* Branch selector */}
        <div className="relative">
          <button
            onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] rounded-lg text-slate-300 transition duration-150"
          >
            <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-mono text-[11px] font-medium">{selectedBranch}</span>
          </button>

          {isBranchDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-44 bg-[#141722] border border-white/[0.12] rounded-xl shadow-2xl z-50 py-1.5">
              <div className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-white/[0.06] mb-1">
                Select Branch
              </div>
              {branches.map((b) => (
                <button
                  key={b}
                  onClick={() => {
                    setSelectedBranch(b);
                    setIsBranchDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-white/[0.06] ${
                    selectedBranch === b ? "text-indigo-400 font-bold" : "text-slate-300"
                  }`}
                >
                  <span className="font-mono">{b}</span>
                  {selectedBranch === b && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Repo metadata badges */}
        <div className="hidden md:flex items-center gap-2 text-[11px] text-slate-400">
          <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/[0.03] border border-white/[0.06]">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400/20" />
            {stars.toLocaleString()}
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/[0.03] border border-white/[0.06]">
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

        <a
          href={githubUrl}
          target="_blank"
          rel="noreferrer"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 rounded-xl transition duration-200 font-medium text-xs"
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
