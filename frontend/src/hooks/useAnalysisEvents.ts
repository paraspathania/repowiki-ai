"use client";

import { useEffect, useState } from "react";

export interface ProgressEvent {
  stage: string;
  progress: number;
  message: string;
  status: "queued" | "running" | "completed" | "failed";
  repository_id?: string;
  failure_reason?: string;
}

export function useAnalysisEvents(analysisId: string) {
  const [event, setEvent] = useState<ProgressEvent>({
    stage: "Connecting",
    progress: 5,
    message: "Connecting to analysis worker...",
    status: "running",
  });

  useEffect(() => {
    if (!analysisId) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
    const sseUrl = `${apiUrl}/analyses/${analysisId}/events`;

    const eventSource = new EventSource(sseUrl);

    eventSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        setEvent(data);
      } catch (err) {
        console.error("Failed to parse SSE event", err);
      }
    };

    eventSource.onerror = () => {
      // Fallback polling if SSE disconnects or not available
      console.warn("SSE connection error, falling back to polling");
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [analysisId]);

  return event;
}
