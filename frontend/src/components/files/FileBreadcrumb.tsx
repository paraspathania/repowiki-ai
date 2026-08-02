"use client";

import { ChevronRight, Folder, FileText } from "lucide-react";

interface FileBreadcrumbProps {
  path: string;
  onNavigate?: (path: string) => void;
}

export function FileBreadcrumb({ path, onNavigate }: FileBreadcrumbProps) {
  const parts = path.split("/").filter(Boolean);

  return (
    <div className="flex items-center gap-1.5 text-xs text-gray-400 font-mono py-2 px-4 bg-surface border-b border-border overflow-x-auto">
      <span
        onClick={() => onNavigate && onNavigate("/")}
        className="hover:text-white cursor-pointer transition flex items-center gap-1"
      >
        <Folder className="w-3.5 h-3.5 text-accent-blue" />
        root
      </span>

      {parts.map((part, idx) => {
        const currentPath = "/" + parts.slice(0, idx + 1).join("/");
        const isLast = idx === parts.length - 1;

        return (
          <div key={currentPath} className="flex items-center gap-1.5">
            <ChevronRight className="w-3 h-3 text-gray-600 flex-shrink-0" />
            <span
              onClick={() => onNavigate && onNavigate(currentPath)}
              className={`hover:text-white cursor-pointer transition ${
                isLast ? "text-white font-semibold" : ""
              }`}
            >
              {isLast ? <FileText className="w-3.5 h-3.5 inline mr-1 text-gray-300" /> : null}
              {part}
            </span>
          </div>
        );
      })}
    </div>
  );
}
