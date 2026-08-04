"use client";

import React from "react";
import { WikiSection } from "@/app/repositories/[repoId]/wiki/page";
import { Loader2 } from "lucide-react";

interface WikiSidebarProps {
  sections: WikiSection[];
  activeSectionSlug: string;
  onSelectSection: (slug: string) => void;
}

export function WikiSidebar({ sections, activeSectionSlug, onSelectSection }: WikiSidebarProps) {
  const getStatusColor = (status: WikiSection["status"]) => {
    switch (status) {
      case "ready": return "#a6e3a1"; // Green
      case "skipped": return "#6c7086"; // Gray
      case "generating": return "#f9e2af"; // Yellow
      case "failed": return "#f38ba8"; // Red
      default: return "#6c7086";
    }
  };

  return (
    <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "4px" }}>
      <h3 style={{ color: "#a6adc8", fontSize: "12px", textTransform: "uppercase", fontWeight: "bold", padding: "8px", marginBottom: "8px" }}>
        Contents
      </h3>
      {sections.map((section) => (
        <button
          key={section.id}
          onClick={() => onSelectSection(section.slug)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 12px",
            borderRadius: "6px",
            backgroundColor: activeSectionSlug === section.slug ? "rgba(49, 50, 68, 0.8)" : "transparent",
            color: activeSectionSlug === section.slug ? "#cdd6f4" : "#bac2de",
            border: "none",
            cursor: "pointer",
            textAlign: "left",
            fontSize: "14px",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => { if (activeSectionSlug !== section.slug) e.currentTarget.style.backgroundColor = "rgba(49, 50, 68, 0.4)"; }}
          onMouseLeave={(e) => { if (activeSectionSlug !== section.slug) e.currentTarget.style.backgroundColor = "transparent"; }}
        >
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {section.title}
          </span>
          {section.status === "generating" ? (
            <Loader2 size={12} color={getStatusColor(section.status)} style={{ animation: "spin 1s linear infinite", flexShrink: 0 }} />
          ) : (
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: getStatusColor(section.status),
                flexShrink: 0,
              }}
            />
          )}
        </button>
      ))}
      <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }` }} />
    </div>
  );
}
