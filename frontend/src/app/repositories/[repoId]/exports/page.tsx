"use client";

import { ExportModal } from "@/components/exports/ExportModal";

export default function ExportsPage({ params }: { params: { repoId: string } }) {
  return (
    <div className="h-full overflow-y-auto p-6 md:p-8 bg-[#07090e]">
      <ExportModal repoName={params.repoId} />
    </div>
  );
}
