"use client";

import { useEffect, useState } from "react";
import { repoService } from "@/lib/api/client";
import { DependencyAnalyzer } from "@/components/dependencies/DependencyAnalyzer";
import { DependencyItem } from "@/types";

export default function DependenciesPage({ params }: { params: { repoId: string } }) {
  const [dependencies, setDependencies] = useState<DependencyItem[]>([]);

  useEffect(() => {
    repoService.getDependencies(params.repoId).then(setDependencies);
  }, [params.repoId]);

  return (
    <div className="h-full overflow-y-auto p-6 md:p-8 bg-[#07090e]">
      {dependencies.length > 0 ? (
        <DependencyAnalyzer dependencies={dependencies} />
      ) : (
        <div className="text-slate-500 text-xs font-mono p-8">Loading dependencies...</div>
      )}
    </div>
  );
}
