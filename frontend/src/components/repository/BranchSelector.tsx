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
      <GitBranch className="w-4 h-4 text-gray-400" />
      <span className="text-sm text-gray-400 font-medium">Branch:</span>
      <select
        value={selectedBranch}
        onChange={(e) => onSelectBranch(e.target.value)}
        className="bg-panel border border-border rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-accent"
      >
        {branches.map((branch) => (
          <option key={branch} value={branch}>
            {branch}
          </option>
        ))}
      </select>
    </div>
  );
}
