"use client";

import { useState } from "react";
import { DependencyItem } from "@/types";
import { Package, ShieldAlert, AlertTriangle, CheckCircle, Search, RefreshCw } from "lucide-react";

interface DependencyAnalyzerProps {
  dependencies: DependencyItem[];
}

export function DependencyAnalyzer({ dependencies }: DependencyAnalyzerProps) {
  const [filter, setFilter] = useState<"all" | "vulnerable" | "outdated" | "unused">("all");
  const [search, setSearch] = useState<string>("");

  const filteredDeps = dependencies.filter((dep) => {
    const matchesSearch = dep.name.toLowerCase().includes(search.toLowerCase());
    if (filter === "all") return matchesSearch;
    return matchesSearch && dep.status === filter;
  });

  const getStatusBadge = (status: DependencyItem["status"]) => {
    switch (status) {
      case "up-to-date":
        return { label: "Up to Date", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30", icon: CheckCircle };
      case "outdated":
        return { label: "Outdated", color: "bg-amber-500/20 text-amber-300 border-amber-500/30", icon: RefreshCw };
      case "vulnerable":
        return { label: "Vulnerability Flag", color: "bg-rose-500/20 text-rose-300 border-rose-500/30", icon: ShieldAlert };
      case "unused":
        return { label: "Unused Package", color: "bg-purple-500/20 text-purple-300 border-purple-500/30", icon: AlertTriangle };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#090b12] p-5 rounded-2xl border border-white/[0.08]">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <Package className="w-4 h-4 text-indigo-400" />
            <span>Dependency Analysis & Vulnerability Auditor</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit manifest files (package.json, pom.xml, requirements.txt, Cargo.toml) for security advisories.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          {(["all", "vulnerable", "outdated", "unused"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
                filter === f
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.08]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Dependency List Table */}
      <div className="bg-[#090b12] rounded-2xl border border-white/[0.08] p-5 space-y-4">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search package name..."
            className="w-full pl-9 pr-3 py-2 bg-white/[0.04] border border-white/[0.1] rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="space-y-2">
          {filteredDeps.map((dep) => {
            const badge = getStatusBadge(dep.status);
            const Icon = badge.icon;
            return (
              <div
                key={dep.name}
                className="p-4 rounded-xl bg-[#05070c] border border-white/[0.06] flex items-center justify-between hover:border-white/[0.12] transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-white">{dep.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-white/[0.06] text-slate-400 rounded">
                      v{dep.version}
                    </span>
                    {dep.latestVersion && (
                      <span className="text-[10px] font-mono text-slate-500">
                        Latest: v{dep.latestVersion}
                      </span>
                    )}
                  </div>
                  {dep.vulnerabilityDescription && (
                    <p className="text-xs text-rose-300 font-medium">
                      ⚠️ {dep.vulnerabilityDescription} ({dep.vulnerabilitySeverity} Severity)
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg border flex items-center gap-1.5 ${badge.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                    <span>{badge.label}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
