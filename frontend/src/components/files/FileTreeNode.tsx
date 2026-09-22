"use client";

import { useState } from "react";
import { Folder, FolderOpen, FileText, ChevronRight, ChevronDown } from "lucide-react";

export interface FileNodeItem {
  name: string;
  path: string;
  type: "file" | "folder";
  children?: FileNodeItem[];
  is_binary?: boolean;
  size_bytes?: number;
  language?: string;
}


interface FileTreeNodeProps {
  node: FileNodeItem;
  selectedPath: string;
  onSelect: (node: FileNodeItem) => void;
}

export function FileTreeNode({ node, selectedPath, onSelect }: FileTreeNodeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isFolder = node.type === "folder";
  const isSelected = selectedPath === node.path;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFolder) {
      setIsOpen(!isOpen);
    }
    onSelect(node);
  };

  return (
    <div className="select-none">
      <div
        onClick={handleToggle}
        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition border ${
          isSelected 
            ? "bg-indigo-500/10 text-indigo-300 font-semibold border-indigo-500/20" 
            : "text-slate-300 hover:bg-white/[0.02] hover:text-white border-transparent"
        }`}
      >
        {isFolder ? (
          <>
            {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
            {isOpen ? <FolderOpen className="w-4 h-4 text-indigo-400" /> : <Folder className="w-4 h-4 text-indigo-400" />}
          </>
        ) : (
          <>
            <span className="w-3.5" />
            <FileText className="w-4 h-4 text-slate-400" />
          </>
        )}
        <span className="truncate">{node.name}</span>
      </div>

      {isFolder && isOpen && node.children && (
        <div className="pl-4 border-l border-white/[0.04] my-0.5 space-y-0.5 ml-[17px]">
          {node.children.map((child) => (
            <FileTreeNode
              key={child.path}
              node={child}
              selectedPath={selectedPath}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
