"use client";

interface ExplanationModeSelectorProps {
  mode: "beginner" | "intermediate" | "expert";
  onChange: (mode: "beginner" | "intermediate" | "expert") => void;
}

export function ExplanationModeSelector({ mode, onChange }: ExplanationModeSelectorProps) {
  const modes: ("beginner" | "intermediate" | "expert")[] = ["beginner", "intermediate", "expert"];

  return (
    <div className="flex items-center gap-1 bg-surface/60 p-1 rounded-xl border border-white/[0.08] text-[10px]">
      {modes.map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={`px-3 py-1.5 rounded-lg capitalize font-bold transition duration-200 ${
            mode === m 
              ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/15" 
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          {m}
        </button>
      ))}
    </div>
  );
}
