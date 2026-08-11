"use client";

import { useEffect, useState } from "react";
import { repoService } from "@/lib/api/client";
import { Repository } from "@/types";
import { BookOpen, FolderTree, Network, GitCommit, Server, ShieldAlert, GraduationCap, Star, GitFork, Code2, Users, HardDrive } from "lucide-react";
import Link from "next/link";

export default function RepositoryOverviewPage({ params }: { params: { repoId: string } }) {
  const [repo, setRepo] = useState<Repository | null>(null);

  useEffect(() => {
    repoService.getRepository(params.repoId).then(setRepo);
  }, [params.repoId]);

  if (!repo) {
    return <div className="p-8 text-slate-400 text-xs font-mono">Loading repository overview...</div>;
  }

  return (
    <div className="h-full overflow-y-auto p-6 md:p-8 space-y-8 bg-[#07090e]">
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-3xl space-y-4 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">{repo.full_name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Analyzed & Grounded
              </span>
            </div>
            <p className="text-slate-400 text-xs max-w-2xl leading-relaxed">
              {repo.description}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/repositories/${params.repoId}/wiki`}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Explore Technical Wiki</span>
            </Link>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-4 border-t border-white/[0.06]">
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
            <div className="flex items-center gap-1 text-slate-400 text-[10px]">
              <Code2 className="w-3 h-3 text-indigo-400" />
              <span>Lines of Code</span>
            </div>
            <p className="text-sm font-bold text-white font-mono">{(repo.lines_of_code || 48920).toLocaleString()}</p>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
            <div className="flex items-center gap-1 text-slate-400 text-[10px]">
              <FolderTree className="w-3 h-3 text-cyan-400" />
              <span>Total Files</span>
            </div>
            <p className="text-sm font-bold text-white font-mono">{repo.total_files || 342}</p>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
            <div className="flex items-center gap-1 text-slate-400 text-[10px]">
              <Star className="w-3 h-3 text-amber-400" />
              <span>Stars</span>
            </div>
            <p className="text-sm font-bold text-white font-mono">{(repo.stars || 1240).toLocaleString()}</p>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
            <div className="flex items-center gap-1 text-slate-400 text-[10px]">
              <GitFork className="w-3 h-3 text-purple-400" />
              <span>Forks</span>
            </div>
            <p className="text-sm font-bold text-white font-mono">{repo.forks || 182}</p>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
            <div className="flex items-center gap-1 text-slate-400 text-[10px]">
              <Users className="w-3 h-3 text-emerald-400" />
              <span>Contributors</span>
            </div>
            <p className="text-sm font-bold text-white font-mono">{repo.contributors_count || 14}</p>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
            <div className="flex items-center gap-1 text-slate-400 text-[10px]">
              <HardDrive className="w-3 h-3 text-rose-400" />
              <span>Repo Size</span>
            </div>
            <p className="text-sm font-bold text-white font-mono">{(repo.size_bytes / 1000000).toFixed(1)} MB</p>
          </div>
        </div>
      </div>

      {/* Feature Modules Quick Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href={`/repositories/${params.repoId}/wiki`} className="p-6 rounded-2xl bg-[#090b12] border border-white/[0.08] hover:border-indigo-500/50 transition group space-y-3 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">14-Section Technical Wiki</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Auto-generated documentation detailing architecture, folder structure, deployment, and security.
            </p>
          </div>
        </Link>

        <Link href={`/repositories/${params.repoId}/architecture`} className="p-6 rounded-2xl bg-[#090b12] border border-white/[0.08] hover:border-indigo-500/50 transition group space-y-3 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Architecture & Component Visualizer</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Interactive Mermaid diagrams visualizing system layers, folder imports, and microservice topologies.
            </p>
          </div>
        </Link>

        <Link href={`/repositories/${params.repoId}/files`} className="p-6 rounded-2xl bg-[#090b12] border border-white/[0.08] hover:border-indigo-500/50 transition group space-y-3 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition">
            <FolderTree className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Smart Monaco Code Explorer</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              IDE-inspired source viewer with line-level AI explanation in Beginner, Intermediate, or Expert modes.
            </p>
          </div>
        </Link>

        <Link href={`/repositories/${params.repoId}/security`} className="p-6 rounded-2xl bg-[#090b12] border border-white/[0.08] hover:border-indigo-500/50 transition group space-y-3 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:scale-110 transition">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Security & Secret Audit</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Detects hardcoded secrets, SQL injection risks, and SAIF data masking compliance.
            </p>
          </div>
        </Link>

        <Link href={`/repositories/${params.repoId}/learning`} className="p-6 rounded-2xl bg-[#090b12] border border-white/[0.08] hover:border-indigo-500/50 transition group space-y-3 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Interactive Learning Hub</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Auto-generated quizzes, flashcards, interview prep, and step-by-step developer roadmaps.
            </p>
          </div>
        </Link>

        <Link href={`/repositories/${params.repoId}/code-flow`} className="p-6 rounded-2xl bg-[#090b12] border border-white/[0.08] hover:border-indigo-500/50 transition group space-y-3 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition">
            <GitCommit className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Animated Code & Flow Trace</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Step-by-step animation of API request lifecycles, AST extraction, and database persistence.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
