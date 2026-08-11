"use client";

import React from "react";
import { Download, Loader2, AlertCircle } from "lucide-react";

export interface ExportJob {
  id: string;
  format: string;
  status: "ready" | "pending" | "processing" | "failed";
  created_at: string;
  size_bytes?: number;
  file_url?: string;
}

interface ExportHistoryListProps {
  jobs: ExportJob[];
}

export function ExportHistoryList({ jobs }: ExportHistoryListProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ready": return { bg: "rgba(166, 227, 161, 0.1)", color: "#a6e3a1", text: "Ready" };
      case "pending": return { bg: "rgba(108, 112, 134, 0.1)", color: "#6c7086", text: "Pending" };
      case "processing": return { bg: "rgba(249, 226, 175, 0.1)", color: "#f9e2af", text: "Processing" };
      case "failed": return { bg: "rgba(243, 139, 168, 0.1)", color: "#f38ba8", text: "Failed" };
      default: return { bg: "rgba(108, 112, 134, 0.1)", color: "#6c7086", text: "Unknown" };
    }
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return "--";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  if (jobs.length === 0) {
    return (
      <div style={{ padding: "48px", textAlign: "center", backgroundColor: "#1e1e2e", border: "1px dashed #313244", borderRadius: "12px", color: "#a6adc8" }}>
        No exports generated yet.
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#1e1e2e", border: "1px solid #313244", borderRadius: "12px", overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
        <thead>
          <tr style={{ backgroundColor: "#181825", borderBottom: "1px solid #313244" }}>
            <th style={{ padding: "16px", color: "#a6adc8", fontSize: "13px", fontWeight: "bold" }}>Format</th>
            <th style={{ padding: "16px", color: "#a6adc8", fontSize: "13px", fontWeight: "bold" }}>Status</th>
            <th style={{ padding: "16px", color: "#a6adc8", fontSize: "13px", fontWeight: "bold" }}>Created</th>
            <th style={{ padding: "16px", color: "#a6adc8", fontSize: "13px", fontWeight: "bold" }}>Size</th>
            <th style={{ padding: "16px", color: "#a6adc8", fontSize: "13px", fontWeight: "bold", textAlign: "right" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => {
            const badge = getStatusBadge(job.status);
            return (
              <tr key={job.id} style={{ borderBottom: "1px solid #313244" }}>
                <td style={{ padding: "16px", color: "#cdd6f4", fontSize: "14px", textTransform: "capitalize", fontWeight: "bold" }}>
                  {job.format}
                </td>
                <td style={{ padding: "16px" }}>
                  <span style={{ 
                    display: "inline-flex", 
                    alignItems: "center", 
                    gap: "6px",
                    backgroundColor: badge.bg, 
                    color: badge.color, 
                    padding: "4px 8px", 
                    borderRadius: "16px", 
                    fontSize: "12px", 
                    fontWeight: "bold" 
                  }}>
                    {job.status === "processing" && <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} />}
                    {job.status === "failed" && <AlertCircle size={12} />}
                    {badge.text}
                  </span>
                </td>
                <td style={{ padding: "16px", color: "#a6adc8", fontSize: "13px" }}>
                  {new Date(job.created_at).toLocaleString()}
                </td>
                <td style={{ padding: "16px", color: "#a6adc8", fontSize: "13px" }}>
                  {formatSize(job.size_bytes)}
                </td>
                <td style={{ padding: "16px", textAlign: "right" }}>
                  {job.status === "ready" && job.file_url ? (
                    <a
                      href={job.file_url}
                      download
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "6px 12px",
                        backgroundColor: "rgba(137, 180, 250, 0.1)",
                        color: "#89b4fa",
                        border: "1px solid rgba(137, 180, 250, 0.2)",
                        borderRadius: "6px",
                        fontSize: "13px",
                        fontWeight: "bold",
                        textDecoration: "none",
                        transition: "background-color 0.2s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(137, 180, 250, 0.2)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(137, 180, 250, 0.1)")}
                    >
                      <Download size={14} />
                      Download
                    </a>
                  ) : (
                    <span style={{ color: "#45475a", fontSize: "13px" }}>--</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }` }} />
    </div>
  );
}
