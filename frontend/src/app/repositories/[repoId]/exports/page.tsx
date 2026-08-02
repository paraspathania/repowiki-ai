"use client";

import React, { useState, useEffect } from "react";
import { ExportTrigger } from "@/components/exports/ExportTrigger";
import { ExportHistoryList } from "@/components/exports/ExportHistoryList";

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
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", backgroundColor: "#11111b", padding: "32px", overflowY: "auto" }}>
      <div style={{ maxWidth: "800px", width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: "32px" }}>
        
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#cdd6f4", marginBottom: "8px" }}>Export Documentation</h1>
          <p style={{ color: "#a6adc8" }}>Generate comprehensive offline documentation for this repository.</p>
        </div>

        <div style={{ backgroundColor: "#1e1e2e", border: "1px solid #313244", borderRadius: "12px", padding: "24px" }}>
          <ExportTrigger
            format={activeFormat}
            onChangeFormat={setActiveFormat}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
          />
        </div>

        <div>
          <h2 style={{ fontSize: "18px", fontWeight: "bold", color: "#cdd6f4", marginBottom: "16px" }}>Export History</h2>
          <ExportHistoryList jobs={jobs} />
        </div>

      </div>
    </div>
  );
}
