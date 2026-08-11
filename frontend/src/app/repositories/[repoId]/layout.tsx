"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RepositoryHeader } from "@/components/layout/RepositoryHeader";
import { RepositorySidebar } from "@/components/layout/RepositorySidebar";
import { CommandPalette, SearchResult } from "@/components/search/CommandPalette";

export default function RepositoryWorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { repoId: string };
}) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSelectSearchResult = (result: SearchResult) => {
    setIsSearchOpen(false);
    router.push(`/repositories/${params.repoId}/files?path=${encodeURIComponent(result.path)}`);
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <RepositoryHeader
        repoName={`Repository (${params.repoId})`}
        branch="main"
        githubUrl={`https://github.com/paraspathania/repowiki-ai`}
        onOpenSearch={() => setIsSearchOpen(true)}
      />
      <div className="flex-1 flex overflow-hidden">
        <RepositorySidebar repoId={params.repoId} />
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>

      <CommandPalette
        repositoryId={params.repoId}
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectResult={handleSelectSearchResult}
      />
    </div>
  );
}
