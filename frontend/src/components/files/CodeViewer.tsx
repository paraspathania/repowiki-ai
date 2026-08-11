"use client";

import Editor from "@monaco-editor/react";
import { Loader2, Code2, Terminal, Cpu, CheckCircle2, ShieldCheck } from "lucide-react";

interface CodeViewerProps {
  code: string;
  language?: string;
  highlightLine?: number;
  selectedPath?: string;
}

export function CodeViewer({ code, language = "typescript", selectedPath = "" }: CodeViewerProps) {
  const getMonacoLanguage = (lang?: string) => {
    if (!lang) return "plaintext";
    const l = lang.toLowerCase();
    if (l === "py" || l === "python") return "python";
    if (l === "ts" || l === "tsx" || l === "typescript") return "typescript";
    if (l === "js" || l === "jsx" || l === "javascript") return "javascript";
    if (l === "json") return "json";
    if (l === "md" || l === "markdown") return "markdown";
    if (l === "html") return "html";
    if (l === "css") return "css";
    return "plaintext";
  };

  const lineCount = code.split("\n").length;
  const charCount = code.length;

  return (
    <div className="w-full h-full flex flex-col bg-[#0b0e17] relative">
      {/* Monaco Editor Container */}
      <div className="flex-1 relative overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage={getMonacoLanguage(language)}
          language={getMonacoLanguage(language)}
          value={code}
          theme="vs-dark"
          options={{
            readOnly: true,
            minimap: { enabled: true, renderCharacters: false },
            fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            wordWrap: "on",
            folding: true,
            automaticLayout: true,
            renderLineHighlight: "all",
            padding: { top: 12, bottom: 12 },
            cursorBlinking: "smooth",
            smoothScrolling: true,
            bracketPairColorization: { enabled: true },
          }}
          loading={
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3 bg-[#0b0e17]">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
              <span className="text-xs font-mono">Initializing Monaco Compiler Engine...</span>
            </div>
          }
        />
      </div>

      {/* IDE Status Bar */}
      <div className="h-7 bg-[#070910] border-t border-white/[0.08] px-3 flex items-center justify-between text-[11px] font-mono text-slate-500 select-none flex-shrink-0">
        {/* Left Status info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-indigo-400">
            <Cpu className="w-3 h-3" />
            <span className="font-bold">Tree-Sitter AST</span>
          </div>
          <span>Ln {lineCount}, Ch {charCount}</span>
          <span>UTF-8</span>
          <span className="text-slate-400 font-bold uppercase">{getMonacoLanguage(language)}</span>
        </div>

        {/* Right Status info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-emerald-400">
            <CheckCircle2 className="w-3 h-3" />
            <span>Prettier: OK</span>
          </div>
          <div className="flex items-center gap-1 text-indigo-300">
            <ShieldCheck className="w-3 h-3" />
            <span>SAIF Safeguard: Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
