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
  Package,
  ExternalLink,
  Copy,
  Check,
  ArrowRight,
  Database,
  GitBranch,
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

const MONO_SHADES = [
  "bg-[#F5F5F5]",
  "bg-[#D4D4D4]",
  "bg-[#A3A3A3]",
  "bg-[#737373]",
  "bg-[#525252]",
  "bg-[#404040]",
];

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
    Promise.allSettled([
      repoService.getRepository(params.repoId),
      repoService.getSummary(params.repoId),
      repoService.getArchitectureDiagrams(params.repoId),
      repoService.getApiEndpoints(params.repoId),
      repoService.getDependencies(params.repoId),
    ]).then(([repoRes, summaryRes, archRes, apisRes, depsRes]) => {
      const repoData = repoRes.status === "fulfilled" ? repoRes.value : null;
      const summaryData = summaryRes.status === "fulfilled" ? summaryRes.value : null;
      const archData = archRes.status === "fulfilled" ? archRes.value : null;
      const apisData = apisRes.status === "fulfilled" ? apisRes.value : null;
      const depsData = depsRes.status === "fulfilled" ? depsRes.value : null;

      if (repoData) {
        setRepo(repoData);
      }
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
    });
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
      <div className="p-8 flex flex-col items-center justify-center gap-4 text-center h-full bg-[#0A0A0A] font-mono text-xs">
        <p className="text-[#A3A3A3]">Failed to load repository data.</p>
        <button
          onClick={() => {
            setError(false);
            repoService.getRepository(params.repoId).then((d) => d && setRepo(d));
          }}
          className="px-4 py-2 rounded-sm bg-[#F5F5F5] hover:bg-[#E0E0E0] text-[#111111] font-semibold transition"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!repo) {
    return (
      <div className="p-8 text-[#737373] text-xs font-mono flex items-center gap-2 bg-[#0A0A0A] h-full">
        <RefreshCw className="w-4 h-4 animate-spin text-[#A3A3A3]" />
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
    <div className="h-full overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6 bg-[#0A0A0A] text-[#F5F5F5] custom-scrollbar">
      
      {/* 1. Concise Repository Header Container */}
      <div className="bg-[#141414] border border-[#303030] rounded-sm p-5 sm:p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
          <div className="space-y-2 flex-1">
            {/* Metadata row */}
            <div className="flex items-center gap-3 flex-wrap font-mono text-[11px]">
              <span className="px-2 py-0.5 border border-[#303030] bg-[#1D1D1D] text-[#737373] uppercase font-medium rounded-sm">
                {repo.visibility || "PUBLIC"}
              </span>
              <span className="flex items-center gap-1.5 text-[#A3A3A3]">
                <span className="w-1.5 h-1.5 bg-[#F5F5F5] rounded-none inline-block" />
                ANALYZED &amp; GROUNDED
              </span>
              <span className="text-[#737373] flex items-center gap-1">
                <GitBranch className="w-3 h-3 text-[#737373]" />
                {repo.default_branch || "main"}
              </span>
            </div>

            {/* Primary Heading */}
            <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F5F5] font-mono tracking-tight">
              {repo.full_name}
            </h1>

            {/* Description */}
            <p className="text-xs sm:text-sm text-[#A3A3A3] max-w-2xl leading-relaxed font-sans">
              {repo.description || "A software repository analyzed with automated technical documentation and AST extraction."}
            </p>

            {/* Tech Stack Chips */}
            {summary?.tech_stack && summary.tech_stack.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[11px] font-mono text-[#737373] mr-1">STACK:</span>
                {summary.tech_stack.map((tech) => (
                  <span
                    key={tech}
                    className="px-2 py-0.5 bg-[#1D1D1D] border border-[#303030] rounded-sm text-[11px] font-mono text-[#A3A3A3]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons: 1 Primary CTA + Quiet Secondary Actions */}
          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              title="Refresh repository stats"
              className="p-2 rounded-sm border border-[#303030] bg-[#141414] hover:bg-[#1D1D1D] text-[#737373] hover:text-[#F5F5F5] transition duration-150 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-[#F5F5F5]" : ""}`} />
            </button>

            <button
              onClick={handleCopyLink}
              title="Copy GitHub URL"
              className="p-2 rounded-sm border border-[#303030] bg-[#141414] hover:bg-[#1D1D1D] text-[#737373] hover:text-[#F5F5F5] transition duration-150"
            >
              {copiedUrl ? <Check className="w-3.5 h-3.5 text-[#F5F5F5]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            <a
              href={repo.github_url || `https://github.com/${repo.full_name}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 rounded-sm border border-[#303030] bg-[#141414] hover:bg-[#1D1D1D] text-[#A3A3A3] hover:text-[#F5F5F5] text-xs font-mono transition duration-150 flex items-center gap-1.5"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3 text-[#737373]" />
            </a>

            <Link
              href={`/repositories/${params.repoId}/wiki`}
              className="px-4 py-2 rounded-sm bg-[#F5F5F5] hover:bg-[#E0E0E0] text-[#111111] font-semibold text-xs tracking-tight transition duration-150 flex items-center gap-2"
            >
              <span>Explore Wiki →</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Metric Strip: Single Structured Region with Vertical Dividers */}
      <div className="bg-[#141414] border border-[#303030] rounded-sm grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 divide-y sm:divide-y-0 sm:divide-x divide-[#303030]">
        
        {/* Metric 1: Lines of Code */}
        <div className="p-4 sm:p-5 flex flex-col justify-between">
          <span className="font-mono text-[10px] text-[#737373] uppercase tracking-wider block mb-1">
            Lines of Code
          </span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-[#F5F5F5] tracking-tight">
            {locCount > 0 ? locCount.toLocaleString() : "—"}
          </span>
          <span className="text-[10px] font-mono text-[#737373] mt-1">source code</span>
        </div>

        {/* Metric 2: Total Files */}
        <div className="p-4 sm:p-5 flex flex-col justify-between">
          <span className="font-mono text-[10px] text-[#737373] uppercase tracking-wider block mb-1">
            Total Files
          </span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-[#F5F5F5] tracking-tight">
            {fileCount > 0 ? fileCount.toLocaleString() : "—"}
          </span>
          <span className="text-[10px] font-mono text-[#737373] mt-1">parsed files</span>
        </div>

        {/* Metric 3: GitHub Stars */}
        <div className="p-4 sm:p-5 flex flex-col justify-between">
          <span className="font-mono text-[10px] text-[#737373] uppercase tracking-wider block mb-1">
            GitHub Stars
          </span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-[#F5F5F5] tracking-tight">
            {repo.stars != null ? repo.stars.toLocaleString() : "0"}
          </span>
          <span className="text-[10px] font-mono text-[#737373] mt-1">stars</span>
        </div>

        {/* Metric 4: Forks */}
        <div className="p-4 sm:p-5 flex flex-col justify-between">
          <span className="font-mono text-[10px] text-[#737373] uppercase tracking-wider block mb-1">
            Forks
          </span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-[#F5F5F5] tracking-tight">
            {repo.forks != null ? repo.forks.toLocaleString() : "0"}
          </span>
          <span className="text-[10px] font-mono text-[#737373] mt-1">forked repos</span>
        </div>

        {/* Metric 5: Contributors */}
        <div className="p-4 sm:p-5 flex flex-col justify-between">
          <span className="font-mono text-[10px] text-[#737373] uppercase tracking-wider block mb-1">
            Contributors
          </span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-[#F5F5F5] tracking-tight">
            {(repo.contributors_count ?? 1).toLocaleString()}
          </span>
          <span className="text-[10px] font-mono text-[#737373] mt-1">authors</span>
        </div>

        {/* Metric 6: Repo Size */}
        <div className="p-4 sm:p-5 flex flex-col justify-between">
          <span className="font-mono text-[10px] text-[#737373] uppercase tracking-wider block mb-1">
            Repo Size
          </span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-[#F5F5F5] tracking-tight">
            {formatBytes(sizeBytes)}
          </span>
          <span className="text-[10px] font-mono text-[#737373] mt-1">disk size</span>
        </div>

        {/* Metric 7: APIs Detected */}
        <div className="p-4 sm:p-5 flex flex-col justify-between">
          <span className="font-mono text-[10px] text-[#737373] uppercase tracking-wider block mb-1">
            APIs Detected
          </span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-[#F5F5F5] tracking-tight">
            {totalApis}
          </span>
          <span className="text-[10px] font-mono text-[#737373] mt-1">routes</span>
        </div>

        {/* Metric 8: Dependencies */}
        <div className="p-4 sm:p-5 flex flex-col justify-between">
          <span className="font-mono text-[10px] text-[#737373] uppercase tracking-wider block mb-1">
            Dependencies
          </span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-[#F5F5F5] tracking-tight">
            {totalDeps}
          </span>
          <span className="text-[10px] font-mono text-[#737373] mt-1">packages</span>
        </div>
      </div>

      {/* 3. Monochrome Proportional Language Distribution */}
      {summary?.languages && summary.languages.length > 0 && (
        <div className="bg-[#141414] border border-[#303030] rounded-sm p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-[#737373] uppercase tracking-wider">
            <span>Language Distribution</span>
            <span>{summary.languages.length} identified</span>
          </div>

          {/* Thin monochrome proportional bar */}
          <div className="w-full h-1.5 bg-[#1D1D1D] rounded-none overflow-hidden flex">
            {summary.languages.map((lang, idx) => (
              <div
                key={lang.name}
                className={`h-full ${MONO_SHADES[idx % MONO_SHADES.length]}`}
                style={{ width: `${lang.percentage}%` }}
                title={`${lang.name}: ${lang.percentage}% (${lang.loc.toLocaleString()} LOC)`}
              />
            ))}
          </div>

          {/* Aligned monospace breakdown items */}
          <div className="flex items-center gap-5 flex-wrap text-xs font-mono pt-1">
            {summary.languages.map((lang, idx) => (
              <div key={lang.name} className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-none inline-block ${MONO_SHADES[idx % MONO_SHADES.length]}`} />
                <span className="text-[#F5F5F5] font-medium">{lang.name}</span>
                <span className="text-[#A3A3A3]">{lang.percentage}%</span>
                <span className="text-[#737373]">({lang.loc.toLocaleString()} LOC)</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Live Architecture Snapshot */}
      {architecture?.mermaid && (
        <div className="bg-[#141414] border border-[#303030] rounded-sm p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-sm font-semibold text-[#F5F5F5] font-sans flex items-center gap-2">
                <Network className="w-3.5 h-3.5 text-[#737373]" />
                <span>System Architecture Topology</span>
              </h2>
              <p className="text-xs text-[#737373]">
                Auto-extracted component graph mapping clients, application services, and routes.
              </p>
            </div>
            <Link
              href={`/repositories/${params.repoId}/architecture`}
              className="px-2.5 py-1 rounded-sm border border-[#303030] bg-[#1D1D1D] hover:bg-[#252525] text-xs font-mono text-[#A3A3A3] hover:text-[#F5F5F5] transition flex items-center gap-1.5"
            >
              <span>Full Visualizer →</span>
            </Link>
          </div>
          <div className="h-80 w-full rounded-sm overflow-hidden border border-[#303030] bg-[#0A0A0A]">
            <MermaidViewer chart={architecture.mermaid} />
          </div>
        </div>
      )}

      {/* 5. Refined Technical Sections: Discovered REST Endpoints & Dependencies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Discovered REST Endpoints */}
        <div className="bg-[#141414] border border-[#303030] rounded-sm p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#F5F5F5] font-sans flex items-center gap-2">
                <Server className="w-3.5 h-3.5 text-[#737373]" />
                <span>Discovered REST Endpoints</span>
              </h3>
              <span className="px-2 py-0.5 rounded-sm text-[10px] font-mono text-[#737373] border border-[#303030] bg-[#1D1D1D]">
                {totalApis} routes
              </span>
            </div>
            <p className="text-xs text-[#737373]">
              HTTP endpoints detected from route handlers, Express/FastAPI declarations, and controller files.
            </p>

            <div className="divide-y divide-[#303030] border-y border-[#303030] pt-1">
              {endpoints.slice(0, 5).map((ep) => (
                <div
                  key={ep.id || `${ep.method}-${ep.path}`}
                  className="py-2.5 flex items-center justify-between gap-3 text-xs font-mono"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="font-mono text-[11px] font-bold text-[#F5F5F5] w-12 shrink-0">
                      {ep.method}
                    </span>
                    <span className="text-[#A3A3A3] truncate">{ep.path}</span>
                  </div>
                  <span className="text-[11px] text-[#737373] truncate shrink-0 max-w-[140px]">
                    {ep.file_path || "handler"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Link
            href={`/repositories/${params.repoId}/apis`}
            className="text-xs font-mono text-[#A3A3A3] hover:text-[#F5F5F5] transition pt-2 flex items-center gap-1.5"
          >
            <span>Explore all {totalApis} endpoints in APIs Hub →</span>
          </Link>
        </div>

        {/* Right: Key Dependencies */}
        <div className="bg-[#141414] border border-[#303030] rounded-sm p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#F5F5F5] font-sans flex items-center gap-2">
                <Package className="w-3.5 h-3.5 text-[#737373]" />
                <span>Extracted Dependencies</span>
              </h3>
              <span className="px-2 py-0.5 rounded-sm text-[10px] font-mono text-[#737373] border border-[#303030] bg-[#1D1D1D]">
                {totalDeps} packages
              </span>
            </div>
            <p className="text-xs text-[#737373]">
              Third-party libraries, runtime frameworks, and dev tools extracted from repository manifests.
            </p>

            <div className="divide-y divide-[#303030] border-y border-[#303030] pt-1">
              {dependencies.slice(0, 5).map((dep) => (
                <div
                  key={dep.id || dep.name}
                  className="py-2.5 flex items-center justify-between gap-3 text-xs font-mono"
                >
                  <span className="text-[#F5F5F5] truncate max-w-[180px]" title={dep.name}>
                    {dep.name}
                  </span>
                  <span className="text-[11px] text-[#737373] shrink-0 font-mono">
                    {dep.version}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Link
            href={`/repositories/${params.repoId}/dependencies`}
            className="text-xs font-mono text-[#A3A3A3] hover:text-[#F5F5F5] transition pt-2 flex items-center gap-1.5"
          >
            <span>View all {totalDeps} dependencies →</span>
          </Link>
        </div>
      </div>

      {/* 6. Repository Intelligence Hub */}
      <div className="space-y-3">
        <h2 className="text-xs font-mono uppercase tracking-wider text-[#737373]">
          Repository Intelligence Hub
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          <Link
            href={`/repositories/${params.repoId}/wiki`}
            className="p-4 rounded-sm bg-[#141414] border border-[#303030] hover:border-[#737373] transition duration-150 group space-y-2.5 flex flex-col justify-between"
          >
            <div className="w-7 h-7 rounded-sm bg-[#1D1D1D] border border-[#303030] flex items-center justify-center text-[#F5F5F5]">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-[#F5F5F5] font-sans">Technical Wiki</h3>
              <p className="text-[11px] text-[#737373] mt-1 leading-relaxed">
                Structured documentation chapters detailing architecture, folder layouts, and onboarding guides.
              </p>
            </div>
          </Link>

          <Link
            href={`/repositories/${params.repoId}/files`}
            className="p-4 rounded-sm bg-[#141414] border border-[#303030] hover:border-[#737373] transition duration-150 group space-y-2.5 flex flex-col justify-between"
          >
            <div className="w-7 h-7 rounded-sm bg-[#1D1D1D] border border-[#303030] flex items-center justify-center text-[#F5F5F5]">
              <FolderTree className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-[#F5F5F5] font-sans">Smart Monaco Code Explorer</h3>
              <p className="text-[11px] text-[#737373] mt-1 leading-relaxed">
                IDE-style source explorer with line-level AI explanation in Beginner, Intermediate, or Expert modes.
              </p>
            </div>
          </Link>

          <Link
            href={`/repositories/${params.repoId}/architecture`}
            className="p-4 rounded-sm bg-[#141414] border border-[#303030] hover:border-[#737373] transition duration-150 group space-y-2.5 flex flex-col justify-between"
          >
            <div className="w-7 h-7 rounded-sm bg-[#1D1D1D] border border-[#303030] flex items-center justify-center text-[#F5F5F5]">
              <Network className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-[#F5F5F5] font-sans">Architecture Visualizer</h3>
              <p className="text-[11px] text-[#737373] mt-1 leading-relaxed">
                Interactive diagrams visualizing microservices, component boundaries, and import graphs.
              </p>
            </div>
          </Link>

          <Link
            href={`/repositories/${params.repoId}/database`}
            className="p-4 rounded-sm bg-[#141414] border border-[#303030] hover:border-[#737373] transition duration-150 group space-y-2.5 flex flex-col justify-between"
          >
            <div className="w-7 h-7 rounded-sm bg-[#1D1D1D] border border-[#303030] flex items-center justify-center text-[#F5F5F5]">
              <Database className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-[#F5F5F5] font-sans">Database ERD</h3>
              <p className="text-[11px] text-[#737373] mt-1 leading-relaxed">
                Automated entity-relationship diagram discovery with foreign key mappings and column attributes.
              </p>
            </div>
          </Link>

          <Link
            href={`/repositories/${params.repoId}/security`}
            className="p-4 rounded-sm bg-[#141414] border border-[#303030] hover:border-[#737373] transition duration-150 group space-y-2.5 flex flex-col justify-between"
          >
            <div className="w-7 h-7 rounded-sm bg-[#1D1D1D] border border-[#303030] flex items-center justify-center text-[#F5F5F5]">
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-[#F5F5F5] font-sans">Security Audit</h3>
              <p className="text-[11px] text-[#737373] mt-1 leading-relaxed">
                Detects hardcoded secrets, injection vectors, and data masking compliance across code files.
              </p>
            </div>
          </Link>

          <Link
            href={`/repositories/${params.repoId}/learning`}
            className="p-4 rounded-sm bg-[#141414] border border-[#303030] hover:border-[#737373] transition duration-150 group space-y-2.5 flex flex-col justify-between"
          >
            <div className="w-7 h-7 rounded-sm bg-[#1D1D1D] border border-[#303030] flex items-center justify-center text-[#F5F5F5]">
              <GraduationCap className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-[#F5F5F5] font-sans">Interactive Learning Hub</h3>
              <p className="text-[11px] text-[#737373] mt-1 leading-relaxed">
                Quizzes, flashcards, interview prep, and step-by-step developer onboarding roadmaps.
              </p>
            </div>
          </Link>

        </div>
      </div>

    </div>
  );
}
