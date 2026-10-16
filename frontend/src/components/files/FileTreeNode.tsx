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
  if (ext === "tsx" || ext === "jsx" || ext === "ts" || ext === "js" || ext === "py") {
    return <FileCode className="w-3.5 h-3.5 text-[#777777] flex-shrink-0" />;
  }
  return <FileText className="w-3.5 h-3.5 text-[#777777] flex-shrink-0" />;
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
        className={`group relative flex items-center gap-1.5 px-2 py-1 rounded-sm text-xs cursor-pointer transition-colors duration-150 ${
          isSelected 
            ? "bg-[#191919] text-[#F2F2F2] font-semibold before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[2px] before:bg-[#F2F2F2]" 
            : "text-[#A3A3A3] hover:bg-[#191919]/60 hover:text-[#F2F2F2]"
        }`}
      >
        {isFolder ? (
          <>
            {isOpen ? (
              <ChevronDown className="w-3 h-3 text-[#777777] flex-shrink-0" />
            ) : (
              <ChevronRight className="w-3 h-3 text-[#777777] flex-shrink-0" />
            )}
            {isOpen ? (
              <FolderOpen className="w-3.5 h-3.5 text-[#A3A3A3] flex-shrink-0" />
            ) : (
              <Folder className="w-3.5 h-3.5 text-[#777777] flex-shrink-0" />
            )}
          </>
        ) : (
          <>
            <span className="w-3 flex-shrink-0" />
            {getFileIcon(node.name)}
          </>
        )}
        <span className="truncate text-[11px] leading-tight">{node.name}</span>
      </div>

      {isFolder && isOpen && node.children && (
        <div className="pl-2.5 border-l border-[#2A2A2A] my-0.5 space-y-0.5 ml-2">
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
