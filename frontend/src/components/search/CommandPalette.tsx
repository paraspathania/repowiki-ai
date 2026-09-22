"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, FileCode, CornerDownLeft, Sparkles, Folder } from "lucide-react";

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

const MOCK_SEARCH_INDEX: SearchResult[] = [
  {
    chunk_id: "chk-1",
    path: "src/app/page.tsx",
    language: "typescript",
    symbol_name: "HomePage",
    symbol_type: "component",
    start_line: 11,
    end_line: 118,
    content: "Main landing page hero component introducing RepoWiki AI capabilities and repo input.",
    score: 0.95,
  },
  {
    chunk_id: "chk-2",
    path: "src/components/files/CodeViewer.tsx",
    language: "typescript",
    symbol_name: "CodeViewer",
    symbol_type: "component",
    start_line: 1,
    end_line: 150,
    content: "Monaco Editor integration supporting multi-level AI explanation drawers.",
    score: 0.91,
  },
  {
    chunk_id: "chk-3",
    path: "src/lib/api/client.ts",
    language: "typescript",
    symbol_name: "apiClient",
    symbol_type: "service",
    start_line: 5,
    end_line: 30,
    content: "Axios client with bearer auth interceptors and mock fallback execution.",
    score: 0.88,
  },
  {
    chunk_id: "chk-4",
    path: "backend/app/services/rag_service.py",
    language: "python",
    symbol_name: "search_hybrid_vector",
    symbol_type: "function",
    start_line: 45,
    end_line: 88,
    content: "Hybrid RAG search pipeline combining pgvector embeddings with BM25 sparse keyword indices.",
    score: 0.85,
  },
];

export function CommandPalette({ repositoryId, isOpen, onClose, onSelectResult }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery("");
      setResults(MOCK_SEARCH_INDEX);
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

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (!query.trim()) {
        setResults(MOCK_SEARCH_INDEX);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8000/api/v1/repositories/${repositoryId}/semantic-search`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
        } else {
          // Fallback search over mock index
          const filtered = MOCK_SEARCH_INDEX.filter((r) =>
            r.path.toLowerCase().includes(query.toLowerCase()) ||
            r.content.toLowerCase().includes(query.toLowerCase()) ||
            (r.symbol_name && r.symbol_name.toLowerCase().includes(query.toLowerCase()))
          );
          setResults(filtered);
        }
      } catch {
        const filtered = MOCK_SEARCH_INDEX.filter((r) =>
          r.path.toLowerCase().includes(query.toLowerCase()) ||
          r.content.toLowerCase().includes(query.toLowerCase()) ||
          (r.symbol_name && r.symbol_name.toLowerCase().includes(query.toLowerCase()))
        );
        setResults(filtered);
      } finally {
        setLoading(false);
        setSelectedIndex(0);
      }
    }, 200);
    return () => clearTimeout(timeout);
  }, [query, repositoryId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter" && results.length > 0) {
      e.preventDefault();
      if (onSelectResult) onSelectResult(results[selectedIndex]);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-start pt-16 md:pt-24 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#0d0f18] border border-white/[0.12] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-white/[0.08] gap-3">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="AI Semantic Code Search (Search symbols, APIs, comments, or functions)..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {loading && <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />}
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 space-y-1">
          {results.map((result, idx) => (
            <div
              key={result.chunk_id}
              onClick={() => {
                if (onSelectResult) onSelectResult(result);
                onClose();
              }}
              onMouseEnter={() => setSelectedIndex(idx)}
              className={`p-3 rounded-xl cursor-pointer transition flex flex-col gap-1 border ${
                idx === selectedIndex
                  ? "bg-indigo-950/40 border-indigo-500/50"
                  : "bg-transparent border-transparent hover:bg-white/[0.03]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-mono font-bold text-white">{result.path}</span>
                  {result.symbol_name && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                      {result.symbol_type}: {result.symbol_name}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-mono text-slate-500">L{result.start_line}-L{result.end_line}</span>
              </div>

              <p className="text-xs text-slate-400 line-clamp-1 leading-relaxed pl-6">
                {result.content}
              </p>
            </div>
          ))}

          {query && results.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-500">
              No matching code symbols found for "{query}".
            </div>
          )}
        </div>

        {/* Keyboard Shortcuts Footer */}
        <div className="px-4 py-2 bg-white/[0.02] border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1 bg-white/[0.08] rounded text-slate-300">↵</kbd> to select</span>
            <span><kbd className="px-1 bg-white/[0.08] rounded text-slate-300">↑↓</kbd> to navigate</span>
            <span><kbd className="px-1 bg-white/[0.08] rounded text-slate-300">esc</kbd> to close</span>
          </div>
          <span>Grounded Semantic RAG Index</span>
        </div>
      </div>
    </div>
  );
}
