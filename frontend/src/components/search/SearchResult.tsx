"use client";

import React from "react";
import { SearchResult as SearchResultType } from "./CommandPalette";

interface Props {
  result: SearchResultType;
  onClick: () => void;
}

export function SearchResult({ result, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: "16px",
        borderRadius: "8px",
        backgroundColor: "#1e1e2e",
        border: "1px solid #313244",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        transition: "border-color 0.2s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#89b4fa")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#313244")}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ color: "#cdd6f4", fontSize: "14px", fontFamily: "monospace" }}>
            {result.path}
          </span>
          <span style={{ fontSize: "12px", color: "#6c7086" }}>
            L{result.start_line} - L{result.end_line}
          </span>
        </div>
        {result.language && (
          <span
            style={{
              fontSize: "12px",
              padding: "2px 8px",
              borderRadius: "12px",
              backgroundColor: "#cba6f7",
              color: "#11111b",
              fontWeight: 600,
            }}
          >
            {result.language}
          </span>
        )}
      </div>
      {result.symbol_name && (
        <div
          style={{
            display: "inline-block",
            fontSize: "13px",
            color: "#89b4fa",
            fontWeight: 500,
            backgroundColor: "rgba(137, 180, 250, 0.1)",
            padding: "2px 6px",
            borderRadius: "4px",
            alignSelf: "flex-start",
          }}
        >
          {result.symbol_type ? `${result.symbol_type} ` : ""}
          {result.symbol_name}
        </div>
      )}
      <div
        style={{
          fontSize: "13px",
          color: "#a6adc8",
          lineHeight: 1.5,
          fontFamily: "monospace",
          backgroundColor: "#181825",
          padding: "8px",
          borderRadius: "6px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
        }}
      >
        {result.content.substring(0, 100)}
        {result.content.length > 100 ? "..." : ""}
      </div>
    </div>
  );
}
