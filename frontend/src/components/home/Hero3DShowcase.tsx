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
} from "lucide-react";

type Mode = "code" | "wiki" | "architecture" | "chat";

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
    badge: "Syntax & Logic",
    icon: Code,
    fileName: "auth-context.tsx",
    language: "TypeScript",
    description: "Deep logic parsing with grounded line-by-line code intelligence.",
  },
  {
    id: "wiki",
    label: "Wiki Docs",
    badge: "Auto-Generated",
    icon: FileText,
    fileName: "TECHNICAL_WIKI.md",
    language: "Markdown",
    description: "Transform complex codebases into structured multi-page documentation.",
  },
  {
    id: "architecture",
    label: "Architecture Graph",
    badge: "Interactive Flow",
    icon: GitFork,
    fileName: "architecture-graph.mmd",
    language: "Mermaid Graph",
    description: "Visual evidence-grounded diagrams of module dependency trees.",
  },
  {
    id: "chat",
    label: "Grounded Chat",
    badge: "Zero Hallucination",
    icon: MessageSquare,
    fileName: "AI_SESSION.chat",
    language: "RepoAI Stream",
    description: "Ask deep architectural queries with direct source code citations.",
  },
];

export function Hero3DShowcase() {
  const [activeMode, setActiveMode] = useState<Mode>("code");
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll-driven 3D perspective calculation matching GitHub hero
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate how far the component has scrolled into the viewport (0 to 1)
      const elementTop = rect.top;
      const elementHeight = rect.height;
      const startTrigger = windowHeight; // enters bottom of screen
      const targetTrigger = windowHeight * 0.25; // aligns in upper-center

      const rawRatio = (startTrigger - elementTop) / (startTrigger - targetTrigger);
      const clampedRatio = Math.min(Math.max(rawRatio, 0), 1);
      
      setScrollProgress(clampedRatio);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-play timer loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Switch to next mode
          setActiveMode((current) => {
            const currentIndex = MODES.findIndex((m) => m.id === current);
            const nextIndex = (currentIndex + 1) % MODES.length;
            return MODES[nextIndex].id;
          });
          return 0;
        }
        return prev + 1.25; // ~8 seconds per tab cycle
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Reset progress when mode manually changes
  const handleModeSelect = (mode: Mode) => {
    setActiveMode(mode);
    setProgress(0);
  };

  // Mouse move perspective tilt handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Normalized position from -1 to 1
    const normX = (e.clientX - centerX) / (rect.width / 2);
    const normY = (e.clientY - centerY) / (rect.height / 2);
    
    setMousePos({ x: normX, y: normY });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePos({ x: 0, y: 0 });
  };

  // 3D Scroll Tilt Physics (GitHub signature effect):
  // Starts at 24deg tilted backwards when scrolling into view, levels to 0deg as centered
  const baseScrollRotateX = 24 * (1 - scrollProgress); 
  const baseScrollScale = 0.88 + 0.12 * scrollProgress;
  const baseScrollOpacity = 0.5 + 0.5 * scrollProgress;

  // Stable on cursor hover (GitHub behavior: box flattens upright & locks solid when cursor is inside)
  const rotateX = isHovered ? 0 : baseScrollRotateX;
  const rotateY = isHovered ? 0 : -2 * (1 - scrollProgress);
  const finalScale = isHovered ? 1.0 : baseScrollScale;

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
        className="perspective-container relative group cursor-pointer"
        style={{
          opacity: baseScrollOpacity,
          transition: "opacity 0.3s ease-out",
        }}
      >
        {/* Ambient Glowing Aura Behind Card */}
        <div
          className="absolute -inset-4 rounded-3xl opacity-60 transition-opacity duration-500 blur-3xl pointer-events-none animate-pulse-glow"
          style={{
            background: `radial-gradient(circle at ${glowX}% ${glowY}%, rgba(129, 140, 248, 0.4), rgba(168, 85, 247, 0.25), rgba(16, 185, 129, 0.15), transparent 70%)`,
          }}
        />

        {/* Outer Card Shell (Locks completely stable on cursor hover) */}
        <div
          className="hero-3d-card relative rounded-2xl border border-white/10 bg-[#090b10] shadow-[0_30px_100px_-20px_rgba(79,70,229,0.35)] overflow-hidden transition-all duration-300 cubic-bezier(0.16,1,0.3,1)"
          style={{
            transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${finalScale}, ${finalScale}, 1)`,
          }}
        >
          {/* Top Metallic Border Highlight */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent z-30" />

          {/* Window Header Bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#0d1017] border-b border-white/[0.08] relative z-20">
            {/* macOS Style Window Controls */}
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]/40 shadow-sm" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]/40 shadow-sm" />
              <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]/40 shadow-sm" />
              
              <span className="ml-3 text-xs font-semibold text-slate-400 flex items-center gap-1.5 font-mono">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                repowiki-ai / frontend
              </span>
            </div>

            {/* Middle Title Pill */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-white/[0.04] border border-white/[0.08] rounded-full text-xs text-slate-300 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>LIVE AI ANALYSIS PREVIEW</span>
              <span className="text-slate-500">|</span>
              <span className="text-indigo-400 font-semibold">{MODES.find(m => m.id === activeMode)?.fileName}</span>
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
                title="Restart Mode Animation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Main IDE Window Workspace */}
          <div className="relative min-h-[380px] sm:min-h-[440px] md:min-h-[480px] bg-[#05070a] flex flex-col md:flex-row overflow-hidden font-mono text-xs sm:text-sm">
            
            {/* Simulated Left Sidebar */}
            <div className="w-full md:w-56 bg-[#090c12] border-b md:border-b-0 md:border-r border-white/[0.06] p-3 flex flex-col justify-between select-none">
              <div className="space-y-4">
                <div className="text-[11px] font-bold text-slate-400 tracking-wider uppercase flex items-center justify-between">
                  <span>EXPLORER</span>
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                </div>

                <div className="space-y-1">
                  <div className="text-slate-400 font-medium px-2 py-1 text-xs flex items-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    <span>repowiki-ai</span>
                  </div>

                  {MODES.map((mode) => {
                    const Icon = mode.icon;
                    const isActive = activeMode === mode.id;
                    return (
                      <button
                        key={mode.id}
                        onClick={() => handleModeSelect(mode.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-all group ${
                          isActive
                            ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold shadow-inner"
                            : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Icon className={`w-4 h-4 ${isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"}`} />
                          <span className="truncate">{mode.fileName}</span>
                        </div>
                        {isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_#818cf8]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status footer badge */}
              <div className="pt-4 border-t border-white/[0.06] mt-4 hidden md:block">
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-[11px] leading-tight text-slate-400">Grounded Citations Active</span>
                </div>
              </div>
            </div>

            {/* Main Content Showcase Panel */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto relative bg-gradient-to-b from-[#080b11] via-[#05070a] to-[#040508] custom-scrollbar">
              
              {/* Scanline Ambient Effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/[0.02] via-transparent to-transparent pointer-events-none animate-scanline" />

              {/* MODE 1: CODE WALKTHROUGH */}
              {activeMode === "code" && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[11px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                        TypeScript
                      </span>
                      <span className="text-slate-400 text-xs">src/lib/auth-context.tsx</span>
                    </div>
                    <span className="text-xs text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> AST Parsed
                    </span>
                  </div>

                  <div className="space-y-1 font-mono text-xs sm:text-sm leading-relaxed">
                    <div className="text-slate-500">// 1. Context definition for repo authentication</div>
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

                    <div className="py-2" />

                    <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-xl p-3 my-2 text-xs space-y-2 relative overflow-hidden shadow-lg">
                      <div className="flex items-center gap-2 text-indigo-300 font-semibold">
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                        <span>RepoWiki AI grounded analysis:</span>
                      </div>
                      <p className="text-slate-300 leading-normal font-sans text-xs sm:text-sm">
                        This context handles state hydration across Next.js client routes. It uses React query cache invalidation on login.
                      </p>
                      <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
                        <span className="bg-slate-800 text-indigo-300 px-2 py-0.5 rounded font-mono border border-slate-700">
                          Ref: line 14-38
                        </span>
                        <span className="text-emerald-400">✔ Verified against AST</span>
                      </div>
                    </div>

                    <div className="text-slate-500">// 2. Provider component with persistent cache</div>
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
                </div>
              )}

              {/* MODE 2: WIKI DOCS */}
              {activeMode === "wiki" && (
                <div className="space-y-4 animate-fade-in font-sans">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 font-mono">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                        Markdown Wiki
                      </span>
                      <span className="text-slate-400 text-xs">TECHNICAL_WIKI.md</span>
                    </div>
                    <span className="text-xs text-indigo-400 font-mono">Auto Generated in 1.4s</span>
                  </div>

                  <div className="space-y-3 text-slate-200">
                    <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                      <FileText className="w-5 h-5 text-emerald-400" />
                      1. System Architecture Overview
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                      RepoWiki AI processes public and private repositories by building a unified Abstract Syntax Tree (AST), indexing symbol definitions, and orchestrating RAG queries with citations.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2 font-mono text-xs">
                      <div className="p-3 bg-white/[0.03] border border-white/[0.08] rounded-xl space-y-1">
                        <div className="text-indigo-400 font-bold">Frontend Layer</div>
                        <div className="text-slate-400 text-[11px]">Next.js 14 + Tailwind CSS + Lucide</div>
                      </div>
                      <div className="p-3 bg-white/[0.03] border border-white/[0.08] rounded-xl space-y-1">
                        <div className="text-emerald-400 font-bold">Analysis Engine</div>
                        <div className="text-slate-400 text-[11px]">Tree-Sitter + Vector RAG + Citation Pipeline</div>
                      </div>
                    </div>

                    <div className="bg-[#0c0f17] border border-white/[0.08] rounded-xl p-3 font-mono text-xs text-slate-300 space-y-1">
                      <div className="text-slate-500">// Getting Started Command</div>
                      <div className="text-indigo-300">
                        git clone https://github.com/repowiki-ai/core.git
                      </div>
                      <div className="text-indigo-300">npm install && npm run dev</div>
                    </div>
                  </div>
                </div>
              )}

              {/* MODE 3: ARCHITECTURE GRAPH */}
              {activeMode === "architecture" && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 font-mono">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[11px] bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
                        Mermaid Diagram
                      </span>
                      <span className="text-slate-400 text-xs">Dependency Graph</span>
                    </div>
                    <span className="text-xs text-purple-400 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" /> Interactive Nodes
                    </span>
                  </div>

                  {/* Simulated Visual Graph UI */}
                  <div className="relative h-64 sm:h-72 w-full bg-[#07090e] border border-white/[0.06] rounded-xl p-4 flex flex-col justify-between overflow-hidden">
                    {/* SVG Connector Lines */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                      <line x1="20%" y1="30%" x2="50%" y2="50%" stroke="#6366f1" strokeWidth="2" strokeDasharray="4" className="animate-pulse" />
                      <line x1="80%" y1="30%" x2="50%" y2="50%" stroke="#a855f7" strokeWidth="2" strokeDasharray="4" className="animate-pulse" />
                      <line x1="50%" y1="50%" x2="50%" y2="80%" stroke="#10b981" strokeWidth="2" />
                    </svg>

                    <div className="flex justify-between relative z-10">
                      <div className="p-3 bg-indigo-950/60 border border-indigo-500/40 rounded-xl text-indigo-200 font-semibold shadow-lg backdrop-blur-md flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-indigo-400" />
                        <span>Frontend Client</span>
                      </div>
                      <div className="p-3 bg-purple-950/60 border border-purple-500/40 rounded-xl text-purple-200 font-semibold shadow-lg backdrop-blur-md flex items-center gap-2">
                        <Layers className="w-4 h-4 text-purple-400" />
                        <span>API Gateway</span>
                      </div>
                    </div>

                    <div className="flex justify-center relative z-10">
                      <div className="p-3 bg-slate-900/90 border border-indigo-400/50 rounded-xl text-white font-bold shadow-2xl flex items-center gap-2 bg-gradient-to-r from-indigo-900/40 to-purple-900/40">
                        <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                        <span>RepoWiki AST Core</span>
                      </div>
                    </div>

                    <div className="flex justify-center relative z-10">
                      <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-200 font-semibold shadow-lg backdrop-blur-md flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Evidence Store & Docs</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* MODE 4: GROUNDED CHAT */}
              {activeMode === "chat" && (
                <div className="space-y-4 animate-fade-in font-sans">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 font-mono">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[11px] bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold">
                        Grounded AI
                      </span>
                      <span className="text-slate-400 text-xs">Repo Stream</span>
                    </div>
                    <span className="text-xs text-blue-400">98.9% Citation Confidence</span>
                  </div>

                  {/* Chat Messages */}
                  <div className="space-y-3">
                    {/* User message */}
                    <div className="flex justify-end">
                      <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-none px-4 py-2.5 max-w-sm text-xs sm:text-sm font-medium shadow-lg">
                        How does user state persist when navigating between pages?
                      </div>
                    </div>

                    {/* AI message */}
                    <div className="flex justify-start">
                      <div className="bg-slate-900 border border-white/[0.1] text-slate-200 rounded-2xl rounded-tl-none p-4 max-w-md space-y-2 text-xs sm:text-sm shadow-xl">
                        <div className="flex items-center gap-2 text-indigo-400 font-bold font-mono text-xs">
                          <Sparkles className="w-4 h-4" />
                          <span>RepoWiki Assistant</span>
                        </div>
                        <p className="leading-relaxed text-slate-300">
                          User authentication state is managed through <code className="text-amber-300 bg-amber-950/40 px-1 py-0.5 rounded">AuthProvider</code> wrapping the root React layout.
                        </p>

                        <div className="pt-2 border-t border-white/[0.06] space-y-1 font-mono text-[11px]">
                          <div className="text-slate-400">Grounding Citations:</div>
                          <div className="flex flex-wrap gap-1.5">
                            <span className="bg-indigo-950/80 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded flex items-center gap-1 hover:bg-indigo-900 cursor-pointer">
                              <span>auth-context.tsx:L14-38</span>
                              <ExternalLink className="w-3 h-3" />
                            </span>
                            <span className="bg-purple-950/80 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded flex items-center gap-1 hover:bg-purple-900 cursor-pointer">
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

            </div>
          </div>

          {/* Bottom Progress Playback Bar */}
          <div className="w-full bg-slate-950 h-1 relative overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* GitHub-Style Bottom Pill Tab Selector (Matching Screenshot!) */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center gap-1 sm:gap-2 p-1.5 bg-[#0d1017]/90 border border-white/10 rounded-full backdrop-blur-xl shadow-2xl max-w-full overflow-x-auto no-scrollbar">
            {MODES.map((mode) => {
              const Icon = mode.icon;
              const isActive = activeMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => handleModeSelect(mode.id)}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 border border-indigo-400/40 scale-105"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.06]"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
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
