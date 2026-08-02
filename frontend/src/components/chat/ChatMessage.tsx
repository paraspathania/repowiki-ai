"use client";

import React from "react";
import { Sparkles, User } from "lucide-react";

export interface Citation {
  path: string;
  line?: number;
}

interface ChatMessageProps {
  message: {
    role: "user" | "assistant";
    content: string;
    citations?: Citation[];
  };
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  // Simple markdown renderer for bold, code, and citations
  const renderContent = (content: string) => {
    if (!content) return null;
    
    // This is a naive regex-based replacement. For a production app, use react-markdown.
    let parsed = content;
    
    // Bold
    parsed = parsed.replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>');
    
    // Code
    parsed = parsed.replace(/`(.*?)`/g, '<code style="background-color: rgba(0,0,0,0.3); padding: 2px 4px; border-radius: 4px; font-family: monospace; font-size: 0.9em;">$1</code>');
    
    // [file:line] Citations
    parsed = parsed.replace(/\\[(.*?):L(\\d+)\\]/g, '<span class="citation" style="background-color: rgba(137, 180, 250, 0.2); color: #89b4fa; padding: 2px 6px; border-radius: 12px; font-size: 0.8em; font-family: monospace; cursor: pointer; border: 1px solid rgba(137, 180, 250, 0.3);">[$1:$2]</span>');

    return (
      <div 
        style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}
        dangerouslySetInnerHTML={{ __html: parsed }} 
      />
    );
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isUser ? "flex-end" : "flex-start",
        width: "100%",
      }}
    >
      <div
        style={{
          maxWidth: "80%",
          padding: "16px",
          borderRadius: "12px",
          backgroundColor: isUser ? "#313244" : "#1e1e2e",
          border: isUser ? "1px solid #45475a" : "1px solid #313244",
          borderBottomRightRadius: isUser ? "4px" : "12px",
          borderBottomLeftRadius: isUser ? "12px" : "4px",
          color: "#cdd6f4",
          fontSize: "15px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
          {isUser ? (
            <>
              <span style={{ fontSize: "12px", color: "#a6adc8", fontWeight: "bold" }}>You</span>
              <div style={{ background: "#45475a", padding: "4px", borderRadius: "50%" }}>
                <User size={14} color="#cdd6f4" />
              </div>
            </>
          ) : (
            <>
              <div style={{ background: "rgba(203, 166, 247, 0.2)", padding: "4px", borderRadius: "50%" }}>
                <Sparkles size={14} color="#cba6f7" />
              </div>
              <span style={{ fontSize: "12px", color: "#cba6f7", fontWeight: "bold" }}>RepoWiki AI</span>
            </>
          )}
        </div>
        
        {renderContent(message.content)}
        
        {message.citations && message.citations.length > 0 && (
          <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {message.citations.map((cite, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: "12px",
                  padding: "4px 8px",
                  borderRadius: "16px",
                  backgroundColor: "rgba(137, 180, 250, 0.15)",
                  color: "#89b4fa",
                  fontFamily: "monospace",
                  border: "1px solid rgba(137, 180, 250, 0.3)",
                  cursor: "pointer",
                }}
              >
                {cite.path}{cite.line ? `:L${cite.line}` : ""}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
