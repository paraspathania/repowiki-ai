"use client";

import { useState } from "react";
import { Star, GitFork, HardDrive, Lock, Globe, Play, Loader2 } from "lucide-react";
import { RepositoryPreview as PreviewType } from "@/types";
import { BranchSelector } from "./BranchSelector";
import { apiClient } from "@/lib/api/client";
import { useRouter } from "next/navigation";

interface RepositoryPreviewProps {
  preview: PreviewType;
  repoUrl: string;
}

export function RepositoryPreviewCard({ preview, repoUrl }: RepositoryPreviewProps) {
  const router = useRouter();
  const [selectedBranch, setSelectedBranch] = useState(preview.default_branch);
  const [starting, setStarting] = useState(false);

  const handleStartAnalysis = async () => {
    setStarting(true);
    try {
      const res = await apiClient.post("/repository/analyze", {
        repo_url: repoUrl,
      });
      const analysisId = res.data.analysis_id;
      router.push(`/analyses/${analysisId}/progress`);
    } catch (err) {
      alert("Failed to start analysis. Please try again.");
      setStarting(false);
    }
  };

  const formattedSize = (preview.size_bytes / (1024 * 1024)).toFixed(1);

  return (
    <div className="w-full max-w-2xl mx-auto bg-panel border border-border rounded-xl p-6 space-y-6 shadow-xl">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white">{preview.full_name}</h2>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${
              preview.visibility === 'private' ? 'bg-amber-950/60 text-amber-400 border border-amber-800/50' : 'bg-blue-950/60 text-blue-400 border border-blue-800/50'
            }`}>
              {preview.visibility === 'private' ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
              {preview.visibility}
            </span>
          </div>
          {preview.description && (
            <p className="text-gray-400 text-sm mt-2 line-clamp-2">{preview.description}</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-border/50 text-xs text-gray-300">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 text-amber-400" />
            <span>{preview.stars.toLocaleString()} stars</span>
          </div>
          <div className="flex items-center gap-1.5">
            <GitFork className="w-4 h-4 text-gray-400" />
            <span>{preview.forks.toLocaleString()} forks</span>
          </div>
          <div className="flex items-center gap-1.5">
            <HardDrive className="w-4 h-4 text-gray-400" />
            <span>{formattedSize} MB</span>
          </div>
        </div>

        <BranchSelector
          branches={preview.branches}
          selectedBranch={selectedBranch}
          onSelectBranch={setSelectedBranch}
        />
      </div>

      <div className="pt-2">
        <button
          onClick={handleStartAnalysis}
          disabled={starting}
          className="w-full py-3.5 bg-accent hover:bg-accent-hover text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50 text-base"
        >
          {starting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Starting Analysis...</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" />
              <span>Analyze Repository</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
