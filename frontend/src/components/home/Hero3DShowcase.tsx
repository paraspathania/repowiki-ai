"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Code,
  FileText,
  GitFork,
  MessageSquare,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Cpu,
  Layers,
  Terminal,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Zap,
  Database,
  Lock,
  Search,
  Copy,
  Check,
  BookOpen,
  Server,
  Radio,
  FileCode,
  ListFilter,
  CheckSquare,
} from "lucide-react";

type Mode = "code" | "wiki" | "architecture" | "chat" | "apis" | "security";

interface ModeConfig {
  id: Mode;
  label: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  fileName: string;
  language: string;
  description: string;
}

const MODES: ModeConfig[] = [
  {
    id: "code",
    label: "Code Walkthrough",
    badge: "Syntax & AST",
    icon: Code,
    fileName: "auth-context.tsx",
    language: "TypeScript",
    description: "Deep code analysis with line-by-line AST symbols and grounded logic.",
  },
  {
    id: "wiki",
    label: "Technical Wiki",
    badge: "14 Multi-Pages",
    icon: FileText,
    fileName: "1_PROJECT_OVERVIEW.md",
    language: "Markdown",
    description: "Automated structured technical documentation generated from source code.",
  },
  {
    id: "architecture",
    label: "Architecture Visualizer",
    badge: "Interactive Flow",
    icon: GitFork,
    fileName: "system_architecture.mmd",
    language: "Mermaid Graph",
    description: "Evidence-grounded module relationship trees & visual dependency graphs.",
  },
  {
    id: "chat",
    label: "Grounded AI Chat",
    badge: "Zero Hallucination",
    icon: MessageSquare,
    fileName: "AI_ASSISTANT.stream",
    language: "RepoAI Engine",
    description: "Conversational code intelligence with line-level verified citations.",
  },
  {
    id: "apis",
    label: "APIs & Schema",
    badge: "OpenAPI & ERD",
    icon: Database,
    fileName: "openapi_schema.json",
    language: "JSON / SQL",
    description: "Extracted REST routes, request signatures, and relational ERD tables.",
  },
  {
    id: "security",
    label: "Security & SAIF",
    badge: "Compliance Audit",
    icon: ShieldCheck,
    fileName: "SAIF_SECURITY.report",
    language: "Security Scan",
    description: "Automated secret masking, vulnerability detection, and SAIF risk scoring.",
  },
];

