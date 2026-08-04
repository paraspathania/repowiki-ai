"use client";

import React, { useState, useEffect } from "react";
import { ExportTrigger } from "@/components/exports/ExportTrigger";
import { ExportHistoryList } from "@/components/exports/ExportHistoryList";
import { Download } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export interface ExportJob {
  id: string;
  format: "markdown" | "pdf";
  status: "pending" | "processing" | "ready" | "failed";
  created_at: string;
  file_url?: string;
  size_bytes?: number;
}

export default function ExportsPage({ params }: { params: { repoId: string } }) {
  const [jobs, setJobs] = useState<ExportJob[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeFormat, setActiveFormat] = useState<"markdown" | "pdf">("markdown");

  const fetchJobs = async () => {
    try {
      const res = await fetch(`${API_BASE}/repositories/${params.repoId}/exports`);
      if (res.ok) {
        const data = await res.json();
        setJobs(data.exports || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchJobs();
    
    // Poll every 3 seconds if there are pending/processing jobs
    const hasActiveJobs = jobs.some(j => j.status === "pending" || j.status === "processing");
    if (hasActiveJobs) {
      const interval = setInterval(fetchJobs, 3000);
      return () => clearInterval(interval);
    }
  }, [jobs, params.repoId]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch(`${API_BASE}/repositories/${params.repoId}/exports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format: activeFormat }),
      });
      if (res.ok) {
        await fetchJobs();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full h-full p-8 space-y-6 overflow-y-auto custom-scrollbar relative bg-background">
      <div className="absolute inset-0 radial-glow-light pointer-events-none z-0" />

      <div className="relative z-10 space-y-8 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 border-b border-white/[0.06] pb-5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Download className="w-5.5 h-5.5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Documentation Export</h2>
            <p className="text-slate-400 text-xs mt-0.5">Generate comprehensive offline documentation for this repository.</p>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl shadow-xl border border-white/[0.08]">
          <ExportTrigger
            format={activeFormat}
            onChangeFormat={setActiveFormat}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white tracking-tight">Export History</h2>
          <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] shadow-xl">
            <ExportHistoryList jobs={jobs} />
          </div>
        </div>
      </div>
    </div>
  );
}
