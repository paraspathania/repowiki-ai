"use client";

import React, { useState } from "react";
import {
  FileCode,
  Folder,
  FolderOpen,
  Terminal,
  GitBranch,
  CheckCircle2,
  Lock,
  ExternalLink,
  Copy,
  Check,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  Database,
  Server,
  ShieldCheck,
  MessageSquare,
  FileText,
} from "lucide-react";

interface FileEntry {
  path: string;
  name: string;
  language: string;
  code: string;
  explanation: {
    title: string;
    description: string;
    citations: string;
    references: string;
  };
}

const REPO_FILES: Record<string, FileEntry> = {
  "ast_analyzer.py": {
    path: "backend/app/services/ast_analyzer.py",
    name: "ast_analyzer.py",
    language: "python",
    code: `class CodebaseASTAnalyzer:
    """Tree-Sitter syntax analyzer for AST symbols & REST routes."""
    def __init__(self, repo_path: str):
        self.parser = get_tree_sitter_parser("python")
        self.symbols = SymbolTable()

    def extract_route_handlers(self) -> List[RouteDefinition]:
        # Inspects AST decorator nodes for @router.get / @router.post
        visitor = FastAPIRouteVisitor()
        visitor.visit(self.tree.root_node)
        return visitor.collected_routes`,
    explanation: {
      title: "Tree-Sitter AST Route Extraction",
      description:
        "Statically parses Python AST decorator syntax to extract REST endpoints, parameter schemas, and HTTP methods without runtime execution.",
      citations: "Lines 12–28 in ast_analyzer.py",
      references: "3 Handlers Detected • 100% AST Verified",
    },
  },
  "auth-context.tsx": {
    path: "frontend/src/lib/auth-context.tsx",
    name: "auth-context.tsx",
    language: "typescript",
    code: `export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  signInWithGitHub: () => Promise<void>;
  signOut: () => void;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // Hydrates JWT from localStorage and attaches Bearer header
  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
}`,
    explanation: {
      title: "Client-Side JWT & Session Context",
      description:
        "Manages client authentication state using React Context. Hydrates session tokens and integrates with Axios interceptors.",
      citations: "Lines 14–38 in auth-context.tsx",
      references: "Exported AuthProvider • 4 Consuming Modules",
    },
  },
  "client.py": {
    path: "backend/app/providers/github/client.py",
    name: "client.py",
    language: "python",
    code: `class GitHubClient:
    """Async client for repository trees, commits & archive streaming."""
    async def fetch_repository_tree(self, repo_id: str, branch: str = "main"):
        endpoint = f"/repos/{repo_id}/git/trees/{branch}?recursive=1"
        response = await self.http.get(endpoint)
        return self._filter_ignored_paths(response.json())`,
    explanation: {
      title: "GitHub Tree Streaming & Ignore Rules",
      description:
        "Recursively fetches Git file trees while filtering binary files, vendor directories, and .gitignore patterns.",
      citations: "Lines 34–52 in client.py",
      references: "Provider Service • Rate-limit Cached",
    },
  },
};

/**
 * Compact, convincing repository exploration interface for Hero (Right column)
 */
