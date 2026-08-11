"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2, Paperclip, ArrowUp, Sparkles, Code2, GitBranch, Zap } from "lucide-react";

interface ChatComposerProps {
  onSend: (msg: string) => void;
  isStreaming: boolean;
  suggestions?: string[];
}

export function ChatComposer({ onSend, isStreaming, suggestions = [] }: ChatComposerProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [text]);

  const handleSend = () => {
    if (text.trim() && !isStreaming) {
      onSend(text.trim());
      setText("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full max-w-[820px] mx-auto">
      {/* Suggestion Chips */}
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => {
                onSend(suggestion);
                setText("");
              }}
              className="group flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-medium bg-white/[0.03] border border-white/[0.1] text-slate-300 hover:text-white hover:bg-indigo-600/20 hover:border-indigo-500/40 transition-all duration-200 hover:shadow-md hover:shadow-indigo-500/10"
            >
              <Zap className="w-3 h-3 text-indigo-400 group-hover:text-indigo-300" />
              <span>{suggestion}</span>
            </button>
          ))}
        </div>
      )}

      {/* Input Bar */}
      <div className="relative group">
        <div className="absolute -inset-[1px] bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-indigo-500/20 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm" />
        <div className="relative flex items-end gap-3 bg-[#0d101a] border border-white/[0.1] rounded-2xl p-3 group-focus-within:border-indigo-500/40 transition-all duration-200 shadow-xl shadow-black/20">
          {/* Left side actions */}
          <button className="p-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition flex-shrink-0 mb-0.5" title="Attach context file">
            <Paperclip className="w-4 h-4" />
          </button>

          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about architecture, APIs, flows, or any code question..."
            disabled={isStreaming}
            className="flex-1 bg-transparent text-white text-sm placeholder:text-slate-500 resize-none outline-none max-h-[150px] min-h-[24px] leading-6 py-1.5"
            rows={1}
          />

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!text.trim() || isStreaming}
            className={`p-2.5 rounded-xl transition-all duration-200 flex items-center justify-center flex-shrink-0 mb-0.5 ${
              text.trim() && !isStreaming
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30 hover:scale-[1.05] active:scale-[0.95]"
                : "bg-white/[0.04] text-slate-600 cursor-not-allowed"
            }`}
          >
            {isStreaming ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowUp className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Bottom footer */}
      <div className="flex items-center justify-center gap-2 text-[10px] text-slate-600">
        <Sparkles className="w-3 h-3 text-indigo-500/50" />
        <span>Grounded RAG — Responses cite exact file paths & line ranges from this repository</span>
      </div>
    </div>
  );
}
