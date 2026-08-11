"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, FileCode, ArrowRight } from "lucide-react";
import Link from "next/link";

export interface Endpoint {
  id?: string;
  method: string;
  path: string;
  handler_name?: string;
  file_path?: string;
  line_number?: number;
}

interface EndpointCardProps {
  endpoint: Endpoint;
  repoId: string;
}

export function EndpointCard({ endpoint, repoId }: EndpointCardProps) {
  const [expanded, setExpanded] = useState(false);

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case "GET": return { bg: "rgba(166, 227, 161, 0.15)", text: "#a6e3a1", border: "rgba(166, 227, 161, 0.3)" };
      case "POST": return { bg: "rgba(137, 180, 250, 0.15)", text: "#89b4fa", border: "rgba(137, 180, 250, 0.3)" };
      case "PUT": return { bg: "rgba(249, 226, 175, 0.15)", text: "#f9e2af", border: "rgba(249, 226, 175, 0.3)" };
      case "DELETE": return { bg: "rgba(243, 139, 168, 0.15)", text: "#f38ba8", border: "rgba(243, 139, 168, 0.3)" };
      case "PATCH": return { bg: "rgba(250, 179, 135, 0.15)", text: "#fab387", border: "rgba(250, 179, 135, 0.3)" };
      default: return { bg: "rgba(108, 112, 134, 0.15)", text: "#bac2de", border: "rgba(108, 112, 134, 0.3)" };
    }
  };

  const colors = getMethodColor(endpoint.method);

  return (
    <div style={{ backgroundColor: "#1e1e2e", border: "1px solid #313244", borderRadius: "12px", overflow: "hidden", transition: "border-color 0.2s" }}
         onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#45475a")}
         onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#313244")}>
      
      <div 
        onClick={() => setExpanded(!expanded)}
        style={{ display: "flex", alignItems: "center", padding: "16px", cursor: "pointer", gap: "16px" }}
      >
        <button style={{ background: "transparent", border: "none", color: "#a6adc8", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
          {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </button>
        
        <span style={{ 
          backgroundColor: colors.bg, 
          color: colors.text, 
          border: `1px solid ${colors.border}`,
          padding: "4px 10px", 
          borderRadius: "6px", 
          fontSize: "12px", 
          fontWeight: "bold",
          minWidth: "70px",
          textAlign: "center",
          letterSpacing: "0.5px"
        }}>
          {endpoint.method.toUpperCase()}
        </span>
        
        <span style={{ color: "#cdd6f4", fontFamily: "monospace", fontSize: "14px", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {endpoint.path}
        </span>
        
        <span style={{ color: "#6c7086", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px", fontFamily: "monospace" }}>
          {endpoint.handler_name || "handler"}
        </span>
      </div>

      {expanded && (
        <div style={{ padding: "16px 16px 16px 48px", borderTop: "1px solid #313244", backgroundColor: "#181825", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
            <span style={{ color: "#a6adc8", minWidth: "80px" }}>Handler:</span>
            <span style={{ color: "#89b4fa", fontFamily: "monospace", backgroundColor: "rgba(137, 180, 250, 0.1)", padding: "2px 6px", borderRadius: "4px" }}>
              {endpoint.handler_name || "handler"}
            </span>
          </div>
          
          {endpoint.file_path && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
              <span style={{ color: "#a6adc8", minWidth: "80px" }}>Source:</span>
              <Link 
                href={`/repositories/${repoId}/files?path=${encodeURIComponent(endpoint.file_path)}`}
                style={{ display: "flex", alignItems: "center", gap: "6px", color: "#cba6f7", textDecoration: "none", fontFamily: "monospace" }}
              >
                <FileCode size={14} />
                {endpoint.file_path} {endpoint.line_number ? `:L${endpoint.line_number}` : ""}
                <ArrowRight size={14} style={{ marginLeft: "4px" }} />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
