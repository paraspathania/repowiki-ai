"use client";

import { useEffect, useState } from "react";
import { repoService } from "@/lib/api/client";
import { Repository, ApiEndpoint } from "@/types";
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
  Package,
  ExternalLink,
  Copy,
  Check,
  ArrowRight,
  Database,
  Cpu,
  FileCode,
} from "lucide-react";
import Link from "next/link";
import { MermaidViewer } from "@/components/architecture/MermaidViewer";

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

interface DependencyItem {
  id: string;
  name: string;
  version: string;
  type: string;
  language: string;
  file_path: string;
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
  subtext,
}: {
  icon: React.ElementType;
  iconColor: string;
  label: string;
  value: string | number;
  subtext?: string;
}) {
  return (
    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-200 group">
      <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
        <span className="font-medium">{label}</span>
        <div className={`p-1.5 rounded-lg bg-white/[0.04] group-hover:scale-110 transition-transform ${iconColor}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>
      <p className="text-xl font-extrabold text-white font-mono tracking-tight">
        {value ?? "—"}
      </p>
      {subtext && (
        <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">{subtext}</p>
      )}
    </div>
  );
}

const METHOD_STYLES: Record<string, string> = {
  GET: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  POST: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  PUT: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  DELETE: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  PATCH: "bg-purple-500/15 text-purple-300 border-purple-500/30",
};

export default function RepositoryOverviewPage({ params }: { params: { repoId: string } }) {
  const [repo, setRepo] = useState<Repository | null>(null);
  const [summary, setSummary] = useState<RepositorySummary | null>(null);
  const [architecture, setArchitecture] = useState<any>(null);
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([]);
  const [dependencies, setDependencies] = useState<DependencyItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
    Promise.all([
      repoService.getRepository(params.repoId),
      repoService.getSummary(params.repoId),
      repoService.getArchitectureDiagrams(params.repoId),
      repoService.getApiEndpoints(params.repoId),
      repoService.getDependencies(params.repoId),
    ])
      .then(([repoData, summaryData, archData, apisData, depsData]) => {
        if (!repoData) {
          setError(true);
          return;
        }
        setRepo(repoData);
        if (summaryData) setSummary(summaryData);
        if (archData) setArchitecture(archData);
        if (Array.isArray(apisData)) setEndpoints(apisData);
        else if (apisData?.endpoints) setEndpoints(apisData.endpoints);

        if (Array.isArray(depsData)) setDependencies(depsData);
        else if (depsData?.dependencies) setDependencies(depsData.dependencies);

        // Silently refresh live GitHub stats in background
        repoService.refreshRepositoryStats(params.repoId).then((fresh) => {
          if (fresh) setRepo((prev) => (prev ? { ...prev, ...fresh } : fresh));
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

  const handleCopyLink = () => {
    if (repo?.github_url) {
      navigator.clipboard.writeText(repo.github_url);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  if (error) {
    return (
      <div className="p-8 flex flex-col items-center justify-center gap-4 text-center h-full">
        <p className="text-slate-400 text-sm">Failed to load repository data.</p>
        <button
          onClick={() => {
            setError(false);
            repoService.getRepository(params.repoId).then((d) => d && setRepo(d));
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
      <div className="p-8 text-slate-400 text-xs font-mono animate-pulse flex items-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
        <span>Loading repository overview and metrics...</span>
      </div>
    );
  }

  const locCount = summary?.loc_count ?? repo.lines_of_code ?? repo.loc_count ?? 0;
  const fileCount = summary?.file_count ?? repo.total_files ?? repo.file_count ?? 0;
  const sizeBytes = summary?.repository_size_bytes ?? repo.size_bytes ?? 0;
  const totalApis = summary?.endpoints_count ?? endpoints.length ?? 0;
  const totalDeps = dependencies.length || 0;

  return (
    <div className="h-full overflow-y-auto p-6 md:p-8 space-y-8 bg-[#07090e] custom-scrollbar">
      {/* 1. Hero Identity Banner */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl relative overflow-hidden border border-white/[0.08] shadow-2xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-3xl font-extrabold text-white tracking-tight">{repo.full_name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                {repo.visibility || "Public"}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Analyzed &amp; Grounded
              </span>
            </div>

            <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
              {repo.description || "A software repository analyzed with automated technical documentation and AST extraction."}
            </p>

            {/* Tech Stack Badges */}
            {summary?.tech_stack && summary.tech_stack.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap pt-2">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mr-1">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  Tech Stack:
                </span>
                {summary.tech_stack.map((tech) => (
                  <span
                    key={tech}
                    className="px-2.5 py-1 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-lg text-xs font-mono text-slate-200 transition duration-150"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-center gap-2.5 flex-shrink-0">
            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              title="Refresh live GitHub stats"
              className="p-2.5 rounded-xl border border-white/[0.08] hover:border-white/[0.18] bg-white/[0.02] hover:bg-white/[0.06] text-slate-300 hover:text-white transition duration-200 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-indigo-400" : ""}`} />
            </button>

            <button
              onClick={handleCopyLink}
              title="Copy GitHub URL"
              className="p-2.5 rounded-xl border border-white/[0.08] hover:border-white/[0.18] bg-white/[0.02] hover:bg-white/[0.06] text-slate-300 hover:text-white transition duration-200"
            >
              {copiedUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            <a
              href={repo.github_url || `https://github.com/${repo.full_name}`}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2.5 rounded-xl border border-white/[0.08] hover:border-white/[0.18] bg-white/[0.02] hover:bg-white/[0.06] text-slate-200 hover:text-white transition duration-200 flex items-center gap-1.5 text-xs font-semibold"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <Link
              href={`/repositories/${params.repoId}/wiki`}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Explore Wiki</span>
            </Link>
          </div>
        </div>

        {/* 2. Key Metrics 8-Card Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 pt-6 border-t border-white/[0.06] mt-6">
          <StatCard
            icon={Code2}
            iconColor="text-indigo-400"
            label="Lines of Code"
            value={locCount > 0 ? locCount.toLocaleString() : "—"}
            subtext="source code"
          />
          <StatCard
            icon={FolderTree}
            iconColor="text-cyan-400"
            label="Total Files"
            value={fileCount > 0 ? fileCount.toLocaleString() : "—"}
            subtext="parsed files"
          />
          <StatCard
            icon={Star}
            iconColor="text-amber-400"
            label="GitHub Stars"
            value={repo.stars != null ? repo.stars.toLocaleString() : "0"}
            subtext="live stars"
          />
          <StatCard
            icon={GitFork}
            iconColor="text-purple-400"
            label="Forks"
            value={repo.forks != null ? repo.forks.toLocaleString() : "0"}
            subtext="forked repos"
          />
          <StatCard
            icon={Users}
            iconColor="text-emerald-400"
            label="Contributors"
            value={(repo.contributors_count ?? 0) > 0 ? (repo.contributors_count ?? 1).toLocaleString() : "1"}
            subtext="contributors"
          />
          <StatCard
            icon={HardDrive}
            iconColor="text-rose-400"
            label="Repo Size"
            value={formatBytes(sizeBytes)}
            subtext="disk volume"
          />
          <StatCard
            icon={Server}
            iconColor="text-blue-400"
            label="APIs Detected"
            value={totalApis > 0 ? totalApis : "0"}
            subtext="REST routes"
          />
          <StatCard
            icon={Package}
            iconColor="text-orange-400"
            label="Dependencies"
            value={totalDeps > 0 ? totalDeps : "0"}
            subtext="manifest packages"
          />
        </div>

        {/* 3. Languages Breakdown Multi-Color Bar */}
        {summary?.languages && summary.languages.length > 0 && (
          <div className="pt-5 border-t border-white/[0.04] mt-5 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-200">Language Distribution</span>
              <span className="font-mono text-[11px] text-slate-400">
                {summary.languages.map((l) => `${l.name} (${l.percentage}%)`).slice(0, 4).join(" • ")}
              </span>
            </div>
            <div className="w-full h-2.5 bg-white/[0.06] rounded-full overflow-hidden flex">
              {summary.languages.map((lang, idx) => {
                const colors = [
                  "bg-indigo-500",
                  "bg-amber-400",
                  "bg-cyan-400",
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
            <div className="flex items-center gap-4 flex-wrap text-xs font-mono text-slate-400 pt-1">
              {summary.languages.map((lang, idx) => {
                const dotColors = [
                  "bg-indigo-500",
                  "bg-amber-400",
                  "bg-cyan-400",
                  "bg-emerald-500",
                  "bg-rose-500",
                  "bg-purple-500",
                ];
                return (
                  <div key={lang.name} className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${dotColors[idx % dotColors.length]}`} />
                    <span className="text-slate-300 font-semibold">{lang.name}</span>
                    <span className="text-slate-500">({lang.loc.toLocaleString()} LOC)</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 4. Live Architecture Snapshot */}
      {architecture?.mermaid && (
        <div className="p-6 md:p-8 rounded-3xl bg-[#090b12] border border-white/[0.08] shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <Network className="w-4 h-4 text-cyan-400" />
                <span>System Architecture Topology</span>
              </h2>
              <p className="text-xs text-slate-400">
                Auto-extracted component graph mapping clients, application services, databases, and detected routes.
              </p>
            </div>
            <Link
              href={`/repositories/${params.repoId}/architecture`}
              className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-semibold text-slate-300 hover:text-white transition flex items-center gap-1.5"
            >
              <span>Full Visualizer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="h-80 w-full rounded-2xl overflow-hidden border border-white/[0.06]">
            <MermaidViewer chart={architecture.mermaid} />
          </div>
        </div>
      )}

      {/* 5. Two-Column Live Previews: APIs & Dependencies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Discovered REST Endpoints */}
        <div className="p-6 rounded-3xl bg-[#090b12] border border-white/[0.08] shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Server className="w-4 h-4 text-blue-400" />
                <span>Discovered REST Endpoints</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/10 text-blue-300 border border-blue-500/20">
                {totalApis} routes
              </span>
            </div>
            <p className="text-xs text-slate-400">
              HTTP endpoints detected from route handlers, Express/FastAPI declarations, and controller files.
            </p>

            <div className="space-y-2 pt-1">
              {endpoints.slice(0, 5).map((ep) => (
                <div
                  key={ep.id || `${ep.method}-${ep.path}`}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] text-xs font-mono transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${METHOD_STYLES[ep.method] || "bg-slate-800 text-slate-300"}`}>
                      {ep.method}
                    </span>
                    <span className="text-slate-200 font-semibold truncate">{ep.path}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 truncate max-w-[150px]">{ep.file_path || "handler"}</span>
                </div>
              ))}
            </div>
          </div>

          <Link
            href={`/repositories/${params.repoId}/apis`}
            className="w-full py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-xs font-semibold text-indigo-300 hover:text-white transition flex items-center justify-center gap-1.5"
          >
            <span>Explore all {totalApis} endpoints in APIs Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Right: Key Dependencies */}
        <div className="p-6 rounded-3xl bg-[#090b12] border border-white/[0.08] shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Package className="w-4 h-4 text-orange-400" />
                <span>Extracted Dependencies</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-500/10 text-orange-300 border border-orange-500/20">
                {totalDeps} packages
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Third-party libraries, runtime frameworks, and dev tools extracted from repository manifests.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {dependencies.slice(0, 8).map((dep) => (
                <div
                  key={dep.id || dep.name}
                  className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] text-xs font-mono transition flex items-center justify-between"
                >
                  <span className="text-slate-200 font-semibold truncate max-w-[130px]" title={dep.name}>
                    {dep.name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-normal">{dep.version}</span>
                </div>
              ))}
            </div>
          </div>

          <Link
            href={`/repositories/${params.repoId}/dependencies`}
            className="w-full py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-xs font-semibold text-orange-300 hover:text-white transition flex items-center justify-center gap-1.5"
          >
            <span>View all {totalDeps} dependencies</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 6. Feature Modules Navigation Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white tracking-tight">Repository Intelligence Hub</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link href={`/repositories/${params.repoId}/wiki`} className="p-6 rounded-2xl bg-[#090b12] border border-white/[0.08] hover:border-indigo-500/50 transition group space-y-3 shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition">Technical Wiki</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Structured documentation chapters detailing architecture, folder layouts, and onboarding guides.
              </p>
            </div>
          </Link>

          <Link href={`/repositories/${params.repoId}/files`} className="p-6 rounded-2xl bg-[#090b12] border border-white/[0.08] hover:border-emerald-500/50 transition group space-y-3 shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition">
              <FolderTree className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition">Smart Monaco Code Explorer</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                IDE-style source explorer with line-level AI explanation in Beginner, Intermediate, or Expert modes.
              </p>
            </div>
          </Link>

          <Link href={`/repositories/${params.repoId}/architecture`} className="p-6 rounded-2xl bg-[#090b12] border border-white/[0.08] hover:border-cyan-500/50 transition group space-y-3 shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition">Architecture Visualizer</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Interactive diagrams visualizing microservices, component boundaries, and import graphs.
              </p>
            </div>
          </Link>

          <Link href={`/repositories/${params.repoId}/database`} className="p-6 rounded-2xl bg-[#090b12] border border-white/[0.08] hover:border-purple-500/50 transition group space-y-3 shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition">Database ERD</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Automated entity-relationship diagram discovery with foreign key mappings and column attributes.
              </p>
            </div>
          </Link>

          <Link href={`/repositories/${params.repoId}/security`} className="p-6 rounded-2xl bg-[#090b12] border border-white/[0.08] hover:border-rose-500/50 transition group space-y-3 shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:scale-110 transition">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-rose-300 transition">Security Audit</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Detects hardcoded secrets, injection vectors, and data masking compliance across code files.
              </p>
            </div>
          </Link>

          <Link href={`/repositories/${params.repoId}/learning`} className="p-6 rounded-2xl bg-[#090b12] border border-white/[0.08] hover:border-amber-500/50 transition group space-y-3 shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition">Interactive Learning Hub</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Quizzes, flashcards, interview prep, and step-by-step developer onboarding roadmaps.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
