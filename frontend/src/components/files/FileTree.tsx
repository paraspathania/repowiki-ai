"use client";

import { FileNodeItem, FileTreeNode } from "./FileTreeNode";
import { Search } from "lucide-react";
import { useState } from "react";

interface FileTreeProps {
  nodes: FileNodeItem[];
  selectedPath: string;
  onSelect: (node: FileNodeItem) => void;
}

export function FileTree({ nodes, selectedPath, onSelect }: FileTreeProps) {
  const [filter, setFilter] = useState("");

  return (
    <div className="w-full h-full flex flex-col bg-surface/10 backdrop-blur-md border-r border-white/[0.06]">
      <div className="p-3 border-b border-white/[0.06]">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search files..."
            className="w-full pl-9 pr-3.5 py-2.5 bg-panel/30 border border-white/[0.08] focus:border-indigo-500/40 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition duration-200"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3.5 space-y-1 custom-scrollbar">
        {nodes.map((node) => (
          <FileTreeNode
            key={node.path}
            node={node}
            selectedPath={selectedPath}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
