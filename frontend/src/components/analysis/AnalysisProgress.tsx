"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Check, Loader2, ArrowRight, AlertTriangle, RefreshCw } from "lucide-react";
import { ProgressEvent } from "@/hooks/useAnalysisEvents";
import { repoService } from "@/lib/api/client";
import { Repository } from "@/types";

interface AnalysisProgressProps {
  event: ProgressEvent;
  analysisId: string;
  repoId?: string;
}

interface TimelineStage {
  id: string;
  title: string;
  description: string;
  threshold: number;
}

const PIPELINE_STAGES: TimelineStage[] = [
  {
    id: "STAGE_01 // INGESTION",
    title: "Repository connection & file tree",
    description: "Cloned source archive and indexed file tree hierarchy.",
    threshold: 25,
  },
  {
    id: "STAGE_02 // AST_PARSER",
    title: "Syntax tree & symbol analysis",
    description: "Parsed AST symbols, function signatures, and route decorators.",
    threshold: 50,
  },
  {
    id: "STAGE_03 // DEPENDENCIES",
    title: "Dependency & manifest resolution",
    description: "Resolved requirements, lockfiles, and cross-package links.",
    threshold: 70,
  },
  {
    id: "STAGE_04 // EMBEDDINGS",
    title: "Semantic chunking & vector indexing",
    description: "Generated vector embeddings and stored symbol chunks.",
    threshold: 88,
  },
  {
    id: "STAGE_05 // SYNTHESIS",
    title: "Technical documentation & topology",
    description: "Compiled 5-chapter wiki and Mermaid architecture graphs.",
    threshold: 100,
  },
];

