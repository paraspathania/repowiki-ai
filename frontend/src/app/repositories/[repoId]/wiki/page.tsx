"use client";

import React, { useState, useEffect } from "react";
import { WikiSidebar } from "@/components/wiki/WikiSidebar";
import { WikiSection as WikiSectionComponent } from "@/components/wiki/WikiSection";
import { repoService } from "@/lib/api/client";
import { WikiSection } from "@/types";
import { BookOpen } from "lucide-react";

export default function WikiPage({ params }: { params: { repoId: string } }) {
  const [sections, setSections] = useState<WikiSection[]>([]);
  const [activeSectionSlug, setActiveSectionSlug] = useState<string>("");

  useEffect(() => {
    repoService.getWikiSections(params.repoId).then((data) => {
      const formatted = data.map((s: any) => ({
        id: s.id,
        slug: s.slug,
        title: s.title,
        content: s.content,
        status: "ready" as const,
      }));
      setSections(formatted);
      if (formatted.length > 0) {
        setActiveSectionSlug(formatted[0].slug);
      }
    });
  }, [params.repoId]);

  const activeSection = sections.find((s) => s.slug === activeSectionSlug);

  return (
    <div className="w-full h-full flex bg-[#07090e] relative overflow-hidden">
      {/* Sidebar */}
      <div className="relative z-10 w-[280px] border-r border-white/[0.08] flex-shrink-0 bg-[#090b12]">
        <WikiSidebar
          sections={sections as any}
          activeSectionSlug={activeSectionSlug}
          onSelectSection={setActiveSectionSlug}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 overflow-y-auto p-8 custom-scrollbar">
        {activeSection ? (
          <WikiSectionComponent
            section={activeSection as any}
            onRegenerate={() => console.log("Regenerate", activeSection.slug)}
          />
        ) : (
          <div className="text-slate-500 text-center mt-24 text-sm">Select a section to view</div>
        )}
      </div>
    </div>
  );
}
