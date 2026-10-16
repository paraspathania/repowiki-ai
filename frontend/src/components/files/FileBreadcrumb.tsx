"use client";

import { ChevronRight, Folder, FileText, Code2, Play, Sparkles, Terminal, CheckCircle2, RotateCcw } from "lucide-react";

interface FileBreadcrumbProps {
  path: string;
  onNavigate?: (path: string) => void;
  onRunCode?: () => void;
  isCompiling?: boolean;
}

export function FileBreadcrumb({ path, onNavigate, onRunCode, isCompiling }: FileBreadcrumbProps) {
  const parts = path.split("/").filter(Boolean);

  return (
    <div className="flex items-center justify-between px-3.5 py-2 bg-[#111111] border-b border-[#2A2A2A] text-xs font-mono text-[#A3A3A3] select-none">
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span
          onClick={() => onNavigate && onNavigate("/")}
          className="hover:text-[#F2F2F2] cursor-pointer transition-colors duration-150 flex items-center gap-1.5 text-[#A3A3A3]"
        >
          <Folder className="w-3.5 h-3.5 text-[#777777]" />
          <span className="font-medium text-[#A3A3A3]">root</span>
        </span>

        {parts.map((part, idx) => {
          const currentPath = parts.slice(0, idx + 1).join("/");
          const isLast = idx === parts.length - 1;

          return (
            <div key={currentPath} className="flex items-center gap-1.5 flex-shrink-0">
              <ChevronRight className="w-3 h-3 text-[#777777] flex-shrink-0" />
              <span
                onClick={() => onNavigate && onNavigate(currentPath)}
                className={`hover:text-[#F2F2F2] cursor-pointer transition-colors duration-150 flex items-center gap-1.5 ${
                  isLast ? "text-[#F2F2F2] font-semibold" : "text-[#777777]"
                }`}
              >
                {isLast && <Code2 className="w-3.5 h-3.5 text-[#A3A3A3]" />}
                <span>{part}</span>
              </span>
            </div>
          );
        })}
      </div>

      {/* Right: Compiler Action Buttons */}
      <div className="flex items-center gap-2 flex-shrink-0 ml-4">
        <button
          onClick={onRunCode}
          disabled={isCompiling}
          className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#F2F2F2] hover:bg-white text-[#111111] font-mono font-medium text-xs transition duration-150 disabled:opacity-40"
        >
          <Play className={`w-3 h-3 fill-current ${isCompiling ? "animate-spin" : ""}`} />
          <span>{isCompiling ? "Compiling..." : "Run Code"}</span>
        </button>
      </div>
    </div>
  );
}
