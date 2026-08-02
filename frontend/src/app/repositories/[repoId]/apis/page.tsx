"use client";

import { Server, Shield } from "lucide-react";

const MOCK_APIS = [
  { method: "POST", route: "/api/v1/auth/signup", handler: "signup", file: "app/modules/auth/router.py", line: 16 },
  { method: "POST", route: "/api/v1/auth/login", handler: "login", file: "app/modules/auth/router.py", line: 31 },
  { method: "POST", route: "/api/v1/repositories/validate", handler: "validate_repository", file: "app/modules/repositories/router.py", line: 20 },
  { method: "POST", route: "/api/v1/repository/analyze", handler: "analyze_repository_legacy", file: "app/modules/repositories/router.py", line: 78 },
];

export default function APIsPage({ params }: { params: { repoId: string } }) {
  return (
    <div className="w-full h-full p-8 space-y-6 overflow-y-auto">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <Server className="w-6 h-6 text-purple-400" />
        <div>
          <h2 className="text-xl font-bold text-white">API Explorer</h2>
          <p className="text-gray-400 text-xs mt-0.5">Statically detected API endpoints in scanned repository code</p>
        </div>
      </div>

      <div className="space-y-3">
        {MOCK_APIS.map((api, idx) => (
          <div key={idx} className="bg-panel border border-border p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className={`px-2.5 py-1 rounded text-xs font-bold font-mono ${
                api.method === "POST" ? "bg-blue-950 text-blue-400 border border-blue-800" : "bg-emerald-950 text-emerald-400 border border-emerald-800"
              }`}>
                {api.method}
              </span>
              <div>
                <p className="font-mono text-sm text-white font-semibold">{api.route}</p>
                <p className="text-xs text-gray-400 mt-0.5">Handler: {api.handler}</p>
              </div>
            </div>
            <div className="text-right text-xs font-mono text-gray-400">
              <p>{api.file}:{api.line}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
