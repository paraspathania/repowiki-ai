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
    <div className="w-full max-w-2xl mx-auto bg-panel border border-border rounded-xl p-8 space-y-8 shadow-2xl">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold text-white">
          {isCompleted ? "Analysis Complete!" : isFailed ? "Analysis Failed" : "Analyzing Repository"}
        </h2>
        <p className="text-gray-400 text-sm">{event.message || "Building structured repository understanding..."}</p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-semibold text-gray-400">
          <span>Progress</span>
          <span>{currentProgress}%</span>
        </div>
        <div className="w-full h-3 bg-surface border border-border rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isFailed ? "bg-red-500" : isCompleted ? "bg-accent" : "bg-accent-blue"
            }`}
            style={{ width: `${currentProgress}%` }}
          />
        </div>
      </div>

      {/* Stages Timeline */}
      <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
        {STAGES.map((s) => {
          const isDone = currentProgress > s.weight || isCompleted;
          const isCurrent = currentProgress <= s.weight && currentProgress > (s.weight - 10) && !isCompleted && !isFailed;

          return (
            <div key={s.id} className="flex items-center gap-3 text-sm">
              {isDone ? (
                <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-5 h-5 text-accent-blue animate-spin flex-shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-gray-600 flex-shrink-0" />
              )}
              <span className={isDone ? "text-gray-200" : isCurrent ? "text-accent-blue font-medium" : "text-gray-500"}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Action Footer */}
      {isCompleted && (
        <div className="pt-4 border-t border-border">
          <Link
            href={repoId ? `/repositories/${repoId}` : `/repositories/overview`}
            className="w-full py-3.5 bg-accent hover:bg-accent-hover text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition"
          >
            <span>Open Repository Workspace</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      )}

      {isFailed && (
        <div className="pt-4 border-t border-border flex items-center justify-between text-red-400 text-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            <span>Analysis process encountered an error.</span>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-950 border border-red-800 rounded-lg text-white text-xs font-semibold hover:bg-red-900 transition"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
