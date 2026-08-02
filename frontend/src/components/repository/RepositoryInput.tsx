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
      <div className="relative flex items-center">
        <div className="absolute left-4 text-gray-400">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://github.com/owner/repository"
          className="w-full pl-12 pr-36 py-4 bg-panel border border-border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent text-base transition"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="absolute right-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium flex items-center gap-2 transition disabled:opacity-50"
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
        <div className="flex items-center gap-2 p-3 bg-red-950/40 border border-red-800/50 rounded-lg text-red-300 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </form>
  );
}
