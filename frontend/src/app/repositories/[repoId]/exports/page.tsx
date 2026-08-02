"use client";

import { Download, FileText, File } from "lucide-react";

export default function ExportsPage({ params }: { params: { repoId: string } }) {
  return (
    <div className="w-full h-full p-8 space-y-6 overflow-y-auto">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <Download className="w-6 h-6 text-amber-400" />
        <div>
          <h2 className="text-xl font-bold text-white">Documentation Export</h2>
          <p className="text-gray-400 text-xs mt-0.5">Export generated technical Wiki and architectural diagrams</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-panel border border-border p-6 rounded-xl space-y-4">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-accent-blue" />
            <div>
              <h3 className="font-bold text-white">Markdown Export</h3>
              <p className="text-gray-400 text-xs">Standard GitHub-flavored markdown bundle</p>
            </div>
          </div>
          <button className="w-full py-2.5 bg-surface hover:bg-border/60 border border-border text-white text-xs font-semibold rounded-lg transition">
            Export Markdown (.md)
          </button>
        </div>

        <div className="bg-panel border border-border p-6 rounded-xl space-y-4">
          <div className="flex items-center gap-3">
            <File className="w-6 h-6 text-red-400" />
            <div>
              <h3 className="font-bold text-white">PDF Documentation</h3>
              <p className="text-gray-400 text-xs">Formatted PDF document with embedded diagrams</p>
            </div>
          </div>
          <button className="w-full py-2.5 bg-surface hover:bg-border/60 border border-border text-white text-xs font-semibold rounded-lg transition">
            Export PDF (.pdf)
          </button>
        </div>
      </div>
    </div>
  );
}
