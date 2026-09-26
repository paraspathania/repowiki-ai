"use client";

import React from "react";
import { Sparkles } from "lucide-react";

export function StreamingIndicator() {
  return (
    <div className="flex justify-start w-full">
      <div className="max-w-[85%] flex items-start gap-3">
        <div className="w-7 h-7 rounded-full bg-white/10 border border-white/15 flex items-center justify-center flex-shrink-0 ring-1 ring-white/20 mt-1 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-white">
              RepoWiki AI
            </span>
            <span className="text-[10px] text-slate-500 font-mono">is thinking...</span>
          </div>
          <div className="px-5 py-4 rounded-2xl rounded-tl-md bg-[#0d101a]/90 backdrop-blur-md border border-white/[0.08] shadow-xl">
            <div className="flex items-center gap-2">
              {/* Animated reasoning dots */}
              <div className="flex gap-1.5 items-center">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-indigo-400"
                    style={{
                      animation: `pulse-dot 1.4s infinite ease-in-out both`,
                      animationDelay: `${i * 0.2}s`,
                    }}
                  />
                ))}
              </div>
              <span className="text-xs text-slate-500 ml-2 font-mono">Analyzing codebase context...</span>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-dot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}} />
    </div>
  );
}
