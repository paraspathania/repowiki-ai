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
    <div className="w-full h-full flex flex-col bg-surface border-r border-border">
      <div className="p-2 border-b border-border">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-500" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search files..."
            className="w-full pl-8 pr-3 py-1 bg-panel border border-border rounded text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-0.5 custom-scrollbar">
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
