"use client";

import { useState } from "react";
import { ApiEndpoint } from "@/types";
import { Copy, Check, Lock, Server } from "lucide-react";

interface ApiEndpointExplorerProps {
  endpoints: ApiEndpoint[];
}

export function ApiEndpointExplorer({ endpoints }: ApiEndpointExplorerProps) {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint>(endpoints[0]);
  const [activeTab, setActiveTab] = useState<"request" | "response" | "headers">("request");
  const [copied, setCopied] = useState<boolean>(false);

  const getMethodBadge = (method: ApiEndpoint["method"]) => {
    switch (method) {
      case "GET": return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      case "POST": return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "PUT": return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      case "DELETE": return "bg-rose-500/20 text-rose-300 border-rose-500/30";
      case "PATCH": return "bg-purple-500/20 text-purple-300 border-purple-500/30";
    }
  };

  const generateCurl = (ep: ApiEndpoint) => {
    return `curl -X ${ep.method} "http://localhost:8000${ep.path}" \\
  -H "Content-Type: application/json" \\
  ${ep.authRequired ? '-H "Authorization: Bearer <YOUR_TOKEN>" \\' : ''}
  -d '${ep.sampleRequest || "{}"}'`;
  };

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(generateCurl(selectedEndpoint));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
      {/* Left List of Endpoints */}
      <div className="lg:col-span-5 bg-[#090b12] border border-white/[0.08] rounded-2xl p-4 space-y-3 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <Server className="w-4 h-4 text-indigo-400" />
            <span>Detected API Interfaces</span>
          </h3>
          <span className="px-2 py-0.5 rounded text-[10px] bg-white/[0.06] text-slate-400 font-mono">
            {endpoints.length} Routes
          </span>
        </div>

        <div className="space-y-2 overflow-y-auto pr-1 flex-1 no-scrollbar">
          {endpoints.map((ep) => {
            const isSelected = selectedEndpoint.id === ep.id;
            return (
              <button
                key={ep.id}
                onClick={() => setSelectedEndpoint(ep)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all duration-150 space-y-2 ${
                  isSelected
                    ? "bg-indigo-950/40 border-indigo-500/60 shadow-lg shadow-indigo-950/40"
                    : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.1]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded border ${getMethodBadge(ep.method)}`}>
                      {ep.method}
                    </span>
                    <span className="text-xs font-mono font-semibold text-white truncate max-w-[180px]">
                      {ep.path}
                    </span>
                  </div>
                  {ep.authRequired && (
                    <div title="Authentication Required">
                      <Lock className="w-3 h-3 text-amber-400" />
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {ep.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Endpoint Detail View */}
      <div className="lg:col-span-7 bg-[#090b12] border border-white/[0.08] rounded-2xl p-6 flex flex-col space-y-5 overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 text-xs font-mono font-bold rounded border ${getMethodBadge(selectedEndpoint.method)}`}>
                {selectedEndpoint.method}
              </span>
              <span className="text-sm font-mono font-bold text-white">
                {selectedEndpoint.path}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {selectedEndpoint.description}
            </p>
          </div>

          <button
            onClick={handleCopyCurl}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/30 transition text-xs font-semibold"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "cURL Copied!" : "Copy cURL"}</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-white/[0.06]">
          <button
            onClick={() => setActiveTab("request")}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition ${
              activeTab === "request"
                ? "text-indigo-400 border-indigo-500"
                : "text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            Sample Request
          </button>
          <button
            onClick={() => setActiveTab("response")}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition ${
              activeTab === "response"
                ? "text-indigo-400 border-indigo-500"
                : "text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            Sample Response
          </button>
          <button
            onClick={() => setActiveTab("headers")}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition ${
              activeTab === "headers"
                ? "text-indigo-400 border-indigo-500"
                : "text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            Headers & Auth
          </button>
        </div>

        {/* Code Content Container */}
        <div className="flex-1 bg-[#05070c] rounded-xl border border-white/[0.08] p-4 overflow-x-auto">
          {activeTab === "request" && (
            <pre className="text-xs font-mono text-emerald-300 leading-relaxed">
              {selectedEndpoint.sampleRequest || "// No request payload required"}
            </pre>
          )}

          {activeTab === "response" && (
            <pre className="text-xs font-mono text-cyan-300 leading-relaxed">
              {selectedEndpoint.sampleResponse || "// Returns 200 OK"}
            </pre>
          )}

          {activeTab === "headers" && (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-white/[0.06]">
                <span className="font-mono text-slate-400">Content-Type</span>
                <span className="font-mono text-indigo-300">application/json</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-white/[0.06]">
                <span className="font-mono text-slate-400">Authorization</span>
                <span className="font-mono text-amber-300">
                  {selectedEndpoint.authRequired ? "Bearer <JWT_TOKEN>" : "None (Public)"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
