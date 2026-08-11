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
    <div className="w-full h-full flex flex-col bg-black border-r border-white/[0.08]">
      {/* Explorer Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-white/[0.08] bg-black">
        <div className="flex items-center gap-2">
          <FolderTree className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-[10px] font-mono font-extrabold text-slate-400 uppercase tracking-wider">
            Workspace Explorer
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition" title="Refresh Explorer">
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Dark IDE Search Bar */}
      <div className="p-2.5 border-b border-white/[0.06] bg-black">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 absolute left-3 text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Quick open (⌘P)"
            className="w-full pl-8 pr-3 py-1.5 bg-[#0a0a0a] border border-white/[0.1] focus:border-indigo-500/50 rounded-lg text-xs text-white placeholder:text-slate-600 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition duration-150"
          />
          {filter && (
            <button
              onClick={() => setFilter("")}
              className="absolute right-2.5 text-[10px] font-mono text-slate-500 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* File Tree List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5 custom-scrollbar">
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
          <div className="p-4 text-center text-[11px] font-mono text-slate-600">
            No files found matching &quot;{filter}&quot;
          </div>
        )}
      </div>
    </div>
  );
}
