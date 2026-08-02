"use client";

import { GitBranch, ExternalLink, RefreshCw, Download } from "lucide-react";
import Link from "next/link";

interface RepositoryHeaderProps {
  repoName: string;
  branch: string;
  githubUrl: string;
}

export function RepositoryHeader({ repoName, branch, githubUrl }: RepositoryHeaderProps) {
  return (
    <header className="h-14 bg-panel border-b border-border px-6 flex items-center justify-between text-xs">
      <div className="flex items-center gap-4">
        <Link href="/" className="font-bold text-white text-sm hover:text-accent-blue transition">
          RepoWiki AI
        </Link>
        <span className="text-gray-600">/</span>
        <span className="text-gray-200 font-medium">{repoName}</span>
        <div className="flex items-center gap-1 px-2.5 py-1 bg-surface border border-border rounded-md text-gray-300">
          <GitBranch className="w-3.5 h-3.5 text-accent" />
          <span>{branch}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <a
          href={githubUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-surface hover:bg-border/60 text-gray-300 border border-border rounded-md transition"
        >
          <span>Open on GitHub</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </header>
  );
}
