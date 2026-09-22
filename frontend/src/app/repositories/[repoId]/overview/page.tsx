"use client";

import { useEffect, useState } from "react";
import { 
  LayoutDashboard, 
  Code, 
  Cpu, 
  HardDrive, 
  FileCode, 
  Loader2, 
  AlertTriangle, 
  Lock, 
  RefreshCw 
} from "lucide-react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface LanguageStat {
  name: string;
  loc: number;
  files: number;
  percentage: number;
}

interface SummaryData {
  repository_id?: string;
  analysis_id?: string;
  status: string;
  progress?: number;
  failure_reason?: string;
  message?: string;
  tech_stack?: string[];
  file_count?: number;
  loc_count?: number;
  repository_size_bytes?: number;
  languages?: LanguageStat[];
  endpoints_count?: number;
}

const COLOR_PALETTE = [
  "from-blue-500 to-indigo-500",
  "from-amber-400 to-orange-500",
  "from-emerald-400 to-teal-500",
  "from-purple-500 to-pink-500",
  "from-cyan-400 to-blue-500",
  "from-rose-400 to-red-500",
];

const DOT_COLORS = [
  "bg-indigo-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-purple-500",
  "bg-cyan-500",
  "bg-rose-500",
];

export default function RepositoryOverviewPage({ params }: { params: { repoId: string } }) {
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);

  const fetchSummary = async () => {
    setLoading(true);
    setErrorStatus(null);
    try {
      const res = await fetch(`${API_BASE}/repositories/${params.repoId}/summary`);
      if (res.status === 404 || res.status === 403) {
        setErrorStatus(res.status);
        setData(null);
        return;
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Failed to fetch summary:", err);
      setErrorStatus(500);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [params.repoId]);

  const formatBytes = (bytes?: number) => {
    if (!bytes || bytes === 0) return "0 MB";
    const mb = bytes / (1024 * 1024);
    if (mb < 0.1) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${mb.toFixed(1)} MB`;
  };

  // State 1: Loading
  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-background min-h-[400px] space-y-4">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        <p className="text-slate-400 text-sm">Loading repository summary...</p>
      </div>
    );
  }

  // State 2: Inaccessible or Not Found (404/403)
  if (errorStatus === 404 || errorStatus === 403) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-background space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-white">Repository Inaccessible or Not Found</h2>
        <p className="text-slate-400 text-sm max-w-md">
          This repository either does not exist or is private. If it belongs to you, please sign in with the owner account to view its analysis.
        </p>
        <Link
          href="/"
          className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-slate-300 rounded-xl border border-white/[0.08] transition"
        >
          Return to Repositories
        </Link>
      </div>
    );
  }

  // State 3: Analysis In Progress (HTTP 202 or non-completed status)
  if (data && (data.status === "queued" || data.status === "cloning" || data.status === "scanning" || data.status === "parsing" || data.status === "indexing")) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-background space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 animate-pulse">
          <RefreshCw className="w-7 h-7 animate-spin" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">Analysis in Progress</h2>
          <p className="text-slate-400 text-sm max-w-md">
            The repository is currently being processed ({data.status}). Progress: {data.progress || 0}%.
          </p>
        </div>
        <div className="w-64 h-2 bg-surface border border-white/[0.06] rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500" 
            style={{ width: `${data.progress || 10}%` }}
          />
        </div>
        <button
          onClick={fetchSummary}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition"
        >
          Check Status
        </button>
      </div>
    );
  }

  // State 4: Analysis Failed
  if (data && data.status === "failed") {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-background space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-white">Analysis Failed</h2>
        <p className="text-slate-400 text-sm max-w-md">
          {data.failure_reason 
            ? `Reason: ${data.failure_reason}`
            : "An unexpected error occurred during repository analysis."}
        </p>
        <button
          onClick={fetchSummary}
          className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-slate-300 rounded-xl border border-white/[0.08] transition"
        >
          Retry Fetch
        </button>
      </div>
    );
  }

  // State 5: Completed
  const techStack = data?.tech_stack?.length ? data.tech_stack : ["Source Code"];
  const languages = data?.languages || [];

  return (
    <div className="w-full h-full overflow-y-auto p-8 space-y-8 custom-scrollbar relative bg-background">
      <div className="absolute inset-0 radial-glow-light pointer-events-none z-0" />

      <div className="relative z-10 space-y-8">
        {/* Hero Summary */}
        <div className="glass-panel p-6 md:p-8 rounded-2xl space-y-4 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 to-indigo-500" />
          
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
              <LayoutDashboard className="w-5.5 h-5.5 text-indigo-400" />
              <span>Repository Overview</span>
            </h2>
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold">
              Analyzed & Indexed
            </span>
          </div>

          <p className="text-slate-300 text-sm leading-relaxed max-w-3xl">
            Repository indexed with AST symbol extraction, semantic code chunking, and architectural inference.
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            {techStack.map((tech) => (
              <span key={tech} className="px-3 py-1 bg-white/[0.03] border border-white/[0.06] rounded-lg text-xs font-mono text-slate-300">
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {[
            { 
              label: "Relevant Files", 
              value: (data?.file_count ?? 0).toLocaleString(), 
              icon: FileCode, 
              color: "text-blue-400", 
              bg: "bg-blue-500/5 border-blue-500/10" 
            },
            { 
              label: "Lines of Code", 
              value: (data?.loc_count ?? 0).toLocaleString(), 
              icon: Code, 
              color: "text-emerald-400", 
              bg: "bg-emerald-500/5 border-emerald-500/10" 
            },
            { 
              label: "Repository Size", 
              value: formatBytes(data?.repository_size_bytes), 
              icon: HardDrive, 
              color: "text-amber-400", 
              bg: "bg-amber-500/5 border-amber-500/10" 
            },
            { 
              label: "Detected APIs", 
              value: `${data?.endpoints_count ?? 0} Endpoints`, 
              icon: Cpu, 
              color: "text-purple-400", 
              bg: "bg-purple-500/5 border-purple-500/10" 
            }
          ].map((stat, idx) => (
            <div key={idx} className={`glass-panel p-5 rounded-2xl space-y-3 shadow-xl ${stat.bg}`}>
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
                <span>{stat.label}</span>
                <stat.icon className={`w-4.5 h-4.5 ${stat.color}`} />
              </div>
              <p className="text-3xl font-extrabold text-white tracking-tight">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Language Breakdown */}
        <div className="glass-panel p-6 md:p-8 rounded-2xl space-y-6 shadow-xl">
          <h3 className="text-base font-bold text-white">Language Breakdown</h3>
          
          {languages.length === 0 ? (
            <p className="text-slate-400 text-xs">No language data recorded for this repository.</p>
          ) : (
            <div className="space-y-4">
              {/* Stacked Progress Bar */}
              <div className="w-full h-3 bg-surface border border-white/[0.04] rounded-full overflow-hidden flex p-[1px]">
                {languages.slice(0, 6).map((lang, idx) => (
                  <div
                    key={lang.name}
                    className={`h-full bg-gradient-to-r ${COLOR_PALETTE[idx % COLOR_PALETTE.length]} ${idx > 0 ? "ml-[2px]" : ""} rounded-full`}
                    style={{ width: `${lang.percentage}%` }}
                    title={`${lang.name}: ${lang.percentage}% (${lang.loc.toLocaleString()} lines)`}
                  />
                ))}
              </div>
              
              {/* Legend */}
              <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-300">
                {languages.slice(0, 6).map((lang, idx) => (
                  <div key={lang.name} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${DOT_COLORS[idx % DOT_COLORS.length]}`} />
                    <span>{lang.name} ({lang.percentage}%)</span>
                    <span className="text-slate-500 font-mono text-[10px]">
                      {lang.loc.toLocaleString()} LOC
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
