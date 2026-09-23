"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { DependencyAnalyzer } from "@/components/dependencies/DependencyAnalyzer";
import { DependencyItem } from "@/types";
import { Package, Loader2, AlertCircle } from "lucide-react";

export default function DependenciesPage({ params }: { params: { repoId: string } }) {
  const [dependencies, setDependencies] = useState<DependencyItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    apiClient
      .get(`/repositories/${params.repoId}/dependencies`)
      .then((res) => {
        if (!isMounted) return;
        if (res.status === 202) {
          setStatusMsg(res.data?.message || "Analysis is currently processing...");
          setDependencies([]);
        } else {
          const rawDeps = res.data?.dependencies || [];
          const formatted: DependencyItem[] = rawDeps.map((d: any) => ({
            name: d.name,
            version: d.version ? d.version.replace(/^[=><~^!]+/, "") : "unspecified",
            status: "up-to-date",
            ecosystem:
              d.language === "Python"
                ? "pip"
                : d.language === "Rust"
                ? "cargo"
                : d.language === "Go"
                ? "npm"
                : "npm",
            vulnerabilityDescription: d.file_path
              ? `${d.file_path} (${d.type} dependency)`
              : undefined,
          }));
          setDependencies(formatted);
          setStatusMsg(null);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setStatusMsg("Failed to load dependencies.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [params.repoId]);

  return (
    <div className="h-full overflow-y-auto p-6 md:p-8 bg-[#07090e]">
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 text-slate-400 gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
          <span className="text-sm font-mono">Parsing repository dependencies...</span>
        </div>
      ) : dependencies.length > 0 ? (
        <DependencyAnalyzer dependencies={dependencies} />
      ) : (
        <div className="flex flex-col items-center justify-center p-16 border border-white/[0.08] rounded-2xl bg-[#090b12] text-center max-w-lg mx-auto mt-12">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4">
            <Package className="w-6 h-6 text-indigo-400" />
          </div>
          <h3 className="text-base font-bold text-white mb-2">No Dependencies Detected</h3>
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm mb-4">
            {statusMsg ||
              "No dependency manifest files were identified in this repository. We automatically parse requirements.txt, package.json, pyproject.toml, Pipfile, and go.mod."}
          </p>
        </div>
      )}
    </div>
  );
}
