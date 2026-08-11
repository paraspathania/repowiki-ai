"use client";

import { useEffect, useState } from "react";
import { FileTree } from "@/components/files/FileTree";
import { FileNodeItem } from "@/components/files/FileTreeNode";
import { FileBreadcrumb } from "@/components/files/FileBreadcrumb";
import { CodeViewer } from "@/components/files/CodeViewer";
import { AIExplanationPanel } from "@/components/ai/AIExplanationPanel";
import { repoService } from "@/lib/api/client";

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
  const [selectedPath, setSelectedPath] = useState("src/app/page.tsx");
  const [currentCode, setCurrentCode] = useState(MOCK_CODE_SAMPLES["src/app/page.tsx"]);

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
      const sample = MOCK_CODE_SAMPLES[node.path] || `// Source content for ${node.path}\n\nexport function ${node.name.split(".")[0]}() {\n  return "RepoWiki AI Grounded AST Node";\n}`;
      setCurrentCode(sample);
    }
  };

  return (
    <div className="w-full h-full grid grid-cols-12 overflow-hidden bg-[#07090e]">
      {/* Panel 1: File Tree (25%) */}
      <div className="col-span-3 h-full overflow-hidden bg-[#090b12] border-r border-white/[0.08]">
        <FileTree
          nodes={fileTree}
          selectedPath={selectedPath}
          onSelect={handleSelectNode}
        />
      </div>

      {/* Panel 2: Monaco Code Viewer (45%) */}
      <div className="col-span-5 h-full flex flex-col overflow-hidden bg-[#0d1117]/60 border-r border-white/[0.08]">
        <FileBreadcrumb path={selectedPath} onNavigate={setSelectedPath} />
        <div className="flex-1 overflow-hidden">
          <CodeViewer code={currentCode} language={selectedPath.split(".").pop()} />
        </div>
      </div>

      {/* Panel 3: AI Code Explanation Panel (30%) */}
      <div className="col-span-4 h-full overflow-hidden">
        <AIExplanationPanel
          repoId={params.repoId}
          selectedPath={selectedPath}
          codeSnippet={currentCode}
        />
      </div>
    </div>
  );
}
