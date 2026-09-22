"use client";

import { useEffect, useState } from "react";
import { repoService } from "@/lib/api/client";
import { SecurityAuditPanel } from "@/components/security/SecurityAuditPanel";
import { SecurityFinding } from "@/types";

export default function SecurityPage({ params }: { params: { repoId: string } }) {
  const [findings, setFindings] = useState<SecurityFinding[]>([]);

  useEffect(() => {
    repoService.getSecurityAudit(params.repoId).then(setFindings);
  }, [params.repoId]);

  return (
    <div className="h-full overflow-y-auto p-6 md:p-8 bg-[#07090e]">
      {findings.length > 0 ? (
        <SecurityAuditPanel findings={findings} />
      ) : (
        <div className="text-slate-500 text-xs font-mono p-8">Loading security audit...</div>
      )}
    </div>
  );
}
