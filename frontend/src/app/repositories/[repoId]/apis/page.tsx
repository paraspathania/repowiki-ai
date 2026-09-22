"use client";

import React, { useState, useEffect } from "react";
import { EndpointCard } from "@/components/apis/EndpointCard";
import { Search, Filter, Loader2, ServerOff, Server, Lock } from "lucide-react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export interface Endpoint {
  id: string;
  method: string;
  path: string;
  handler_name: string;
  file_path: string;
  line_number?: number;
}

export default function APIsPage({ params }: { params: { repoId: string } }) {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("ALL");
  const [errorStatus, setErrorStatus] = useState<number | null>(null);

  useEffect(() => {
    fetchApis();
  }, [params.repoId]);

  const fetchApis = async () => {
    setLoading(true);
    setErrorStatus(null);
    try {
      const res = await fetch(`${API_BASE}/repositories/${params.repoId}/apis`);
      if (res.status === 404 || res.status === 403) {
        setErrorStatus(res.status);
        setEndpoints([]);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setEndpoints(data.endpoints || []);
      }
    } catch (err) {
      console.error("Failed to fetch APIs:", err);
      setErrorStatus(500);
    } finally {
      setLoading(false);
    }
  };

  const filteredEndpoints = endpoints.filter((ep) => {
    const matchesSearch = ep.path.toLowerCase().includes(search.toLowerCase()) || 
                         ep.handler_name.toLowerCase().includes(search.toLowerCase());
    const matchesMethod = methodFilter === "ALL" || ep.method.toUpperCase() === methodFilter;
    return matchesSearch && matchesMethod;
  });

  const methods = ["ALL", "GET", "POST", "PUT", "DELETE", "PATCH"];

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-background min-h-[400px]">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (errorStatus === 404 || errorStatus === 403) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-background space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-white">Repository Inaccessible or Not Found</h2>
        <p className="text-slate-400 text-sm max-w-md">
          You do not have access to view detected APIs for this repository.
        </p>
        <Link
          href="/"
          className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-slate-300 rounded-xl border border-white/[0.08] transition"
        >
          Return to Repositories
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-8 space-y-6 overflow-y-auto custom-scrollbar relative bg-background">
      <div className="absolute inset-0 radial-glow-light pointer-events-none z-0" />

      {/* Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.06] pb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
            <Server className="w-5.5 h-5.5 text-indigo-400" />
            <span>API Explorer</span>
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Browse endpoints discovered by AST source code analysis across routes and controllers.
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-1.5 bg-white/[0.02] border border-white/[0.06] p-1 rounded-xl">
          {methods.map((method) => (
            <button
              key={method}
              onClick={() => setMethodFilter(method)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                methodFilter === method
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              {method}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative z-10">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by path or handler name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition"
          />
        </div>
      </div>

      {/* Results List */}
      <div className="relative z-10 space-y-3">
        {filteredEndpoints.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center glass-panel rounded-2xl border border-white/[0.06] space-y-3">
            <ServerOff className="w-8 h-8 text-slate-500" />
            <p className="text-sm font-semibold text-slate-300">No Endpoints Discovered</p>
            <p className="text-xs text-slate-500 max-w-sm">
              {endpoints.length === 0
                ? "No REST routes were detected in the analyzed source code files."
                : "No endpoints matched your active filter criteria."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredEndpoints.map((ep) => (
              <EndpointCard key={ep.id} endpoint={ep} repoId={params.repoId} />
            ))}
          </div>

        )}
      </div>
    </div>
  );
}
