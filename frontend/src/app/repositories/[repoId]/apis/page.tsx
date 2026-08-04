"use client";

import React, { useState, useEffect } from "react";
import { EndpointCard } from "@/components/apis/EndpointCard";
import { Search, Filter, Loader2, ServerOff, Server } from "lucide-react";

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

  useEffect(() => {
    fetchApis();
  }, [params.repoId]);

  const fetchApis = async () => {
    try {
      const res = await fetch(`${API_BASE}/repositories/${params.repoId}/apis`);
      if (res.ok) {
        const data = await res.json();
        setEndpoints(data.endpoints || []);
      }
    } catch (err) {
      console.error(err);
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

  return (
    <div className="w-full h-full p-8 space-y-6 overflow-y-auto custom-scrollbar relative bg-background">
      <div className="absolute inset-0 radial-glow-light pointer-events-none z-0" />

      <div className="relative z-10 space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-3 border-b border-white/[0.06] pb-5">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Server className="w-5.5 h-5.5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">API Explorer</h2>
            <p className="text-slate-400 text-xs mt-0.5">Automatically detected API routes and their handlers.</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[250px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search endpoints or handlers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/30 focus:bg-white/[0.05] transition-all"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <div className="flex p-0.5 bg-white/[0.03] border border-white/[0.08] rounded-xl">
              {methods.map((m) => (
                <button
                  key={m}
                  onClick={() => setMethodFilter(m)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    methodFilter === m 
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* List */}
        <div className="space-y-4">
          {filteredEndpoints.length > 0 ? (
            filteredEndpoints.map((ep) => (
              <EndpointCard key={ep.id} endpoint={ep} repoId={params.repoId} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center p-16 text-center border border-dashed border-white/[0.08] rounded-2xl bg-white/[0.01]">
              <ServerOff className="w-12 h-12 text-slate-600 mb-4" />
              <h3 className="text-white font-semibold text-lg mb-1">No APIs detected</h3>
              <p className="text-slate-400 text-sm max-w-sm">Try adjusting your search filters or make sure the repository contains recognized routing files.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
