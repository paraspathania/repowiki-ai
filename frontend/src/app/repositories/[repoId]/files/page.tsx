"use client";

import { useEffect, useState } from "react";
import { FileTree } from "@/components/files/FileTree";
import { FileNodeItem } from "@/components/files/FileTreeNode";
import { FileBreadcrumb } from "@/components/files/FileBreadcrumb";
import { CodeViewer } from "@/components/files/CodeViewer";
import { AIExplanationPanel } from "@/components/ai/AIExplanationPanel";
import { repoService } from "@/lib/api/client";
import {
  Terminal as TerminalIcon, Code2, X, Play, CheckCircle2, AlertTriangle,
  Cpu, Zap, Minimize2, Maximize2, Sparkles, FileCode, ChevronUp, ChevronDown
} from "lucide-react";

const MOCK_CODE_SAMPLES: Record<string, string> = {
  "src/app/page.tsx": `"use client";

import { useState } from "react";
import { RepositoryInput } from "@/components/repository/RepositoryInput";
import { RepositoryPreviewCard } from "@/components/repository/RepositoryPreview";
import { Sparkles, BookOpen, GitBranch, Cpu } from "lucide-react";

export default function HomePage() {
  const [preview, setPreview] = useState(null);

  return (
    <main className="min-h-screen relative flex flex-col justify-between p-6 bg-background">
      <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight text-white">
        Understand Any Repository
      </h1>
      <p className="text-slate-400 text-base max-w-2xl">
        Transform software codebases into structured, navigable technical documentation.
      </p>
    </main>
  );
}`,
  "src/components/files/CodeViewer.tsx": `"use client";

import Editor from "@monaco-editor/react";
import { Loader2 } from "lucide-react";

export function CodeViewer({ code, language = "typescript" }: { code: string; language?: string }) {
  return (
    <div className="w-full h-full bg-[#1e1e1e]">
      <Editor
        height="100%"
        defaultLanguage={language}
        value={code}
        theme="vs-dark"
        options={{ readOnly: true, minimap: { enabled: true } }}
      />
    </div>
  );
}`,
  "src/lib/api/client.ts": `import axios from "axios";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
  headers: { "Content-Type": "application/json" },
});`,
};

