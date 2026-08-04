"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, FileCode, CornerDownLeft } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

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
  onSelectResult: (result: SearchResult) => void;
}

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

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/repositories/${repositoryId}/semantic-search`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
          setSelectedIndex(0);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);
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
      onSelectResult(results[selectedIndex]);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(4px)",
        zIndex: 50,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingTop: "10vh",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "600px",
          backgroundColor: "#1e1e2e",
          borderRadius: "12px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
          overflow: "hidden",
          border: "1px solid #313244",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", padding: "16px", borderBottom: "1px solid #313244" }}>
          <Search size={20} color="#a6adc8" style={{ marginRight: "12px" }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search for symbols, functions, or text..."
            style={{
              flex: 1,
              backgroundColor: "transparent",
              border: "none",
              color: "#cdd6f4",
              fontSize: "16px",
              outline: "none",
            }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {loading && <div style={{ width: "16px", height: "16px", border: "2px solid #89b4fa", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />}
        </div>
        
        {results.length > 0 && (
          <div style={{ maxHeight: "400px", overflowY: "auto", padding: "8px" }}>
            {results.map((result, idx) => (
              <div
                key={result.chunk_id}
                style={{
                  padding: "12px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  backgroundColor: idx === selectedIndex ? "#313244" : "transparent",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
                onClick={() => {
                  onSelectResult(result);
                  onClose();
                }}
                onMouseEnter={() => setSelectedIndex(idx)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <FileCode size={16} color="#cba6f7" />
                    <span style={{ color: "#cdd6f4", fontSize: "14px", fontFamily: "monospace" }}>{result.path}</span>
                  </div>
                  {result.language && (
                    <span style={{ fontSize: "12px", padding: "2px 6px", borderRadius: "4px", backgroundColor: "#45475a", color: "#a6adc8" }}>
                      {result.language}
                    </span>
                  )}
                </div>
                {result.symbol_name && (
                  <div style={{ fontSize: "13px", color: "#89b4fa", fontWeight: 500 }}>
                    {result.symbol_type ? `${result.symbol_type} ` : ""}{result.symbol_name}
                  </div>
                )}
                <div style={{ fontSize: "12px", color: "#a6adc8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {result.content}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {query && !loading && results.length === 0 && (
          <div style={{ padding: "32px", textAlign: "center", color: "#a6adc8", fontSize: "14px" }}>
            No results found for "{query}"
          </div>
        )}
        
        <div style={{ padding: "8px 16px", borderTop: "1px solid #313244", display: "flex", gap: "16px", backgroundColor: "#181825" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#a6adc8" }}>
            <span style={{ padding: "2px 4px", backgroundColor: "#313244", borderRadius: "4px", display: "flex", alignItems: "center" }}><CornerDownLeft size={12} /></span>
            <span>to select</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#a6adc8" }}>
            <span style={{ padding: "2px 4px", backgroundColor: "#313244", borderRadius: "4px" }}>↑↓</span>
            <span>to navigate</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#a6adc8" }}>
            <span style={{ padding: "2px 4px", backgroundColor: "#313244", borderRadius: "4px" }}>esc</span>
            <span>to close</span>
          </div>
        </div>
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        ` }} />
      </div>
    </div>
  );
}
