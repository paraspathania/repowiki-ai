"use client";

import { GitBranch, ExternalLink } from "lucide-react";
import Link from "next/link";
import { UserNav } from "@/components/auth/UserNav";


interface RepositoryHeaderProps {
  repoName: string;
  branch: string;
  githubUrl: string;
}

export function RepositoryHeader({ repoName, branch, githubUrl }: RepositoryHeaderProps) {
  return (
    <header className="h-16 bg-panel/50 backdrop-blur-md border-b border-white/[0.06] px-6 flex items-center justify-between text-xs sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <Link href="/" className="font-extrabold text-white text-sm hover:text-indigo-400 transition duration-200 tracking-tight">
          RepoWiki AI
        </Link>
        <span className="text-slate-700">/</span>
        <span className="text-slate-200 font-semibold text-xs tracking-tight">{repoName}</span>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-surface/50 border border-white/[0.08] rounded-full text-slate-300">
          <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-medium font-mono text-[10px]">{branch}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <a
          href={githubUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 rounded-lg transition duration-200 font-medium"
        >
          <span>Open on GitHub</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
        <div className="h-4 w-px bg-white/[0.08]" />
        <UserNav />
      </div>

    </header>
  );
}
