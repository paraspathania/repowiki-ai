"use client";

import { RepositoryHeader } from "@/components/layout/RepositoryHeader";
import { RepositorySidebar } from "@/components/layout/RepositorySidebar";

export default function RepositoryWorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { repoId: string };
}) {
  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <RepositoryHeader
        repoName={`Repository (${params.repoId.slice(0, 8)})`}
        branch="main"
        githubUrl={`https://github.com`}
      />
      <div className="flex-1 flex overflow-hidden">
        <RepositorySidebar repoId={params.repoId} />
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
