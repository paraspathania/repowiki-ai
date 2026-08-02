"use client";

import { useState } from "react";
import { RepositoryInput } from "@/components/repository/RepositoryInput";
import { RepositoryPreviewCard } from "@/components/repository/RepositoryPreview";
import { RepositoryPreview } from "@/types";
import { BookOpen, GitBranch, Cpu, Sparkles } from "lucide-react";

export default function HomePage() {
  const [preview, setPreview] = useState<RepositoryPreview | null>(null);
  const [validatedUrl, setValidatedUrl] = useState<string>("");

  return (
    <main className="min-h-screen bg-background flex flex-col justify-between p-6 md:p-12">
      <div className="max-w-4xl mx-auto w-full space-y-12">
        {/* Header Hero */}
        <div className="text-center space-y-4 pt-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-panel border border-border rounded-full text-xs font-semibold text-accent-blue mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>RepoWiki AI v1.0</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight">
            Understand Any Repository
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Transform software repositories into structured, navigable technical knowledge.
            Overview, technical Wiki, file explanations, and architecture diagrams.
          </p>
        </div>

        {/* Input / Preview Section */}
        <div className="space-y-6">
          <RepositoryInput
            onValidated={(prev, url) => {
              setPreview(prev);
              setValidatedUrl(url);
            }}
          />

          {preview && (
            <RepositoryPreviewCard
              preview={preview}
              repoUrl={validatedUrl}
            />
          )}
        </div>

        {/* Value Proposition Cards */}
        {!preview && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
            <div className="bg-panel border border-border p-6 rounded-xl space-y-3">
              <BookOpen className="w-6 h-6 text-accent-blue" />
              <h3 className="text-lg font-bold text-white">Technical Wiki</h3>
              <p className="text-gray-400 text-sm">
                Automatically generated architecture, module explanations, and getting-started docs grounded in source code.
              </p>
            </div>

            <div className="bg-panel border border-border p-6 rounded-xl space-y-3">
              <GitBranch className="w-6 h-6 text-accent" />
              <h3 className="text-lg font-bold text-white">Architecture Visualizer</h3>
              <p className="text-gray-400 text-sm">
                Evidence-grounded Mermaid diagrams visualizing module dependencies, data flow, and entry points.
              </p>
            </div>

            <div className="bg-panel border border-border p-6 rounded-xl space-y-3">
              <Cpu className="w-6 h-6 text-amber-400" />
              <h3 className="text-lg font-bold text-white">Grounded AI Chat</h3>
              <p className="text-gray-400 text-sm">
                Ask deep questions about code logic with verified source citations linking straight to exact line numbers.
              </p>
            </div>
          </div>
        )}
      </div>

      <footer className="text-center text-gray-500 text-xs py-6 border-t border-border/30 mt-12">
        RepoWiki AI — Modular Monolith Architecture
      </footer>
    </main>
  );
}
