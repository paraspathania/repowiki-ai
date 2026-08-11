"use client";

import { useEffect, useState } from "react";
import { repoService } from "@/lib/api/client";
import { LearningHub } from "@/components/learning/LearningHub";
import { QuizQuestion, Flashcard, LearningRoadmapStep } from "@/types";

export default function LearningPage({ params }: { params: { repoId: string } }) {
  const [data, setData] = useState<{
    quizzes: QuizQuestion[];
    flashcards: Flashcard[];
    roadmap: LearningRoadmapStep[];
  } | null>(null);

  useEffect(() => {
    repoService.getLearningData(params.repoId).then(setData);
  }, [params.repoId]);

  return (
    <div className="h-full overflow-y-auto p-6 md:p-8 bg-[#07090e]">
      {data ? (
        <LearningHub quizzes={data.quizzes} flashcards={data.flashcards} roadmap={data.roadmap} />
      ) : (
        <div className="text-slate-500 text-xs font-mono p-8">Loading learning engine...</div>
      )}
    </div>
  );
}
