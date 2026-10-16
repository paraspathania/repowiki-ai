"use client";

interface ExplanationModeSelectorProps {
  mode: "beginner" | "intermediate" | "expert";
  onChange: (mode: "beginner" | "intermediate" | "expert") => void;
}

export function ExplanationModeSelector({ mode, onChange }: ExplanationModeSelectorProps) {
  const modes: ("beginner" | "intermediate" | "expert")[] = ["beginner", "intermediate", "expert"];

  return (
    <div className="flex items-center bg-[#191919] p-0.5 rounded-sm border border-[#2A2A2A] text-[10px] font-mono">
      {modes.map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={`px-2 py-1 rounded-sm capitalize transition duration-150 ${
            mode === m 
              ? "bg-[#F2F2F2] text-[#111111] font-semibold" 
              : "text-[#777777] hover:text-[#F2F2F2] bg-transparent"
          }`}
        >
          {m}
        </button>
      ))}
    </div>
  );
}
