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
    <div className="flex items-center justify-between px-4 py-2 bg-[#090c14] border-b border-white/[0.08] text-xs font-mono text-slate-400 select-none">
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span
          onClick={() => onNavigate && onNavigate("/")}
          className="hover:text-white cursor-pointer transition-colors duration-150 flex items-center gap-1 text-slate-400"
        >
          <Folder className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold text-slate-300">root</span>
        </span>

        {parts.map((part, idx) => {
          const currentPath = parts.slice(0, idx + 1).join("/");
          const isLast = idx === parts.length - 1;

          return (
            <div key={currentPath} className="flex items-center gap-1.5 flex-shrink-0">
              <ChevronRight className="w-3 h-3 text-slate-600 flex-shrink-0" />
              <span
                onClick={() => onNavigate && onNavigate(currentPath)}
                className={`hover:text-white cursor-pointer transition-colors duration-150 flex items-center gap-1 ${
                  isLast ? "text-white font-bold" : "text-slate-400"
                }`}
              >
                {isLast && <Code2 className="w-3.5 h-3.5 text-cyan-400" />}
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
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono font-bold text-xs shadow-md shadow-emerald-600/20 transition duration-150 active:scale-95 disabled:opacity-50"
        >
          <Play className={`w-3 h-3 fill-current ${isCompiling ? "animate-spin" : ""}`} />
          <span>{isCompiling ? "Compiling..." : "▶ Run Code"}</span>
        </button>
      </div>
    </div>
  );
}
