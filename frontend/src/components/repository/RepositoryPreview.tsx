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
        branch: selectedBranch,
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
    <div className="w-full max-w-2xl mx-auto glass-panel rounded-2xl p-6 space-y-6 shadow-2xl animate-fade-in relative">
      <div className="absolute top-0 left-0 right-0 h-[1px] rounded-t-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
      
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">{preview.full_name}</h2>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border backdrop-blur-md ${
              preview.visibility === 'private' 
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/20' 
                : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
            }`}>
              {preview.visibility === 'private' ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
              <span className="capitalize">{preview.visibility}</span>
            </span>
          </div>
          {preview.description && (
            <p className="text-slate-400 text-sm leading-relaxed max-w-xl">{preview.description}</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/[0.06] text-xs">
        <div className="flex items-center gap-4 text-slate-300">
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-white">{preview.stars.toLocaleString()}</span>
            <span className="text-slate-500">stars</span>
          </div>
          <div className="flex items-center gap-1.5">
            <GitFork className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-white">{preview.forks.toLocaleString()}</span>
            <span className="text-slate-500">forks</span>
          </div>
          <div className="flex items-center gap-1.5">
            <HardDrive className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-white">{formattedSize}</span>
            <span className="text-slate-500">MB</span>
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
          className="w-full py-4 bg-white hover:bg-neutral-200 text-neutral-950 font-semibold rounded-xl flex items-center justify-center gap-2.5 transition-all duration-200 shadow-sm hover:shadow active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none text-base"
        >
          {starting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-neutral-950" />
              <span>Starting Analysis...</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current text-neutral-950" />
              <span>Analyze Repository</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
