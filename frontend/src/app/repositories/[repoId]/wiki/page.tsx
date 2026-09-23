"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { WikiSidebar } from "@/components/wiki/WikiSidebar";
import { WikiSection as WikiSectionComponent, WikiSectionType } from "@/components/wiki/WikiSection";
import { apiClient } from "@/lib/api/client";
import { BookOpen, Sparkles, Loader2, AlertCircle, RefreshCw, Cpu, Bot } from "lucide-react";

export default function WikiPage({ params }: { params: { repoId: string } }) {
  const [wikiStatus, setWikiStatus] = useState<"not_generated" | "generating" | "ready" | "failed">("not_generated");
  const [generationMode, setGenerationMode] = useState<"llm" | "ast_fallback" | null>(null);
  const [errorReason, setErrorReason] = useState<string | null>(null);
  const [sections, setSections] = useState<WikiSectionType[]>([]);
  const [activeSectionSlug, setActiveSectionSlug] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [isTriggering, setIsTriggering] = useState<boolean>(false);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchWiki = useCallback(async () => {
    try {
      const res = await apiClient.get(`/repositories/${params.repoId}/wiki`);
      const data = res.data;

      const status = data.wiki_status || "not_generated";
      setWikiStatus(status);
      setGenerationMode(data.generation_mode || null);
      setErrorReason(data.error_reason || null);

      if (data.sections && data.sections.length > 0) {
        const formatted: WikiSectionType[] = data.sections.map((s: any) => ({
          id: s.id,
          slug: s.slug,
          title: s.title,
          content: s.content || "",
          status: s.status || "ready",
          citations: s.citations?.files ? s.citations.files.map((p: string) => ({ path: p })) : [],
        }));
        setSections(formatted);
        setActiveSectionSlug((prev) => (prev ? prev : formatted[0]?.slug || ""));
      }
      return status;
    } catch (err) {
      console.error("Failed to load wiki:", err);
      return "failed";
    } finally {
      setLoading(false);
    }
  }, [params.repoId]);

  useEffect(() => {
    fetchWiki().then((initialStatus) => {
      if (initialStatus === "generating") {
        startPolling();
      }
    });

    return () => {
      stopPolling();
    };
  }, [fetchWiki]);

  const startPolling = () => {
    stopPolling();
    pollTimerRef.current = setInterval(async () => {
      const status = await fetchWiki();
      if (status === "ready" || status === "failed") {
        stopPolling();
      }
    }, 3000);
  };

  const stopPolling = () => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  };

  const handleGenerate = async () => {
    try {
      setIsTriggering(true);
      setWikiStatus("generating");
      setErrorReason(null);
      await apiClient.post(`/repositories/${params.repoId}/wiki/generate`);
      startPolling();
    } catch (err: any) {
      console.error("Failed to trigger wiki generation:", err);
      setErrorReason(err?.response?.data?.detail || "Failed to trigger wiki generation.");
      setWikiStatus("failed");
    } finally {
      setIsTriggering(false);
    }
  };

  const activeSection = sections.find((s) => s.slug === activeSectionSlug);

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#07090e] text-slate-400 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
        <span className="text-sm font-mono">Loading repository wiki...</span>
      </div>
    );
  }

  // State 1: Not Generated
  if (wikiStatus === "not_generated") {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-[#07090e] text-center">
        <div className="max-w-lg border border-white/[0.08] rounded-2xl bg-[#090b12] p-8 shadow-2xl flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-5">
            <BookOpen className="w-7 h-7 text-indigo-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Automated Technical Wiki</h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-md mb-6">
            Generate 5 structured chapters detailing your codebase: System Overview, Architecture & Component Flow, Core Modules, REST APIs, and Getting Started.
          </p>
          <button
            onClick={handleGenerate}
            disabled={isTriggering}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
          >
            {isTriggering ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>Generate Technical Wiki</span>
          </button>
        </div>
      </div>
    );
  }

  // State 2: Generating
  if (wikiStatus === "generating") {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-[#07090e] text-center">
        <div className="max-w-md border border-white/[0.08] rounded-2xl bg-[#090b12] p-8 shadow-2xl flex flex-col items-center">
          <div className="relative mb-5">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-indigo-400 animate-pulse" />
            </div>
            <Loader2 className="w-5 h-5 animate-spin text-indigo-400 absolute -top-1 -right-1" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Synthesizing Wiki Chapters</h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            Synthesizing code AST, symbol tables, dependencies, and API signatures into comprehensive technical chapters...
          </p>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-400">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Generation in progress...</span>
          </div>
        </div>
      </div>
    );
  }

  // State 3: Failed
  if (wikiStatus === "failed") {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-[#07090e] text-center">
        <div className="max-w-md border border-rose-500/20 rounded-2xl bg-[#090b12] p-8 shadow-2xl flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-5">
            <AlertCircle className="w-7 h-7 text-rose-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Wiki Generation Failed</h3>
          <p className="text-xs text-rose-300 leading-relaxed mb-6 font-mono">
            {errorReason || "An unexpected error occurred during wiki generation."}
          </p>
          <button
            onClick={handleGenerate}
            disabled={isTriggering}
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry Generation</span>
          </button>
        </div>
      </div>
    );
  }

  // State 4: Ready
  return (
    <div className="w-full h-full flex bg-[#07090e] relative overflow-hidden">
      {/* Sidebar */}
      <div className="relative z-10 w-[280px] border-r border-white/[0.08] flex-shrink-0 bg-[#090b12] flex flex-col">
        <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Wiki Chapters</span>
          {generationMode && (
            <span
              className={`flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded border ${
                generationMode === "llm"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : "bg-indigo-500/10 border-indigo-500/30 text-indigo-300"
              }`}
            >
              {generationMode === "llm" ? <Bot className="w-3 h-3" /> : <Cpu className="w-3 h-3" />}
              {generationMode === "llm" ? "AI / LLM" : "AST Engine"}
            </span>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          <WikiSidebar
            sections={sections}
            activeSectionSlug={activeSectionSlug}
            onSelectSection={setActiveSectionSlug}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 overflow-y-auto p-8 custom-scrollbar">
        {activeSection ? (
          <WikiSectionComponent
            section={activeSection}
            onRegenerate={handleGenerate}
          />
        ) : (
          <div className="text-slate-500 text-center mt-24 text-sm font-mono">
            Select a section from the sidebar to view documentation.
          </div>
        )}
      </div>
    </div>
  );
}
