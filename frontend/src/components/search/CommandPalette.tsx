"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, FileCode, CornerDownLeft, Sparkles, Folder, LayoutDashboard, Network, Database, Package, Server, BookOpen, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api/client";

export interface SearchResult {
  chunk_id: string;
  path: string;
  language: string;
  symbol_name?: string;
  symbol_type?: string;
  start_line: number;
  end_line: number;
  content: string;
  score: number;
}

interface CommandPaletteProps {
  repositoryId: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectResult?: (result: SearchResult) => void;
}

interface QuickAction {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  icon: React.ElementType;
}

export function CommandPalette({ repositoryId, isOpen, onClose, onSelectResult }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const QUICK_ACTIONS: QuickAction[] = [
    { id: "overview", title: "Overview", subtitle: "High-level metrics, code volume, and tech stack", href: `/repositories/${repositoryId}/overview`, icon: LayoutDashboard },
    { id: "files", title: "Files Explorer", subtitle: "Browse source files and AST-annotated code", href: `/repositories/${repositoryId}/files`, icon: Folder },
    { id: "architecture", title: "Architecture Visualizer", subtitle: "Mermaid component flow and system boundaries", href: `/repositories/${repositoryId}/architecture`, icon: Network },
    { id: "database", title: "Database ERD", subtitle: "Entity-relationship schema detection", href: `/repositories/${repositoryId}/database`, icon: Database },
    { id: "dependencies", title: "Dependencies", subtitle: "Parsed manifests and third-party packages", href: `/repositories/${repositoryId}/dependencies`, icon: Package },
    { id: "apis", title: "APIs Hub", subtitle: "Detected REST endpoints and route handlers", href: `/repositories/${repositoryId}/apis`, icon: Server },
    { id: "wiki", title: "Technical Wiki", subtitle: "AI & AST documentation chapters", href: `/repositories/${repositoryId}/wiki`, icon: BookOpen },
  ];

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Real-time backend search (with 250ms debounce)
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await apiClient.get(`/repositories/${repositoryId}/search`, {
          params: { q: query.trim(), limit: 12 },
        });
        const items = res.data?.results || [];
        setResults(items);
      } catch (err) {
        console.error("[CommandPalette] Search failed:", err);
        setResults([]);
      } finally {
        setLoading(false);
        setSelectedIndex(0);
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [query, repositoryId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalItems = query.trim() ? results.length : QUICK_ACTIONS.length;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (query.trim()) {
        if (results[selectedIndex]) {
          handleSelectSearchResult(results[selectedIndex]);
        }
      } else {
        if (QUICK_ACTIONS[selectedIndex]) {
          router.push(QUICK_ACTIONS[selectedIndex].href);
          onClose();
        }
      }
    }
  };

  const handleSelectSearchResult = (result: SearchResult) => {
    if (onSelectResult) {
      onSelectResult(result);
    } else {
      router.push(`/repositories/${repositoryId}/files?path=${encodeURIComponent(result.path)}`);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      {/* Background click to dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-[#0f111a] border border-white/[0.12] rounded-2xl shadow-2xl overflow-hidden flex flex-col z-10 animate-fade-in-up">
        {/* Search input bar */}
        <div className="flex items-center px-4 border-b border-white/[0.08] bg-[#141724]">
          <Search className="w-5 h-5 text-indigo-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search symbols, functions, files, or code..."
            className="w-full bg-transparent px-3 py-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-0 font-medium"
          />
          {loading ? (
            <Loader2 className="w-4 h-4 text-indigo-400 animate-spin flex-shrink-0 mr-2" />
          ) : query ? (
            <button
              onClick={() => setQuery("")}
              className="px-2 py-0.5 rounded text-[11px] text-slate-500 hover:text-white bg-white/[0.04]"
            >
              Clear
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white/[0.06] border border-white/[0.1] rounded text-slate-400">
                ESC
              </kbd>
            </div>
          )}
        </div>

        {/* Results or Quick Actions list */}
        <div className="max-h-[380px] overflow-y-auto custom-scrollbar p-2">
          {/* Real Search Results */}
          {query.trim() ? (
            results.length > 0 ? (
              <div className="space-y-1">
                <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-500">
                  Search Results ({results.length})
                </div>
                {results.map((result, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <div
                      key={result.chunk_id || `${result.path}-${idx}`}
                      onClick={() => handleSelectSearchResult(result)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all duration-150 ${
                        isSelected ? "bg-indigo-600/20 border border-indigo-500/30" : "hover:bg-white/[0.03] border border-transparent"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 flex-shrink-0 mt-0.5">
                        <FileCode className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white truncate font-mono">
                            {result.path}
                          </span>
                          {result.symbol_name && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300">
                              {result.symbol_name}
                            </span>
                          )}
                          {result.language && (
                            <span className="text-[10px] text-slate-500 font-mono">
                              {result.language}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 font-mono leading-relaxed bg-black/40 p-1.5 rounded">
                          {result.content.slice(0, 160)}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="flex items-center gap-1 text-[10px] text-indigo-300 flex-shrink-0 self-center">
                          <CornerDownLeft className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : !loading ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No code chunks or symbols found matching &quot;{query}&quot;.
              </div>
            ) : null
          ) : (
            /* Quick Workspace Navigation when input is empty */
            <div className="space-y-1">
              <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-500">
                Quick Navigation
              </div>
              {QUICK_ACTIONS.map((action, idx) => {
                const Icon = action.icon;
                const isSelected = idx === selectedIndex;
                return (
                  <div
                    key={action.id}
                    onClick={() => {
                      router.push(action.href);
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
                      isSelected ? "bg-indigo-600/20 border border-indigo-500/30 text-white" : "hover:bg-white/[0.03] text-slate-300 border border-transparent"
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-indigo-400 flex-shrink-0">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-semibold block">{action.title}</span>
                      <span className="text-[10px] text-slate-500 block truncate">{action.subtitle}</span>
                    </div>
                    {isSelected && (
                      <span className="text-[10px] text-indigo-300 flex items-center gap-1">
                        Go <CornerDownLeft className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2 border-t border-white/[0.06] bg-[#0c0e18] flex items-center justify-between text-[10px] text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-white/[0.06] rounded border border-white/[0.08]">↑</kbd>
              <kbd className="px-1 py-0.5 bg-white/[0.06] rounded border border-white/[0.08]">↓</kbd> to navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white/[0.06] rounded border border-white/[0.08]">↵</kbd> to select
            </span>
          </div>
          <span>RepoWiki AI Search</span>
        </div>
      </div>
    </div>
  );
}
