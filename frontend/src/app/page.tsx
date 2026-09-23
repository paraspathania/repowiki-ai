"use client";

import { useState } from "react";
import { RepositoryInput } from "@/components/repository/RepositoryInput";
import { RepositoryPreviewCard } from "@/components/repository/RepositoryPreview";
import { RepositoryPreview } from "@/types";
import { BookOpen, GitBranch, Cpu, Sparkles, ArrowRight } from "lucide-react";
import { UserMenu } from "@/components/auth/UserMenu";
import Link from "next/link";

const SUGGESTION_CHIPS = [
  "facebook/react",
  "vercel/next.js",
  "fastapi/fastapi",
  "microsoft/vscode",
  "torvalds/linux",
];

export default function HomePage() {
  const [preview, setPreview] = useState<RepositoryPreview | null>(null);
  const [validatedUrl, setValidatedUrl] = useState<string>("");
  const [chipUrl, setChipUrl] = useState<string>("");

  function handleChipClick(repo: string) {
    setChipUrl(`https://github.com/${repo}`);
    setPreview(null);
  }

  return (
    <main className="min-h-screen relative flex flex-col justify-between p-6 md:p-12 overflow-hidden bg-background">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none z-0" />
      <div className="absolute inset-0 radial-glow pointer-events-none z-0" />

      {/* Top Navigation Bar */}
      <nav className="relative z-20 flex items-center justify-between w-full max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span className="text-sm font-bold text-white tracking-tight">
            RepoWiki AI
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/about"
            className="text-xs text-slate-400 hover:text-white transition-colors duration-200"
          >
            About
          </Link>
          <UserMenu />
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-4xl mx-auto w-full flex-1 flex flex-col justify-center items-center text-center gap-8 py-16">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-950/30 border border-indigo-500/20 rounded-full text-xs font-semibold text-indigo-300 backdrop-blur-md shadow-lg shadow-indigo-950/20 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>RepoWiki AI — Understand Any Codebase</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-slate-400/80 max-w-3xl leading-none">
          Understand Any Repository
        </h1>

        {/* Subtitle */}
        <p className="text-slate-400 text-base md:text-lg max-w-xl leading-relaxed font-normal">
          Paste a GitHub URL and get instant technical documentation — Wiki,
          architecture diagrams, AI chat, and more.
        </p>

        {/* Input */}
        <div className="w-full max-w-2xl space-y-4">
          <RepositoryInput
            key={chipUrl}
            defaultValue={chipUrl}
            onValidated={(prev, url) => {
              setPreview(prev);
              setValidatedUrl(url);
            }}
          />

          {/* Suggestion Chips */}
          {!preview && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-[11px] text-slate-500 font-medium">
                Try:
              </span>
              {SUGGESTION_CHIPS.map((repo) => (
                <button
                  key={repo}
                  onClick={() => handleChipClick(repo)}
                  className="px-3 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.08] hover:border-indigo-500/30 text-[11px] font-mono text-slate-400 hover:text-slate-200 transition-all duration-200"
                >
                  {repo}
                </button>
              ))}
            </div>
          )}

          {/* Preview Card */}
          {preview && (
            <div className="animate-fade-in-up duration-300">
              <RepositoryPreviewCard
                preview={preview}
                repoUrl={validatedUrl}
              />
            </div>
          )}
        </div>

        {/* Feature Cards — shown when no preview */}
        {!preview && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-3xl pt-4">
            <div className="glass-panel glass-panel-interactive p-5 rounded-2xl space-y-3 shadow-xl text-left">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white tracking-tight">Technical Wiki</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Architecture, module explanations, and getting-started docs grounded in source code.
                </p>
              </div>
            </div>

            <div className="glass-panel glass-panel-interactive p-5 rounded-2xl space-y-3 shadow-xl text-left">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <GitBranch className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white tracking-tight">Architecture Visualizer</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Mermaid diagrams visualizing module dependencies, data flow, and entry points.
                </p>
              </div>
            </div>

            <div className="glass-panel glass-panel-interactive p-5 rounded-2xl space-y-3 shadow-xl text-left">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Cpu className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white tracking-tight">Grounded AI Chat</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Ask deep questions about code logic with citations linking to exact line numbers.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* About link */}
        {!preview && (
          <Link
            href="/about"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-300 transition-colors duration-200 group"
          >
            Learn more about RepoWiki AI
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform duration-200" />
          </Link>
        )}
      </div>

      {/* Footer */}
      <footer className="relative z-10 text-center text-slate-600 text-xs py-6 border-t border-white/[0.04] w-full max-w-5xl mx-auto flex items-center justify-between">
        <span>RepoWiki AI — Modular Monolith Architecture</span>
        <span className="flex items-center gap-1.5 text-slate-600">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Systems operational
        </span>
      </footer>
    </main>
  );
}
