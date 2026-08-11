"use client";

import { BookOpen, Star, Clock, FolderGit2, Sparkles, ExternalLink } from "lucide-react";
import Link from "next/link";

const RECENT_ANALYSES = [
  {
    id: "paraspathania-repowiki-ai",
    full_name: "paraspathania/repowiki-ai",
    description: "AI-powered repository understanding, documentation, visualization, and learning platform.",
    stars: 1240,
    language: "TypeScript",
    analyzed_at: "2 hours ago",
  },
  {
    id: "facebook-react",
    full_name: "facebook/react",
    description: "The library for web and native user interfaces.",
    stars: 224000,
    language: "JavaScript",
    analyzed_at: "1 day ago",
  },
  {
    id: "vercel-nextjs",
    full_name: "vercel/next.js",
    description: "The React Framework for the Web.",
    stars: 121000,
    language: "TypeScript",
    analyzed_at: "3 days ago",
  },
];

export default function UserDashboardPage() {
  return (
    <div className="min-h-screen bg-[#07090e] p-6 md:p-12 space-y-8 text-white">
      {/* Top Navbar */}
      <div className="max-w-6xl mx-auto flex items-center justify-between border-b border-white/[0.08] pb-4">
        <Link href="/" className="flex items-center gap-2 font-extrabold text-sm tracking-tight text-white hover:text-indigo-400 transition">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>RepoWiki AI</span>
        </Link>
        <span className="text-xs text-slate-400 font-mono">User Dashboard & History</span>
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Recent Repository Analyses</h1>
          <p className="text-slate-400 text-xs mt-1">
            Access your previously analyzed codebases, saved wikis, and chat threads.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {RECENT_ANALYSES.map((repo) => (
            <div
              key={repo.id}
              className="p-6 rounded-2xl bg-[#090b12] border border-white/[0.08] space-y-4 hover:border-indigo-500/50 transition flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs font-bold">
                    <FolderGit2 className="w-4 h-4" />
                    <span>{repo.full_name}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {repo.analyzed_at}
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {repo.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400/20" />
                    {repo.stars.toLocaleString()}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white/[0.04] text-slate-300 font-mono text-[10px]">
                    {repo.language}
                  </span>
                </div>

                <Link
                  href={`/repositories/${repo.id}/overview`}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1 transition"
                >
                  <span>Open Wiki</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
