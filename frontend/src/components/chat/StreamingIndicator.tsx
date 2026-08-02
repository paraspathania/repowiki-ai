"use client";

import React from "react";
import { Sparkles } from "lucide-react";

export function StreamingIndicator() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", width: "100%" }}>
      <div
        style={{
          padding: "16px",
          borderRadius: "12px",
          backgroundColor: "#1e1e2e",
          border: "1px solid #313244",
          borderBottomLeftRadius: "4px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div style={{ background: "rgba(203, 166, 247, 0.2)", padding: "4px", borderRadius: "50%" }}>
          <Sparkles size={14} color="#cba6f7" />
        </div>
        
        <div style={{ display: "flex", gap: "4px", alignItems: "center", height: "20px" }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: "6px",
                height: "6px",
                backgroundColor: "#89b4fa",
                borderRadius: "50%",
                animation: \`bounce 1.4s infinite ease-in-out both\`,
                animationDelay: \`\${i * 0.16}s\`,
              }}
            />
          ))}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: \`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
      \`}} />
    </div>
  );
}
