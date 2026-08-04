"use client";

import { LayoutDashboard, Code, Cpu, HardDrive, FileCode } from "lucide-react";

export default function RepositoryOverviewPage({ params }: { params: { repoId: string } }) {
  return (
    <div className="w-full h-full overflow-y-auto p-8 space-y-8 custom-scrollbar relative bg-background">
      <div className="absolute inset-0 radial-glow-light pointer-events-none z-0" />

      <div className="relative z-10 space-y-8">
        {/* Hero Summary */}
        <div className="glass-panel p-6 md:p-8 rounded-2xl space-y-4 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 to-indigo-500" />
          
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
              <LayoutDashboard className="w-5.5 h-5.5 text-indigo-400" />
              <span>Repository Overview</span>
            </h2>
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold">
              Analyzed & Indexed
            </span>
          </div>

          <p className="text-slate-300 text-sm leading-relaxed max-w-3xl">
            RepoWiki AI is a high-performance software repository understanding platform built with Next.js, FastAPI, PostgreSQL (pgvector), and Redis/Celery background workers.
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            {["FastAPI", "Next.js", "PostgreSQL + pgvector", "Celery + Redis", "OpenAI API"].map((tech) => (
              <span key={tech} className="px-3 py-1 bg-white/[0.03] border border-white/[0.06] rounded-lg text-xs font-mono text-slate-300">
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {[
            { label: "Relevant Files", value: "1,482", icon: FileCode, color: "text-blue-400", bg: "bg-blue-500/5 border-blue-500/10" },
            { label: "Lines of Code", value: "142,500", icon: Code, color: "text-emerald-400", bg: "bg-emerald-500/5 border-emerald-500/10" },
            { label: "Repository Size", value: "48.2 MB", icon: HardDrive, color: "text-amber-400", bg: "bg-amber-500/5 border-amber-500/10" },
            { label: "Detected APIs", value: "24 Endpoints", icon: Cpu, color: "text-purple-400", bg: "bg-purple-500/5 border-purple-500/10" }
          ].map((stat, idx) => (
            <div key={idx} className={`glass-panel p-5 rounded-2xl space-y-3 shadow-xl ${stat.bg}`}>
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
                <span>{stat.label}</span>
                <stat.icon className={`w-4.5 h-4.5 ${stat.color}`} />
              </div>
              <p className="text-3xl font-extrabold text-white tracking-tight">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Language Breakdown */}
        <div className="glass-panel p-6 md:p-8 rounded-2xl space-y-6 shadow-xl">
          <h3 className="text-base font-bold text-white">Language Breakdown</h3>
          
          <div className="space-y-4">
            <div className="w-full h-3 bg-surface border border-white/[0.04] rounded-full overflow-hidden flex p-[1px]">
              <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: "65%" }} />
              <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full ml-[2px]" style={{ width: "25%" }} />
              <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full ml-[2px]" style={{ width: "10%" }} />
            </div>
            
            <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-300">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-500" />
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
      </div>
    </div>
  );
}