export default function FileExplorerPage({ params }: { params: { repoId: string } }) {
  const [fileTree, setFileTree] = useState<FileNodeItem[]>([]);
  const [openTabs, setOpenTabs] = useState<string[]>([
    "src/app/page.tsx",
    "src/components/files/CodeViewer.tsx",
    "src/lib/api/client.ts",
  ]);
  const [selectedPath, setSelectedPath] = useState("src/app/page.tsx");
  const [currentCode, setCurrentCode] = useState(MOCK_CODE_SAMPLES["src/app/page.tsx"]);

  // Compiler Console State
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [activeConsoleTab, setActiveConsoleTab] = useState<"compiler" | "console" | "ast">("compiler");
  const [isCompiling, setIsCompiling] = useState(false);
  const [compilerLogs, setCompilerLogs] = useState<string[]>([
    "RepoWiki AI Compiler Engine v2.4.0 [x86_64-linux]",
    "Target AST Parser: Tree-Sitter TypeScript / Python plugin",
    "Status: Idle. Click '▶ Run Code' to execute AST build pipeline.",
  ]);

  useEffect(() => {
    repoService.getFileTree(params.repoId).then((nodes: any[]) => {
      const mapped: FileNodeItem[] = nodes.map((n: any) => ({
        name: n.name,
        path: n.path,
        type: (n.type === "directory" ? "folder" : "file") as "folder" | "file",
        children: n.children?.map((c: any) => ({
          name: c.name,
          path: c.path,
          type: (c.type === "directory" ? "folder" : "file") as "folder" | "file",
        })),
      }));
      setFileTree(mapped);
    });
  }, [params.repoId]);

  const handleSelectNode = (node: FileNodeItem) => {
    setSelectedPath(node.path);
    if (node.type === "file") {
      if (!openTabs.includes(node.path)) {
        setOpenTabs((prev) => [...prev, node.path]);
      }
      const sample =
        MOCK_CODE_SAMPLES[node.path] ||
        `// Source content for ${node.path}\n\nexport function ${node.name
          .split(".")[0]
          .replace(/[^a-zA-Z0-9]/g, "")}() {\n  // AST Chunk Node\n  return "RepoWiki AI Grounded AST Node";\n}\n`;
      setCurrentCode(sample);
    }
  };

  const handleCloseTab = (e: React.MouseEvent, tabPath: string) => {
    e.stopPropagation();
    const filtered = openTabs.filter((t) => t !== tabPath);
    setOpenTabs(filtered);
    if (selectedPath === tabPath && filtered.length > 0) {
      const nextTab = filtered[filtered.length - 1];
      setSelectedPath(nextTab);
      setCurrentCode(MOCK_CODE_SAMPLES[nextTab] || `// Source for ${nextTab}`);
    }
  };

  const handleRunCode = () => {
    setIsCompiling(true);
    setIsConsoleOpen(true);
    const fileName = selectedPath.split("/").pop();
    setCompilerLogs([
      `[COMPILER] Initializing build for target: ${selectedPath}`,
      `[PARSER] Generating Tree-Sitter AST tokens...`,
      `[TYPECHECK] Executing static analysis check on ${fileName}...`,
      `[TRANSPILE] Bundling ESM module via Next.js Compiler...`,
    ]);

    setTimeout(() => {
      setCompilerLogs((prev) => [
        ...prev,
        `[SUCCESS] Built ${fileName} in 38ms!`,
        `[OUTPUT] Component '${fileName}' rendered successfully. Zero syntax or type errors detected.`,
        `[STATUS] Return Code 0 — Memory: 14.2MB`,
      ]);
      setIsCompiling(false);
    }, 1200);
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-black">
      {/* Main 3-Column IDE Workspace Grid */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        {/* Column 1: File Tree Explorer (22%) */}
        <div className="col-span-3 h-full overflow-hidden bg-black border-r border-white/[0.08]">
          <FileTree
            nodes={fileTree}
            selectedPath={selectedPath}
            onSelect={handleSelectNode}
          />
        </div>

        {/* Column 2: Code Editor Workspace & Tabs (53%) */}
        <div className="col-span-6 h-full flex flex-col overflow-hidden bg-black border-r border-white/[0.08] relative">
          {/* Editor Tabs Bar */}
          <div className="flex items-center bg-black border-b border-white/[0.08] overflow-x-auto no-scrollbar flex-shrink-0 select-none">
            {openTabs.map((tabPath) => {
              const fileName = tabPath.split("/").pop() || tabPath;
              const isActive = selectedPath === tabPath;
              return (
                <div
                  key={tabPath}
                  onClick={() => {
                    setSelectedPath(tabPath);
                    setCurrentCode(
                      MOCK_CODE_SAMPLES[tabPath] || `// Source for ${tabPath}`
                    );
                  }}
                  className={`group flex items-center gap-2 px-3.5 py-2 text-xs font-mono border-r border-white/[0.06] cursor-pointer transition-all duration-150 relative ${
                    isActive
                      ? "bg-[#0b0e17] text-white font-semibold border-t-2 border-t-indigo-500"
                      : "bg-[#06080e]/60 text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]"
                  }`}
                >
                  <Code2
                    className={`w-3.5 h-3.5 ${
                      isActive ? "text-cyan-400" : "text-slate-500"
                    }`}
                  />
                  <span className="truncate max-w-[130px]">{fileName}</span>
                  <button
                    onClick={(e) => handleCloseTab(e, tabPath)}
                    className="p-0.5 rounded hover:bg-white/10 text-slate-500 hover:text-white transition opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Breadcrumbs & Controls */}
          <FileBreadcrumb
            path={selectedPath}
            onNavigate={(p) => setSelectedPath(p)}
            onRunCode={handleRunCode}
            isCompiling={isCompiling}
          />

          {/* Monaco Code Editor */}
          <div className="flex-1 overflow-hidden relative">
            <CodeViewer
              code={currentCode}
              language={selectedPath.split(".").pop()}
              selectedPath={selectedPath}
            />
          </div>

          {/* Collapsible IDE Compiler Terminal Drawer */}
          <div
            className={`border-t border-white/[0.08] bg-black flex flex-col transition-all duration-300 flex-shrink-0 ${
              isConsoleOpen ? "h-48" : "h-8"
            }`}
          >
            {/* Drawer Header Bar */}
            <div
              onClick={() => setIsConsoleOpen(!isConsoleOpen)}
              className="flex items-center justify-between px-4 py-1.5 bg-black cursor-pointer hover:bg-white/[0.04] border-b border-white/[0.06] select-none"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white">
                  <TerminalIcon className="w-3.5 h-3.5 text-emerald-400" />
                  <span>TERMINAL & COMPILER OUTPUT</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveConsoleTab("compiler");
                      setIsConsoleOpen(true);
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono transition ${
                      activeConsoleTab === "compiler"
                        ? "bg-indigo-600/30 text-indigo-300 font-bold border border-indigo-500/30"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    ⚡ Compiler Log
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveConsoleTab("console");
                      setIsConsoleOpen(true);
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono transition ${
                      activeConsoleTab === "console"
                        ? "bg-indigo-600/30 text-indigo-300 font-bold border border-indigo-500/30"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    Console (0 Errors)
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveConsoleTab("ast");
                      setIsConsoleOpen(true);
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono transition ${
                      activeConsoleTab === "ast"
                        ? "bg-indigo-600/30 text-indigo-300 font-bold border border-indigo-500/30"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    AST Breakdown
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  ● Engine Ready
                </span>
                {isConsoleOpen ? (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                )}
              </div>
            </div>

            {/* Console Log Content */}
            {isConsoleOpen && (
              <div className="flex-1 p-3 overflow-y-auto font-mono text-xs text-slate-300 space-y-1.5 bg-[#05070e] custom-scrollbar">
                {activeConsoleTab === "compiler" && (
                  <>
                    {compilerLogs.map((log, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-400">$</span>
                        <span
                          className={
                            log.includes("SUCCESS")
                              ? "text-emerald-400 font-bold"
                              : log.includes("COMPILER")
                              ? "text-indigo-400"
                              : "text-slate-300"
                          }
                        >
                          {log}
                        </span>
                      </div>
                    ))}
                  </>
                )}

                {activeConsoleTab === "console" && (
                  <div className="text-slate-400 text-[11px]">
                    <span className="text-emerald-400">[INFO]</span> Virtual Node Sandbox initialized at localhost:3000. Zero runtime exceptions.
                  </div>
                )}

                {activeConsoleTab === "ast" && (
                  <div className="text-amber-300 text-[11px] whitespace-pre font-mono">
                    {`{
  "type": "Program",
  "sourceType": "module",
  "target": "${selectedPath}",
  "body": [
    { "type": "ExportDefaultDeclaration", "kind": "function", "name": "HomePage" }
  ]
}`}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Column 3: IDE AI Assistant Panel (25%) */}
        <div className="col-span-3 h-full overflow-hidden">
          <AIExplanationPanel
            repoId={params.repoId}
            selectedPath={selectedPath}
            codeSnippet={currentCode}
          />
        </div>
      </div>
    </div>
  );
}
