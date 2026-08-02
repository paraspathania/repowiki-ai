"use client";

import { useAnalysisEvents } from "@/hooks/useAnalysisEvents";
import { AnalysisProgressCard } from "@/components/analysis/AnalysisProgress";

export default function AnalysisProgressPage({ params }: { params: { analysisId: string } }) {
  const event = useAnalysisEvents(params.analysisId);

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <AnalysisProgressCard event={event} analysisId={params.analysisId} />
    </main>
  );
}
