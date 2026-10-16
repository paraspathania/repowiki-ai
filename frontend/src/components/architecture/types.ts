export type ArchitectureMode = "system" | "component" | "sequence";

export type ComponentLayer = "frontend" | "backend" | "data" | "infrastructure";

export interface ArchitectureNode {
  id: string;
  name: string;
  subtitle?: string;
  type: "client" | "service" | "gateway" | "worker" | "database" | "cache" | "queue" | "external" | "module" | "flow-step";
  layer: ComponentLayer;
  description: string;
  sourceFile?: string;
  techStack?: string[];
  routes?: string[];
  stepNumber?: number;
  dependencies?: string[];
  x: number;
  y: number;
  width?: number;
  height?: number;
}

export interface ArchitectureEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  protocol?: string;
}

export interface ArchitectureGraphData {
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
  mermaidChart: string;
  mode: ArchitectureMode;
  layerCounts: Record<ComponentLayer, number>;
}
