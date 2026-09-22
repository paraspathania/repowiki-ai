"use client";

import { RefactoringSuggestion } from "@/types";
import { Activity, ShieldCheck, Flame, Layers, Sparkles, ArrowRight, Zap } from "lucide-react";

interface CodeMetricsDashboardProps {
  suggestions: RefactoringSuggestion[];
}

export function CodeMetricsDashboard({ suggestions }: CodeMetricsDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#090b12] p-5 rounded-2xl border border-white/[0.08] space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Maintainability Index</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">88</span>
            <span className="text-xs text-emerald-400 font-semibold">/ 100 (A+)</span>
          </div>
          <p className="text-[11px] text-slate-500">High modularity and low code churn.</p>
        </div>

        <div className="bg-[#090b12] p-5 rounded-2xl border border-white/[0.08] space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Cyclomatic Complexity</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">4.2</span>
            <span className="text-xs text-amber-400 font-semibold">Avg / Method</span>
          </div>
          <p className="text-[11px] text-slate-500">Well structured control flows.</p>
        </div>

        <div className="bg-[#090b12] p-5 rounded-2xl border border-white/[0.08] space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Duplicate Code Ratio</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">1.8%</span>
            <span className="text-xs text-indigo-400 font-semibold">Optimal</span>
          </div>
          <p className="text-[11px] text-slate-500">Low duplicated code blocks.</p>
        </div>

        <div className="bg-[#090b12] p-5 rounded-2xl border border-white/[0.08] space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Refactoring Score</span>
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">2</span>
            <span className="text-xs text-purple-400 font-semibold">Action Items</span>
          </div>
          <p className="text-[11px] text-slate-500">Recommended optimization cards.</p>
        </div>
      </div>

      {/* Refactoring Suggestions List */}
      <div className="bg-[#090b12] p-6 rounded-2xl border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>AI Refactoring Recommendations & SOLID Audits</span>
          </h3>
          <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 font-mono">
            {suggestions.length} Cards
          </span>
        </div>

        <div className="space-y-4">
          {suggestions.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-xl bg-[#05070c] border border-white/[0.06] space-y-3 hover:border-indigo-500/40 transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {item.category}
                  </span>
                  <h4 className="text-xs font-bold text-white">{item.title}</h4>
                </div>
                <span className="text-[10px] font-mono text-slate-400">{item.filePath}</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {item.description}
              </p>

              {item.beforeSnippet && item.afterSnippet && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-[11px] font-mono">
                  <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/20 text-rose-300">
                    <span className="block text-[10px] uppercase font-bold text-rose-400 mb-1">Before Refactoring</span>
                    <pre className="whitespace-pre-wrap">{item.beforeSnippet}</pre>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-emerald-300">
                    <span className="block text-[10px] uppercase font-bold text-emerald-400 mb-1">After Refactoring</span>
                    <pre className="whitespace-pre-wrap">{item.afterSnippet}</pre>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
