"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import mermaid from "mermaid";
import { Network, Copy, Check, Loader2, Lock, Clock } from "lucide-react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export default function ArchitecturePage({ params }: { params: { repoId: string } }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [mermaidDsl, setMermaidDsl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [isInProgress, setIsInProgress] = useState(false);

  const fetchDiagram = useCallback(async () => {
    setLoading(true);
    setErrorStatus(null);
    setIsInProgress(false);
    try {
      const res = await fetch(`${API_BASE}/repositories/${params.repoId}/diagrams`);
      if (res.status === 404 || res.status === 403) {
        setErrorStatus(res.status);
        return;
      }
      if (res.status === 202) {
        setIsInProgress(true);
        return;
      }
      const data = await res.json();
      if (data.mermaid) {
        setMermaidDsl(data.mermaid);
      }
    } catch (err) {
      console.error("Failed to load diagram:", err);
      setErrorStatus(500);
    } finally {
      setLoading(false);
    }
  }, [params.repoId]);

  useEffect(() => {
    fetchDiagram();
  }, [fetchDiagram]);

  useEffect(() => {
    if (!mermaidDsl || !containerRef.current) return;

    mermaid.initialize({
      startOnLoad: false,
      theme: "dark",
      securityLevel: "loose",
      fontFamily: "ui-sans-serif, system-ui, sans-serif",
    });

    const renderChart = async () => {
      try {
        const id = `mermaid-${Date.now()}`;
        const { svg } = await mermaid.render(id, mermaidDsl);
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (err) {
        console.error("Mermaid render error:", err);
        if (containerRef.current) {
          containerRef.current.innerHTML = `<pre class="text-xs text-rose-400 p-4 font-mono">${mermaidDsl}</pre>`;
        }
      }
    };

    renderChart();
  }, [mermaidDsl]);

  const handleCopy = () => {
    if (!mermaidDsl) return;
    navigator.clipboard.writeText(mermaidDsl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // State: Loading
  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-background min-h-[400px] space-y-3">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        <p className="text-slate-400 text-sm">Generating architecture diagram...</p>
      </div>
    );
  }

  // State: Inaccessible or Not Found
  if (errorStatus === 404 || errorStatus === 403) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-background space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-white">Repository Inaccessible or Not Found</h2>
        <p className="text-slate-400 text-sm max-w-md">
          You do not have access to view diagrams for this repository.
        </p>
        <Link
          href="/"
          className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-slate-300 rounded-xl border border-white/[0.08] transition"
        >
          Return to Repositories
        </Link>
      </div>
    );
  }

  // State: In Progress / Not Ready
  if (isInProgress || !mermaidDsl) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-background space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
          <Clock className="w-7 h-7 animate-pulse" />
        </div>
        <h2 className="text-lg font-bold text-white">Diagram In Progress</h2>
        <p className="text-slate-400 text-sm max-w-md">
          The architecture diagram is generated automatically once repository analysis completes.
        </p>
        <button
          onClick={fetchDiagram}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition"
        >
          Refresh Diagram
        </button>
      </div>
    );
  }

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
        <div ref={containerRef} className="scale-105 flex items-center justify-center w-full h-full" />
      </div>
    </div>
  );
}
