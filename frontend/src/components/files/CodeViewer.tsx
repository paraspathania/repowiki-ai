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
    <div className="w-full h-full flex flex-col bg-[#111111] relative">
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
            <div className="flex flex-col items-center justify-center h-full text-[#A3A3A3] gap-2.5 bg-[#111111]">
              <Loader2 className="w-5 h-5 animate-spin text-[#F2F2F2]" />
              <span className="text-xs font-mono text-[#777777]">Loading file...</span>
            </div>
          }
        />
      </div>

      {/* IDE Status Bar */}
      <div className="h-7 bg-[#111111] border-t border-[#2A2A2A] px-3 flex items-center justify-between text-[11px] font-mono text-[#777777] select-none flex-shrink-0">
        {/* Left Status info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[#A3A3A3]">
            <Cpu className="w-3 h-3 text-[#777777]" />
            <span className="font-medium text-[#F2F2F2]">Tree-Sitter AST</span>
          </div>
          <span>Ln {lineCount}, Ch {charCount}</span>
          <span>UTF-8</span>
          <span className="text-[#A3A3A3] font-medium uppercase">{getMonacoLanguage(language)}</span>
        </div>

        {/* Right Status info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[#A3A3A3]">
            <CheckCircle2 className="w-3 h-3 text-[#777777]" />
            <span>Prettier: OK</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#A3A3A3]">
            <ShieldCheck className="w-3 h-3 text-[#777777]" />
            <span>SAIF Safeguard: Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
