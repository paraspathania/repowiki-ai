"use client";

import { useState } from "react";
import { Folder, FolderOpen, FileText, ChevronRight, ChevronDown } from "lucide-react";

export interface FileNodeItem {
  name: string;
  path: string;
  type: "file" | "folder";
  children?: FileNodeItem[];
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
        className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs cursor-pointer transition ${
          isSelected ? "bg-accent/20 text-white font-medium" : "text-gray-300 hover:bg-panel hover:text-white"
        }`}
      >
        {isFolder ? (
          <>
            {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-gray-500" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-500" />}
            {isOpen ? <FolderOpen className="w-4 h-4 text-accent-blue" /> : <Folder className="w-4 h-4 text-accent-blue" />}
          </>
        ) : (
          <>
            <span className="w-3.5" />
            <FileText className="w-4 h-4 text-gray-400" />
          </>
        )}
        <span className="truncate">{node.name}</span>
      </div>

      {isFolder && isOpen && node.children && (
        <div className="pl-4 border-l border-border/40 my-0.5 space-y-0.5">
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
