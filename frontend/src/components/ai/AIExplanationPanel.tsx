"use client";

import { useState } from "react";
import { Sparkles, Loader2, BookOpen, ExternalLink, ShieldCheck, Flame, Layers } from "lucide-react";
import { ExplanationModeSelector } from "./ExplanationModeSelector";
import { repoService } from "@/lib/api/client";
import { CodeExplanation } from "@/types";

interface AIExplanationPanelProps {
  repoId: string;
  selectedPath: string;
  codeSnippet?: string;
  onCitationClick?: (filePath: string, line: number) => void;
}

export function AIExplanationPanel({ repoId, selectedPath, codeSnippet, onCitationClick }: AIExplanationPanelProps) {
  const [mode, setMode] = useState<"beginner" | "intermediate" | "expert">("intermediate");
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<CodeExplanation | null>(null);

  const fetchExplanation = async () => {
    setLoading(true);
    try {
      const data = await repoService.getCodeExplanation(repoId, selectedPath);
      setExplanation(data);
    } catch (err) {
      console.error(err);
    } font: {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full bg-[#090b12] border-l border-white/[0.08] flex flex-col p-5 space-y-5 overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
        <div className="flex items-center gap-2 text-sm font-bold text-white tracking-tight">
          <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
          <span>AI Code Explanation</span>
        </div>
        <ExplanationModeSelector mode={mode} onChange={setMode} />
      </div>

      <button
        onClick={fetchExplanation}
        disabled={loading || !selectedPath}
        className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition duration-300 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Analyzing Code Syntax...</span>
          </>
        ) : (
          <>
            <BookOpen className="w-4 h-4" />
            <span>Explain {selectedPath ? selectedPath.split("/").pop() : "File"}</span>
          </>
        )}
      </button>

      {explanation && (
        <div className="space-y-5 text-xs animate-fade-in">
          {/* Summary Box */}
          <div className="p-4 bg-[#05070c] border border-white/[0.08] rounded-xl space-y-1.5">
            <h4 className="font-bold text-indigo-400 tracking-wide uppercase text-[10px]">Summary</h4>
            <p className="text-slate-300 leading-relaxed">{explanation.summary}</p>
          </div>

          {/* Explanation content based on active mode */}
          <div className="space-y-2">
            <h4 className="font-bold text-indigo-400 tracking-wide uppercase text-[10px] capitalize">
              {mode} Explanation Mode
            </h4>
            <div className="p-4 bg-[#05070c] border border-white/[0.08] rounded-xl text-slate-300 whitespace-pre-wrap leading-relaxed">
              {explanation[mode]}
            </div>
          </div>

          {/* Complexity & Patterns */}
          <div className="grid grid-cols-1 gap-2 pt-1">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Complexity Rating</span>
                <span className="text-xs font-mono font-bold text-slate-200">{explanation.complexity}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Design Patterns</span>
                <span className="text-xs font-mono font-bold text-indigo-300">
                  {explanation.designPatterns.join(", ")}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
