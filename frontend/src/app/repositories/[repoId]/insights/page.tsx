"use client";

import { useEffect, useState } from "react";
import { repoService } from "@/lib/api/client";
import { CodeMetricsDashboard } from "@/components/insights/CodeMetricsDashboard";
import { RefactoringSuggestion } from "@/types";

export default function InsightsPage({ params }: { params: { repoId: string } }) {
  const [suggestions, setSuggestions] = useState<RefactoringSuggestion[]>([]);

  useEffect(() => {
    repoService.getRefactoringSuggestions(params.repoId).then(setSuggestions);
  }, [params.repoId]);

  return (
    <div className="h-full overflow-y-auto p-6 md:p-8 bg-[#07090e]">
      <CodeMetricsDashboard suggestions={suggestions} />
    </div>
  );
}
