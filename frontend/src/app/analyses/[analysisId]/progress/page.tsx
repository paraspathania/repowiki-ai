"use client";

import { useAnalysisEvents } from "@/hooks/useAnalysisEvents";
import { AnalysisProgressCard } from "@/components/analysis/AnalysisProgress";

export default function AnalysisProgressPage({ params }: { params: { analysisId: string } }) {
  const event = useAnalysisEvents(params.analysisId);

  return (
    <main className="min-h-screen bg-[#0C0C0C] text-[#F5F5F5] flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      {/* Editorial Engineering Console Status Bar */}
      <div className="w-full max-w-2xl mb-4 flex items-center justify-between text-xs font-mono text-[#777777] border-b border-[#292929] pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-[#F5F5F5] inline-block" />
          <span className="text-[#F5F5F5] font-semibold tracking-wider">REPOWIKI // CONSOLE</span>
        </div>
        <div className="text-[11px] text-[#777777]">
          SESSION: {params.analysisId ? (params.analysisId.length > 8 ? `${params.analysisId.slice(0, 8)}` : params.analysisId) : "LOCAL"}
        </div>
      </div>
      <AnalysisProgressCard event={event} analysisId={params.analysisId} />
    </main>
  );
}
