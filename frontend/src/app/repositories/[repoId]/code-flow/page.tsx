"use client";

import { CodeFlowAnimator } from "@/components/flow/CodeFlowAnimator";

export default function CodeFlowPage() {
  return (
    <div className="h-full overflow-y-auto p-6 md:p-8 bg-[#07090e] space-y-6">
      <CodeFlowAnimator />
    </div>
  );
}
