"use client";

import { useEffect, useState } from "react";
import { repoService } from "@/lib/api/client";
import { ArchitectureStudio } from "@/components/architecture/ArchitectureStudio";
import { Loader2 } from "lucide-react";

export default function ArchitecturePage({ params }: { params: { repoId: string } }) {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [apis, setApis] = useState<any[]>([]);
  const [diagrams, setDiagrams] = useState<Record<string, string>>({});

  useEffect(() => {
    let mounted = true;
    Promise.all([
      repoService.getSummary(params.repoId).catch(() => null),
      repoService.getApiEndpoints(params.repoId).catch(() => []),
      repoService.getArchitectureDiagrams(params.repoId).catch(() => ({})),
    ]).then(([summaryData, apisData, diagramsData]) => {
      if (!mounted) return;
      if (summaryData) setSummary(summaryData);
      if (apisData) setApis(apisData);
      if (diagramsData && typeof diagramsData === "object") {
        setDiagrams(diagramsData);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [params.repoId]);

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#090909] text-[#A3A3A3] font-mono gap-3 select-none">
        <Loader2 className="w-5 h-5 animate-spin text-[#F5F5F5]" />
        <span className="text-xs">Synthesizing Architecture Studio...</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-hidden bg-[#090909]">
      <ArchitectureStudio
        repoId={params.repoId}
        summary={summary}
        apis={apis}
        diagrams={diagrams}
      />
    </div>
  );
}
