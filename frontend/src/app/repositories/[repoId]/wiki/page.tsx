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
        fetchWiki();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateSection = async (slug: string) => {
    console.log(`Regenerating section ${slug}`);
  };

  const activeSection = sections.find((s) => s.slug === activeSectionSlug);

  if (!isReady && !isGenerating) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-background p-8 relative">
        <div className="absolute inset-0 radial-glow-light pointer-events-none z-0" />
        <div className="relative z-10 text-center max-w-md p-8 glass-panel rounded-2xl border border-white/[0.08] shadow-2xl">
          <div className="inline-flex p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400 mb-5">
            <BookOpen className="w-8 h-8" />
          </div>
          <h2 className="text-white text-2xl font-bold tracking-tight mb-2">Repository Wiki</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            The wiki has not been generated for this repository yet. Generate it now to get comprehensive documentation grounded in the source code.
          </p>
          <button
            onClick={handleGenerate}
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/10 transition-all duration-200 active:scale-98"
          >
            Generate Wiki
          </button>
        </div>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-background p-8 relative">
        <div className="absolute inset-0 radial-glow-light pointer-events-none z-0" />
        <div className="relative z-10 flex flex-col items-center max-w-sm text-center">
          <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mb-4" />
          <h2 className="text-white text-xl font-bold tracking-tight mb-2">Generating Wiki...</h2>
          <p className="text-slate-400 text-sm">This might take a few minutes depending on the repository size.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex bg-background relative overflow-hidden">
      <div className="absolute inset-0 radial-glow-light pointer-events-none z-0" />

      {/* Sidebar */}
      <div className="relative z-10 w-[280px] border-r border-white/[0.06] flex-shrink-0 bg-white/[0.01]">
        <WikiSidebar
          sections={sections}
          activeSectionSlug={activeSectionSlug}
          onSelectSection={setActiveSectionSlug}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 overflow-y-auto p-8 custom-scrollbar">
        {activeSection ? (
          <WikiSectionComponent section={activeSection} onRegenerate={() => handleRegenerateSection(activeSection.slug)} />
        ) : (
          <div className="text-slate-500 text-center mt-24 text-sm">Select a section to view</div>
        )}
      </div>
    </div>
  );
}
