"use client";

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { ZoomIn, ZoomOut, RotateCcw, Download, Copy, Check } from "lucide-react";

interface MermaidViewerProps {
  chart: string;
  id?: string;
  showControls?: boolean;
}

export function MermaidViewer({ chart, id = "mermaid-diagram", showControls = true }: MermaidViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>("");
  const [zoom, setZoom] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: "dark",
      securityLevel: "loose",
      fontFamily: "var(--font-mono, monospace), monospace",
      themeVariables: {
        darkMode: true,
        background: "#141414",
        primaryColor: "#1D1D1D",
        primaryTextColor: "#F5F5F5",
        primaryBorderColor: "#303030",
        lineColor: "#737373",
        secondaryColor: "#1D1D1D",
        tertiaryColor: "#191919",
        actorBkg: "#1D1D1D",
        actorBorder: "#303030",
        actorTextColor: "#F5F5F5",
        signalColor: "#A3A3A3",
        signalTextColor: "#F5F5F5",
      },
    });

    let isMounted = true;

    async function renderDiagram() {
      try {
        setError(null);
        const uniqueId = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
        const { svg } = await mermaid.render(uniqueId, chart.trim());
        if (isMounted) {
          setSvgContent(svg);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || "Failed to render Mermaid diagram.");
        }
      }
    }

    renderDiagram();

    return () => {
      isMounted = false;
    };
  }, [chart]);

  const handleCopyMermaid = () => {
    navigator.clipboard.writeText(chart);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSVG = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `architecture-diagram.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative w-full h-full bg-[#090909] rounded-lg border border-[#303030] overflow-hidden flex flex-col font-mono">
      {/* Controls Bar */}
      {showControls && (
        <div className="flex items-center justify-between px-3.5 py-2 bg-[#141414] border-b border-[#303030] z-10 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#A3A3A3]" />
            <span className="text-xs font-medium text-[#A3A3A3]">Mermaid AST Source</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setZoom((z) => Math.min(z + 0.2, 2.5))}
              className="p-1 rounded text-[#737373] hover:text-[#F5F5F5] hover:bg-[#1D1D1D] transition"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(z - 0.2, 0.4))}
              className="p-1 rounded text-[#737373] hover:text-[#F5F5F5] hover:bg-[#1D1D1D] transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-1 rounded text-[#737373] hover:text-[#F5F5F5] hover:bg-[#1D1D1D] transition"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-3.5 bg-[#303030] mx-1" />
            <button
              onClick={handleCopyMermaid}
              className="flex items-center gap-1 px-2.5 py-1 text-xs rounded bg-[#1D1D1D] hover:bg-[#262626] text-[#A3A3A3] hover:text-[#F5F5F5] border border-[#303030] transition"
            >
              {copied ? <Check className="w-3 h-3 text-[#F5F5F5]" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? "Copied" : "Copy Code"}</span>
            </button>
            <button
              onClick={handleDownloadSVG}
              className="flex items-center gap-1 px-2.5 py-1 text-xs rounded bg-[#F5F5F5] hover:bg-white text-[#111111] transition font-medium"
            >
              <Download className="w-3 h-3" />
              <span>Export SVG</span>
            </button>
          </div>
        </div>
      )}

      {/* Canvas Viewport */}
      <div className="flex-1 overflow-auto p-6 flex items-center justify-center relative no-scrollbar">
        {error ? (
          <div className="p-4 rounded border border-[#303030] bg-[#141414] text-[#A3A3A3] text-xs font-mono max-w-lg">
            Failed to parse Mermaid diagram code syntax:
            <pre className="mt-2 text-[11px] whitespace-pre-wrap text-[#737373]">{error}</pre>
          </div>
        ) : (
          <div
            ref={containerRef}
            style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}
            className="transition-transform duration-150 ease-out max-w-full"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        )}
      </div>
    </div>
  );
}
