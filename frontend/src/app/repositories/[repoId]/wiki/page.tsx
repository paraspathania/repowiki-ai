"use client";

import React, { useState, useEffect } from "react";
import { WikiSidebar } from "@/components/wiki/WikiSidebar";
import { WikiSection as WikiSectionComponent } from "@/components/wiki/WikiSection";
import { BookOpen, Loader2 } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export interface Citation {
  path: string;
  line?: number;
}

export interface WikiSection {
  id: string;
  slug: string;
  title: string;
  content: string;
  status: "ready" | "skipped" | "generating" | "failed";
  citations?: Citation[];
}

export default function WikiPage({ params }: { params: { repoId: string } }) {
  const [sections, setSections] = useState<WikiSection[]>([]);
  const [activeSectionSlug, setActiveSectionSlug] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    fetchWiki();
  }, [params.repoId]);

  const fetchWiki = async () => {
    try {
      const res = await fetch(`${API_BASE}/repositories/${params.repoId}/wiki`);
      if (res.ok) {
        const data = await res.json();
        if (data.sections && data.sections.length > 0) {
          setSections(data.sections);
          setActiveSectionSlug(data.sections[0].slug);
          setIsReady(true);
        } else {
          setIsReady(false);
        }
      } else {
        setIsReady(false);
      }
    } catch (err) {
      console.error(err);
      setIsReady(false);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch(`${API_BASE}/repositories/${params.repoId}/wiki/generate`, {
        method: "POST",
      });
      if (res.ok) {
        // Mocked response handling, in real app might need polling
        fetchWiki();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateSection = async (slug: string) => {
    // In a real app, you might call an endpoint like POST /wiki/sections/{slug}/regenerate
    console.log(\`Regenerating section \${slug}\`);
  };

  const activeSection = sections.find((s) => s.slug === activeSectionSlug);

  if (!isReady && !isGenerating) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", width: "100%", backgroundColor: "#11111b", padding: "32px" }}>
        <div style={{ textAlign: "center", maxWidth: "400px", padding: "32px", backgroundColor: "#1e1e2e", borderRadius: "16px", border: "1px solid #313244" }}>
          <div style={{ display: "inline-flex", padding: "16px", backgroundColor: "rgba(137, 180, 250, 0.1)", borderRadius: "50%", marginBottom: "16px" }}>
            <BookOpen size={48} color="#89b4fa" />
          </div>
          <h2 style={{ color: "#cdd6f4", fontSize: "24px", fontWeight: "bold", marginBottom: "8px" }}>Repository Wiki</h2>
          <p style={{ color: "#a6adc8", fontSize: "14px", marginBottom: "24px", lineHeight: 1.5 }}>
            The wiki has not been generated for this repository yet. Generate it now to get comprehensive documentation grounded in the source code.
          </p>
          <button
            onClick={handleGenerate}
            style={{
              padding: "12px 24px",
              backgroundColor: "#cba6f7",
              color: "#11111b",
              border: "none",
              borderRadius: "8px",
              fontWeight: "bold",
              cursor: "pointer",
              width: "100%",
            }}
          >
            Generate Wiki
          </button>
        </div>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", width: "100%", backgroundColor: "#11111b" }}>
        <Loader2 size={48} color="#cba6f7" style={{ animation: "spin 1s linear infinite", marginBottom: "16px" }} />
        <h2 style={{ color: "#cdd6f4", fontSize: "20px", fontWeight: "bold" }}>Generating Wiki...</h2>
        <p style={{ color: "#a6adc8", fontSize: "14px", marginTop: "8px" }}>This might take a few minutes depending on the repository size.</p>
        <style dangerouslySetInnerHTML={{ __html: \`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }\`}} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100%", width: "100%", backgroundColor: "#11111b", overflow: "hidden" }}>
      {/* Sidebar */}
      <div style={{ width: "280px", borderRight: "1px solid #313244", flexShrink: 0, backgroundColor: "#181825" }}>
        <WikiSidebar
          sections={sections}
          activeSectionSlug={activeSectionSlug}
          onSelectSection={setActiveSectionSlug}
        />
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "48px", position: "relative" }}>
        {activeSection ? (
          <WikiSectionComponent section={activeSection} onRegenerate={() => handleRegenerateSection(activeSection.slug)} />
        ) : (
          <div style={{ color: "#a6adc8", textAlign: "center", marginTop: "100px" }}>Select a section to view</div>
        )}
      </div>
    </div>
  );
}
