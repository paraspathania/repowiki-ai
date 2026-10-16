"use client";

import Link from "next/link";
import {
  ArrowRight,
  Github,
  CheckCircle2,
  Lock,
  ExternalLink,
  Terminal,
  FileCode,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { HeroRepositoryExplorer, Hero3DShowcase } from "@/components/home/Hero3DShowcase";

interface CapabilityItem {
  index: string;
  title: string;
  description: string;
  engine: string;
  status: string;
  authRequired?: boolean;
}

const CAPABILITIES: CapabilityItem[] = [
  {
    index: "01",
    title: "Technical Wiki",
    description:
      "5-chapter technical documentation generated from source code. Covers system architecture, core modules, APIs, and getting started.",
    engine: "AST Grammar Parser",
    status: "UNLOCKED",
  },
  {
    index: "02",
    title: "Architecture Visualizer",
    description:
      "Auto-generated Mermaid diagrams visualizing module dependencies, service boundaries, and asynchronous message queues.",
    engine: "Mermaid Flow Topology",
    status: "VISUAL",
  },
  {
    index: "03",
    title: "Grounded AI Chat",
    description:
      "Conversational code intelligence with zero hallucination. Every answer cites exact file lines with clickable references.",
    engine: "pgvector + RAG Citations",
    status: "AUTH REQUIRED",
    authRequired: true,
  },
  {
    index: "04",
    title: "Security Audit",
    description:
      "Automated SAST-style security analysis identifying hardcoded secrets, sensitive credentials, and insecure syntax patterns.",
    engine: "SAIF Framework Scan",
    status: "AUTH REQUIRED",
    authRequired: true,
  },
  {
    index: "05",
    title: "Dependency Analysis",
    description:
      "Interactive dependency table parsed from requirements.txt, package.json, pyproject.toml, and go.mod manifest files.",
    engine: "Manifest Indexer",
    status: "UNLOCKED",
  },
  {
    index: "06",
    title: "Database ERD",
    description:
      "Entity-relationship diagrams inferred from SQLAlchemy models, SQL DDL, and Prisma schema definitions.",
    engine: "Schema DDL Inferrer",
    status: "UNLOCKED",
  },
  {
    index: "07",
    title: "APIs Hub",
    description:
      "AST-powered REST endpoint detection — method, path, handler function, and response JSON schema extracted without runtime execution.",
    engine: "OpenAPI 3.1 Registry",
    status: "LIVE",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Connect a repository",
    description:
      "Paste any public GitHub repository URL or choose from open-source benchmarks. Zero CLI configuration, SSH keys, or build setups required.",
  },
  {
    number: "02",
    title: "Analyze code and relationships",
    description:
      "Tree-Sitter compiles source syntax trees, extracts REST endpoint declarations, maps cross-module dependencies, and builds vector embeddings.",
  },
  {
    number: "03",
    title: "Explore generated documentation",
    description:
      "Navigate 5-chapter structured wikis, inspect architecture topologies, query code logic with line citations, and audit security compliance.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#101110] text-[#E8E8DF] font-sans selection:bg-[#C5F467] selection:text-[#101110] overflow-x-hidden">
      {/* Navigation */}
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24 sm:space-y-32 pt-10 sm:pt-14 pb-24">
        
        {/* ========================================================
            1. HERO SECTION (Asymmetric 2-Column Editorial Layout)
            ======================================================== */}
        <section aria-labelledby="hero-heading" className="pt-2 sm:pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Column: Editorial Headline & Actions (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Eyebrow */}
              <div className="font-mono text-xs text-[#A1A39B] tracking-widest uppercase flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#C5F467] rounded-none" />
                <span>REPOSITORY INTELLIGENCE / 01</span>
              </div>

              {/* Headline */}
              <h1
                id="hero-heading"
                className="text-4xl sm:text-5xl lg:text-[54px] font-bold tracking-tight text-[#E8E8DF] leading-[1.08]"
              >
                Understand the code you didn&apos;t write.
              </h1>

              {/* Description */}
              <p className="text-[#A1A39B] text-base leading-relaxed max-w-lg font-normal">
                RepoWiki AI turns GitHub repositories into navigable technical documentation,
                architecture insights, and code-grounded answers.
              </p>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/"
                  className="px-4 py-2.5 bg-[#E8E8DF] hover:bg-white text-[#101110] font-semibold text-xs rounded-sm tracking-tight inline-flex items-center gap-2 transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5F467]"
                >
                  <span>Analyze a repository</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <a
                  href="https://github.com/paraspathania/repowiki-ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 border border-[rgba(232,232,223,0.16)] hover:border-[rgba(232,232,223,0.3)] hover:bg-[#191A18] text-[#E8E8DF] font-medium text-xs rounded-sm tracking-tight inline-flex items-center gap-2 transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5F467]"
                >
                  <Github className="w-3.5 h-3.5 text-[#A1A39B]" />
                  <span>Explore the source</span>
                </a>
              </div>

              {/* Metadata Indicators */}
              <div className="pt-4 border-t border-[rgba(232,232,223,0.08)] flex items-center gap-6 font-mono text-[11px] text-[#A1A39B]">
                <div>
                  <span className="text-[#E8E8DF] font-bold block">100%</span>
                  <span>AST Grounded</span>
                </div>
                <div className="h-6 w-px bg-[rgba(232,232,223,0.08)]" />
                <div>
                  <span className="text-[#E8E8DF] font-bold block">0 config</span>
                  <span>Direct URL Input</span>
                </div>
                <div className="h-6 w-px bg-[rgba(232,232,223,0.08)]" />
                <div>
                  <span className="text-[#E8E8DF] font-bold block">OpenAPI 3.1</span>
                  <span>AST REST Extraction</span>
                </div>
              </div>
            </div>

            {/* Right Column: Genuine Repository Explorer (7 cols) */}
            <div className="lg:col-span-7">
              <HeroRepositoryExplorer />
            </div>

          </div>
        </section>

        {/* ========================================================
            2. PRODUCT DEMONSTRATION (Integrated Workbench)
            ======================================================== */}
        <section aria-labelledby="product-demo-heading" className="space-y-6">
          <div className="space-y-2">
            <div className="font-mono text-xs text-[#A1A39B] tracking-widest uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#C5F467] rounded-none" />
              <span>02 // PRODUCT DEMONSTRATION</span>
            </div>
            <h2
              id="product-demo-heading"
              className="text-2xl sm:text-3xl font-bold text-[#E8E8DF] tracking-tight"
            >
              Integrated code exploration, grounded in syntax.
            </h2>
            <p className="text-[#A1A39B] text-sm max-w-2xl leading-relaxed">
              Real application states for architecture maps, generated wikis, OpenAPI endpoints,
              and citation-verified AI chat.
            </p>
          </div>

          <Hero3DShowcase />
        </section>

        {/* ========================================================
            3. ABOUT / PRODUCT PHILOSOPHY
            ======================================================== */}
        <section
          aria-labelledby="philosophy-heading"
          className="border-t border-[rgba(232,232,223,0.08)] pt-16 sm:pt-20 space-y-10"
        >
          <div className="space-y-4">
            <div className="font-mono text-xs text-[#A1A39B] tracking-widest uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#C5F467] rounded-none" />
              <span>03 // PRODUCT PHILOSOPHY</span>
            </div>

            {/* Large Typographic Statement */}
            <h2
              id="philosophy-heading"
              className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-bold text-[#E8E8DF] leading-[1.15] max-w-4xl tracking-tight"
            >
              &ldquo;Understanding unfamiliar codebases should not require hours of manually tracing files and dependencies.&rdquo;
            </h2>
          </div>

          {/* 3-Column Technical Editorial Explanation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4 border-t border-[rgba(232,232,223,0.08)]">
            <div className="space-y-2">
              <h3 className="font-mono text-xs font-semibold uppercase text-[#E8E8DF] tracking-wider">
                The Cognitive Overhead
              </h3>
              <p className="text-sm text-[#A1A39B] leading-relaxed">
                Software engineers spend over 70% of their time reading and decoding unfamiliar code
                rather than writing new features. Onboarding to a legacy repository or auditing a
                third-party dependency often means tracing function calls across dozens of files, guessing
                service boundaries, and piecing together outdated READMEs.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-mono text-xs font-semibold uppercase text-[#E8E8DF] tracking-wider">
                Syntax-Grounded Truth
              </h3>
              <p className="text-sm text-[#A1A39B] leading-relaxed">
                RepoWiki AI approaches documentation as an engineering problem. By compiling abstract
                syntax trees via Tree-Sitter and indexing semantic vector embeddings, it builds
                verifiable architectural maps and technical wikis where every claim links directly to
                specific lines in repository source files.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-mono text-xs font-semibold uppercase text-[#E8E8DF] tracking-wider">
                Zero Configuration
              </h3>
              <p className="text-sm text-[#A1A39B] leading-relaxed">
                Documentation that requires local builds, complex Docker containers, or fragile
                CI scripts rarely survives. RepoWiki operates directly on public GitHub repositories
                using Tree-Sitter grammars—providing instant architectural visibility from any browser.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================
            4. CAPABILITY INDEX (Structured Technical Rows)
            ======================================================== */}
        <section aria-labelledby="capabilities-heading" className="space-y-8">
          <div className="space-y-2">
            <div className="font-mono text-xs text-[#A1A39B] tracking-widest uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#C5F467] rounded-none" />
              <span>04 // CAPABILITY INDEX</span>
            </div>
            <h2
              id="capabilities-heading"
              className="text-2xl sm:text-3xl font-bold text-[#E8E8DF] tracking-tight"
            >
              Seven modules for comprehensive repository intelligence.
            </h2>
            <p className="text-[#A1A39B] text-sm max-w-2xl leading-relaxed">
              Every capability is derived statically from source syntax trees or grounded through
              verifiable line-level citations.
            </p>
          </div>

          {/* Structured Table / Rows */}
          <div className="border border-[rgba(232,232,223,0.08)] bg-[#191A18] rounded-md overflow-hidden">
            {/* Table Header (Desktop) */}
            <div className="hidden md:grid grid-cols-12 px-5 py-3 bg-[#141514] border-b border-[rgba(232,232,223,0.08)] font-mono text-[11px] text-[#A1A39B] font-semibold tracking-wider uppercase">
              <span className="col-span-1">INDEX</span>
              <span className="col-span-3">CAPABILITY</span>
              <span className="col-span-5">DESCRIPTION</span>
              <span className="col-span-2">ENGINE SPEC</span>
              <span className="col-span-1 text-right">STATUS</span>
            </div>

            {/* Capability Rows */}
            <div className="divide-y divide-[rgba(232,232,223,0.06)]">
              {CAPABILITIES.map((cap) => (
                <div
                  key={cap.index}
                  tabIndex={0}
                  className="grid grid-cols-1 md:grid-cols-12 px-5 py-4 items-center gap-2 md:gap-4 hover:bg-[#141514] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5F467] group"
                >
                  {/* Index Numeral */}
                  <div className="col-span-1 font-mono text-xs text-[#A1A39B] group-hover:text-[#C5F467] transition-colors">
                    {cap.index}
                  </div>

                  {/* Title */}
                  <div className="col-span-3 font-semibold text-sm text-[#E8E8DF] flex items-center gap-2">
                    <span>{cap.title}</span>
                    {cap.authRequired && (
                      <Lock className="w-3 h-3 text-[#A1A39B] shrink-0" />
                    )}
                  </div>

                  {/* Description */}
                  <div className="col-span-5 text-xs text-[#A1A39B] leading-relaxed">
                    {cap.description}
                  </div>

                  {/* Engine Spec */}
                  <div className="col-span-2 font-mono text-[11px] text-[#A1A39B] hidden md:block">
                    {cap.engine}
                  </div>

                  {/* Status Indicator */}
                  <div className="col-span-1 text-left md:text-right font-mono text-[11px]">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded-none border text-[10px] ${
                        cap.authRequired
                          ? "border-amber-500/30 text-amber-300 bg-amber-950/20"
                          : "border-[rgba(232,232,223,0.12)] text-[#C5F467] bg-[#101110]"
                      }`}
                    >
                      {cap.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================
            5. HOW IT WORKS (3-Step Sequence)
            ======================================================== */}
        <section aria-labelledby="workflow-heading" className="space-y-8">
          <div className="space-y-2">
            <div className="font-mono text-xs text-[#A1A39B] tracking-widest uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#C5F467] rounded-none" />
              <span>05 // WORKFLOW SEQUENCE</span>
            </div>
            <h2
              id="workflow-heading"
              className="text-2xl sm:text-3xl font-bold text-[#E8E8DF] tracking-tight"
            >
              From repository URL to verified knowledge.
            </h2>
            <p className="text-[#A1A39B] text-sm max-w-2xl leading-relaxed">
              Three clean stages connecting raw source files to interactive developer documentation.
            </p>
          </div>

          {/* 3-Column Layout with Thin Separators (No giant cards) */}
          <div className="grid grid-cols-1 md:grid-cols-3 border border-[rgba(232,232,223,0.08)] bg-[#191A18] rounded-md divide-y md:divide-y-0 md:divide-x divide-[rgba(232,232,223,0.08)]">
            {STEPS.map((step) => (
              <div key={step.number} className="p-6 sm:p-7 space-y-4">
                <div className="font-mono text-xs text-[#C5F467] font-semibold">
                  STAGE // {step.number}
                </div>

                <h3 className="text-base font-bold text-[#E8E8DF] tracking-tight">
                  {step.title}
                </h3>

                <p className="text-xs sm:text-sm text-[#A1A39B] leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================
            6. FINAL CTA (Editorial Closing)
            ======================================================== */}
        <section
          aria-labelledby="cta-heading"
          className="border-t border-b border-[rgba(232,232,223,0.08)] py-14 sm:py-16 bg-[#141514]"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="font-mono text-xs text-[#A1A39B] tracking-widest uppercase flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#C5F467] rounded-none" />
                <span>06 // READY TO EXPLORE</span>
              </div>
              <h2
                id="cta-heading"
                className="text-3xl sm:text-4xl font-bold text-[#E8E8DF] tracking-tight"
              >
                Make the unfamiliar codebase familiar.
              </h2>
              <p className="text-[#A1A39B] text-sm leading-relaxed max-w-xl">
                Paste any public GitHub repository to extract technical wikis, architecture topologies,
                and AST-grounded explanations.
              </p>
            </div>

            <div className="shrink-0 space-y-3">
              <Link
                href="/"
                className="px-6 py-3 bg-[#E8E8DF] hover:bg-white text-[#101110] font-semibold text-xs rounded-sm tracking-tight inline-flex items-center gap-2 transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5F467]"
              >
                <span>Analyze a repository</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <div className="font-mono text-[11px] text-[#A1A39B]">
                Zero setup required • 100% Free
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ========================================================
          7. FOOTER (Aligned Technical Footer)
          ======================================================== */}
      <footer className="border-t border-[rgba(232,232,223,0.08)] bg-[#101110] py-8 text-xs font-mono text-[#A1A39B]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Identity & Build Version */}
          <div className="flex items-center gap-3">
            <span className="font-bold text-[#E8E8DF]">RepoWiki.ai</span>
            <span className="text-[11px] text-[#A1A39B]">v1.0.0-prod</span>
            <span className="hidden sm:inline text-[11px] text-[#A1A39B]">
              • Modular Monolith Architecture
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-5 text-[11px]">
            <Link href="/" className="hover:text-[#E8E8DF] transition-colors">
              Home
            </Link>
            <Link href="/about" className="text-[#E8E8DF] font-medium">
              About
            </Link>
            <a
              href="https://github.com/paraspathania/repowiki-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#E8E8DF] transition-colors inline-flex items-center gap-1"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3 text-[#A1A39B]" />
            </a>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center gap-2 text-[11px] text-[#A1A39B]">
            <span className="w-1.5 h-1.5 bg-[#C5F467] rounded-none" />
            <span>Systems operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
