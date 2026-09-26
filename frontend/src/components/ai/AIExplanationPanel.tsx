"use client";

import { useState } from "react";
import {
  Sparkles, Loader2, BookOpen, ExternalLink, ShieldCheck, Flame, Layers,
  Terminal, Bot, Code2, Play, Bug, FileCheck, CheckCircle2, Cpu
} from "lucide-react";
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
  const [activeQuickAction, setActiveQuickAction] = useState<string | null>(null);

  const fetchExplanation = async () => {
    setLoading(true);
    try {
      const data = await repoService.getCodeExplanation(repoId, selectedPath);
      setExplanation(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fileName = selectedPath ? selectedPath.split("/").pop() : "File";

  return (
    <div className="w-full h-full bg-[#080b13] border-l border-white/[0.08] flex flex-col overflow-hidden">
      {/* Copilot / IDE Assistant Header */}
      <div className="p-3.5 border-b border-white/[0.08] bg-[#0c101c] flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center shadow-sm">
            <Bot className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5 font-mono">
              AI Code Assistant
            </h3>
            <span className="text-[10px] text-slate-500 font-mono block -mt-0.5">
              Grounded RAG Engine
            </span>
          </div>
        </div>

        {/* Mode Selector */}
        <ExplanationModeSelector mode={mode} onChange={setMode} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {/* Active Target Banner */}
        <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20 flex items-center justify-between font-mono">
          <div className="flex items-center gap-2 min-w-0">
            <Code2 className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <span className="text-xs font-semibold text-indigo-200 truncate">{fileName}</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30 flex-shrink-0">
            AST Node
          </span>
        </div>

        {/* Primary Explain Action */}
        <button
          onClick={fetchExplanation}
          disabled={loading || !selectedPath}
          className="w-full py-3 bg-white hover:bg-neutral-200 text-neutral-950 text-xs font-mono font-bold rounded-xl flex items-center justify-center gap-2 transition duration-200 shadow-sm disabled:opacity-40 active:scale-[0.98]"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-neutral-950" />
              <span>Parsing Code AST & RAG...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-neutral-950" />
              <span>Explain {fileName}</span>
            </>
          )}
        </button>

        {/* Quick Assistant Actions Grid */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: "lint", label: "Lint Check", icon: FileCheck, color: "text-emerald-400" },
            { id: "audit", label: "Security Audit", icon: ShieldCheck, color: "text-indigo-400" },
            { id: "complexity", label: "Complexity", icon: Flame, color: "text-amber-400" },
            { id: "patterns", label: "AST Patterns", icon: Cpu, color: "text-purple-400" },
          ].map((act) => (
            <button
              key={act.id}
              onClick={() => {
                setActiveQuickAction(act.id);
                if (!explanation) fetchExplanation();
              }}
              className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] flex items-center gap-2 text-left transition"
            >
              <act.icon className={`w-3.5 h-3.5 ${act.color}`} />
              <span className="text-[11px] font-mono text-slate-300 font-medium">{act.label}</span>
            </button>
          ))}
        </div>

        {/* Explanation Results */}
        {explanation ? (
          <div className="space-y-4 text-xs animate-fade-in font-mono">
            {/* Summary Box */}
            <div className="p-3.5 bg-[#05070e] border border-white/[0.08] rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-[10px] uppercase tracking-wider">
                <Terminal className="w-3 h-3" />
                <span>Executive Summary</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">{explanation.summary}</p>
            </div>

            {/* Mode Explanation */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <span>{mode} Level Analysis</span>
                <span className="text-emerald-400">✓ Grounded</span>
              </div>
              <div className="p-3.5 bg-[#05070e] border border-white/[0.08] rounded-xl text-slate-300 whitespace-pre-wrap leading-relaxed text-[11px]">
                {explanation[mode]}
              </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 gap-2 pt-1">
              <div className="p-3 rounded-xl bg-[#05070e] border border-white/[0.08] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span className="text-[11px] text-slate-400 font-semibold">Cyclomatic Complexity</span>
                </div>
                <span className="text-xs font-mono font-bold text-amber-300">{explanation.complexity}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#05070e] border border-white/[0.08] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span className="text-[11px] text-slate-400 font-semibold">Design Patterns</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-indigo-300">
                  {explanation.designPatterns.join(", ")}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center border border-dashed border-white/[0.08] rounded-2xl bg-black/20 space-y-2">
            <Sparkles className="w-6 h-6 text-indigo-400/60 mx-auto animate-pulse" />
            <p className="text-xs font-mono text-slate-400 font-semibold">
              Select any file and click &quot;Explain {fileName}&quot; to run RAG AST analysis.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
