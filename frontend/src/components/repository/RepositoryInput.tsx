"use client";

import { useState } from "react";
import { Search, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { RepositoryPreview } from "@/types";

interface RepositoryInputProps {
  onValidated: (preview: RepositoryPreview, url: string) => void;
}

export function RepositoryInput({ onValidated }: RepositoryInputProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!url.trim()) {
      setError("Please enter a GitHub repository URL");
      return;
    }

    if (!url.includes("github.com")) {
      setError("Only github.com repository URLs are supported in V1");
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post<RepositoryPreview>("/repositories/validate", {
        repo_url: url.trim(),
      });
      onValidated(res.data, url.trim());
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || "Failed to validate repository. Ensure it exists and is accessible.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleValidate} className="w-full max-w-2xl mx-auto space-y-4">
      <div className="relative flex items-center bg-panel/40 border border-white/[0.08] focus-within:border-indigo-500/40 rounded-2xl p-1.5 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all duration-300 shadow-2xl backdrop-blur-md">
        <div className="absolute left-5 text-slate-400">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://github.com/owner/repository"
          className="w-full pl-14 pr-36 py-4 bg-transparent border-none text-white placeholder-slate-500 focus:outline-none focus:ring-0 text-base"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="absolute right-2 px-6 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-semibold flex items-center gap-2 transition duration-300 shadow-lg shadow-indigo-500/20 active:scale-95 disabled:opacity-50 disabled:pointer-events-none shimmer-btn"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Checking...</span>
            </>
          ) : (
            <>
              <span>Analyze</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-950/20 border border-red-500/20 rounded-xl text-red-300 text-sm backdrop-blur-md shadow-lg shadow-red-950/10 animate-fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}
    </form>
  );
}
