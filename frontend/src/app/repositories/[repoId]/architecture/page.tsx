"use client";

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { Network, Copy, Check } from "lucide-react";

const INITIAL_MERMAID = `flowchart LR
    UI[Next.js Frontend]
    API[FastAPI Backend]
    Worker[Celery Workers]
    Redis[(Redis Cache & Queue)]
    DB[(PostgreSQL + pgvector)]
    GitHub[GitHub API]
    LLM[OpenAI API]

    UI --> API
    API --> GitHub
    API --> DB
    API --> Redis
    Redis --> Worker
    Worker --> DB
    Worker --> LLM
`;

export default function ArchitecturePage({ params }: { params: { repoId: string } }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: "dark",
      securityLevel: "loose",
      fontFamily: "ui-sans-serif, system-ui, sans-serif",
    });

    if (containerRef.current) {
      containerRef.current.removeAttribute("data-processed");
      mermaid.contentLoaded();
    }
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(INITIAL_MERMAID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full h-full flex flex-col p-8 space-y-6 overflow-hidden bg-background relative">
      <div className="absolute inset-0 radial-glow-light pointer-events-none z-0" />

      <div className="relative z-10 flex items-center justify-between border-b border-white/[0.06] pb-5 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Network className="w-5.5 h-5.5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Architecture Diagram</h2>
            <p className="text-slate-400 text-xs mt-0.5">
              Evidence-grounded architecture graph inferred from repository dependencies and entry points.
            </p>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] hover:bg-white/[0.06] text-xs text-slate-300 font-semibold border border-white/[0.08] rounded-xl transition duration-200"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
          <span>{copied ? "Copied" : "Copy DSL"}</span>
        </button>
      </div>

      <div className="relative z-10 flex-1 glass-panel rounded-2xl p-8 flex items-center justify-center overflow-auto shadow-2xl">
        <div ref={containerRef} className="mermaid scale-105">
          {INITIAL_MERMAID}
        </div>
      </div>
    </div>
  );
}
