"use client";

import React from "react";
import { FileText, File, Download, Loader2 } from "lucide-react";

interface ExportTriggerProps {
  format: "markdown" | "pdf";
  onChangeFormat: (format: "markdown" | "pdf") => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export function ExportTrigger({ format, onChangeFormat, onGenerate, isGenerating }: ExportTriggerProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h3 style={{ color: "#cdd6f4", fontSize: "16px", fontWeight: "bold", marginBottom: "16px" }}>Select Format</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div
            onClick={() => onChangeFormat("markdown")}
            style={{
              padding: "16px",
              borderRadius: "8px",
              border: format === "markdown" ? "2px solid #cba6f7" : "2px solid #313244",
              backgroundColor: format === "markdown" ? "rgba(203, 166, 247, 0.1)" : "#181825",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              transition: "all 0.2s",
            }}
          >
            <div style={{ padding: "8px", backgroundColor: "rgba(137, 180, 250, 0.2)", borderRadius: "8px" }}>
              <FileText size={24} color="#89b4fa" />
            </div>
            <div>
              <div style={{ color: "#cdd6f4", fontWeight: "bold", fontSize: "14px", marginBottom: "4px" }}>Markdown</div>
              <div style={{ color: "#a6adc8", fontSize: "12px" }}>Raw text, suitable for Git or Wikis</div>
            </div>
          </div>
          
          <div
            onClick={() => onChangeFormat("pdf")}
            style={{
              padding: "16px",
              borderRadius: "8px",
              border: format === "pdf" ? "2px solid #cba6f7" : "2px solid #313244",
              backgroundColor: format === "pdf" ? "rgba(203, 166, 247, 0.1)" : "#181825",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              transition: "all 0.2s",
            }}
          >
            <div style={{ padding: "8px", backgroundColor: "rgba(243, 139, 168, 0.2)", borderRadius: "8px" }}>
              <File size={24} color="#f38ba8" />
            </div>
            <div>
              <div style={{ color: "#cdd6f4", fontWeight: "bold", fontSize: "14px", marginBottom: "4px" }}>PDF Document</div>
              <div style={{ color: "#a6adc8", fontSize: "12px" }}>Formatted document, suitable for sharing</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "24px", borderTop: "1px solid #313244" }}>
        <span style={{ color: "#a6adc8", fontSize: "13px" }}>
          Estimated time: ~1-5 minutes for standard repositories
        </span>
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 20px",
            backgroundColor: isGenerating ? "#45475a" : "#cba6f7",
            color: isGenerating ? "#a6adc8" : "#11111b",
            border: "none",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: isGenerating ? "not-allowed" : "pointer",
            transition: "background-color 0.2s",
          }}
        >
          {isGenerating ? (
            <>
              <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
              Starting Export...
            </>
          ) : (
            <>
              <Download size={16} />
              Generate Export
            </>
          )}
        </button>
      </div>
      <style dangerouslySetInnerHTML={{ __html: \`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }\`}} />
    </div>
  );
}
