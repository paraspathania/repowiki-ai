"use client";

import { useState } from "react";
import { QuizQuestion, Flashcard, LearningRoadmapStep } from "@/types";
import { GraduationCap, HelpCircle, Layers, Map, CheckCircle2, XCircle, RotateCcw, ArrowRight } from "lucide-react";

interface LearningHubProps {
  quizzes: QuizQuestion[];
  flashcards: Flashcard[];
  roadmap: LearningRoadmapStep[];
}

export function LearningHub({ quizzes, flashcards, roadmap }: LearningHubProps) {
  const [activeTab, setActiveTab] = useState<"quiz" | "flashcards" | "roadmap">("quiz");
  
  // Quiz state
  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);

  // Flashcard state
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  const activeQuestion = quizzes[currentQuizIndex];
  const activeCard = flashcards[currentFlashcardIndex];

  const handleSelectOption = (index: number) => {
    if (isAnswerSubmitted) return;
    setSelectedAnswer(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || isAnswerSubmitted) return;
    setIsAnswerSubmitted(true);
    if (selectedAnswer === activeQuestion.correctAnswerIndex) {
      setScore((s) => s + 1);
    }
  };

  const handleNextQuiz = () => {
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    if (currentQuizIndex < quizzes.length - 1) {
      setCurrentQuizIndex((i) => i + 1);
    } else {
      // Quiz finished
      alert(`Quiz completed! You scored ${score + (selectedAnswer === activeQuestion.correctAnswerIndex ? 1 : 0)} / ${quizzes.length}`);
      setCurrentQuizIndex(0);
      setScore(0);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#090b12] p-5 rounded-2xl border border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Interactive Repository Learning Engine
            </h3>
            <p className="text-xs text-slate-400">
              Master repository architecture through auto-generated quizzes, flashcards, and step-by-step onboarding roadmaps.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("quiz")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === "quiz"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.08]"
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Interactive Quiz</span>
          </button>
          <button
            onClick={() => setActiveTab("flashcards")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === "flashcards"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.08]"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Flashcards</span>
          </button>
          <button
            onClick={() => setActiveTab("roadmap")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === "roadmap"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.08]"
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>Onboarding Roadmap</span>
          </button>
        </div>
      </div>

      {/* QUIZ TAB */}
      {activeTab === "quiz" && activeQuestion && (
        <div className="bg-[#090b12] p-6 rounded-2xl border border-white/[0.08] space-y-6 max-w-3xl mx-auto">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-3 border-b border-white/[0.06]">
            <span>Question {currentQuizIndex + 1} of {quizzes.length}</span>
            <span className="font-mono text-indigo-400">Score: {score}</span>
          </div>

          <h4 className="text-base font-bold text-white leading-relaxed">
            {activeQuestion.question}
          </h4>

          <div className="space-y-3">
            {activeQuestion.options.map((opt, idx) => {
              const isSelected = selectedAnswer === idx;
              const isCorrect = idx === activeQuestion.correctAnswerIndex;
              let btnClass = "bg-white/[0.02] border-white/[0.08] text-slate-300 hover:bg-white/[0.06]";

              if (isAnswerSubmitted) {
                if (isCorrect) {
                  btnClass = "bg-emerald-950/40 border-emerald-500 text-emerald-300 font-bold";
                } else if (isSelected) {
                  btnClass = "bg-rose-950/40 border-rose-500 text-rose-300";
                }
              } else if (isSelected) {
                btnClass = "bg-indigo-950/40 border-indigo-500 text-indigo-200 font-bold";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full text-left p-4 rounded-xl border text-xs leading-relaxed transition flex items-center justify-between ${btnClass}`}
                >
                  <span>{opt}</span>
                  {isAnswerSubmitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  {isAnswerSubmitted && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-400" />}
                </button>
              );
            })}
          </div>

          {/* Explanation Box */}
          {isAnswerSubmitted && (
            <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-xs text-indigo-200 space-y-1 animate-fade-in">
              <span className="font-bold text-indigo-400 uppercase tracking-wider block text-[10px]">Explanation</span>
              <p>{activeQuestion.explanation}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            {!isAnswerSubmitted ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold text-xs shadow-lg transition"
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNextQuiz}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg transition flex items-center gap-1.5"
              >
                <span>{currentQuizIndex < quizzes.length - 1 ? "Next Question" : "Finish Quiz"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* FLASHCARDS TAB */}
      {activeTab === "flashcards" && activeCard && (
        <div className="max-w-xl mx-auto space-y-6">
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="cursor-pointer h-64 bg-[#090b12] rounded-3xl border border-white/[0.1] p-8 flex flex-col justify-between items-center text-center shadow-2xl hover:border-indigo-500/50 transition-all duration-300 transform active:scale-98"
          >
            <span className="px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {activeCard.category} — {isFlipped ? "ANSWER" : "QUESTION (Click to Flip)"}
            </span>

            <p className="text-base font-bold text-white leading-relaxed max-w-md my-auto">
              {isFlipped ? activeCard.back : activeCard.front}
            </p>

            <span className="text-[11px] text-slate-500 font-mono">
              Card {currentFlashcardIndex + 1} of {flashcards.length}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                setIsFlipped(false);
                setCurrentFlashcardIndex((i) => Math.max(0, i - 1));
              }}
              disabled={currentFlashcardIndex === 0}
              className="px-4 py-2 rounded-xl bg-white/[0.04] disabled:opacity-30 text-slate-300 text-xs font-semibold border border-white/[0.08]"
            >
              Previous Card
            </button>
            <button
              onClick={() => {
                setIsFlipped(false);
                setCurrentFlashcardIndex((i) => Math.min(flashcards.length - 1, i + 1));
              }}
              disabled={currentFlashcardIndex === flashcards.length - 1}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white text-xs font-semibold shadow-lg"
            >
              Next Card
            </button>
          </div>
        </div>
      )}

      {/* ROADMAP TAB */}
      {activeTab === "roadmap" && (
        <div className="bg-[#090b12] p-6 rounded-2xl border border-white/[0.08] space-y-6 max-w-3xl mx-auto">
          <h4 className="text-sm font-bold text-white tracking-tight">
            Developer Onboarding Roadmap
          </h4>

          <div className="space-y-6 relative before:absolute before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-indigo-500/30">
            {roadmap.map((step) => (
              <div key={step.step} className="relative pl-10 space-y-2">
                <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-mono font-bold text-xs shadow-lg shadow-indigo-600/40">
                  {step.step}
                </div>

                <h5 className="text-xs font-bold text-white">{step.title}</h5>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {step.description}
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] text-slate-500 font-semibold">Target Files:</span>
                  {step.recommendedFiles.map((f) => (
                    <span key={f} className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08] text-[10px] font-mono text-indigo-300">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
