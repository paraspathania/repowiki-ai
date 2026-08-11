"use client";

import { useState } from "react";
import { DatabaseTable } from "@/types";
import { Database, Key, Table as TableIcon, Layers, Search, ShieldCheck } from "lucide-react";

interface DatabaseErdViewerProps {
  tables: DatabaseTable[];
}

export function DatabaseErdViewer({ tables }: DatabaseErdViewerProps) {
  const [search, setSearch] = useState<string>("");

  const filteredTables = tables.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#090b12] p-4 rounded-2xl border border-white/[0.08]">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            <span>Database Architecture & Entity Relationship Diagram</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Auto-detected relational schema tables, primary keys, foreign references, and indices.
          </p>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search table or column..."
            className="pl-9 pr-3 py-1.5 bg-white/[0.04] border border-white/[0.1] rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Grid of Database Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTables.map((table) => (
          <div
            key={table.name}
            className="bg-[#090b12] rounded-2xl border border-white/[0.08] p-5 space-y-4 shadow-lg hover:border-white/[0.15] transition duration-200"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <TableIcon className="w-4 h-4 text-indigo-400" />
                <span className="font-mono text-sm font-bold text-white">{table.name}</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-300 font-mono">
                {table.columns.length} columns
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {table.description}
            </p>

            {/* Column Schema Table */}
            <div className="space-y-1 bg-[#05070c] p-3 rounded-xl border border-white/[0.06]">
              <div className="grid grid-cols-12 text-[10px] font-mono text-slate-500 uppercase pb-2 border-b border-white/[0.06]">
                <span className="col-span-5">Column</span>
                <span className="col-span-4">Type</span>
                <span className="col-span-3 text-right">Key Attributes</span>
              </div>

              {table.columns.map((col) => (
                <div key={col.name} className="grid grid-cols-12 items-center py-1.5 text-xs border-b border-white/[0.02]">
                  <span className="col-span-5 font-mono font-semibold text-slate-200 flex items-center gap-1.5 truncate">
                    {col.isPrimary && <Key className="w-3 h-3 text-amber-400 flex-shrink-0" />}
                    {col.isForeign && <Layers className="w-3 h-3 text-purple-400 flex-shrink-0" />}
                    {col.name}
                  </span>
                  <span className="col-span-4 font-mono text-[11px] text-cyan-300">
                    {col.type}
                  </span>
                  <span className="col-span-3 text-right text-[10px] font-mono text-slate-400 truncate">
                    {col.isPrimary ? "PRIMARY KEY" : col.isForeign ? `FK (${col.references})` : col.isNullable ? "NULL" : "NOT NULL"}
                  </span>
                </div>
              ))}
            </div>

            {/* Indexes */}
            {table.indexes.length > 0 && (
              <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold text-slate-300">Indexes:</span>
                <span className="font-mono text-slate-400 truncate">{table.indexes.join(", ")}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
