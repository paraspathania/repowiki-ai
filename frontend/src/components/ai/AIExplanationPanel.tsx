"use client";

import { useState } from "react";
import { Sparkles, Loader2, BookOpen, ExternalLink, ShieldCheck } from "lucide-react";
import { ExplanationModeSelector } from "./ExplanationModeSelector";
import { apiClient } from "@/lib/api/client";

interface AIExplanationPanelProps {
  repoId: string;
  selectedPath: string;
  codeSnippet?: string;
  onCitationClick?: (filePath: string, line: number) => void;
}

export function AIExplanationPanel({ repoId, selectedPath, codeSnippet, onCitationClick }: AIExplanationPanelProps) {
  const [mode, setMode] = useState<"beginner" | "intermediate" | "expert">("intermediate");
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<any | null>(null);

  const fetchExplanation = async () => {
    setLoading(true);
    try {
      const res = await apiClient.post(`/repositories/${repoId}/explanations/file`, {
        path: selectedPath,
        mode: mode,
        code_snippet: codeSnippet,
      });
      setExplanation(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full bg-panel/20 border-l border-white/[0.06] flex flex-col p-5 space-y-5 overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
        <div className="flex items-center gap-2 text-sm font-bold text-white tracking-tight">
          <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
          <span>AI Explanation</span>
        </div>
        <ExplanationModeSelector mode={mode} onChange={setMode} />
      </div>

      <button
        onClick={fetchExplanation}
        disabled={loading || !selectedPath}
        className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition duration-300 shadow-lg shadow-indigo-500/10 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none shimmer-btn"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Analyzing Code...</span>
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
          <div className="p-4 bg-surface/50 border border-white/[0.08] rounded-xl space-y-2 shadow-sm">
            <h4 className="font-bold text-white tracking-wide uppercase text-[10px] text-indigo-400">Summary</h4>
            <p className="text-slate-300 leading-relaxed">{explanation.summary}</p>
          </div>

          <div className="space-y-3 p-4 bg-surface/20 border border-white/[0.04] rounded-xl">
            <h4 className="font-bold text-white tracking-wide uppercase text-[10px] text-indigo-400">Key Responsibilities</h4>
            <ul className="list-disc pl-4 text-slate-300 space-y-1.5 leading-relaxed">
              {explanation.responsibilities?.map((r: string, idx: number) => (
                <li key={idx} className="marker:text-indigo-500">{r}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white tracking-wide uppercase text-[10px] text-indigo-400 px-1">Detailed Explanation</h4>
            <div className="p-4 bg-surface/50 border border-white/[0.08] rounded-xl text-slate-300 whitespace-pre-wrap leading-relaxed shadow-sm">
              {explanation.explanation}
            </div>
          </div>

          {explanation.citations && explanation.citations.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-bold text-white text-[10px] tracking-wide uppercase flex items-center gap-1.5 text-indigo-400 px-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verified Source Citations</span>
              </h4>
              <div className="space-y-2">
                {explanation.citations.map((c: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => onCitationClick && onCitationClick(c.file_path, c.start_line)}
                    className="w-full text-left p-3 bg-surface/50 hover:bg-white/[0.02] border border-white/[0.08] hover:border-indigo-500/30 rounded-xl flex items-center justify-between text-indigo-400 font-mono transition duration-200 shadow-sm"
                  >
                    <span>{c.file_path}:{c.start_line}-{c.end_line}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
