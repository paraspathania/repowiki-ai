"use client";

import React from "react";
import { WikiSection as WikiSectionType } from "@/app/repositories/[repoId]/wiki/page";
import { RefreshCw, FileText } from "lucide-react";

interface WikiSectionProps {
  section: WikiSectionType;
  onRegenerate: () => void;
}

export function WikiSection({ section, onRegenerate }: WikiSectionProps) {
  const getStatusBadge = () => {
    switch (section.status) {
      case "ready": return { bg: "rgba(166, 227, 161, 0.1)", color: "#a6e3a1", text: "Ready" };
      case "skipped": return { bg: "rgba(108, 112, 134, 0.1)", color: "#6c7086", text: "Skipped" };
      case "generating": return { bg: "rgba(249, 226, 175, 0.1)", color: "#f9e2af", text: "Generating" };
      case "failed": return { bg: "rgba(243, 139, 168, 0.1)", color: "#f38ba8", text: "Failed" };
      default: return { bg: "rgba(108, 112, 134, 0.1)", color: "#6c7086", text: "Unknown" };
    }
  };

  const badge = getStatusBadge();

  // Very simple markdown to HTML (just for basic rendering, ideally use marked or react-markdown)
  const renderMarkdown = (md: string) => {
    let html = md || "";
    // Headings
    html = html.replace(/^### (.*$)/gim, '<h3 style="font-size: 1.25rem; font-weight: bold; margin-top: 24px; margin-bottom: 12px; color: #cdd6f4;">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 style="font-size: 1.5rem; font-weight: bold; margin-top: 32px; margin-bottom: 16px; color: #cdd6f4; border-bottom: 1px solid #313244; padding-bottom: 8px;">$1</h2>');
    // Bold
    html = html.replace(/\\*\\*(.*?)\\*\\*/gim, '<strong>$1</strong>');
    // Code blocks
    html = html.replace(/```[\\s\\S]*?\\n([\\s\\S]*?)```/gim, '<pre style="background-color: #181825; padding: 16px; border-radius: 8px; overflow-x: auto; font-family: monospace; font-size: 0.9em; border: 1px solid #313244; margin: 16px 0;"><code>$1</code></pre>');
    // Inline code
    html = html.replace(/`([^`]+)`/gim, '<code style="background-color: #181825; padding: 2px 4px; border-radius: 4px; font-family: monospace; font-size: 0.9em;">$1</code>');
    // Paragraphs
    html = html.replace(/^\\s*(\\n)?([^<\\n][\\s\\S]*?)(?=\\n\\n|\\n?$)/gim, '<p style="margin-bottom: 16px; line-height: 1.7;">$2</p>');
    return { __html: html };
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", color: "#bac2de" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
            <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: "#cdd6f4" }}>{section.title}</h1>
            <span style={{ backgroundColor: badge.bg, color: badge.color, padding: "4px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" }}>
              {badge.text}
            </span>
          </div>
        </div>
        <button
          onClick={onRegenerate}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 12px",
            backgroundColor: "#313244",
            color: "#cdd6f4",
            border: "1px solid #45475a",
            borderRadius: "6px",
            fontSize: "13px",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#45475a")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#313244")}
        >
          <RefreshCw size={14} />
          Regenerate
        </button>
      </div>

      <div
        style={{ fontSize: "16px" }}
        dangerouslySetInnerHTML={renderMarkdown(section.content)}
      />

      {section.citations && section.citations.length > 0 && (
        <div style={{ marginTop: "48px", paddingTop: "24px", borderTop: "1px solid #313244" }}>
          <h4 style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#a6adc8", marginBottom: "16px", fontWeight: "bold" }}>
            <FileText size={16} />
            Sources
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {section.citations.map((cite, idx) => (
              <div
                key={idx}
                style={{
                  padding: "12px 16px",
                  backgroundColor: "#181825",
                  border: "1px solid #313244",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "13px",
                }}
              >
                <span style={{ color: "#89b4fa", fontFamily: "monospace" }}>{cite.path}</span>
                {cite.line && <span style={{ color: "#6c7086" }}>Line {cite.line}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
