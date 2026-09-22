"use client";

import { SettingsPanel } from "@/components/settings/SettingsPanel";

export default function SettingsPage({ params }: { params: { repoId: string } }) {
  return (
    <div className="h-full overflow-y-auto p-6 md:p-8 bg-[#07090e]">
      <SettingsPanel repoId={params.repoId} />
    </div>
  );
}
