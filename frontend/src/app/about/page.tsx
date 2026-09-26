"use client";

import Link from "next/link";
import {
  Sparkles,
  BookOpen,
  GitBranch,
  Cpu,
  ShieldAlert,
  Package,
  Database,
  Server,
  ArrowLeft,
  Github,
} from "lucide-react";
import { Hero3DShowcase } from "@/components/home/Hero3DShowcase";
import { Navbar } from "@/components/layout/Navbar";

const FEATURES = [
  {
    icon: BookOpen,
    color: "blue",
    title: "Technical Wiki",
    description:
      "AI-generated, 5-chapter technical documentation grounded in your source code. Covers architecture, modules, APIs, and getting started.",
    badge: "AI-Powered",
  },
  {
    icon: GitBranch,
    color: "emerald",
    title: "Architecture Visualizer",
    description:
      "Auto-generated Mermaid diagrams showing module dependencies, data flow, message queues, and system boundaries.",
    badge: "Visual",
  },
  {
    icon: Cpu,
    color: "purple",
    title: "Grounded AI Chat",
    description:
      "Ask deep questions about any repository. Every answer is grounded with citations linking to exact file lines.",
    badge: "Auth Required",
    authRequired: true,
  },
  {
    icon: ShieldAlert,
    color: "rose",
    title: "Security Audit",
    description:
      "Automated SAST-style security analysis identifying vulnerabilities, hardcoded secrets, and insecure patterns.",
    badge: "Auth Required",
    authRequired: true,
  },
  {
    icon: Package,
    color: "orange",
    title: "Dependency Analysis",
    description:
      "Parse requirements.txt, package.json, pyproject.toml, go.mod and more into an interactive dependency table.",
    badge: "New",
  },
  {
    icon: Database,
    color: "teal",
    title: "Database ERD",
    description:
      "Detect SQLAlchemy models, SQL DDL, and Prisma schema to auto-generate entity-relationship diagrams.",
    badge: "New",
  },
  {
    icon: Server,
    color: "indigo",
    title: "APIs Hub",
    description:
      "AST-powered REST endpoint detection — method, path, handler, and line number extracted from any framework.",
    badge: "Live",
  },
];

const COLOR_MAP: Record<string, string> = {
  blue: "bg-blue-500/10 border-blue-500/20 text-blue-400",
  emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  purple: "bg-purple-500/10 border-purple-500/20 text-purple-400",
  rose: "bg-rose-500/10 border-rose-500/20 text-rose-400",
  orange: "bg-orange-500/10 border-orange-500/20 text-orange-400",
  teal: "bg-teal-500/10 border-teal-500/20 text-teal-400",
  indigo: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
};

const BADGE_COLOR_MAP: Record<string, string> = {
  "AI-Powered": "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
  "Auth Required": "bg-amber-500/10 text-amber-300 border-amber-500/20",
  "Visual": "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  "New": "bg-blue-500/10 text-blue-300 border-blue-500/20",
  "Live": "bg-teal-500/10 text-teal-300 border-teal-500/20",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen relative flex flex-col px-4 py-2 md:px-8 md:py-4 overflow-hidden bg-background">
      {/* Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none z-0" />
      <div className="absolute inset-0 radial-glow pointer-events-none z-0" />

      {/* Nav */}
      <Navbar showBackHome />

      <div className="relative z-10 max-w-5xl mx-auto w-full space-y-16 pt-4 pb-12">
        {/* Hero */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-950/30 border border-indigo-500/20 rounded-full text-xs font-semibold text-indigo-300 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            About RepoWiki AI
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-slate-400/80 leading-none">
            Your Codebase, Explained
          </h1>
          <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            RepoWiki AI transforms any public GitHub repository into structured,
            navigable technical documentation — powered by AI and AST analysis,
            with zero configuration required.
          </p>
          <div className="flex items-center justify-center gap-4 pt-2">
            <Link
              href="/"
              className="px-6 py-3 bg-white hover:bg-neutral-200 text-neutral-950 rounded-full font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow active:scale-95"
            >
              Analyze a Repository
            </Link>
            <a
              href="https://github.com/paraspathania/repowiki-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 border border-white/[0.1] hover:border-white/[0.2] hover:bg-white/[0.04] text-slate-300 hover:text-white rounded-full font-semibold text-sm transition-all duration-200"
            >
              <Github className="w-4 h-4" />
              View Source
            </a>
          </div>
        </div>

        {/* 3D Showcase */}
        <Hero3DShowcase />

        {/* Feature Grid */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white text-center">
            Everything You Need to Understand a Codebase
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              const iconClass = COLOR_MAP[feature.color];
              const badgeClass =
                BADGE_COLOR_MAP[feature.badge] ||
                "bg-slate-500/10 text-slate-300 border-slate-500/20";
              return (
                <div
                  key={feature.title}
                  className="glass-panel p-5 rounded-2xl space-y-3 shadow-xl relative"
                >
                  <div className="flex items-start justify-between">
                    <div
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${iconClass}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badgeClass}`}
                    >
                      {feature.badge}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white tracking-tight">
                      {feature.title}
                    </h3>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-4 pb-8">
          <p className="text-slate-400 text-sm">
            Ready to explore a repository?
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white hover:bg-neutral-200 text-neutral-950 rounded-full font-semibold transition-all duration-200 shadow-sm hover:shadow active:scale-95"
          >
            Get Started — It&apos;s Free
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 text-center text-slate-600 text-xs py-6 mt-16 border-t border-white/[0.04] w-full max-w-5xl mx-auto flex items-center justify-between">
        <span>RepoWiki AI — Modular Monolith Architecture</span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Systems operational
        </span>
      </footer>
    </main>
  );
}