export function Hero3DShowcase() {
  const [activeMode, setActiveMode] = useState<Mode>("code");
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Sub-tab selection state inside showcase tabs
  const [selectedFile, setSelectedFile] = useState<string>("auth-context.tsx");
  const [selectedWikiPage, setSelectedWikiPage] = useState<string>("overview");
  const [selectedApiRoute, setSelectedApiRoute] = useState<string>("GET /api/v1/repos/{id}/wiki");

  // High-performance RAF scroll & LERP animation loop (60fps / 120fps smooth scrolling)
  useEffect(() => {
    let animationFrameId: number;
    let currentRotX = 24;
    let targetRotX = 24;
    let currentRotY = 0;
    let targetRotY = 0;
    let currentScale = 0.88;
    let targetScale = 0.88;
    let currentOpacity = 0.5;
    let targetOpacity = 0.5;

    const updatePhysics = () => {
      if (containerRef.current && cardRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        const elementTop = rect.top;
        const startTrigger = windowHeight;
        const targetTrigger = windowHeight * 0.2;

        const rawRatio = (startTrigger - elementTop) / (startTrigger - targetTrigger);
        const clampedRatio = Math.min(Math.max(rawRatio, 0), 1);

        if (isHovered) {
          targetRotX = 0;
          targetRotY = 0;
          targetScale = 1.0;
          targetOpacity = 1.0;
        } else {
          targetRotX = 24 * (1 - clampedRatio);
          targetRotY = -2 * (1 - clampedRatio);
          targetScale = 0.88 + 0.12 * clampedRatio;
          targetOpacity = 0.5 + 0.5 * clampedRatio;
        }

        // Linear interpolation (LERP) for ultra-smooth motion
        const lerpFactor = isHovered ? 0.15 : 0.08;
        currentRotX += (targetRotX - currentRotX) * lerpFactor;
        currentRotY += (targetRotY - currentRotY) * lerpFactor;
        currentScale += (targetScale - currentScale) * lerpFactor;
        currentOpacity += (targetOpacity - currentOpacity) * lerpFactor;

        cardRef.current.style.transform = `perspective(1200px) rotateX(${currentRotX.toFixed(2)}deg) rotateY(${currentRotY.toFixed(2)}deg) scale3d(${currentScale.toFixed(3)}, ${currentScale.toFixed(3)}, 1) translateZ(0)`;
        containerRef.current.style.opacity = currentOpacity.toFixed(2);
      }

      animationFrameId = requestAnimationFrame(updatePhysics);
    };

    animationFrameId = requestAnimationFrame(updatePhysics);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isHovered]);

  // Auto-play timer loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveMode((current) => {
            const currentIndex = MODES.findIndex((m) => m.id === current);
            const nextIndex = (currentIndex + 1) % MODES.length;
            return MODES[nextIndex].id;
          });
          return 0;
        }
        return prev + 1.1; // ~9 seconds per tab cycle
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleModeSelect = (mode: Mode) => {
    setActiveMode(mode);
    setProgress(0);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const normX = (e.clientX - centerX) / (rect.width / 2);
    const normY = (e.clientY - centerY) / (rect.height / 2);
    
    setMousePos({ x: normX, y: normY });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePos({ x: 0, y: 0 });
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const glowX = (mousePos.x + 1) * 50;
  const glowY = (mousePos.y + 1) * 50;

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4 sm:px-6">
      {/* 3D Perspective Wrapper */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="perspective-container relative group cursor-pointer opacity-50"
        style={{ willChange: "opacity" }}
      >
        {/* Ambient Glow */}
        <div
          className="absolute -inset-4 rounded-3xl opacity-50 transition-opacity duration-500 blur-3xl pointer-events-none animate-pulse-glow"
          style={{
            background: `radial-gradient(circle at ${glowX}% ${glowY}%, rgba(56, 189, 248, 0.12), rgba(99, 102, 241, 0.08), transparent 70%)`,
          }}
        />

        {/* Outer Showcase Window (GitHub #0d1117 Dark Obsidian Shell with RAF LERP physics) */}
        <div
          ref={cardRef}
          className="hero-3d-card relative rounded-2xl border border-[#30363d] bg-[#0d1117] shadow-[0_30px_90px_-20px_rgba(0,0,0,0.85)] overflow-hidden"
          style={{
            willChange: "transform",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          {/* Metallic Top Border Highlight */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#58a6ff]/50 to-transparent z-30" />

          {/* Window Header Bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#161b22] border-b border-[#30363d] relative z-20">
            {/* macOS Style Window Controls */}
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]/40 shadow-sm" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]/40 shadow-sm" />
              <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]/40 shadow-sm" />
              
              <span className="ml-3 text-xs font-semibold text-slate-300 flex items-center gap-1.5 font-mono">
                <Terminal className="w-3.5 h-3.5 text-[#58a6ff]" />
                paraspathania / repowiki-ai
              </span>
            </div>

            {/* Middle Live Status Pill */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-[#21262d] border border-[#30363d] rounded-full text-xs text-slate-300 font-mono">
              <span className="w-2 h-2 rounded-full bg-[#3fb950] animate-ping" />
              <span>LIVE REPOSITORY PLATFORM</span>
              <span className="text-slate-500">|</span>
              <span className="text-[#58a6ff] font-semibold">{MODES.find(m => m.id === activeMode)?.fileName}</span>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white transition border border-white/10 text-xs flex items-center gap-1.5"
                title={isPlaying ? "Pause Demo" : "Play Demo"}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden sm:inline font-mono">Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                    <span className="hidden sm:inline font-mono">Auto Play</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setProgress(0)}
                className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white transition border border-white/10"
                title="Restart Animation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Main Content Workspace */}
          <div className="relative min-h-[400px] sm:min-h-[460px] md:min-h-[500px] bg-[#05070a] flex flex-col md:flex-row overflow-hidden font-mono text-xs sm:text-sm">
            
            {/* Left Interactive Explorer Sidebar */}
            <div className="w-full md:w-60 bg-[#090c12] border-b md:border-b-0 md:border-r border-white/[0.06] p-3 flex flex-col justify-between select-none">
              <div className="space-y-4">
                <div className="text-[11px] font-bold text-slate-400 tracking-wider uppercase flex items-center justify-between">
                  <span>PLATFORM HUB</span>
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                </div>

                <div className="space-y-1">
                  {MODES.map((mode) => {
                    const Icon = mode.icon;
                    const isActive = activeMode === mode.id;
                    return (
                      <button
                        key={mode.id}
                        onClick={() => handleModeSelect(mode.id)}
                        className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition-all group ${
                          isActive
                            ? "bg-indigo-600/25 text-indigo-200 border border-indigo-500/40 font-semibold shadow-lg shadow-indigo-950/40"
                            : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"}`} />
                          <span className="truncate text-xs sm:text-sm">{mode.label}</span>
                        </div>
                        {isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_#818cf8]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status Badge */}
              <div className="pt-3 border-t border-white/[0.06] mt-3 hidden md:block">
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="text-[11px] leading-tight text-slate-400">
                    <span className="font-semibold text-slate-300">RepoWiki Engine</span>
                    <div>342 files parsed</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Interactive Content Canvas */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto relative bg-gradient-to-b from-[#080b11] via-[#05070a] to-[#040508] custom-scrollbar">
              
              {/* Scanline Effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/[0.02] via-transparent to-transparent pointer-events-none animate-scanline" />

              {/* MODE 1: CODE WALKTHROUGH */}
              {activeMode === "code" && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedFile("auth-context.tsx")}
                        className={`px-2.5 py-1 rounded text-xs transition ${
                          selectedFile === "auth-context.tsx"
                            ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-semibold"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        auth-context.tsx
                      </button>
                      <button
                        onClick={() => setSelectedFile("client.ts")}
                        className={`px-2.5 py-1 rounded text-xs transition ${
                          selectedFile === "client.ts"
                            ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-semibold"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        client.ts
                      </button>
                      <button
                        onClick={() => setSelectedFile("page.tsx")}
                        className={`px-2.5 py-1 rounded text-xs transition ${
                          selectedFile === "page.tsx"
                            ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-semibold"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        page.tsx
                      </button>
                    </div>

                    <button
                      onClick={() => handleCopyCode("export function AuthProvider({ children }) { ... }")}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-white/[0.04] px-2 py-1 rounded border border-white/[0.08]"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? "Copied" : "Copy"}</span>
                    </button>
                  </div>

                  {selectedFile === "auth-context.tsx" && (
                    <div className="space-y-1.5 font-mono text-xs sm:text-sm leading-relaxed">
                      <div className="text-slate-500">// 1. Context definition for user authentication</div>
                      <div>
                        <span className="text-purple-400">export</span>{" "}
                        <span className="text-purple-400">interface</span>{" "}
                        <span className="text-amber-300">AuthContextType</span> {"{"}
                      </div>
                      <div className="pl-4 text-slate-300">
                        user: <span className="text-blue-300">User</span> | <span className="text-purple-400">null</span>;
                      </div>
                      <div className="pl-4 text-slate-300">
                        isLoading: <span className="text-blue-300">boolean</span>;
                      </div>
                      <div className="pl-4 text-slate-300">
                        loginWithGithub: () =&gt; <span className="text-blue-300">Promise</span>&lt;<span className="text-purple-400">void</span>&gt;;
                      </div>
                      <div>{"}"}</div>

                      <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-xl p-3 my-2 text-xs space-y-2 shadow-lg">
                        <div className="flex items-center gap-2 text-indigo-300 font-semibold">
                          <Sparkles className="w-4 h-4 text-indigo-400" />
                          <span>RepoWiki AST Analysis:</span>
                        </div>
                        <p className="text-slate-300 leading-normal font-sans text-xs sm:text-sm">
                          Manages client authentication state using React Context. Hydrates session token from localStorage and triggers automated query cache invalidation.
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <span className="bg-slate-800 text-indigo-300 px-2 py-0.5 rounded border border-slate-700">
                            Lines 14–38
                          </span>
                          <span className="text-emerald-400">✔ Grounded AST Citation</span>
                        </div>
                      </div>

                      <div className="text-slate-500">// 2. Provider component with persistent state</div>
                      <div>
                        <span className="text-purple-400">export</span>{" "}
                        <span className="text-purple-400">function</span>{" "}
                        <span className="text-blue-400">AuthProvider</span>({'{ children }'}: {'{ children: React.ReactNode }'}) {"{"}
                      </div>
                      <div className="pl-4 text-slate-300">
                        <span className="text-purple-400">const</span> [user, setUser] = <span className="text-blue-400">useState</span>&lt;<span className="text-amber-300">User</span> | <span className="text-purple-400">null</span>&gt;(<span className="text-purple-400">null</span>);
                      </div>
                      <div className="pl-4 text-slate-300">
                        <span className="text-purple-400">return</span> (
                      </div>
                      <div className="pl-8 text-slate-300">
                        &lt;<span className="text-emerald-400">AuthContext.Provider</span> value={"{{ user }}"}&gt;
                      </div>
                      <div className="pl-12 text-slate-300">{"{children}"}</div>
                      <div className="pl-8 text-slate-300">&lt;/<span className="text-emerald-400">AuthContext.Provider</span>&gt;
                      </div>
                      <div className="pl-4 text-slate-300">);</div>
                      <div>{"}"}</div>
                    </div>
                  )}

                  {selectedFile === "client.ts" && (
                    <div className="space-y-1.5 font-mono text-xs sm:text-sm leading-relaxed">
                      <div className="text-slate-500">// Axios Client Setup with JWT Interceptor</div>
                      <div>
                        <span className="text-purple-400">import</span> axios <span className="text-purple-400">from</span> <span className="text-emerald-300">"axios"</span>;
                      </div>
                      <div className="py-1" />
                      <div>
                        <span className="text-purple-400">export</span> <span className="text-purple-400">const</span> <span className="text-blue-400">apiClient</span> = axios.<span className="text-blue-300">create</span>({"{"}
                      </div>
                      <div className="pl-4 text-slate-300">
                        baseURL: <span className="text-emerald-300">"https://api.repowiki.ai/v1"</span>,
                      </div>
                      <div className="pl-4 text-slate-300">
                        headers: {"{ 'Content-Type': 'application/json' }"},
                      </div>
                      <div>{"});"}</div>
                    </div>
                  )}

                  {selectedFile === "page.tsx" && (
                    <div className="space-y-1.5 font-mono text-xs sm:text-sm leading-relaxed">
                      <div className="text-slate-500">// Root Next.js Homepage Container</div>
                      <div>
                        <span className="text-purple-400">export default</span> <span className="text-purple-400">function</span> <span className="text-blue-400">HomePage</span>() {"{"}
                      </div>
                      <div className="pl-4 text-slate-300">
                        <span className="text-purple-400">return</span> (
                      </div>
                      <div className="pl-8 text-emerald-400">&lt;main className="min-h-screen bg-background"&gt;</div>
                      <div className="pl-12 text-slate-300">&lt;Hero3DShowcase /&gt;</div>
                      <div className="pl-8 text-emerald-400">&lt;/main&gt;</div>
                      <div className="pl-4 text-slate-300">);</div>
                      <div>{"}"}</div>
                    </div>
                  )}
                </div>
              )}

              {/* MODE 2: TECHNICAL WIKI */}
              {activeMode === "wiki" && (
                <div className="space-y-4 animate-fade-in font-sans">
                  {/* Sub Wiki Navbar */}
                  <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3 overflow-x-auto no-scrollbar font-mono text-xs">
                    <button
                      onClick={() => setSelectedWikiPage("overview")}
                      className={`px-3 py-1 rounded-lg transition whitespace-nowrap ${
                        selectedWikiPage === "overview"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      1. Project Overview
                    </button>
                    <button
                      onClick={() => setSelectedWikiPage("architecture")}
                      className={`px-3 py-1 rounded-lg transition whitespace-nowrap ${
                        selectedWikiPage === "architecture"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      2. Architecture & RAG
                    </button>
                    <button
                      onClick={() => setSelectedWikiPage("techstack")}
                      className={`px-3 py-1 rounded-lg transition whitespace-nowrap ${
                        selectedWikiPage === "techstack"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      3. Tech Stack Matrix
                    </button>
                  </div>

                  {selectedWikiPage === "overview" && (
                    <div className="space-y-3 text-slate-200">
                      <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                        <FileText className="w-5 h-5 text-emerald-400" />
                        Project Overview & Technical Wiki
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                        RepoWiki AI automatically transforms raw software codebases into 14 structured, interactive documentation modules using AST parser trees and Gemini RAG embeddings.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-2 font-mono text-xs">
                        <div className="p-3 bg-white/[0.03] border border-white/[0.08] rounded-xl space-y-1">
                          <div className="text-indigo-400 font-bold">14 Wiki Pages</div>
                          <div className="text-slate-400 text-[11px]">Overview to Deployment</div>
                        </div>
                        <div className="p-3 bg-white/[0.03] border border-white/[0.08] rounded-xl space-y-1">
                          <div className="text-emerald-400 font-bold">100% Grounded</div>
                          <div className="text-slate-400 text-[11px]">Direct Line Citations</div>
                        </div>
                        <div className="p-3 bg-white/[0.03] border border-white/[0.08] rounded-xl space-y-1">
                          <div className="text-purple-400 font-bold">Auto-Sync</div>
                          <div className="text-slate-400 text-[11px]">Syncs on Git Push</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedWikiPage === "architecture" && (
                    <div className="space-y-3 text-slate-200">
                      <h2 className="text-lg font-bold text-white tracking-tight">
                        Architecture & RAG Pipeline
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                        Follows a Decoupled Modular Monolith pattern. Code files are parsed with Tree-Sitter into symbol trees, chunked by scope, and indexed in pgvector.
                      </p>
                      <div className="bg-[#0b0e14] border border-white/[0.08] rounded-xl p-3 font-mono text-xs text-indigo-300 space-y-1">
                        <div>Git Repository → Tree-Sitter AST → Vector Embeddings → RAG Citation Engine</div>
                      </div>
                    </div>
                  )}

                  {selectedWikiPage === "techstack" && (
                    <div className="space-y-3 text-slate-200">
                      <h2 className="text-lg font-bold text-white tracking-tight">
                        Core Tech Stack
                      </h2>
                      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">Next.js 14 (App Router)</div>
                        <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">TypeScript 5.4</div>
                        <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">FastAPI & Python 3.11</div>
                        <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">Mermaid.js Visualizer</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* MODE 3: ARCHITECTURE VISUALIZER */}
              {activeMode === "architecture" && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 font-mono text-xs">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-semibold">
                        System Map
                      </span>
                      <span className="text-slate-400">Mermaid Visualizer</span>
                    </div>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" /> 6 Active Nodes Connected
                    </span>
                  </div>

                  <div className="relative h-64 sm:h-72 w-full bg-[#07090e] border border-white/[0.06] rounded-xl p-4 flex flex-col justify-between overflow-hidden">
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                      <line x1="20%" y1="25%" x2="50%" y2="50%" stroke="#6366f1" strokeWidth="2" strokeDasharray="4" className="animate-pulse" />
                      <line x1="80%" y1="25%" x2="50%" y2="50%" stroke="#a855f7" strokeWidth="2" strokeDasharray="4" className="animate-pulse" />
                      <line x1="50%" y1="50%" x2="30%" y2="80%" stroke="#10b981" strokeWidth="2" />
                      <line x1="50%" y1="50%" x2="70%" y2="80%" stroke="#3b82f6" strokeWidth="2" />
                    </svg>

                    <div className="flex justify-between relative z-10 text-xs">
                      <div className="p-3 bg-indigo-950/80 border border-indigo-500/50 rounded-xl text-indigo-200 font-semibold shadow-xl flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-indigo-400" />
                        <span>Frontend Client</span>
                      </div>
                      <div className="p-3 bg-purple-950/80 border border-purple-500/50 rounded-xl text-purple-200 font-semibold shadow-xl flex items-center gap-2">
                        <Layers className="w-4 h-4 text-purple-400" />
                        <span>API Gateway</span>
                      </div>
                    </div>

                    <div className="flex justify-center relative z-10 text-xs">
                      <div className="p-3 bg-slate-900 border border-indigo-400/60 rounded-xl text-white font-bold shadow-2xl flex items-center gap-2 bg-gradient-to-r from-indigo-900/50 to-purple-900/50">
                        <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                        <span>RepoWiki AST Core Engine</span>
                      </div>
                    </div>

                    <div className="flex justify-between relative z-10 text-xs">
                      <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-200 font-semibold shadow-xl flex items-center gap-2">
                        <Database className="w-4 h-4 text-emerald-400" />
                        <span>Vector Store</span>
                      </div>
                      <div className="p-3 bg-blue-950/80 border border-blue-500/50 rounded-xl text-blue-200 font-semibold shadow-xl flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-400" />
                        <span>Citation Verifier</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* MODE 4: GROUNDED AI CHAT */}
              {activeMode === "chat" && (
                <div className="space-y-4 animate-fade-in font-sans">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 font-mono text-xs">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 font-semibold">
                        Grounded RAG Assistant
                      </span>
                      <span className="text-slate-400">Interactive Session</span>
                    </div>
                    <span className="text-blue-400">98.9% Verification Confidence</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-end">
                      <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-none px-4 py-2.5 max-w-sm text-xs sm:text-sm font-medium shadow-lg">
                        How is user authentication state persisted across routes?
                      </div>
                    </div>

                    <div className="flex justify-start">
                      <div className="bg-slate-900 border border-white/[0.1] text-slate-200 rounded-2xl rounded-tl-none p-4 max-w-md space-y-2.5 text-xs sm:text-sm shadow-xl">
                        <div className="flex items-center gap-2 text-indigo-400 font-bold font-mono text-xs">
                          <Sparkles className="w-4 h-4" />
                          <span>RepoWiki Assistant</span>
                        </div>
                        <p className="leading-relaxed text-slate-300">
                          Authentication state is hydrated inside <code className="text-amber-300 bg-amber-950/50 px-1.5 py-0.5 rounded font-mono">AuthProvider</code> using React Context and cached localStorage tokens.
                        </p>

                        <div className="pt-2 border-t border-white/[0.08] space-y-1.5 font-mono text-[11px]">
                          <div className="text-slate-400 font-semibold">Source Citations:</div>
                          <div className="flex flex-wrap gap-1.5">
                            <span className="bg-indigo-950 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded flex items-center gap-1">
                              <span>auth-context.tsx:L14-38</span>
                              <ExternalLink className="w-3 h-3" />
                            </span>
                            <span className="bg-purple-950 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded flex items-center gap-1">
                              <span>providers.tsx:L8</span>
                              <ExternalLink className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* MODE 5: APIS & SCHEMA */}
              {activeMode === "apis" && (
                <div className="space-y-4 animate-fade-in font-sans">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 font-mono text-xs">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold">
                        API Explorer
                      </span>
                      <span className="text-slate-400">REST Endpoints & ERD</span>
                    </div>
                    <span className="text-amber-400">OpenAPI 3.0 Extracted</span>
                  </div>

                  <div className="space-y-3 font-mono text-xs">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedApiRoute("GET /api/v1/repos/{id}/wiki")}
                        className={`px-3 py-1.5 rounded-lg border text-left flex items-center gap-2 transition ${
                          selectedApiRoute.startsWith("GET")
                            ? "bg-blue-950/60 border-blue-500/50 text-blue-300 font-semibold"
                            : "bg-slate-900 border-slate-800 text-slate-400"
                        }`}
                      >
                        <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded text-[10px]">GET</span>
                        <span>/api/v1/repos/{'{id}'}/wiki</span>
                      </button>
                      <button
                        onClick={() => setSelectedApiRoute("POST /api/v1/repos/analyze")}
                        className={`px-3 py-1.5 rounded-lg border text-left flex items-center gap-2 transition ${
                          selectedApiRoute.startsWith("POST")
                            ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-300 font-semibold"
                            : "bg-slate-900 border-slate-800 text-slate-400"
                        }`}
                      >
                        <span className="bg-emerald-600 text-white px-1.5 py-0.5 rounded text-[10px]">POST</span>
                        <span>/api/v1/repos/analyze</span>
                      </button>
                    </div>

                    <div className="bg-[#0b0e15] border border-white/[0.08] rounded-xl p-3 space-y-2 text-slate-300">
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Response JSON Schema (200 OK)</span>
                        <span className="text-emerald-400">application/json</span>
                      </div>
                      <pre className="text-xs text-indigo-300 leading-relaxed font-mono">
{`{
  "repository_id": "repo-123",
  "full_name": "paraspathania/repowiki-ai",
  "wiki_sections": [
    { "title": "Overview", "slug": "overview" },
    { "title": "Architecture", "slug": "architecture" }
  ]
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {/* MODE 6: SECURITY & SAIF */}
              {activeMode === "security" && (
                <div className="space-y-4 animate-fade-in font-sans">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 font-mono text-xs">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold">
                        SAIF Compliant
                      </span>
                      <span className="text-slate-400">Security Audit</span>
                    </div>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 100% Passed
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl space-y-1">
                      <div className="text-emerald-300 font-bold flex items-center gap-1.5">
                        <Lock className="w-4 h-4 text-emerald-400" />
                        <span>Secret Masking</span>
                      </div>
                      <p className="text-slate-400 font-sans text-xs">
                        Zero API keys, JWT secrets, or tokens exposed in generated wikis.
                      </p>
                    </div>

                    <div className="p-3 bg-indigo-950/30 border border-indigo-500/30 rounded-xl space-y-1">
                      <div className="text-indigo-300 font-bold flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-indigo-400" />
                        <span>Dependency Audit</span>
                      </div>
                      <p className="text-slate-400 font-sans text-xs">
                        All 39 npm & pip packages scanned against vulnerability databases.
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Bottom Progress Bar */}
          <div className="w-full bg-[#161b22] h-1 relative overflow-hidden border-t border-[#30363d]">
            <div
              className="h-full bg-[#58a6ff] transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Bottom Interactive Feature Tab Bar */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center gap-1 sm:gap-2 p-1.5 bg-[#0d1117] border border-[#30363d] rounded-full shadow-2xl max-w-full overflow-x-auto no-scrollbar">
            {MODES.map((mode) => {
              const Icon = mode.icon;
              const isActive = activeMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => handleModeSelect(mode.id)}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-2.5 whitespace-nowrap ${
                    isActive
                      ? "bg-[#21262d] text-white border border-[#484f58] shadow-md"
                      : "text-slate-400 hover:text-slate-200 hover:bg-[#161b22]"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-blue-400" : "text-slate-500"}`} />
                  <span>{mode.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
