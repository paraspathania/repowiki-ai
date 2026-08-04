"use client";

import { ChevronRight, Folder, FileText } from "lucide-react";

interface FileBreadcrumbProps {
  path: string;
  onNavigate?: (path: string) => void;
}

export function FileBreadcrumb({ path, onNavigate }: FileBreadcrumbProps) {
  const parts = path.split("/").filter(Boolean);

  return (
    <div className="flex items-center gap-2 text-xs text-slate-400 font-mono py-3 px-5 bg-panel/20 border-b border-white/[0.06] overflow-x-auto custom-scrollbar">
      <span
        onClick={() => onNavigate && onNavigate("/")}
        className="hover:text-white cursor-pointer transition-colors duration-200 flex items-center gap-1.5"
      >
        <Folder className="w-4 h-4 text-indigo-400" />
        <span className="font-semibold text-slate-300">root</span>
      </span>

      {parts.map((part, idx) => {
        const currentPath = "/" + parts.slice(0, idx + 1).join("/");
        const isLast = idx === parts.length - 1;

        return (
          <div key={currentPath} className="flex items-center gap-2 flex-shrink-0">
            <ChevronRight className="w-3.5 h-3.5 text-slate-700 flex-shrink-0" />
            <span
              onClick={() => onNavigate && onNavigate(currentPath)}
              className={`hover:text-white cursor-pointer transition-colors duration-200 flex items-center gap-1.5 ${
                isLast ? "text-white font-semibold" : "text-slate-300"
              }`}
            >
              {isLast ? <FileText className="w-3.5 h-3.5 text-slate-400" /> : null}
              <span>{part}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}
