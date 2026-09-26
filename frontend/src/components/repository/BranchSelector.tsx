"use client";

import { useState, useRef, useEffect } from "react";
import { GitBranch, ChevronDown, Check, Search } from "lucide-react";

interface BranchSelectorProps {
  branches?: string[];
  selectedBranch: string;
  onSelectBranch: (branch: string) => void;
}

export function BranchSelector({
  branches = [],
  selectedBranch,
  onSelectBranch,
}: BranchSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Safe deduplicated branches list with fallback
  const safeBranches =
    Array.isArray(branches) && branches.length > 0
      ? Array.from(new Set(branches.filter(Boolean)))
      : [selectedBranch || "main"];

  const currentBranch = selectedBranch || safeBranches[0] || "main";

  // Filter branches by search query
  const filteredBranches = safeBranches.filter((b) =>
    b.toLowerCase().includes(search.trim().toLowerCase())
  );

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen]);

  // If there's only 1 branch, render a clean branch pill
  if (safeBranches.length <= 1) {
    return (
      <div className="flex items-center gap-1.5">
        <GitBranch className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
        <span className="text-xs text-slate-400 font-medium">Branch:</span>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/[0.04] border border-white/[0.1] rounded-lg text-slate-200 font-mono text-xs shadow-sm">
          <span className="max-w-[130px] truncate">{currentBranch}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 relative" ref={dropdownRef}>
      <GitBranch className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
      <span className="text-xs text-slate-400 font-medium">Branch:</span>

      {/* Dropdown trigger button */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setIsOpen((prev) => !prev);
            setSearch("");
          }}
          className="flex items-center gap-2 px-2.5 py-1 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] hover:border-indigo-500/40 rounded-lg text-xs font-mono text-slate-200 transition-all duration-150 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 active:scale-95 cursor-pointer"
          title="Switch branch"
        >
          <span className="max-w-[120px] truncate font-medium text-slate-200">
            {currentBranch}
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-indigo-400" : ""
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 top-full mt-1.5 w-60 bg-[#0e121d] border border-white/[0.12] rounded-xl shadow-2xl z-50 py-1.5 animate-fade-in">
            <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-white/[0.08] flex items-center justify-between">
              <span>Select Branch</span>
              <span className="text-[10px] font-mono text-slate-500">
                {safeBranches.length} branch{safeBranches.length === 1 ? "" : "es"}
              </span>
            </div>

            {safeBranches.length > 5 && (
              <div className="p-2 border-b border-white/[0.06]">
                <div className="relative">
                  <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Filter branches..."
                    className="w-full pl-7 pr-2.5 py-1 text-xs bg-black/40 border border-white/[0.08] rounded-md text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                    autoFocus
                  />
                </div>
              </div>
            )}

            <div className="max-h-48 overflow-y-auto custom-scrollbar py-1">
              {filteredBranches.length === 0 ? (
                <div className="px-3 py-3 text-center text-xs text-slate-500 font-mono">
                  No matching branches
                </div>
              ) : (
                filteredBranches.map((b) => {
                  const isSelected = b === currentBranch;
                  return (
                    <button
                      key={b}
                      type="button"
                      onClick={() => {
                        onSelectBranch(b);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs font-mono flex items-center justify-between hover:bg-white/[0.08] transition-colors ${
                        isSelected
                          ? "text-indigo-400 font-bold bg-indigo-500/15"
                          : "text-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <GitBranch
                          className={`w-3 h-3 flex-shrink-0 ${
                            isSelected ? "text-indigo-400" : "text-slate-500"
                          }`}
                        />
                        <span className="truncate">{b}</span>
                      </div>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
