"use client";

import { useEffect, useState } from "react";
import { repoService } from "@/lib/api/client";
import { Repository } from "@/types";
import {
  BookOpen,
  FolderTree,
  Network,
  GitCommit,
  Server,
  ShieldAlert,
  GraduationCap,
  Star,
  GitFork,
  Code2,
  Users,
  HardDrive,
  RefreshCw,
  Layers,
} from "lucide-react";
import Link from "next/link";

interface RepositorySummary {
  repository_id: string;
  analysis_id: string;
  status: string;
  progress: number;
  tech_stack: string[];
  file_count: number;
  loc_count: number;
  repository_size_bytes: number;
  languages: Array<{
    name: string;
    loc: number;
    files: number;
    percentage: number;
  }>;
  endpoints_count: number;
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return "—";
  const mb = bytes / 1_000_000;
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  const kb = bytes / 1_000;
  return `${kb.toFixed(0)} KB`;
}

function StatCard({
  icon: Icon,
  iconColor,
  label,
  value,
}: {
  icon: React.ElementType;
  iconColor: string;
  label: string;
  value: string | number;
}) {
  return (
    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
      <div className="flex items-center gap-1 text-slate-400 text-[10px]">
        <Icon className={`w-3 h-3 ${iconColor}`} />
        <span>{label}</span>
      </div>
      <p className="text-sm font-bold text-white font-mono">
        {value ?? "—"}
      </p>
    </div>
  );
}

export default function RepositoryOverviewPage({ params }: { params: { repoId: string } }) {
  const [repo, setRepo] = useState<Repository | null>(null);
  const [summary, setSummary] = useState<RepositorySummary | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
    Promise.all([
      repoService.getRepository(params.repoId),
      repoService.getSummary(params.repoId),
    ])
      .then(([repoData, summaryData]) => {
        if (!repoData) {
          setError(true);
          return;
        }
        setRepo(repoData);
        if (summaryData) setSummary(summaryData);

        // Silently refresh live GitHub stats in background
        repoService.refreshRepositoryStats(params.repoId).then((fresh) => {
          if (fresh) {
            setRepo((prev) => (prev ? { ...prev, ...fresh } : fresh));
          }
        });
      })
      .catch(() => setError(true));
  }, [params.repoId]);

  async function handleManualRefresh() {
    setRefreshing(true);
    const [freshRepo, freshSummary] = await Promise.all([
      repoService.refreshRepositoryStats(params.repoId),
      repoService.getSummary(params.repoId),
    ]);
    if (freshRepo) setRepo((prev) => (prev ? { ...prev, ...freshRepo } : freshRepo));
    if (freshSummary) setSummary(freshSummary);
    setRefreshing(false);
  }

  if (error) {
    return (
      <div className="p-8 flex flex-col items-center justify-center gap-4 text-center h-full">
        <p className="text-slate-400 text-sm">Failed to load repository data.</p>
        <button
          onClick={() => {
            setError(false);
            Promise.all([
              repoService.getRepository(params.repoId),
              repoService.getSummary(params.repoId),
            ]).then(([repoData, summaryData]) => {
              if (repoData) setRepo(repoData);
              if (summaryData) setSummary(summaryData);
            });
          }}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!repo) {
    return (
      <div className="p-8 text-slate-400 text-xs font-mono animate-pulse">
        Loading repository overview...
      </div>
    );
  }

  const locCount = summary?.loc_count ?? repo.lines_of_code ?? repo.loc_count ?? 0;
  const fileCount = summary?.file_count ?? repo.total_files ?? repo.file_count ?? 0;
  const sizeBytes = summary?.repository_size_bytes ?? repo.size_bytes ?? 0;

  return (
    <div className="h-full overflow-y-auto p-6 md:p-8 space-y-8 bg-[#07090e]">
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-3xl space-y-4 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">{repo.full_name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Analyzed &amp; Grounded
              </span>
            </div>
            <p className="text-slate-400 text-xs max-w-2xl leading-relaxed">
              {repo.description || "No description provided."}
            </p>

            {/* Tech Stack Tags */}
            {summary?.tech_stack && summary.tech_stack.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1 mr-1">
                  <Layers className="w-3 h-3 text-indigo-400" />
                  Stack:
                </span>
                {summary.tech_stack.map((tech) => (
                  <span
                    key={tech}
                    className="px-2 py-0.5 bg-white/[0.04] border border-white/[0.08] rounded-md text-[10px] font-mono text-slate-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              title="Refresh stats from GitHub"
              className="p-2 rounded-xl border border-white/[0.08] hover:border-white/[0.16] text-slate-400 hover:text-white transition-all duration-200 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            </button>
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
          <StatCard
            icon={Code2}
            iconColor="text-indigo-400"
            label="Lines of Code"
            value={locCount > 0 ? locCount.toLocaleString() : "—"}
          />
          <StatCard
            icon={FolderTree}
            iconColor="text-cyan-400"
            label="Total Files"
            value={fileCount > 0 ? fileCount.toLocaleString() : "—"}
          />
          <StatCard
            icon={Star}
            iconColor="text-amber-400"
            label="Stars"
            value={repo.stars != null ? repo.stars.toLocaleString() : "0"}
          />
          <StatCard
            icon={GitFork}
            iconColor="text-purple-400"
            label="Forks"
            value={repo.forks != null ? repo.forks.toLocaleString() : "0"}
          />
          <StatCard
            icon={Users}
            iconColor="text-emerald-400"
            label="Contributors"
            value={repo.contributors_count > 0 ? repo.contributors_count.toLocaleString() : "1"}
          />
          <StatCard
            icon={HardDrive}
            iconColor="text-rose-400"
            label="Repo Size"
            value={formatBytes(sizeBytes)}
          />
        </div>

        {/* Language Breakdown Bar */}
        {summary?.languages && summary.languages.length > 0 && (
          <div className="pt-3 border-t border-white/[0.04] space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-semibold text-slate-300">Languages Breakdown</span>
              <span className="font-mono text-[10px] text-slate-500">
                {summary.languages.map((l) => `${l.name} ${l.percentage}%`).slice(0, 4).join(" • ")}
              </span>
            </div>
            <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden flex">
              {summary.languages.map((lang, idx) => {
                const colors = [
                  "bg-indigo-500",
                  "bg-amber-500",
                  "bg-cyan-500",
                  "bg-emerald-500",
                  "bg-rose-500",
                  "bg-purple-500",
                ];
                return (
                  <div
                    key={lang.name}
                    className={`h-full ${colors[idx % colors.length]}`}
                    style={{ width: `${lang.percentage}%` }}
                    title={`${lang.name}: ${lang.percentage}% (${lang.loc.toLocaleString()} LOC)`}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Feature Modules Quick Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href={`/repositories/${params.repoId}/wiki`} className="p-6 rounded-2xl bg-[#090b12] border border-white/[0.08] hover:border-indigo-500/50 transition group space-y-3 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Technical Wiki</h3>
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
            <h3 className="text-sm font-bold text-white">Architecture &amp; Component Visualizer</h3>
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
            <h3 className="text-sm font-bold text-white">Security &amp; Secret Audit</h3>
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
            <h3 className="text-sm font-bold text-white">Animated Code &amp; Flow Trace</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Step-by-step animation of API request lifecycles, AST extraction, and database persistence.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
