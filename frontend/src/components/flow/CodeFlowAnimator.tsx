"use client";

import { useState } from "react";
import { Play, Pause, RotateCcw, ArrowRight, CheckCircle2, Server, Database, Shield, Globe } from "lucide-react";

interface Step {
  id: number;
  title: string;
  subTitle: string;
  type: "client" | "gateway" | "auth" | "service" | "database";
  description: string;
}

const FLOW_STEPS: Step[] = [
  { id: 1, title: "Client Browser", subTitle: "POST /api/v1/repositories/analyze", type: "client", description: "User pastes GitHub repo URL into Next.js frontend app and clicks Analyze." },
  { id: 2, title: "API Gateway", subTitle: "FastAPI Interceptor & Rate Limiter", type: "gateway", description: "Gateway validates Bearer JWT token, checks rate limits, and sanitizes input payload." },
  { id: 3, title: "Security & Secret Masker", subTitle: "Regex & Entropy Scanner", type: "auth", description: "Scans repository credentials to prevent secret leakage to external providers." },
  { id: 4, title: "AST & Tree-Sitter Service", subTitle: "Asynchronous Git Worker", type: "service", description: "Clones repository, builds Concrete Syntax Trees (CST), and extracts module dependencies." },
  { id: 5, title: "Vector Database Indexing", subTitle: "PostgreSQL pgvector Store", type: "database", description: "Generates dense 1536-dimensional embeddings and indexes chunks using HNSW indexing." },
];

export function CodeFlowAnimator() {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      const interval = setInterval(() => {
        setActiveStep((prev) => {
          if (prev >= FLOW_STEPS.length) {
            clearInterval(interval);
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1800);
    }
  };

  const resetFlow = () => {
    setIsPlaying(false);
    setActiveStep(1);
  };

  const getStepIcon = (type: Step["type"]) => {
    switch (type) {
      case "client": return Globe;
      case "gateway": return Server;
      case "auth": return Shield;
      case "service": return Server;
      case "database": return Database;
    }
  };

  return (
    <div className="w-full bg-[#090b12] rounded-2xl border border-white/[0.08] p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span>Animated Code & Request Flow</span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 font-mono">
              Live Flow Trace
            </span>
          </h3>
          <p className="text-slate-400 text-xs mt-0.5">
            Step-by-step visualization of request lifecycle, authentication, AST extraction, and database persistence.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={togglePlay}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition duration-150 ${
              isPlaying
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30"
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? "Pause Trace" : "Play Animation"}</span>
          </button>
          <button
            onClick={resetFlow}
            className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 border border-white/[0.08]"
            title="Reset Trace"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Pipeline Stepper Graph */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative pt-4">
        {FLOW_STEPS.map((step) => {
          const Icon = getStepIcon(step.type);
          const isActive = activeStep === step.id;
          const isPassed = activeStep > step.id;

          return (
            <div
              key={step.id}
              onClick={() => {
                setIsPlaying(false);
                setActiveStep(step.id);
              }}
              className={`cursor-pointer p-4 rounded-xl border transition-all duration-300 relative flex flex-col justify-between space-y-3 ${
                isActive
                  ? "bg-indigo-950/40 border-indigo-500 shadow-xl shadow-indigo-950/50 scale-[1.02]"
                  : isPassed
                  ? "bg-emerald-950/20 border-emerald-500/30 opacity-80"
                  : "bg-white/[0.02] border-white/[0.06] opacity-40 hover:opacity-70"
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isActive
                      ? "bg-indigo-500 text-white animate-pulse"
                      : isPassed
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-white/[0.06] text-slate-400"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-500">
                  STEP 0{step.id}
                </span>
              </div>

              <div>
                <h4 className={`text-xs font-bold ${isActive ? "text-white" : "text-slate-300"}`}>
                  {step.title}
                </h4>
                <p className="text-[10px] font-mono text-indigo-300 truncate mt-0.5">
                  {step.subTitle}
                </p>
              </div>

              {isPassed && (
                <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium pt-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Executed</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Active Step Details Panel */}
      {FLOW_STEPS.find((s) => s.id === activeStep) && (
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-2 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              Step Details Trace: {FLOW_STEPS[activeStep - 1].title}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Protocol: HTTPS / SSE Stream
            </span>
          </div>
          <p className="text-slate-300 text-xs leading-relaxed">
            {FLOW_STEPS[activeStep - 1].description}
          </p>
        </div>
      )}
    </div>
  );
}
