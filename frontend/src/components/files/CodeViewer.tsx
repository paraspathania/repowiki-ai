"use client";

import Editor from "@monaco-editor/react";
import { Loader2 } from "lucide-react";

interface CodeViewerProps {
  code: string;
  language?: string;
  highlightLine?: number;
}

export function CodeViewer({ code, language = "typescript", highlightLine }: CodeViewerProps) {
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

  return (
    <div className="w-full h-full min-h-[500px] bg-[#1e1e1e] relative">
      <Editor
        height="100%"
        defaultLanguage={getMonacoLanguage(language)}
        language={getMonacoLanguage(language)}
        value={code}
        theme="vs-dark"
        options={{
          readOnly: true,
          minimap: { enabled: true },
          fontSize: 13,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          wordWrap: "on",
          folding: true,
          automaticLayout: true,
          renderLineHighlight: "all",
        }}
        loading={
          <div className="flex items-center justify-center h-full text-gray-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading Code Viewer...</span>
          </div>
        }
      />
    </div>
  );
}
