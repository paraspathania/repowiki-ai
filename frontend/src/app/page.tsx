"use client";

import { useState } from "react";
import { RepositoryInput } from "@/components/repository/RepositoryInput";
import { RepositoryPreviewCard } from "@/components/repository/RepositoryPreview";
import { RepositoryPreview } from "@/types";
import { BookOpen, GitBranch, Cpu, Sparkles } from "lucide-react";

export default function HomePage() {
  const [preview, setPreview] = useState<RepositoryPreview | null>(null);
  const [validatedUrl, setValidatedUrl] = useState<string>("");

  return (
    <main className="min-h-screen relative flex flex-col justify-between p-6 md:p-12 overflow-hidden bg-background">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none z-0" />
      <div className="absolute inset-0 radial-glow pointer-events-none z-0" />

      <div className="relative z-10 max-w-5xl mx-auto w-full space-y-16 flex-1 flex flex-col justify-center">
        {/* Header Hero */}
        <div className="text-center space-y-6 pt-12 md:pt-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-950/30 border border-indigo-500/20 rounded-full text-xs font-semibold text-indigo-300 backdrop-blur-md shadow-lg shadow-indigo-950/20 mb-3 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>RepoWiki AI v1.0</span>
          </div>
          <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-slate-400/80 max-w-3xl mx-auto leading-none">
            Understand Any Repository
          </h1>
          <p className="text-slate-400 text-base md:text-xl max-w-2xl mx-auto leading-relaxed font-normal">
            Transform software codebases into structured, navigable technical documentation.
            Overview, interactive Wiki, file walkthroughs, and architecture graphs.
          </p>
        </div>

        {/* Input / Preview Section */}
        <div className="space-y-6 w-full max-w-3xl mx-auto">
          <RepositoryInput
            onValidated={(prev, url) => {
              setPreview(prev);
              setValidatedUrl(url);
            }}
          />

          {preview && (
            <div className="animate-fade-in-up duration-300">
              <RepositoryPreviewCard
                preview={preview}
                repoUrl={validatedUrl}
              />
            </div>
          )}
        </div>

        {/* Value Proposition Cards */}
        {!preview && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            <div className="glass-panel glass-panel-interactive p-6 rounded-2xl space-y-4 shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-white tracking-tight">Technical Wiki</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Automatically generated architecture, module explanations, and getting-started docs grounded in source code.
                </p>
              </div>
            </div>

            <div className="glass-panel glass-panel-interactive p-6 rounded-2xl space-y-4 shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <GitBranch className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-white tracking-tight">Architecture Visualizer</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Evidence-grounded Mermaid diagrams visualizing module dependencies, data flow, and entry points.
                </p>
              </div>
            </div>

            <div className="glass-panel glass-panel-interactive p-6 rounded-2xl space-y-4 shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Cpu className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-white tracking-tight">Grounded AI Chat</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Ask deep questions about code logic with verified source citations linking straight to exact line numbers.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="relative z-10 text-center text-slate-500 text-xs py-8 mt-16 border-t border-white/[0.04] w-full max-w-5xl mx-auto flex items-center justify-between">
        <span>RepoWiki AI — Modular Monolith Architecture</span>
        <span className="flex items-center gap-1.5 text-slate-600">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Systems operational
        </span>
      </footer>
    </main>
  );
}
