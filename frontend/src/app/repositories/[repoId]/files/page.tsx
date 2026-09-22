"use client";

import { useEffect, useState, useCallback } from "react";
import { FileTree } from "@/components/files/FileTree";
import { FileNodeItem } from "@/components/files/FileTreeNode";
import { FileBreadcrumb } from "@/components/files/FileBreadcrumb";
import { CodeViewer } from "@/components/files/CodeViewer";
import { AIExplanationPanel } from "@/components/ai/AIExplanationPanel";
import { Loader2, Lock, FileQuestion, Binary } from "lucide-react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export default function FileExplorerPage({ params }: { params: { repoId: string } }) {
  const [tree, setTree] = useState<FileNodeItem[]>([]);
  const [selectedPath, setSelectedPath] = useState<string>("");
  const [currentCode, setCurrentCode] = useState<string>("");
  const [isBinary, setIsBinary] = useState<boolean>(false);
  const [loadingTree, setLoadingTree] = useState<boolean>(true);
  const [loadingFile, setLoadingFile] = useState<boolean>(false);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);

  // Helper to find first file in tree
  const findFirstFile = (nodes: FileNodeItem[]): FileNodeItem | null => {
    for (const node of nodes) {
      if (node.type === "file") return node;
      if (node.children && node.children.length > 0) {
        const found = findFirstFile(node.children);
        if (found) return found;
      }
    }
    return null;
  };

  const loadFileContent = useCallback(async (path: string, isBinHint?: boolean) => {
    if (!path) return;
    if (isBinHint) {
      setIsBinary(true);
      setCurrentCode("");
      return;
    }

    setLoadingFile(true);
    setIsBinary(false);
    try {
      const res = await fetch(`${API_BASE}/repositories/${params.repoId}/files/content?path=${encodeURIComponent(path)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.is_binary) {
          setIsBinary(true);
          setCurrentCode("");
        } else {
          setIsBinary(false);
          setCurrentCode(data.content || "");
        }
      } else {
        setCurrentCode(`// Failed to load content for ${path}`);
      }
    } catch (err) {
      console.error("Error loading file content:", err);
      setCurrentCode(`// Error loading file: ${String(err)}`);
    } finally {
      setLoadingFile(false);
    }
  }, [params.repoId]);

  useEffect(() => {
    const fetchTree = async () => {
      setLoadingTree(true);
      setErrorStatus(null);
      try {
        const res = await fetch(`${API_BASE}/repositories/${params.repoId}/files`);
        if (res.status === 404 || res.status === 403) {
          setErrorStatus(res.status);
          setTree([]);
          return;
        }
        const data = await res.json();
        const nodes: FileNodeItem[] = data.tree || [];
        setTree(nodes);

        if (nodes.length > 0) {
          const first = findFirstFile(nodes);
          if (first) {
            setSelectedPath(first.path);
            loadFileContent(first.path, first.is_binary);
          }
        }
      } catch (err) {
        console.error("Failed to fetch tree:", err);
        setErrorStatus(500);
      } finally {
        setLoadingTree(false);
      }
    };

    fetchTree();
  }, [params.repoId, loadFileContent]);

  const handleSelectNode = (node: FileNodeItem) => {
    setSelectedPath(node.path);
    if (node.type === "file") {
      loadFileContent(node.path, node.is_binary);
    }
  };

  // State: Loading tree
  if (loadingTree) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-background min-h-[400px] space-y-3">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        <p className="text-slate-400 text-sm">Building repository file tree...</p>
      </div>
    );
  }

  // State: Access denied / Not found
  if (errorStatus === 404 || errorStatus === 403) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-background space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-white">Repository Inaccessible or Not Found</h2>
        <p className="text-slate-400 text-sm max-w-md">
          You do not have permission to view files in this repository or it has not been analyzed yet.
        </p>
        <Link
          href="/"
          className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-slate-300 rounded-xl border border-white/[0.08] transition"
        >
          Return to Repositories
        </Link>
      </div>
    );
  }

  // State: Empty tree
  if (tree.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-background space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-slate-500/10 border border-white/[0.08] flex items-center justify-center text-slate-400">
          <FileQuestion className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-white">No Files Scanned Yet</h2>
        <p className="text-slate-400 text-sm max-w-md">
          This repository may still be in the process of cloning and scanning.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full grid grid-cols-12 overflow-hidden bg-background">
      {/* Panel 1: File Tree (25%) */}
      <div className="col-span-3 h-full overflow-hidden bg-surface/10 border-r border-white/[0.06]">
        <FileTree
          nodes={tree}
          selectedPath={selectedPath}
          onSelect={handleSelectNode}
        />
      </div>

      {/* Panel 2: Code Viewer (41.6%) */}
      <div className="col-span-5 h-full flex flex-col overflow-hidden bg-[#0d1117]/40 border-r border-white/[0.06]">
        <FileBreadcrumb path={selectedPath} onNavigate={(p) => { setSelectedPath(p); loadFileContent(p); }} />
        <div className="flex-1 overflow-hidden relative">
          {loadingFile ? (
            <div className="w-full h-full flex items-center justify-center bg-[#1e1e1e] space-x-2 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
              <span className="text-xs">Loading {selectedPath}...</span>
            </div>
          ) : isBinary ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-[#1e1e1e] space-y-3">
              <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-400">
                <Binary className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-white">Binary File Preview Unavailable</h3>
              <p className="text-xs text-slate-400 max-w-xs">
                This file contains binary data and cannot be displayed in the code viewer.
              </p>
            </div>
          ) : (
            <CodeViewer code={currentCode} language={selectedPath.split(".").pop()} />
          )}
        </div>
      </div>

      {/* Panel 3: AI Context & Explanation (33.3%) */}
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
