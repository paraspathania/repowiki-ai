"use client";

import { CheckCircle2, Circle, Loader2, AlertTriangle, ArrowRight } from "lucide-react";
import { ProgressEvent } from "@/hooks/useAnalysisEvents";
import Link from "next/link";

interface AnalysisProgressProps {
  event: ProgressEvent;
  analysisId: string;
  repoId?: string;
}

const STAGES = [
  { id: "connecting", label: "Connecting to GitHub", weight: 5 },
  { id: "metadata", label: "Fetching metadata", weight: 10 },
  { id: "cloning", label: "Cloning repository", weight: 20 },
  { id: "scanning", label: "Scanning files", weight: 25 },
  { id: "file_tree", label: "Building file tree", weight: 30 },
  { id: "languages", label: "Detecting languages", weight: 35 },
  { id: "frameworks", label: "Detecting frameworks", weight: 40 },
  { id: "parsing", label: "Parsing source code", weight: 50 },
  { id: "apis", label: "Detecting APIs", weight: 55 },
  { id: "database", label: "Detecting database models", weight: 60 },
  { id: "dependencies", label: "Building dependency graph", weight: 65 },
  { id: "chunking", label: "Chunking repository", weight: 75 },
  { id: "embeddings", label: "Generating embeddings", weight: 85 },
  { id: "summary", label: "Generating project summary", weight: 90 },
  { id: "wiki", label: "Generating Wiki", weight: 95 },
  { id: "architecture", label: "Generating architecture", weight: 98 },
  { id: "finalizing", label: "Finalizing workspace", weight: 100 },
];

export function AnalysisProgressCard({ event, analysisId, repoId }: AnalysisProgressProps) {
  const currentProgress = event.progress || 10;
  const isCompleted = currentProgress >= 100 || event.status === "completed";
  const isFailed = event.status === "failed";

  return (
    <div className="w-full max-w-2xl mx-auto glass-panel rounded-2xl p-8 space-y-8 shadow-2xl relative overflow-hidden animate-fade-in">
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 animate-pulse" />
      
      <div className="space-y-3 text-center">
        <h2 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-200 tracking-tight">
          {isCompleted ? "Analysis Complete!" : isFailed ? "Analysis Failed" : "Analyzing Repository"}
        </h2>
        <p className="text-slate-400 text-sm leading-relaxed max-w-md mx-auto">{event.message || "Building structured repository understanding..."}</p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-3">
        <div className="flex justify-between text-xs font-bold text-slate-400">
          <span className="uppercase tracking-wider">Progress</span>
          <span className="font-mono text-indigo-400">{currentProgress}%</span>
        </div>
        <div className="w-full h-3 bg-surface/50 border border-white/[0.06] rounded-full overflow-hidden p-[2px]">
          <div
            className={`h-full transition-all duration-500 rounded-full bg-gradient-to-r ${
              isFailed 
                ? "from-red-500 to-rose-600" 
                : isCompleted 
                  ? "from-emerald-500 to-teal-500" 
                  : "from-blue-500 via-indigo-500 to-purple-500"
            }`}
            style={{ width: `${currentProgress}%` }}
          />
        </div>
      </div>

      {/* Stages Timeline */}
      <div className="space-y-3.5 max-h-80 overflow-y-auto pr-2 custom-scrollbar border border-white/[0.04] bg-surface/20 rounded-xl p-4">
        {STAGES.map((s) => {
          const isDone = currentProgress > s.weight || isCompleted;
          const isCurrent = currentProgress <= s.weight && currentProgress > (s.weight - 10) && !isCompleted && !isFailed;

          return (
            <div key={s.id} className="flex items-center gap-3.5 text-sm transition-all duration-300">
              {isDone ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-5 h-5 text-indigo-400 animate-spin flex-shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-slate-700 flex-shrink-0" />
              )}
              <span className={isDone ? "text-slate-200" : isCurrent ? "text-indigo-300 font-semibold" : "text-slate-500"}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Action Footer */}
      {isCompleted && (
        <div className="pt-4 border-t border-white/[0.06]">
          <Link
            href={repoId ? `/repositories/${repoId}` : `/repositories/overview`}
            className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2.5 transition duration-300 shadow-xl shadow-indigo-500/15 active:scale-[0.99] shimmer-btn"
          >
            <span>Open Repository Workspace</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      )}

      {isFailed && (
        <div className="pt-6 border-t border-white/[0.06] flex flex-col md:flex-row md:items-center justify-between gap-4 text-rose-300 text-sm">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <span>Analysis process encountered an error.</span>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-white text-xs font-bold hover:bg-rose-500/20 transition duration-200"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
