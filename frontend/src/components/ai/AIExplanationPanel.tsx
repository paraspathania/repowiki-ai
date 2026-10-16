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
    <div className="w-full h-full bg-[#111111] border-l border-[#2A2A2A] flex flex-col overflow-hidden">
      {/* Copilot / IDE Assistant Header */}
      <div className="p-3.5 border-b border-[#2A2A2A] bg-[#111111] flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded border border-[#2A2A2A] bg-[#191919] flex items-center justify-center">
            <Bot className="w-3.5 h-3.5 text-[#F2F2F2]" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-[#F2F2F2] tracking-tight font-mono">
              AI Code Assistant
            </h3>
            <span className="text-[10px] text-[#777777] font-mono block -mt-0.5">
              Code-grounded analysis
            </span>
          </div>
        </div>

        {/* Mode Selector */}
        <ExplanationModeSelector mode={mode} onChange={setMode} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar bg-[#111111]">
        {/* Active Target Banner */}
        <div className="p-2.5 rounded border border-[#2A2A2A] bg-[#191919] flex items-center justify-between font-mono">
          <div className="flex items-center gap-2 min-w-0">
            <Code2 className="w-3.5 h-3.5 text-[#A3A3A3] flex-shrink-0" />
            <span className="text-xs font-medium text-[#F2F2F2] truncate">{fileName}</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded border border-[#2A2A2A] bg-[#111111] text-[#A3A3A3] font-mono flex-shrink-0">
            AST Node
          </span>
        </div>

        {/* Primary Explain Action */}
        <button
          onClick={fetchExplanation}
          disabled={loading || !selectedPath}
          className="w-full py-2 px-3 bg-[#F2F2F2] hover:bg-white text-[#111111] text-xs font-mono font-medium rounded flex items-center justify-center gap-2 transition duration-150 disabled:opacity-40 disabled:hover:bg-[#F2F2F2]"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#111111]" />
              <span>Analyzing {fileName}...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-[#111111]" />
              <span>Explain selected file</span>
            </>
          )}
        </button>

        {/* Quick Assistant Actions Grid */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: "lint", label: "Lint Check", icon: FileCheck },
            { id: "audit", label: "Security Audit", icon: ShieldCheck },
            { id: "complexity", label: "Complexity", icon: Flame },
            { id: "patterns", label: "AST Patterns", icon: Cpu },
          ].map((act) => (
            <button
              key={act.id}
              onClick={() => {
                setActiveQuickAction(act.id);
                if (!explanation) fetchExplanation();
              }}
              className="p-2 rounded border border-[#2A2A2A] bg-[#191919] hover:bg-[#202020] flex items-center gap-2 text-left transition"
            >
              <act.icon className="w-3.5 h-3.5 text-[#777777]" />
              <span className="text-[11px] font-mono text-[#A3A3A3] font-medium">{act.label}</span>
            </button>
          ))}
        </div>

        {/* Explanation Results */}
        {explanation ? (
          <div className="space-y-3 text-xs font-mono">
            {/* Summary Box */}
            <div className="p-3 bg-[#191919] border border-[#2A2A2A] rounded space-y-1.5">
              <div className="flex items-center gap-1.5 text-[#A3A3A3] font-medium text-[10px] uppercase tracking-wider">
                <Terminal className="w-3 h-3 text-[#777777]" />
                <span>Executive Summary</span>
              </div>
              <p className="text-[#F2F2F2] leading-relaxed text-[11px]">{explanation.summary}</p>
            </div>

            {/* Mode Explanation */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono text-[#A3A3A3] uppercase tracking-wider">
                <span>{mode} Level Analysis</span>
                <span className="text-[#777777]">Grounded</span>
              </div>
              <div className="p-3 bg-[#191919] border border-[#2A2A2A] rounded text-[#A3A3A3] whitespace-pre-wrap leading-relaxed text-[11px]">
                {explanation[mode]}
              </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 gap-2 pt-1">
              <div className="p-2.5 rounded border border-[#2A2A2A] bg-[#191919] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-3.5 h-3.5 text-[#777777]" />
                  <span className="text-[11px] text-[#A3A3A3] font-medium">Cyclomatic Complexity</span>
                </div>
                <span className="text-xs font-mono font-medium text-[#F2F2F2]">{explanation.complexity}</span>
              </div>

              <div className="p-2.5 rounded border border-[#2A2A2A] bg-[#191919] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-[#777777]" />
                  <span className="text-[11px] text-[#A3A3A3] font-medium">Design Patterns</span>
                </div>
                <span className="text-[10px] font-mono font-medium text-[#F2F2F2]">
                  {explanation.designPatterns.join(", ")}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-5 border border-[#2A2A2A] rounded bg-[#191919] space-y-2.5">
            <div className="w-7 h-7 rounded border border-[#2A2A2A] bg-[#111111] flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-[#777777]" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-medium text-[#F2F2F2] font-mono">Select a file to begin</h4>
              <p className="text-[11px] text-[#777777] font-mono leading-relaxed">
                Explore explanations, code quality, complexity, and security insights for the selected file.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
