"use client";

import { SecurityFinding } from "@/types";
import { ShieldAlert, Lock, AlertOctagon, CheckCircle2, Shield } from "lucide-react";

interface SecurityAuditPanelProps {
  findings: SecurityFinding[];
}

export function SecurityAuditPanel({ findings }: SecurityAuditPanelProps) {
  const getSeverityBadge = (severity: SecurityFinding["severity"]) => {
    switch (severity) {
      case "Critical": return "bg-rose-500/20 text-rose-300 border-rose-500/40";
      case "High": return "bg-amber-500/20 text-amber-300 border-amber-500/40";
      case "Medium": return "bg-yellow-500/20 text-yellow-300 border-yellow-500/40";
      case "Low": return "bg-blue-500/20 text-blue-300 border-blue-500/40";
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-[#090b12] p-5 rounded-2xl border border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Security & SAIF Compliance Audit
            </h3>
            <p className="text-xs text-slate-400">
              Automated secret leak prevention, SQL injection detection, and SAIF data masking safeguards.
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          Client Secret Masking Active
        </span>
      </div>

      {/* Findings List */}
      <div className="space-y-4">
        {findings.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl bg-[#090b12] border border-white/[0.08] space-y-3 hover:border-white/[0.15] transition"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded border ${getSeverityBadge(item.severity)}`}>
                  {item.severity} SEVERITY
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-white/[0.04] rounded border border-white/[0.06]">
                  {item.category}
                </span>
                <h4 className="text-xs font-bold text-white">{item.title}</h4>
              </div>

              <span className="text-[11px] font-mono text-indigo-300">
                {item.filePath}:L{item.lineNumber}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {item.description}
            </p>

            {/* Code Snippet Box */}
            <div className="p-3 rounded-xl bg-[#05070c] border border-white/[0.06] font-mono text-xs text-rose-300">
              <pre className="whitespace-pre-wrap">{item.codeSnippet}</pre>
            </div>

            {/* Recommendation */}
            <div className="flex items-start gap-2 text-xs text-emerald-300 bg-emerald-950/20 p-3 rounded-xl border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-400" />
              <div>
                <span className="font-bold text-emerald-400">Recommendation: </span>
                <span>{item.recommendation}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
