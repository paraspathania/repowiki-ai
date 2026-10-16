"use client";

import { FileNodeItem, FileTreeNode } from "./FileTreeNode";
import { Search, FolderTree, RefreshCw, Filter } from "lucide-react";
import { useState } from "react";

interface FileTreeProps {
  nodes: FileNodeItem[];
  selectedPath: string;
  onSelect: (node: FileNodeItem) => void;
}

export function FileTree({ nodes, selectedPath, onSelect }: FileTreeProps) {
  const [filter, setFilter] = useState("");

  const filterNodes = (items: FileNodeItem[], query: string): FileNodeItem[] => {
    if (!query) return items;
    const q = query.toLowerCase();
    return items.reduce<FileNodeItem[]>((acc, item) => {
      if (item.name.toLowerCase().includes(q)) {
        acc.push(item);
      } else if (item.children) {
        const matchingChildren = filterNodes(item.children, q);
        if (matchingChildren.length > 0) {
          acc.push({ ...item, children: matchingChildren });
        }
      }
      return acc;
    }, []);
  };

  const filteredNodes = filterNodes(nodes, filter);

  return (
    <div className="w-full h-full flex flex-col bg-[#111111] border-r border-[#2A2A2A]">
      {/* Explorer Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-[#2A2A2A] bg-[#111111]">
        <div className="flex items-center gap-2">
          <FolderTree className="w-3.5 h-3.5 text-[#A3A3A3]" />
          <span className="text-[11px] font-mono font-medium text-[#F2F2F2] uppercase tracking-wider">
            Workspace Explorer
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setFilter("")}
            className="p-1 rounded text-[#777777] hover:text-[#F2F2F2] hover:bg-[#202020] transition"
            title="Refresh Explorer"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Dark IDE Search Bar */}
      <div className="p-2.5 border-b border-[#2A2A2A] bg-[#111111]">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 absolute left-3 text-[#777777] pointer-events-none" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Quick open (⌘P)"
            className="w-full pl-8 pr-7 py-1.5 bg-[#191919] border border-[#2A2A2A] focus:border-[#777777] rounded text-xs text-[#F2F2F2] placeholder:text-[#777777] font-mono focus:outline-none focus:ring-1 focus:ring-[#777777]/30 transition duration-150"
          />
          {filter && (
            <button
              onClick={() => setFilter("")}
              className="absolute right-2.5 text-[10px] font-mono text-[#777777] hover:text-[#F2F2F2]"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* File Tree List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5 custom-scrollbar bg-[#111111]">
        {filteredNodes.length > 0 ? (
          filteredNodes.map((node) => (
            <FileTreeNode
              key={node.path}
              node={node}
              selectedPath={selectedPath}
              onSelect={onSelect}
            />
          ))
        ) : (
          <div className="p-4 text-center text-[11px] font-mono text-[#777777]">
            No files found matching &quot;{filter}&quot;
          </div>
        )}
      </div>
    </div>
  );
}
