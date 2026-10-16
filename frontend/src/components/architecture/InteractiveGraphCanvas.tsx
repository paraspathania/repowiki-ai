"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { ArchitectureNode, ArchitectureEdge, ComponentLayer } from "./types";
import {
  Server,
  Layers,
  Cpu,
  Database,
  Network,
  Globe,
  Terminal,
  ShieldCheck,
  Zap,
  GitBranch,
  Bot,
  HardDrive,
  Workflow,
} from "lucide-react";

interface InteractiveGraphCanvasProps {
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
  selectedNode: ArchitectureNode | null;
  onSelectNode: (node: ArchitectureNode | null) => void;
  searchQuery?: string;
  selectedLayer?: ComponentLayer | "all";
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  pan: { x: number; y: number };
  setPan: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
}

export function InteractiveGraphCanvas({
  nodes: initialNodes,
  edges,
  selectedNode,
  onSelectNode,
  searchQuery = "",
  selectedLayer = "all",
  zoom,
  setZoom,
  pan,
  setPan,
}: InteractiveGraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<ArchitectureNode[]>(initialNodes);
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Sync initial nodes whenever initialNodes changes (e.g. mode switch)
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes]);

  // Handle Canvas Panning
  const handleMouseDownCanvas = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".graph-node")) return;
    setIsPanning(true);
    setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y,
      });
    } else if (draggingNodeId) {
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return;

      const mouseX = (e.clientX - containerRect.left - pan.x) / zoom;
      const mouseY = (e.clientY - containerRect.top - pan.y) / zoom;

      setNodes((prev) =>
        prev.map((node) => {
          if (node.id === draggingNodeId) {
            return {
              ...node,
              x: Math.round(mouseX - dragOffset.x),
              y: Math.round(mouseY - dragOffset.y),
            };
          }
          return node;
        })
      );
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
  };

  // Node Drag Initiator
  const handleNodeMouseDown = (e: React.MouseEvent, node: ArchitectureNode) => {
    e.stopPropagation();
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    const mouseX = (e.clientX - containerRect.left - pan.x) / zoom;
    const mouseY = (e.clientY - containerRect.top - pan.y) / zoom;

    setDraggingNodeId(node.id);
    setDragOffset({
      x: mouseX - node.x,
      y: mouseY - node.y,
    });
  };

  // Mouse Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setZoom((prev) => Math.min(Math.max(prev * zoomFactor, 0.3), 2.5));
  };

  // Determine Connected Nodes and Edges for Active Selection
  const connectedEdgeIds = new Set<string>();
  const connectedNodeIds = new Set<string>();

  if (selectedNode) {
    connectedNodeIds.add(selectedNode.id);
    edges.forEach((edge) => {
      if (edge.source === selectedNode.id || edge.target === selectedNode.id) {
        connectedEdgeIds.add(edge.id);
        connectedNodeIds.add(edge.source);
        connectedNodeIds.add(edge.target);
      }
    });
  }

  // Helper to get Node Coordinates
  const getNodeCenter = (nodeId: string): {
    x: number;
    y: number;
    centerX: number;
    centerY: number;
    rightX: number;
    leftX: number;
    topY: number;
    bottomY: number;
    width: number;
    height: number;
  } | null => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return null;
    const width = node.width || 250;
    const height = node.height || 110;
    return {
      x: node.x,
      y: node.y,
      centerX: node.x + width / 2,
      centerY: node.y + height / 2,
      rightX: node.x + width,
      leftX: node.x,
      topY: node.y,
      bottomY: node.y + height,
      width,
      height,
    };
  };

  // Render Icon according to node type
  const renderNodeIcon = (type: string, layer: string) => {
    switch (type) {
      case "client":
        return <Globe className="w-4 h-4 text-[#A3A3A3]" />;
      case "gateway":
        return <Network className="w-4 h-4 text-[#F5F5F5]" />;
      case "service":
        return <Server className="w-4 h-4 text-[#A3A3A3]" />;
      case "worker":
        return <Cpu className="w-4 h-4 text-[#A3A3A3]" />;
      case "database":
        return <Database className="w-4 h-4 text-[#A3A3A3]" />;
      case "cache":
        return <HardDrive className="w-4 h-4 text-[#A3A3A3]" />;
      case "queue":
        return <Layers className="w-4 h-4 text-[#A3A3A3]" />;
      case "external":
        return <Bot className="w-4 h-4 text-[#A3A3A3]" />;
      case "flow-step":
        return <Workflow className="w-4 h-4 text-[#F5F5F5]" />;
      default:
        return <Server className="w-4 h-4 text-[#A3A3A3]" />;
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDownCanvas}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      className="relative w-full h-full overflow-hidden bg-[#090909] select-none cursor-default"
      style={{
        backgroundImage: `radial-gradient(#262626 1px, transparent 1px)`,
        backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
        backgroundPosition: `${pan.x}px ${pan.y}px`,
      }}
    >
      {/* SVG Canvas for Connectors / Edges */}
      <svg
        className="absolute inset-0 pointer-events-none w-full h-full overflow-visible"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "0 0",
        }}
      >
        <defs>
          <marker
            id="monochrome-arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#737373" />
          </marker>
          <marker
            id="monochrome-arrow-active"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#F5F5F5" />
          </marker>
        </defs>

        {edges.map((edge) => {
          const s = getNodeCenter(edge.source);
          const t = getNodeCenter(edge.target);
          if (!s || !t) return null;

          const isConnected = connectedEdgeIds.has(edge.id);
          const isDimmed = selectedNode !== null && !isConnected;

          // Determine connection anchor points
          const isHorizontal = Math.abs(t.centerX - s.centerX) >= Math.abs(t.centerY - s.centerY);
          let startX = s.rightX;
          let startY = s.centerY;
          let endX = t.leftX;
          let endY = t.centerY;

          if (t.centerX < s.centerX && isHorizontal) {
            startX = s.leftX;
            endX = t.rightX;
          } else if (!isHorizontal) {
            if (t.centerY > s.centerY) {
              startX = s.centerX;
              startY = s.bottomY;
              endX = t.centerX;
              endY = t.topY;
            } else {
              startX = s.centerX;
              startY = s.topY;
              endX = t.centerX;
              endY = t.bottomY;
            }
          }

          // Cubic Bezier curve control points
          const dx = endX - startX;
          const dy = endY - startY;
          const c1x = isHorizontal ? startX + dx * 0.5 : startX;
          const c1y = isHorizontal ? startY : startY + dy * 0.5;
          const c2x = isHorizontal ? endX - dx * 0.5 : endX;
          const c2y = isHorizontal ? endY : endY - dy * 0.5;

          const pathD = `M ${startX} ${startY} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${endX} ${endY}`;
          const midX = (startX + endX) / 2;
          const midY = (startY + endY) / 2;

          return (
            <g
              key={edge.id}
              className={`transition-opacity duration-150 ${
                isDimmed ? "opacity-20" : isConnected ? "opacity-100" : "opacity-75"
              }`}
            >
              {/* Background wider hit path */}
              <path
                d={pathD}
                fill="none"
                stroke="transparent"
                strokeWidth={12}
                className="pointer-events-auto cursor-pointer"
              />
              {/* Visible edge line */}
              <path
                d={pathD}
                fill="none"
                stroke={isConnected ? "#F5F5F5" : "#404040"}
                strokeWidth={isConnected ? 2 : 1.25}
                strokeDasharray={isConnected ? "none" : undefined}
                markerEnd={isConnected ? "url(#monochrome-arrow-active)" : "url(#monochrome-arrow)"}
              />
              {/* Edge Label Badge if present */}
              {edge.label && (
                <g transform={`translate(${midX}, ${midY})`}>
                  <rect
                    x={-((edge.label.length * 6.5) / 2 + 8)}
                    y={-10}
                    width={edge.label.length * 6.5 + 16}
                    height={20}
                    rx={4}
                    fill="#141414"
                    stroke={isConnected ? "#F5F5F5" : "#303030"}
                    strokeWidth={0.75}
                  />
                  <text
                    x={0}
                    y={3.5}
                    textAnchor="middle"
                    fill={isConnected ? "#F5F5F5" : "#A3A3A3"}
                    className="text-[9px] font-mono tracking-tight select-none pointer-events-none"
                  >
                    {edge.label}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* HTML Node Elements Container */}
      <div
        className="absolute inset-0 pointer-events-none w-full h-full"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "0 0",
        }}
      >
        {nodes.map((node) => {
          const isSelected = selectedNode?.id === node.id;
          const isConnected = connectedNodeIds.has(node.id);
          const isDimmed = selectedNode !== null && !isConnected;

          // Check search query match
          const matchesSearch =
            searchQuery.trim().length > 0 &&
            (node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              node.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
              node.sourceFile?.toLowerCase().includes(searchQuery.toLowerCase()));

          // Check layer filter
          const layerMismatch = selectedLayer !== "all" && node.layer !== selectedLayer;

          return (
            <div
              key={node.id}
              onClick={(e) => {
                e.stopPropagation();
                onSelectNode(node);
              }}
              onMouseDown={(e) => handleNodeMouseDown(e, node)}
              className={`graph-node absolute pointer-events-auto rounded-lg border transition-all duration-100 cursor-grab active:cursor-grabbing p-3.5 select-none ${
                isSelected
                  ? "bg-[#1D1D1D] border-[#F5F5F5] ring-1 ring-[#F5F5F5]/30 z-20 shadow-xl shadow-black/50"
                  : matchesSearch
                  ? "bg-[#191919] border-[#F5F5F5]/80 ring-1 ring-[#F5F5F5]/20 z-10"
                  : "bg-[#141414] border-[#303030] hover:border-[#525252] hover:bg-[#191919] z-0"
              } ${isDimmed || layerMismatch ? "opacity-30" : "opacity-100"}`}
              style={{
                left: `${node.x}px`,
                top: `${node.y}px`,
                width: `${node.width || 250}px`,
                minHeight: `${node.height || 110}px`,
              }}
            >
              {/* Header: Layer & Step Number */}
              <div className="flex items-center justify-between gap-2 mb-2 font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#1D1D1D] border border-[#303030] text-[#A3A3A3] font-medium">
                    {node.layer}
                  </span>
                  {node.stepNumber && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#F5F5F5] text-[#111111]">
                      #{node.stepNumber}
                    </span>
                  )}
                </div>
                <div className="w-5 h-5 rounded border border-[#303030] bg-[#191919] flex items-center justify-center flex-shrink-0">
                  {renderNodeIcon(node.type, node.layer)}
                </div>
              </div>

              {/* Node Title */}
              <h4 className="text-xs font-semibold text-[#F5F5F5] tracking-tight font-mono truncate">
                {node.name}
              </h4>

              {/* Subtitle / Type */}
              {node.subtitle && (
                <p className="text-[10px] text-[#A3A3A3] font-mono truncate mt-0.5">
                  {node.subtitle}
                </p>
              )}

              {/* Description Snippet */}
              <p className="text-[11px] text-[#737373] line-clamp-2 mt-2 leading-relaxed">
                {node.description}
              </p>

              {/* Source File Badge (if present) */}
              {node.sourceFile && (
                <div className="mt-2.5 pt-2 border-t border-[#303030]/60 flex items-center justify-between text-[10px] font-mono text-[#A3A3A3]">
                  <span className="truncate max-w-[190px]">{node.sourceFile}</span>
                  <span className="text-[#737373] text-[9px]">FILE →</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
