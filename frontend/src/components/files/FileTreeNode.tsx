"use client";

import { useState } from "react";
import {
  Folder, FolderOpen, FileCode, FileText, ChevronRight, ChevronDown,
  Code2, FileJson, FileSpreadsheet, Terminal as TerminalIcon
} from "lucide-react";

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

function getFileIcon(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "tsx" || ext === "jsx") {
    return <Code2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />;
  }
  if (ext === "ts" || ext === "js") {
    return <FileCode className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />;
  }
  if (ext === "json") {
    return <FileJson className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />;
  }
  if (ext === "md") {
    return <FileText className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />;
  }
  if (ext === "py") {
    return <TerminalIcon className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />;
  }
  return <FileText className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />;
}

export function FileTreeNode({ node, selectedPath, onSelect }: FileTreeNodeProps) {
  const [isOpen, setIsOpen] = useState(true);
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
    <div className="select-none font-mono">
      <div
        onClick={handleToggle}
        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-all duration-150 border ${
          isSelected 
            ? "bg-indigo-600/20 text-white font-semibold border-indigo-500/40 shadow-sm shadow-indigo-500/10" 
            : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200 border-transparent"
        }`}
      >
        {isFolder ? (
          <>
            {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />}
            {isOpen ? <FolderOpen className="w-4 h-4 text-amber-400 flex-shrink-0" /> : <Folder className="w-4 h-4 text-amber-400/80 flex-shrink-0" />}
          </>
        ) : (
          <>
            <span className="w-3.5 flex-shrink-0" />
            {getFileIcon(node.name)}
          </>
        )}
        <span className="truncate text-[11px]">{node.name}</span>
      </div>

      {isFolder && isOpen && node.children && (
        <div className="pl-3 border-l border-white/[0.06] my-0.5 space-y-0.5 ml-3">
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