export function HeroRepositoryExplorer() {
  const [selectedKey, setSelectedKey] = useState<string>("ast_analyzer.py");
  const [copied, setCopied] = useState<boolean>(false);

  const activeFile = REPO_FILES[selectedKey] || REPO_FILES["ast_analyzer.py"];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-[#191A18] border border-[rgba(232,232,223,0.12)] rounded-md overflow-hidden shadow-2xl">
      {/* Explorer Titlebar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#141514] border-b border-[rgba(232,232,223,0.08)] text-xs font-mono">
        <div className="flex items-center gap-2 text-[#A1A39B] truncate">
          <span className="text-[#C5F467] font-semibold">repo:</span>
          <span className="text-[#E8E8DF] font-medium truncate">paraspathania/repowiki-ai</span>
          <span className="text-[11px] px-1.5 py-0.2 bg-[#101110] border border-[rgba(232,232,223,0.08)] text-[#A1A39B]">
            main
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0 text-[11px] text-[#A1A39B]">
          <span className="w-1.5 h-1.5 bg-[#C5F467] rounded-none" />
          <span className="hidden sm:inline">AST Indexed</span>
        </div>
      </div>

      {/* Main Split Layout: Left Mini Tree + Right Code & Context */}
      <div className="grid grid-cols-1 sm:grid-cols-12 min-h-[360px] font-mono text-xs">
        
        {/* Left Mini Tree (4 cols) */}
        <div className="sm:col-span-4 bg-[#141514] border-b sm:border-b-0 sm:border-r border-[rgba(232,232,223,0.08)] p-2.5 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="text-[10px] uppercase tracking-wider text-[#A1A39B] px-2 py-1 font-semibold flex items-center justify-between">
              <span>EXPLORER</span>
              <span className="text-[9px] text-[#C5F467]">342 files</span>
            </div>

            <div className="space-y-0.5 pt-1">
              <div className="text-[11px] text-[#A1A39B] px-2 py-1 flex items-center gap-1.5">
                <FolderOpen className="w-3.5 h-3.5 text-[#A1A39B]" />
                <span>backend/app/</span>
              </div>

              <div className="pl-3 space-y-0.5">
                <button
                  onClick={() => setSelectedKey("ast_analyzer.py")}
                  className={`w-full text-left px-2 py-1.5 rounded-sm flex items-center gap-1.5 transition-colors text-xs ${
                    selectedKey === "ast_analyzer.py"
                      ? "bg-[#101110] text-[#E8E8DF] font-medium border-l-2 border-[#C5F467]"
                      : "text-[#A1A39B] hover:text-[#E8E8DF] hover:bg-[#191A18]"
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5 text-[#C5F467]" />
                  <span className="truncate">ast_analyzer.py</span>
                </button>

                <button
                  onClick={() => setSelectedKey("client.py")}
                  className={`w-full text-left px-2 py-1.5 rounded-sm flex items-center gap-1.5 transition-colors text-xs ${
                    selectedKey === "client.py"
                      ? "bg-[#101110] text-[#E8E8DF] font-medium border-l-2 border-[#C5F467]"
                      : "text-[#A1A39B] hover:text-[#E8E8DF] hover:bg-[#191A18]"
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5 text-[#A1A39B]" />
                  <span className="truncate">client.py</span>
                </button>
              </div>

              <div className="text-[11px] text-[#A1A39B] px-2 py-1 flex items-center gap-1.5 pt-1">
                <FolderOpen className="w-3.5 h-3.5 text-[#A1A39B]" />
                <span>frontend/src/</span>
              </div>

              <div className="pl-3 space-y-0.5">
                <button
                  onClick={() => setSelectedKey("auth-context.tsx")}
                  className={`w-full text-left px-2 py-1.5 rounded-sm flex items-center gap-1.5 transition-colors text-xs ${
                    selectedKey === "auth-context.tsx"
                      ? "bg-[#101110] text-[#E8E8DF] font-medium border-l-2 border-[#C5F467]"
                      : "text-[#A1A39B] hover:text-[#E8E8DF] hover:bg-[#191A18]"
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5 text-[#C5F467]" />
                  <span className="truncate">auth-context.tsx</span>
                </button>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[rgba(232,232,223,0.06)] px-2 text-[10px] text-[#A1A39B] flex items-center justify-between">
            <span>Syntax: Tree-Sitter</span>
            <span className="text-[#C5F467]">OK</span>
          </div>
        </div>

        {/* Right Code Excerpt & Grounded Explanation (8 cols) */}
        <div className="sm:col-span-8 flex flex-col justify-between bg-[#101110]">
          {/* File Header */}
          <div className="flex items-center justify-between px-3.5 py-2 bg-[#141514] border-b border-[rgba(232,232,223,0.08)] text-[11px]">
            <span className="text-[#E8E8DF] font-medium truncate">{activeFile.path}</span>
            <button
              onClick={() => handleCopy(activeFile.code)}
              className="text-[#A1A39B] hover:text-[#E8E8DF] flex items-center gap-1 px-1.5 py-0.5 rounded-sm border border-[rgba(232,232,223,0.08)]"
              title="Copy snippet"
            >
              {copied ? <Check className="w-3 h-3 text-[#C5F467]" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>

          {/* Syntax Code Block */}
          <div className="p-3.5 text-xs text-[#E8E8DF] font-mono leading-relaxed overflow-x-auto whitespace-pre">
            {activeFile.code}
          </div>

          {/* Contextual Explanation Panel */}
          <div className="p-3 bg-[#191A18] border-t border-[rgba(232,232,223,0.1)] space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#C5F467] font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{activeFile.explanation.title}</span>
              </span>
              <span className="text-[#A1A39B] text-[10px]">{activeFile.explanation.references}</span>
            </div>

            <p className="font-sans text-xs text-[#A1A39B] leading-relaxed">
              {activeFile.explanation.description}
            </p>

            <div className="pt-1 text-[11px] text-[#E8E8DF] font-mono flex items-center gap-2">
              <span className="px-1.5 py-0.5 bg-[#101110] border border-[rgba(232,232,223,0.1)] text-[#A1A39B]">
                {activeFile.explanation.citations}
              </span>
              <span className="text-[#C5F467]">✔ Grounded Citation</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

/**
 * Integrated Product Demonstration Workbench for Section 3
 */
export function Hero3DShowcase() {
  const [activeTab, setActiveTab] = useState<"wiki" | "architecture" | "chat" | "apis" | "database">("wiki");
  const [wikiChapter, setWikiChapter] = useState<number>(1);

  return (
    <div className="w-full space-y-4">
      {/* Workbench Header & Tab Navigation */}
      <div className="border border-[rgba(232,232,223,0.12)] bg-[#191A18] rounded-md overflow-hidden">
        
        {/* Editorial Subtitle & Tab Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[rgba(232,232,223,0.08)] bg-[#141514] px-4 py-3 gap-3">
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-[#C5F467] font-bold">WORKBENCH //</span>
            <span className="text-[#E8E8DF] font-medium">paraspathania/repowiki-ai</span>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar font-mono text-xs">
            {[
              { id: "wiki", label: "01 Technical Wiki" },
              { id: "architecture", label: "02 Architecture Map" },
              { id: "chat", label: "03 Grounded AI Chat" },
              { id: "apis", label: "04 APIs Hub" },
              { id: "database", label: "05 Database ERD" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "bg-[#101110] text-[#E8E8DF] border-b-2 border-[#C5F467] font-medium"
                    : "text-[#A1A39B] hover:text-[#E8E8DF] hover:bg-[#191A18]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content Display */}
        <div className="p-5 sm:p-6 bg-[#101110] min-h-[380px]">
          
          {/* TAB 1: TECHNICAL WIKI */}
          {activeTab === "wiki" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-[rgba(232,232,223,0.08)] pb-3 flex-wrap gap-2 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[#C5F467]">CHAPTERS:</span>
                  {[1, 2, 3, 4].map((num) => (
                    <button
                      key={num}
                      onClick={() => setWikiChapter(num)}
                      className={`px-2 py-0.5 rounded-sm border ${
                        wikiChapter === num
                          ? "bg-[#191A18] border-[#C5F467] text-[#E8E8DF] font-semibold"
                          : "border-[rgba(232,232,223,0.08)] text-[#A1A39B] hover:text-[#E8E8DF]"
                      }`}
                    >
                      0{num}
                    </button>
                  ))}
                </div>

                <div className="text-[11px] text-[#A1A39B] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#C5F467]" />
                  <span>100% Grounded in Tree-Sitter AST</span>
                </div>
              </div>

              {wikiChapter === 1 && (
                <div className="space-y-4">
                  <h3 className="text-xl sm:text-2xl font-bold text-[#E8E8DF] tracking-tight">
                    Chapter 1: System Overview & Architecture
                  </h3>
                  <p className="text-sm text-[#A1A39B] leading-relaxed max-w-3xl">
                    RepoWiki AI implements a decoupled Modular Monolith architecture. The backend service parses GitHub repository trees, generates Tree-Sitter abstract syntax trees, and produces grounded multi-chapter technical documentation without requiring build steps.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs pt-2">
                    <div className="p-3 bg-[#191A18] border border-[rgba(232,232,223,0.08)] rounded-sm space-y-1">
                      <div className="text-[#C5F467] font-bold">5 Documentation Chapters</div>
                      <div className="text-[#A1A39B] text-[11px]">System boundaries to API tables</div>
                    </div>
                    <div className="p-3 bg-[#191A18] border border-[rgba(232,232,223,0.08)] rounded-sm space-y-1">
                      <div className="text-[#E8E8DF] font-bold">Line-Level Verified</div>
                      <div className="text-[#A1A39B] text-[11px]">Direct citations to exact source lines</div>
                    </div>
                    <div className="p-3 bg-[#191A18] border border-[rgba(232,232,223,0.08)] rounded-sm space-y-1">
                      <div className="text-[#A1A39B] font-bold">Zero Setup Required</div>
                      <div className="text-[#A1A39B] text-[11px]">No CLI, SSH keys or tokens</div>
                    </div>
                  </div>
                </div>
              )}

              {wikiChapter !== 1 && (
                <div className="space-y-3 font-mono text-xs">
                  <h4 className="text-base font-bold text-[#E8E8DF]">
                    {wikiChapter === 2 && "Chapter 2: Modular Architecture & Service Boundaries"}
                    {wikiChapter === 3 && "Chapter 3: Tree-Sitter AST & Semantic Symbol Extraction"}
                    {wikiChapter === 4 && "Chapter 4: Vector Grounding & RAG Citation Pipeline"}
                  </h4>
                  <p className="font-sans text-sm text-[#A1A39B] leading-relaxed">
                    Abstract syntax trees map every imported module, class declaration, and route handler into verifiable symbol nodes stored in pgvector.
                  </p>
                  <div className="p-3 bg-[#191A18] border border-[rgba(232,232,223,0.08)] rounded-sm text-[#C5F467]">
                    Tree-Sitter v0.21.3 • FastAPI Gateway • pgvector 0.2.5
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ARCHITECTURE MAP */}
          {activeTab === "architecture" && (
            <div className="space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-[rgba(232,232,223,0.08)] pb-2 text-[11px] text-[#A1A39B]">
                <span>TOPOLOGY: DECOUPLED MODULAR MONOLITH</span>
                <span className="text-[#C5F467]">6 Active Verified Nodes</span>
              </div>

              <div className="relative h-64 w-full bg-[#141514] border border-[rgba(232,232,223,0.08)] rounded-sm p-4 flex flex-col justify-between">
                <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
                  <line x1="20%" y1="20%" x2="50%" y2="50%" stroke="rgba(232, 232, 223, 0.2)" strokeWidth="1" strokeDasharray="3" />
                  <line x1="80%" y1="20%" x2="50%" y2="50%" stroke="rgba(232, 232, 223, 0.2)" strokeWidth="1" strokeDasharray="3" />
                  <line x1="50%" y1="50%" x2="25%" y2="80%" stroke="#C5F467" strokeWidth="1" />
                  <line x1="50%" y1="50%" x2="75%" y2="80%" stroke="#C5F467" strokeWidth="1" />
                </svg>

                <div className="flex justify-between relative z-10">
                  <div className="p-2.5 bg-[#191A18] border border-[rgba(232,232,223,0.12)] rounded-sm">
                    <div className="text-[#E8E8DF] font-bold">Frontend Client</div>
                    <div className="text-[10px] text-[#A1A39B]">Next.js 14 App Router</div>
                  </div>
                  <div className="p-2.5 bg-[#191A18] border border-[rgba(232,232,223,0.12)] rounded-sm">
                    <div className="text-[#E8E8DF] font-bold">API Gateway</div>
                    <div className="text-[10px] text-[#A1A39B]">FastAPI Framework</div>
                  </div>
                </div>

                <div className="flex justify-center relative z-10">
                  <div className="p-3 bg-[#191A18] border border-[#C5F467] rounded-sm text-center">
                    <div className="text-[#E8E8DF] font-bold">Tree-Sitter AST & Semantic Engine</div>
                    <div className="text-[10px] text-[#C5F467]">Maps syntax symbols, routes & dependencies</div>
                  </div>
                </div>

                <div className="flex justify-between relative z-10">
                  <div className="p-2.5 bg-[#191A18] border border-[rgba(232,232,223,0.12)] rounded-sm">
                    <div className="text-[#E8E8DF] font-bold">pgvector Embeddings</div>
                    <div className="text-[10px] text-[#A1A39B]">Semantic Vector Index</div>
                  </div>
                  <div className="p-2.5 bg-[#191A18] border border-[rgba(232,232,223,0.12)] rounded-sm">
                    <div className="text-[#E8E8DF] font-bold">Citation Verifier</div>
                    <div className="text-[10px] text-[#C5F467]">100% Line Number Match</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GROUNDED AI CHAT */}
          {activeTab === "chat" && (
            <div className="space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-[rgba(232,232,223,0.08)] pb-2 text-[11px] text-[#A1A39B]">
                <span>GROUNDED RAG CHAT</span>
                <span className="text-[#C5F467]">Verification Score: 99.4%</span>
              </div>

              <div className="space-y-3 font-sans">
                <div className="flex justify-end">
                  <div className="bg-[#191A18] border border-[rgba(232,232,223,0.12)] text-[#E8E8DF] p-3 rounded-sm max-w-lg text-xs font-mono">
                    How does the AST engine discover REST API routes in FastAPI without execution?
                  </div>
                </div>

                <div className="flex justify-start">
                  <div className="bg-[#141514] border border-[rgba(232,232,223,0.12)] text-[#A1A39B] p-4 rounded-sm max-w-xl space-y-2.5 text-xs">
                    <div className="font-mono text-[#C5F467] font-semibold text-[11px]">
                      RepoWiki Code Intelligence:
                    </div>
                    <p className="leading-relaxed text-[#E8E8DF]">
                      RepoWiki uses Tree-Sitter visitors to inspect decorator syntax nodes (e.g. <code className="text-[#C5F467] bg-[#101110] px-1 py-0.5 rounded-sm font-mono">@router.get</code>) and endpoint function signatures directly in the AST grammar. Parameters and response models are parsed into symbol trees with zero runtime execution.
                    </p>
                    <div className="pt-2 border-t border-[rgba(232,232,223,0.08)] font-mono text-[11px] text-[#A1A39B] flex items-center gap-2">
                      <span className="text-[#C5F467]">Citations:</span>
                      <span className="px-1.5 py-0.5 bg-[#191A18] border border-[rgba(232,232,223,0.08)] text-[#E8E8DF]">
                        backend/app/services/ast_analyzer.py:L14-48
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: APIS & SCHEMA */}
          {activeTab === "apis" && (
            <div className="space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-[rgba(232,232,223,0.08)] pb-2 text-[11px] text-[#A1A39B]">
                <span>AST-EXTRACTED REST ENDPOINTS</span>
                <span className="text-[#C5F467]">OpenAPI 3.1 Spec</span>
              </div>

              <div className="border border-[rgba(232,232,223,0.08)] rounded-sm overflow-hidden text-xs">
                <div className="grid grid-cols-12 px-3 py-2 bg-[#141514] border-b border-[rgba(232,232,223,0.08)] text-[#A1A39B] font-semibold text-[11px]">
                  <span className="col-span-2">METHOD</span>
                  <span className="col-span-4">PATH</span>
                  <span className="col-span-4">AST HANDLER</span>
                  <span className="col-span-2 text-right">STATUS</span>
                </div>
                {[
                  { method: "GET", path: "/api/v1/repos/{id}/wiki", handler: "get_repo_wiki()", status: "200 OK" },
                  { method: "POST", path: "/api/v1/repos/analyze", handler: "trigger_analysis()", status: "201 Created" },
                  { method: "GET", path: "/api/v1/repos/{id}/architecture", handler: "get_architecture_map()", status: "200 OK" },
                  { method: "GET", path: "/api/v1/repos/{id}/security", handler: "get_security_audit()", status: "200 OK" },
                ].map((ep) => (
                  <div key={ep.path} className="grid grid-cols-12 px-3 py-2.5 border-b border-[rgba(232,232,223,0.04)] items-center">
                    <span className="col-span-2 text-[#C5F467] font-bold">{ep.method}</span>
                    <span className="col-span-4 text-[#E8E8DF]">{ep.path}</span>
                    <span className="col-span-4 text-[#A1A39B] truncate">{ep.handler}</span>
                    <span className="col-span-2 text-right text-[#A1A39B]">{ep.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: DATABASE ERD */}
          {activeTab === "database" && (
            <div className="space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-[rgba(232,232,223,0.08)] pb-2 text-[11px] text-[#A1A39B]">
                <span>RELATIONAL SCHEMA INFERRER</span>
                <span className="text-[#C5F467]">SQLAlchemy & SQL DDL</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-[#141514] border border-[rgba(232,232,223,0.08)] rounded-sm space-y-2">
                  <div className="flex justify-between border-b border-[rgba(232,232,223,0.06)] pb-1 text-[#E8E8DF] font-bold">
                    <span>repositories</span>
                    <span className="text-[#C5F467] text-[10px]">TABLE</span>
                  </div>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between"><span className="text-[#C5F467]">id (PK)</span><span className="text-[#A1A39B]">UUID</span></div>
                    <div className="flex justify-between"><span className="text-[#E8E8DF]">full_name</span><span className="text-[#A1A39B]">VARCHAR(255)</span></div>
                    <div className="flex justify-between"><span className="text-[#E8E8DF]">default_branch</span><span className="text-[#A1A39B]">VARCHAR(64)</span></div>
                  </div>
                </div>

                <div className="p-3 bg-[#141514] border border-[rgba(232,232,223,0.08)] rounded-sm space-y-2">
                  <div className="flex justify-between border-b border-[rgba(232,232,223,0.06)] pb-1 text-[#E8E8DF] font-bold">
                    <span>wiki_chapters</span>
                    <span className="text-[#C5F467] text-[10px]">TABLE</span>
                  </div>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between"><span className="text-[#C5F467]">id (PK)</span><span className="text-[#A1A39B]">UUID</span></div>
                    <div className="flex justify-between"><span className="text-[#E8E8DF]">repo_id (FK)</span><span className="text-[#A1A39B]">UUID</span></div>
                    <div className="flex justify-between"><span className="text-[#E8E8DF]">content_markdown</span><span className="text-[#A1A39B]">TEXT</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
