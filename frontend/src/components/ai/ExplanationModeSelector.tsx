"use client";

interface ExplanationModeSelectorProps {
  mode: "beginner" | "intermediate" | "expert";
  onChange: (mode: "beginner" | "intermediate" | "expert") => void;
}

export function ExplanationModeSelector({ mode, onChange }: ExplanationModeSelectorProps) {
  const modes: ("beginner" | "intermediate" | "expert")[] = ["beginner", "intermediate", "expert"];

  return (
    <div className="flex items-center gap-1 bg-surface p-1 rounded-lg border border-border text-xs">
      {modes.map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={`px-3 py-1 rounded-md capitalize font-medium transition ${
            mode === m ? "bg-accent text-white" : "text-gray-400 hover:text-white"
          }`}
        >
          {m}
        </button>
      ))}
    </div>
  );
}