export function AnalysisProgressCard({ event, analysisId, repoId }: AnalysisProgressProps) {
  const currentProgress = event.progress ?? (event.status === "completed" ? 100 : 15);
  const isCompleted = currentProgress >= 100 || event.status === "completed";
  const isFailed = event.status === "failed";
  const targetRepoId = event.repository_id || repoId || "repo-123";

  const [repo, setRepo] = useState<Repository | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (targetRepoId) {
      repoService
        .getRepository(targetRepoId)
        .then((data) => {
          if (isMounted && data) {
            setRepo(data);
          }
        })
        .catch(() => {
          // Non-critical fallback
        });
    }
    return () => {
      isMounted = false;
    };
  }, [targetRepoId]);

  const targetUrl = targetRepoId
    ? `/repositories/${targetRepoId}/overview`
    : `/dashboard`;

  return (
    <div className="w-full max-w-2xl bg-[#171717] border border-[#292929] rounded-sm p-6 sm:p-8 space-y-7 shadow-2xl">
      
      {/* 1. Compact Left-Aligned Status Header */}
      <div className="space-y-1.5 text-left">
        <div className="font-mono text-[11px] text-[#777777] tracking-wider uppercase flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-[#F5F5F5] rounded-none" />
          <span>PIPELINE CONSOLE // {isCompleted ? "COMPLETE" : isFailed ? "FAILED" : "PROCESSING"}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F5F5F5] font-sans">
          {isCompleted
            ? "Repository analyzed."
            : isFailed
            ? "Analysis failed."
            : "Analyzing repository."}
        </h1>

        <p className="text-sm text-[#BDBDBD] font-sans leading-relaxed">
          {isCompleted
            ? "Your codebase is ready to explore."
            : isFailed
            ? (event.failure_reason || "Process encountered an unrecoverable pipeline error.")
            : (event.message || "Building structured repository understanding...")}
        </p>
      </div>

      {/* 2. Compact Horizontal Metadata & Real Metrics Summary */}
      <div className="bg-[#1D1D1D] border border-[#292929] rounded-sm p-3.5 flex flex-wrap items-center justify-between gap-y-2 gap-x-4 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-[#777777]">STATUS:</span>
          <span className="text-[#F5F5F5] font-semibold">
            {isCompleted ? "ANALYZED" : isFailed ? "ERROR" : "RUNNING"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[#777777]">ID:</span>
          <span className="text-[#BDBDBD] truncate max-w-[120px] sm:max-w-[160px]" title={analysisId}>
            {analysisId ? (analysisId.length > 12 ? `${analysisId.slice(0, 12)}…` : analysisId) : "active"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[#777777]">REPO:</span>
          <span className="text-[#F5F5F5] truncate max-w-[140px] sm:max-w-[200px]">
            {repo?.full_name || repo?.name || (targetRepoId ? `repo-${targetRepoId.slice(0, 6)}` : "repowiki-ai")}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[#777777]">BRANCH:</span>
          <span className="text-[#BDBDBD]">{repo?.default_branch || "main"}</span>
        </div>
      </div>

      {/* 3. Thin Neutral-Gray Progress Line & Percentage Label */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[#777777] uppercase text-[11px] tracking-wider">
            {isCompleted ? "Pipeline Complete" : isFailed ? "Halted" : "Analyzing Codebase"}
          </span>
          <span className="text-[#F5F5F5] font-medium">{currentProgress}%</span>
        </div>

        <div className="w-full h-1 bg-[#292929] rounded-none overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              isFailed ? "bg-red-400" : "bg-[#F5F5F5]"
            }`}
            style={{ width: `${currentProgress}%` }}
          />
        </div>
      </div>

      {/* 4. Compact Pipeline Timeline (No Clipped Rows, Consistent Spacing) */}
      <div className="space-y-2">
        <div className="text-[11px] font-mono text-[#777777] uppercase tracking-wider">
          Execution Stages
        </div>

        <div className="border border-[#292929] bg-[#171717] rounded-sm divide-y divide-[#292929]">
          {PIPELINE_STAGES.map((stage) => {
            const isStageDone = isCompleted || currentProgress >= stage.threshold;
            const isStageCurrent =
              !isCompleted &&
              !isFailed &&
              currentProgress < stage.threshold &&
              currentProgress >= stage.threshold - 25;

            return (
              <div
                key={stage.id}
                className="px-4 py-3 flex items-center justify-between gap-3 text-xs transition-colors hover:bg-[#1D1D1D]/50"
              >
                {/* Left: Indicator + Labels */}
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-5 h-5 rounded-none border border-[#292929] bg-[#1D1D1D] flex items-center justify-center shrink-0 mt-0.5">
                    {isStageDone ? (
                      <Check className="w-3.5 h-3.5 text-[#F5F5F5]" />
                    ) : isStageCurrent ? (
                      <Loader2 className="w-3 h-3 text-[#BDBDBD] animate-spin" />
                    ) : (
                      <span className="w-1.5 h-1.5 bg-[#777777] rounded-none" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <span className="font-mono text-[10px] text-[#777777] block tracking-tight">
                      {stage.id}
                    </span>
                    <span className="font-sans font-medium text-xs text-[#F5F5F5] block truncate">
                      {stage.title}
                    </span>
                    <span className="font-sans text-[11px] text-[#BDBDBD] block truncate">
                      {stage.description}
                    </span>
                  </div>
                </div>

                {/* Right: Stage Status Tag */}
                <div className="shrink-0 font-mono text-[11px] text-right">
                  {isStageDone ? (
                    <span className="text-[#F5F5F5] font-semibold">DONE</span>
                  ) : isStageCurrent ? (
                    <span className="text-[#BDBDBD]">IN PROGRESS</span>
                  ) : (
                    <span className="text-[#777777]">QUEUED</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Refined Actions Footer */}
      {isCompleted && (
        <div className="pt-2 border-t border-[#292929] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="font-mono text-[11px] text-[#777777]">
            Documentation synthesized • Ready for navigation
          </div>

          <Link
            href={targetUrl}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#F5F5F5] hover:bg-[#E0E0E0] text-[#0C0C0C] font-semibold text-xs tracking-tight rounded-sm transition-colors duration-150 inline-flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#F5F5F5] active:scale-[0.99]"
          >
            <span>Explore repository →</span>
          </Link>
        </div>
      )}

      {isFailed && (
        <div className="pt-4 border-t border-[#292929] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-[#F5F5F5]">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span className="text-[#BDBDBD]">
              {event.failure_reason || "Analysis failed. Please check repository permissions or network connectivity."}
            </span>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 border border-[#292929] hover:bg-[#1D1D1D] text-[#F5F5F5] text-xs font-mono rounded-sm transition-colors flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#F5F5F5]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry analysis</span>
          </button>
        </div>
      )}

      {!isCompleted && !isFailed && (
        <div className="pt-2 border-t border-[#292929] flex items-center justify-between text-xs font-mono text-[#777777]">
          <span>Processing AST syntax grammars...</span>
          <span>Elapsed: ~12s</span>
        </div>
      )}

    </div>
  );
}
