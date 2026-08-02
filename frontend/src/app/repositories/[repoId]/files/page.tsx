"use client";

import { useState } from "react";
import { FileTree } from "@/components/files/FileTree";
import { FileNodeItem } from "@/components/files/FileTreeNode";
import { FileBreadcrumb } from "@/components/files/FileBreadcrumb";
import { CodeViewer } from "@/components/files/CodeViewer";
import { AIExplanationPanel } from "@/components/ai/AIExplanationPanel";

const MOCK_TREE: FileNodeItem[] = [
  {
    name: "app",
    path: "/app",
    type: "folder",
    children: [
      { name: "main.py", path: "/app/main.py", type: "file" },
      {
        name: "core",
        path: "/app/core",
        type: "folder",
        children: [
          { name: "config.py", path: "/app/core/config.py", type: "file" },
          { name: "security.py", path: "/app/core/security.py", type: "file" },
        ],
      },
      {
        name: "api",
        path: "/app/api",
        type: "folder",
        children: [{ name: "router.py", path: "/app/api/router.py", type: "file" }],
      },
    ],
  },
  { name: "docker-compose.yml", path: "/docker-compose.yml", type: "file" },
  { name: "README.md", path: "/README.md", type: "file" },
];

const MOCK_CODE = `from fastapi import FastAPI
from app.core.config import settings

app = FastAPI(title=settings.PROJECT_NAME)

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": settings.PROJECT_NAME}
`;

export default function FileExplorerPage({ params }: { params: { repoId: string } }) {
  const [selectedPath, setSelectedPath] = useState("/app/main.py");
  const [currentCode, setCurrentCode] = useState(MOCK_CODE);

  const handleSelectNode = (node: FileNodeItem) => {
    setSelectedPath(node.path);
    if (node.type === "file") {
      setCurrentCode(`// Content of ${node.path}\n\nfunction sampleCode() {\n  console.log("Viewing ${node.name}");\n}`);
    }
  };

  return (
    <div className="w-full h-full grid grid-cols-12 overflow-hidden">
      {/* Panel 1: File Tree (25%) */}
      <div className="col-span-3 h-full overflow-hidden">
        <FileTree
          nodes={MOCK_TREE}
          selectedPath={selectedPath}
          onSelect={handleSelectNode}
        />
      </div>

      {/* Panel 2: Code Viewer (50%) */}
      <div className="col-span-5 h-full flex flex-col overflow-hidden bg-[#1e1e1e]">
        <FileBreadcrumb path={selectedPath} onNavigate={setSelectedPath} />
        <div className="flex-1 overflow-hidden">
          <CodeViewer code={currentCode} language={selectedPath.split(".").pop()} />
        </div>
      </div>

      {/* Panel 3: AI Context & Explanation (25%) */}
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
