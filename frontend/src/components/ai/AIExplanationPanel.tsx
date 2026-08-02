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
    <div className="w-full h-full bg-panel border-l border-border flex flex-col p-4 space-y-4 overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <Sparkles className="w-4 h-4 text-accent-blue" />
          <span>AI Context & Explanation</span>
        </div>
        <ExplanationModeSelector mode={mode} onChange={setMode} />
      </div>

      <button
        onClick={fetchExplanation}
        disabled={loading || !selectedPath}
        className="w-full py-2 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
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
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-surface border border-border rounded-lg space-y-2">
            <h4 className="font-bold text-white text-xs">Summary</h4>
            <p className="text-gray-300 leading-relaxed">{explanation.summary}</p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs">Key Responsibilities</h4>
            <ul className="list-disc pl-4 text-gray-300 space-y-1">
              {explanation.responsibilities?.map((r: string, idx: number) => (
                <li key={idx}>{r}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs">Detailed Explanation</h4>
            <div className="p-3 bg-surface border border-border rounded-lg text-gray-300 whitespace-pre-wrap leading-relaxed">
              {explanation.explanation}
            </div>
          </div>

          {explanation.citations && explanation.citations.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                <span>Verified Source Citations</span>
              </h4>
              <div className="space-y-1">
                {explanation.citations.map((c: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => onCitationClick && onCitationClick(c.file_path, c.start_line)}
                    className="w-full text-left p-2 bg-surface hover:bg-border/40 border border-border rounded flex items-center justify-between text-accent-blue font-mono transition"
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
