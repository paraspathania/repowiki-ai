"use client";

import { useEffect, useState } from "react";
import { repoService } from "@/lib/api/client";
import { MermaidViewer } from "@/components/architecture/MermaidViewer";
import { Network, Layers, GitBranch, Cpu, Server } from "lucide-react";

export default function ArchitecturePage({ params }: { params: { repoId: string } }) {
  const [diagrams, setDiagrams] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"system" | "component" | "sequence">("system");

  useEffect(() => {
    repoService.getArchitectureDiagrams(params.repoId).then(setDiagrams);
  }, [params.repoId]);

  return (
    <div className="h-full flex flex-col p-6 space-y-4 bg-[#07090e] overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#090b12] p-4 rounded-2xl border border-white/[0.08]">
        <div>
          <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <Network className="w-4 h-4 text-indigo-400" />
            <span>Architecture & Component Visualization</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Auto-synthesized evidence-grounded diagrams powered by Tree-Sitter AST parsing and Mermaid.js.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("system")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === "system"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.08]"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>System Layer</span>
          </button>
          <button
            onClick={() => setActiveTab("component")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === "component"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.08]"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Component Topology</span>
          </button>
          <button
            onClick={() => setActiveTab("sequence")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === "sequence"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.08]"
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Sequence Flow</span>
          </button>
        </div>
      </div>

      {/* Main Diagram Viewport */}
      <div className="flex-1 overflow-hidden">
        {diagrams[activeTab] ? (
          <MermaidViewer chart={diagrams[activeTab]} id={`arch-${activeTab}`} />
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-slate-500 font-mono">
            Loading Mermaid Diagram...
          </div>
        )}
      </div>
    </div>
  );
}
