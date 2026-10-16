"use client";

import React from "react";
import Link from "next/link";
import { ArchitectureNode, ArchitectureEdge } from "./types";
import {
  X,
  ExternalLink,
  Layers,
  ArrowRight,
  ArrowLeft,
  FileCode,
  Globe,
  Server,
  Database,
  Cpu,
  Network,
  Tag,
  Route,
  HardDrive,
  Workflow,
} from "lucide-react";

interface ComponentInspectorProps {
  repoId: string;
  selectedNode: ArchitectureNode | null;
  allNodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
  onSelectNode: (node: ArchitectureNode | null) => void;
  onClose?: () => void;
}

export function ComponentInspector({
  repoId,
  selectedNode,
  allNodes,
  edges,
  onSelectNode,
  onClose,
}: ComponentInspectorProps) {
  if (!selectedNode) {
    return (
      <div className="w-full h-full flex flex-col justify-center items-center p-6 text-center bg-[#141414] border-l border-[#303030] font-mono select-none">
        <div className="w-10 h-10 rounded-lg border border-[#303030] bg-[#1D1D1D] flex items-center justify-center mb-3">
          <Network className="w-5 h-5 text-[#737373]" />
        </div>
        <h4 className="text-xs font-semibold text-[#F5F5F5]">Component Inspector</h4>
        <p className="text-[11px] text-[#737373] mt-1.5 leading-relaxed max-w-[240px]">
          Select any component node on the canvas to inspect technical metadata, connected dependencies, source files, and API endpoints.
        </p>
        {allNodes.length > 0 && (
          <button
            onClick={() => onSelectNode(allNodes[0])}
            className="mt-4 px-3 py-1.5 rounded bg-[#1D1D1D] hover:bg-[#262626] border border-[#303030] text-[#A3A3A3] hover:text-[#F5F5F5] text-xs font-medium transition"
          >
            Inspect {allNodes[0].name}
          </button>
        )}
      </div>
    );
  }

  // Find incoming and outgoing edges
  const inboundEdges = edges.filter((e) => e.target === selectedNode.id);
  const outboundEdges = edges.filter((e) => e.source === selectedNode.id);

  const inboundNodes = inboundEdges
    .map((e) => ({
      edge: e,
      node: allNodes.find((n) => n.id === e.source),
    }))
    .filter((item): item is { edge: ArchitectureEdge; node: ArchitectureNode } => Boolean(item.node));

  const outboundNodes = outboundEdges
    .map((e) => ({
      edge: e,
      node: allNodes.find((n) => n.id === e.target),
    }))
    .filter((item): item is { edge: ArchitectureEdge; node: ArchitectureNode } => Boolean(item.node));

  return (
    <div className="w-full h-full flex flex-col bg-[#141414] border-l border-[#303030] overflow-hidden font-mono">
      {/* Inspector Header */}
      <div className="p-3.5 border-b border-[#303030] flex items-center justify-between bg-[#141414] flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#1D1D1D] border border-[#303030] text-[#A3A3A3] font-medium flex-shrink-0">
            {selectedNode.layer}
          </span>
          <h3 className="text-xs font-semibold text-[#F5F5F5] truncate">
            {selectedNode.name}
          </h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded text-[#737373] hover:text-[#F5F5F5] hover:bg-[#1D1D1D] transition"
            title="Close Inspector"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Inspector Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar text-xs">
        {/* Node Subtitle & Overview */}
        <div className="p-3 rounded border border-[#303030] bg-[#1D1D1D] space-y-1.5">
          <div className="flex items-center justify-between text-[10px] text-[#A3A3A3]">
            <span>Type: {selectedNode.type.toUpperCase()}</span>
            {selectedNode.stepNumber && (
              <span className="text-[#F5F5F5] font-bold">Step #{selectedNode.stepNumber}</span>
            )}
          </div>
          <p className="text-[11px] text-[#D4D4D4] leading-relaxed">
            {selectedNode.description}
          </p>
        </div>

        {/* Source File Location */}
        {selectedNode.sourceFile && (
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase tracking-wider text-[#737373] font-semibold flex items-center gap-1.5">
              <FileCode className="w-3 h-3 text-[#A3A3A3]" />
              Source File Reference
            </span>
            <div className="p-2.5 rounded border border-[#303030] bg-[#1D1D1D] flex items-center justify-between gap-2">
              <span className="text-[11px] text-[#F5F5F5] truncate font-mono">
                {selectedNode.sourceFile}
              </span>
              <Link
                href={`/repositories/${repoId}/files?path=${encodeURIComponent(selectedNode.sourceFile)}`}
                className="flex items-center gap-1 px-2 py-1 rounded bg-[#262626] hover:bg-[#303030] text-[10px] text-[#F5F5F5] flex-shrink-0 transition"
              >
                <span>View</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Tech Stack / Dependencies */}
        {selectedNode.techStack && selectedNode.techStack.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase tracking-wider text-[#737373] font-semibold flex items-center gap-1.5">
              <Tag className="w-3 h-3 text-[#A3A3A3]" />
              Technologies & Libraries
            </span>
            <div className="flex flex-wrap gap-1.5">
              {selectedNode.techStack.map((tech, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded bg-[#1D1D1D] border border-[#303030] text-[10px] text-[#A3A3A3]"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Connected Inbound Components */}
        <div className="space-y-1.5">
          <span className="text-[10px] uppercase tracking-wider text-[#737373] font-semibold flex items-center gap-1.5">
            <ArrowLeft className="w-3 h-3 text-[#A3A3A3]" />
            Inbound Connections ({inboundNodes.length})
          </span>
          {inboundNodes.length > 0 ? (
            <div className="space-y-1">
              {inboundNodes.map(({ node, edge }) => (
                <button
                  key={node.id}
                  onClick={() => onSelectNode(node)}
                  className="w-full p-2 rounded border border-[#303030] bg-[#1D1D1D] hover:bg-[#262626] text-left flex items-center justify-between transition group"
                >
                  <div className="min-w-0 pr-2">
                    <span className="text-[11px] text-[#F5F5F5] group-hover:underline block truncate">
                      {node.name}
                    </span>
                    {edge.label && (
                      <span className="text-[9px] text-[#737373] block truncate">
                        via: {edge.label}
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#141414] border border-[#303030] text-[#A3A3A3] flex-shrink-0">
                    {node.layer}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-[#737373] italic">No incoming connections.</p>
          )}
        </div>

        {/* Connected Outbound Components */}
        <div className="space-y-1.5">
          <span className="text-[10px] uppercase tracking-wider text-[#737373] font-semibold flex items-center gap-1.5">
            <ArrowRight className="w-3 h-3 text-[#A3A3A3]" />
            Outbound Connections ({outboundNodes.length})
          </span>
          {outboundNodes.length > 0 ? (
            <div className="space-y-1">
              {outboundNodes.map(({ node, edge }) => (
                <button
                  key={node.id}
                  onClick={() => onSelectNode(node)}
                  className="w-full p-2 rounded border border-[#303030] bg-[#1D1D1D] hover:bg-[#262626] text-left flex items-center justify-between transition group"
                >
                  <div className="min-w-0 pr-2">
                    <span className="text-[11px] text-[#F5F5F5] group-hover:underline block truncate">
                      {node.name}
                    </span>
                    {edge.label && (
                      <span className="text-[9px] text-[#737373] block truncate">
                        calls: {edge.label}
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#141414] border border-[#303030] text-[#A3A3A3] flex-shrink-0">
                    {node.layer}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-[#737373] italic">No outgoing connections.</p>
          )}
        </div>

        {/* Related API Routes */}
        {selectedNode.routes && selectedNode.routes.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase tracking-wider text-[#737373] font-semibold flex items-center gap-1.5">
              <Route className="w-3 h-3 text-[#A3A3A3]" />
              API Endpoints & Routes ({selectedNode.routes.length})
            </span>
            <div className="space-y-1">
              {selectedNode.routes.map((route, idx) => (
                <div
                  key={idx}
                  className="p-1.5 rounded border border-[#303030] bg-[#1D1D1D] text-[10px] text-[#D4D4D4] font-mono break-all"
                >
                  {route}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
