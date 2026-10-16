"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ArchitectureMode,
  ArchitectureNode,
  ArchitectureEdge,
  ComponentLayer,
} from "./types";
import { buildGraphDataForMode } from "./graphDataBuilder";
import { InteractiveGraphCanvas } from "./InteractiveGraphCanvas";
import { ComponentInspector } from "./ComponentInspector";
import { MermaidViewer } from "./MermaidViewer";
import {
  Layers,
  Network,
  GitBranch,
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Copy,
  Download,
  Code2,
  SlidersHorizontal,
  Info,
  Check,
  PanelRightClose,
  PanelRightOpen,
  Filter,
} from "lucide-react";

interface ArchitectureStudioProps {
  repoId: string;
  summary?: any;
  apis?: any[];
  diagrams?: Record<string, string>;
}

export function ArchitectureStudio({
  repoId,
  summary,
  apis = [],
  diagrams = {},
}: ArchitectureStudioProps) {
  const [activeMode, setActiveMode] = useState<ArchitectureMode>("system");
  const [selectedNode, setSelectedNode] = useState<ArchitectureNode | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLayer, setSelectedLayer] = useState<ComponentLayer | "all">("all");
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  const [isMermaidViewOpen, setIsMermaidViewOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Zoom and Pan State
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 40, y: 30 });

  // Compute graph data based on active mode and repository context
  const graphData = useMemo(() => {
    return buildGraphDataForMode(activeMode, {
      repoId,
      summary,
      apis,
      diagrams,
    });
  }, [activeMode, repoId, summary, apis, diagrams]);

  // Fit View Callback to center and scale nodes
  const handleFitView = useCallback(() => {
    if (!graphData.nodes.length) return;

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    graphData.nodes.forEach((n) => {
      minX = Math.min(minX, n.x);
      maxX = Math.max(maxX, n.x + (n.width || 250));
      minY = Math.min(minY, n.y);
      maxY = Math.max(maxY, n.y + (n.height || 110));
    });

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;

    // Viewport dimensions (estimate with responsive deduction)
    const viewportWidth = window.innerWidth > 1200 ? 900 : window.innerWidth - 60;
    const viewportHeight = 650;

    const scaleX = viewportWidth / (contentWidth + 120);
    const scaleY = viewportHeight / (contentHeight + 120);
    const calculatedZoom = Math.min(Math.max(Math.min(scaleX, scaleY), 0.45), 1.25);

    setZoom(calculatedZoom);
    setPan({
      x: Math.round((viewportWidth - contentWidth * calculatedZoom) / 2 - minX * calculatedZoom),
      y: Math.round((viewportHeight - contentHeight * calculatedZoom) / 2 - minY * calculatedZoom),
    });
  }, [graphData.nodes]);

  // Reset zoom & pan
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 40, y: 30 });
    setSelectedNode(null);
  };

  // Switch mode with auto-fit
  const handleSwitchMode = (mode: ArchitectureMode) => {
    setActiveMode(mode);
    setSelectedNode(null);
    setSearchQuery("");
    setSelectedLayer("all");
    setTimeout(handleFitView, 60);
  };

  // Copy active Mermaid code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(graphData.mermaidChart);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Export SVG download
  const handleExportSVG = () => {
    const svgElement = document.querySelector("svg");
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${repoId}-${activeMode}-architecture.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Automatically select first node on initial mount
  useEffect(() => {
    if (graphData.nodes.length > 0 && !selectedNode) {
      setSelectedNode(graphData.nodes[0]);
    }
  }, [graphData.nodes, selectedNode]);

  return (
    <div className="w-full h-full flex flex-col bg-[#090909] overflow-hidden select-none font-mono">
      {/* 1. Architecture Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-5 py-3 bg-[#141414] border-b border-[#303030] flex-shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-[#F5F5F5]" />
            <h2 className="text-xs font-semibold text-[#F5F5F5] uppercase tracking-wider">
              Architecture Intelligence Studio
            </h2>
          </div>
          <p className="text-[11px] text-[#737373] mt-0.5 font-sans">
            Interactive evidence-grounded system topology, component dependency graphs, and request flows.
          </p>
        </div>

        {/* 3 Functional Modes Switcher */}
        <div className="flex items-center p-1 rounded-lg bg-[#1D1D1D] border border-[#303030] self-start md:self-auto">
          <button
            onClick={() => handleSwitchMode("system")}
            className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition ${
              activeMode === "system"
                ? "bg-[#F5F5F5] text-[#111111]"
                : "text-[#A3A3A3] hover:text-[#F5F5F5]"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>System Layers</span>
          </button>
          <button
            onClick={() => handleSwitchMode("component")}
            className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition ${
              activeMode === "component"
                ? "bg-[#F5F5F5] text-[#111111]"
                : "text-[#A3A3A3] hover:text-[#F5F5F5]"
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Component Topology</span>
          </button>
          <button
            onClick={() => handleSwitchMode("sequence")}
            className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition ${
              activeMode === "sequence"
                ? "bg-[#F5F5F5] text-[#111111]"
                : "text-[#A3A3A3] hover:text-[#F5F5F5]"
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Sequence Flow</span>
          </button>
        </div>
      </div>

      {/* 2. Compact Graph Toolbar Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-[#141414] border-b border-[#303030] flex-shrink-0 text-xs">
        {/* Left Toolbar: Node Search & Quick Layer Filters */}
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <div className="relative flex items-center">
            <Search className="w-3 h-3 absolute left-2.5 text-[#737373] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter nodes..."
              className="pl-7 pr-6 py-1 bg-[#1D1D1D] border border-[#303030] focus:border-[#737373] rounded text-[11px] text-[#F5F5F5] placeholder:text-[#737373] focus:outline-none focus:ring-1 focus:ring-[#737373]/30 w-36 sm:w-44 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 text-[10px] text-[#737373] hover:text-[#F5F5F5]"
              >
                ✕
              </button>
            )}
          </div>

          {/* Layer Filter Pills */}
          <div className="hidden sm:flex items-center gap-1 pl-1">
            {(["all", "frontend", "backend", "data", "infrastructure"] as const).map((layer) => (
              <button
                key={layer}
                onClick={() => setSelectedLayer(layer)}
                className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono transition ${
                  selectedLayer === layer
                    ? "bg-[#F5F5F5] text-[#111111] font-semibold"
                    : "bg-[#1D1D1D] text-[#737373] hover:text-[#F5F5F5] border border-[#303030]"
                }`}
              >
                {layer}
              </button>
            ))}
          </div>
        </div>

        {/* Right Toolbar: Viewport & Export Controls */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.15, 2.5))}
            className="p-1.5 rounded bg-[#1D1D1D] hover:bg-[#262626] border border-[#303030] text-[#A3A3A3] hover:text-[#F5F5F5] transition"
            title="Zoom In (+)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(z - 0.15, 0.3))}
            className="p-1.5 rounded bg-[#1D1D1D] hover:bg-[#262626] border border-[#303030] text-[#A3A3A3] hover:text-[#F5F5F5] transition"
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleFitView}
            className="p-1.5 rounded bg-[#1D1D1D] hover:bg-[#262626] border border-[#303030] text-[#A3A3A3] hover:text-[#F5F5F5] transition"
            title="Fit to View"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 rounded bg-[#1D1D1D] hover:bg-[#262626] border border-[#303030] text-[#A3A3A3] hover:text-[#F5F5F5] transition"
            title="Reset View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-4 bg-[#303030] mx-1" />

          {/* Copy Mermaid Code */}
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1 px-2.5 py-1 text-xs rounded bg-[#1D1D1D] hover:bg-[#262626] text-[#A3A3A3] hover:text-[#F5F5F5] border border-[#303030] transition"
            title="Copy Mermaid Code"
          >
            {copied ? <Check className="w-3 h-3 text-[#F5F5F5]" /> : <Copy className="w-3 h-3" />}
            <span className="hidden sm:inline">{copied ? "Copied" : "Copy Code"}</span>
          </button>

          {/* Export SVG */}
          <button
            onClick={handleExportSVG}
            className="flex items-center gap-1 px-2.5 py-1 text-xs rounded bg-[#1D1D1D] hover:bg-[#262626] text-[#A3A3A3] hover:text-[#F5F5F5] border border-[#303030] transition"
            title="Export SVG File"
          >
            <Download className="w-3 h-3" />
            <span className="hidden sm:inline">Export SVG</span>
          </button>

          {/* Toggle Mermaid Raw View */}
          <button
            onClick={() => setIsMermaidViewOpen(!isMermaidViewOpen)}
            className={`p-1.5 rounded border border-[#303030] transition ${
              isMermaidViewOpen
                ? "bg-[#F5F5F5] text-[#111111]"
                : "bg-[#1D1D1D] text-[#A3A3A3] hover:text-[#F5F5F5]"
            }`}
            title="Toggle Mermaid Source View"
          >
            <Code2 className="w-3.5 h-3.5" />
          </button>

          {/* Toggle Inspector Panel */}
          <button
            onClick={() => setIsInspectorOpen(!isInspectorOpen)}
            className={`p-1.5 rounded border border-[#303030] transition ${
              isInspectorOpen
                ? "bg-[#F5F5F5] text-[#111111]"
                : "bg-[#1D1D1D] text-[#A3A3A3] hover:text-[#F5F5F5]"
            }`}
            title="Toggle Component Inspector"
          >
            {isInspectorOpen ? (
              <PanelRightClose className="w-3.5 h-3.5" />
            ) : (
              <PanelRightOpen className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* 3. Main Studio Workspace Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Interactive Graph Canvas */}
        <div className="flex-1 h-full overflow-hidden relative">
          <InteractiveGraphCanvas
            nodes={graphData.nodes}
            edges={graphData.edges}
            selectedNode={selectedNode}
            onSelectNode={(node) => {
              setSelectedNode(node);
              if (node && !isInspectorOpen) setIsInspectorOpen(true);
            }}
            searchQuery={searchQuery}
            selectedLayer={selectedLayer}
            zoom={zoom}
            setZoom={setZoom}
            pan={pan}
            setPan={setPan}
          />

          {/* Overlay: Raw Mermaid Code Drawer (if toggled) */}
          {isMermaidViewOpen && (
            <div className="absolute inset-0 z-30 bg-[#090909]/95 p-6 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-[#303030] mb-4">
                <span className="text-xs font-semibold text-[#F5F5F5] flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5" />
                  Mermaid Source AST
                </span>
                <button
                  onClick={() => setIsMermaidViewOpen(false)}
                  className="p-1 rounded text-[#737373] hover:text-[#F5F5F5]"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <MermaidViewer chart={graphData.mermaidChart} id={`mermaid-ast-${activeMode}`} />
              </div>
            </div>
          )}
        </div>

        {/* 4. Contextual Component Inspector (Desktop Sidebar / Tablet Slide-over) */}
        {isInspectorOpen && (
          <div className="w-80 md:w-88 lg:w-96 h-full flex-shrink-0 z-10 transition-all duration-200">
            <ComponentInspector
              repoId={repoId}
              selectedNode={selectedNode}
              allNodes={graphData.nodes}
              edges={graphData.edges}
              onSelectNode={setSelectedNode}
              onClose={() => setIsInspectorOpen(false)}
            />
          </div>
        )}
      </div>

      {/* 5. Slim Bottom Information Bar */}
      <div className="h-7 bg-[#141414] border-t border-[#303030] px-4 flex items-center justify-between text-[11px] text-[#737373] font-mono flex-shrink-0 select-none">
        {/* Left Stats: Component, Connection & Layer Counts */}
        <div className="flex items-center gap-4">
          <span className="text-[#A3A3A3] font-medium">
            {graphData.nodes.length} Components
          </span>
          <span>•</span>
          <span>{graphData.edges.length} Connections</span>
          <span>•</span>
          <span>4 Layers</span>
          <span>•</span>
          <span className="hidden sm:inline text-[#A3A3A3]">
            Mode: <strong className="text-[#F5F5F5] uppercase">{activeMode}</strong>
          </span>
        </div>

        {/* Right Info: Canvas Zoom & Selection State */}
        <div className="flex items-center gap-4">
          <span className="hidden md:inline text-[10px] text-[#525252]">
            Drag nodes • Pan canvas • Scroll to zoom • Click node to inspect
          </span>
          <span>Zoom {Math.round(zoom * 100)}%</span>
          {selectedNode ? (
            <span className="text-[#F5F5F5] truncate max-w-[140px]">
              [{selectedNode.name}]
            </span>
          ) : (
            <span>No Node Selected</span>
          )}
        </div>
      </div>
    </div>
  );
}
