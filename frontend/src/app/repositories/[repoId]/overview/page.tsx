"use client";

import { LayoutDashboard, Code, Cpu, HardDrive, FileCode, Star, GitFork, ShieldCheck } from "lucide-react";

export default function RepositoryOverviewPage({ params }: { params: { repoId: string } }) {
  return (
    <div className="w-full h-full overflow-y-auto p-8 space-y-8 custom-scrollbar">
      {/* Hero Summary */}
      <div className="bg-panel border border-border p-6 rounded-xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-accent-blue" />
            <span>Repository Overview</span>
          </h2>
          <span className="px-3 py-1 bg-accent/20 text-accent border border-accent/40 rounded-full text-xs font-semibold">
            Analyzed & Indexed
          </span>
        </div>

        <p className="text-gray-300 text-sm leading-relaxed">
          RepoWiki AI is a high-performance software repository understanding platform built with Next.js, FastAPI, PostgreSQL (pgvector), and Redis/Celery background workers.
        </p>

        <div className="flex flex-wrap gap-2 pt-2">
          <span className="px-2.5 py-1 bg-surface border border-border rounded text-xs font-mono text-gray-300">FastAPI</span>
          <span className="px-2.5 py-1 bg-surface border border-border rounded text-xs font-mono text-gray-300">Next.js</span>
          <span className="px-2.5 py-1 bg-surface border border-border rounded text-xs font-mono text-gray-300">PostgreSQL + pgvector</span>
          <span className="px-2.5 py-1 bg-surface border border-border rounded text-xs font-mono text-gray-300">Celery + Redis</span>
          <span className="px-2.5 py-1 bg-surface border border-border rounded text-xs font-mono text-gray-300">OpenAI API</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-panel border border-border p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-gray-400 text-xs font-medium">
            <span>Relevant Files</span>
            <FileCode className="w-4 h-4 text-accent-blue" />
          </div>
          <p className="text-2xl font-bold text-white">1,482</p>
        </div>

        <div className="bg-panel border border-border p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-gray-400 text-xs font-medium">
            <span>Lines of Code</span>
            <Code className="w-4 h-4 text-accent" />
          </div>
          <p className="text-2xl font-bold text-white">142,500</p>
        </div>

        <div className="bg-panel border border-border p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-gray-400 text-xs font-medium">
            <span>Repository Size</span>
            <HardDrive className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white">48.2 MB</p>
        </div>

        <div className="bg-panel border border-border p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-gray-400 text-xs font-medium">
            <span>Detected APIs</span>
            <Cpu className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-white">24 Endpoints</p>
        </div>
      </div>

      {/* Language Breakdown */}
      <div className="bg-panel border border-border p-6 rounded-xl space-y-4">
        <h3 className="text-base font-bold text-white">Language Breakdown</h3>
        <div className="w-full h-3 bg-surface rounded-full overflow-hidden flex">
          <div className="h-full bg-blue-500" style={{ width: "65%" }} />
          <div className="h-full bg-amber-500" style={{ width: "25%" }} />
          <div className="h-full bg-emerald-500" style={{ width: "10%" }} />
        </div>
        <div className="flex items-center gap-6 text-xs text-gray-300">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span>Python (65%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span>TypeScript (25%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span>Docker / SQL (10%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
