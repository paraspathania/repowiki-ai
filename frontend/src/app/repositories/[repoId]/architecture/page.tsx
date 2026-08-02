"use client";

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { Network, Copy, Download, RefreshCw, Check } from "lucide-react";

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
    <div className="w-full h-full flex flex-col p-6 space-y-4 overflow-hidden">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Network className="w-5 h-5 text-accent-blue" />
            <span>Architecture Diagram</span>
          </h2>
          <p className="text-gray-400 text-xs mt-1">
            Evidence-grounded architecture graph inferred from repository dependencies and entry points.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-panel hover:bg-border/60 text-xs text-gray-300 border border-border rounded-lg transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-accent" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy DSL"}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 bg-panel border border-border rounded-xl p-8 flex items-center justify-center overflow-auto">
        <div ref={containerRef} className="mermaid">
          {INITIAL_MERMAID}
        </div>
      </div>
    </div>
  );
}
