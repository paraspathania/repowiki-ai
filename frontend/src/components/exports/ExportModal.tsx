"use client";

import { useState } from "react";
import { Download, FileText, Code, FileSpreadsheet, Check, Sparkles } from "lucide-react";

interface ExportModalProps {
  repoName: string;
}

export function ExportModal({ repoName }: ExportModalProps) {
  const [exportingFormat, setExportingFormat] = useState<string | null>(null);
  const [downloadCompleted, setDownloadCompleted] = useState<string | null>(null);

  const handleTriggerExport = (format: string, extension: string) => {
    setExportingFormat(format);
    setTimeout(() => {
      setExportingFormat(null);
      setDownloadCompleted(format);

      // Trigger synthetic download file
      const content = `# RepoWiki AI Documentation Package\n\nRepository: ${repoName}\nGenerated: ${new Date().toISOString()}\n\nFull technical wiki, dependency map, and API specifications included.`;
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${repoName}-wiki.${extension}`;
      a.click();
      URL.revokeObjectURL(url);

      setTimeout(() => setDownloadCompleted(null), 3000);
    }, 1200);
  };

  return (
    <div className="bg-[#090b12] p-6 rounded-2xl border border-white/[0.08] space-y-6 max-w-2xl mx-auto">
      <div>
        <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <Download className="w-4 h-4 text-indigo-400" />
          <span>Export Documentation Package</span>
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Package the auto-generated technical wiki, architecture diagrams, and API routes into publication-ready documents.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* PDF EXPORT */}
        <div className="p-5 rounded-2xl bg-[#05070c] border border-white/[0.06] space-y-3 hover:border-indigo-500/40 transition">
          <div className="flex items-center justify-between">
            <FileText className="w-6 h-6 text-rose-400" />
            <span className="text-[10px] font-mono font-bold text-slate-500">PDF FORMAT</span>
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Full PDF eBook Documentation</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Styled publication layout with cover page & TOC.</p>
          </div>
          <button
            onClick={() => handleTriggerExport("pdf", "pdf")}
            disabled={exportingFormat === "pdf"}
            className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs shadow-lg transition flex items-center justify-center gap-2"
          >
            {downloadCompleted === "pdf" ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Downloaded PDF</span>
              </>
            ) : exportingFormat === "pdf" ? (
              <span>Generating PDF...</span>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </>
            )}
          </button>
        </div>

        {/* MARKDOWN EXPORT */}
        <div className="p-5 rounded-2xl bg-[#05070c] border border-white/[0.06] space-y-3 hover:border-indigo-500/40 transition">
          <div className="flex items-center justify-between">
            <Code className="w-6 h-6 text-indigo-400" />
            <span className="text-[10px] font-mono font-bold text-slate-500">MARKDOWN</span>
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Markdown Bundle (.md)</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Ready for GitBook, Notion, or GitHub repository.</p>
          </div>
          <button
            onClick={() => handleTriggerExport("markdown", "md")}
            disabled={exportingFormat === "markdown"}
            className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs shadow-lg transition flex items-center justify-center gap-2"
          >
            {downloadCompleted === "markdown" ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Downloaded Markdown</span>
              </>
            ) : exportingFormat === "markdown" ? (
              <span>Generating Markdown...</span>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Download .md</span>
              </>
            )}
          </button>
        </div>

        {/* MERMAID DIAGRAMS EXPORT */}
        <div className="p-5 rounded-2xl bg-[#05070c] border border-white/[0.06] space-y-3 hover:border-indigo-500/40 transition">
          <div className="flex items-center justify-between">
            <Sparkles className="w-6 h-6 text-emerald-400" />
            <span className="text-[10px] font-mono font-bold text-slate-500">MERMAID .MMD</span>
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Mermaid Architecture Diagrams</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Raw Mermaid diagram definitions for Lucidchart / Draw.io.</p>
          </div>
          <button
            onClick={() => handleTriggerExport("mermaid", "mmd")}
            disabled={exportingFormat === "mermaid"}
            className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs shadow-lg transition flex items-center justify-center gap-2"
          >
            {downloadCompleted === "mermaid" ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Downloaded Diagrams</span>
              </>
            ) : exportingFormat === "mermaid" ? (
              <span>Exporting Diagrams...</span>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Export .mmd</span>
              </>
            )}
          </button>
        </div>

        {/* DOCX EXPORT */}
        <div className="p-5 rounded-2xl bg-[#05070c] border border-white/[0.06] space-y-3 hover:border-indigo-500/40 transition">
          <div className="flex items-center justify-between">
            <FileSpreadsheet className="w-6 h-6 text-blue-400" />
            <span className="text-[10px] font-mono font-bold text-slate-500">MS WORD (.DOCX)</span>
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Microsoft Word Document</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Editable document for enterprise internal wikis.</p>
          </div>
          <button
            onClick={() => handleTriggerExport("docx", "docx")}
            disabled={exportingFormat === "docx"}
            className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs shadow-lg transition flex items-center justify-center gap-2"
          >
            {downloadCompleted === "docx" ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Downloaded DOCX</span>
              </>
            ) : exportingFormat === "docx" ? (
              <span>Generating DOCX...</span>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Download .docx</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
