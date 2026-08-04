"use client";

import { GitBranch } from "lucide-react";

interface BranchSelectorProps {
  branches: string[];
  selectedBranch: string;
  onSelectBranch: (branch: string) => void;
}

export function BranchSelector({ branches, selectedBranch, onSelectBranch }: BranchSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <GitBranch className="w-3.5 h-3.5 text-slate-400" />
      <span className="text-xs text-slate-400 font-medium">Branch:</span>
      <select
        value={selectedBranch}
        onChange={(e) => onSelectBranch(e.target.value)}
        className="bg-surface/50 border border-white/[0.08] focus:border-indigo-500/40 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition duration-200 cursor-pointer"
      >
        {branches.map((branch) => (
          <option key={branch} value={branch} className="bg-[#0b0f1a]">
            {branch}
          </option>
        ))}
      </select>
    </div>
  );
}
