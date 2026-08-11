"use client";

import { useState } from "react";
import { QuizQuestion, Flashcard, LearningRoadmapStep } from "@/types";
import {
  Terminal, ChevronRight, CheckCircle2, XCircle, RotateCcw,
  ArrowRight, ArrowLeft, Code2, Layers, GitBranch, FileCode2,
  Braces, Hash, Play, Cpu, Sparkles, Zap, BookOpen,
} from "lucide-react";

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
      alert(`Quiz completed! You scored ${score + (selectedAnswer === activeQuestion.correctAnswerIndex ? 1 : 0)} / ${quizzes.length}`);
      setCurrentQuizIndex(0);
      setScore(0);
    }
  };

  const optionLabels = ["A", "B", "C", "D", "E", "F"];

  return (
    <div className="space-y-5">
      {/* Terminal-Style Header Bar */}
      <div className="bg-[#0a0d14] rounded-2xl border border-white/[0.08] overflow-hidden">
        {/* Title bar mimicking IDE/terminal */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center gap-3">
            {/* Traffic lights */}
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            </div>
            <div className="flex items-center gap-2 ml-2">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] font-mono font-bold text-slate-300">
                learning-engine<span className="text-emerald-400">@</span>repowiki
              </span>
              <span className="text-[10px] text-slate-600 font-mono">~/interactive</span>
            </div>
          </div>

          {/* Tab Buttons - Terminal style */}
          <div className="flex items-center gap-1 bg-black/30 rounded-xl p-1">
            {([
              { key: "quiz", label: "quiz.test()", icon: Braces },
              { key: "flashcards", label: "cards.flip()", icon: Layers },
              { key: "roadmap", label: "roadmap.init()", icon: GitBranch },
            ] as const).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-semibold flex items-center gap-1.5 transition-all duration-200 ${
                  activeTab === key
                    ? "bg-indigo-600/90 text-white shadow-lg shadow-indigo-600/30"
                    : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]"
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Description line */}
        <div className="px-5 py-2.5 border-b border-white/[0.04] flex items-center gap-2">
          <span className="text-emerald-400 text-[11px] font-mono font-bold">$</span>
          <span className="text-[11px] font-mono text-slate-500">
            Master repository architecture through auto-generated quizzes, flashcards, and step-by-step onboarding.
          </span>
          <span className="w-1.5 h-4 bg-emerald-400 animate-pulse ml-0.5" />
        </div>
      </div>

      {/* ═══════ QUIZ TAB ═══════ */}
      {activeTab === "quiz" && activeQuestion && (
        <div className="max-w-3xl mx-auto space-y-4">
          {/* Quiz header in IDE style */}
          <div className="bg-[#0a0d14] rounded-2xl border border-white/[0.08] overflow-hidden">
            {/* File tab */}
            <div className="flex items-center justify-between px-4 py-2 bg-white/[0.02] border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <FileCode2 className="w-3 h-3 text-amber-400" />
                <span className="text-[11px] font-mono text-slate-400">
                  quiz_<span className="text-amber-300">{currentQuizIndex + 1}</span>.test.ts
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-slate-600">
                  {currentQuizIndex + 1}/{quizzes.length}
                </span>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <Zap className="w-2.5 h-2.5 text-emerald-400" />
                  <span className="text-[10px] font-mono font-bold text-emerald-400">{score} pts</span>
                </div>
              </div>
            </div>

            {/* Question with line numbers */}
            <div className="px-5 py-5 flex gap-4">
              <div className="flex flex-col items-end select-none pt-0.5">
                <span className="text-[10px] font-mono text-slate-700 leading-relaxed">1</span>
                <span className="text-[10px] font-mono text-slate-700 leading-relaxed">2</span>
                <span className="text-[10px] font-mono text-slate-700 leading-relaxed">3</span>
              </div>
              <div className="border-l border-white/[0.06] pl-4 flex-1">
                <div className="text-[10px] font-mono text-slate-600 mb-2">
                  <span className="text-purple-400">describe</span>(<span className="text-amber-300">&apos;Repository Knowledge&apos;</span>, () =&gt; {"{"}
                </div>
                <h4 className="text-sm font-bold text-white leading-relaxed pl-4">
                  <span className="text-purple-400 font-mono text-[11px] mr-2">it</span>
                  <span className="text-amber-300 font-mono text-[11px]">&apos;</span>
                  {activeQuestion.question}
                  <span className="text-amber-300 font-mono text-[11px]">&apos;</span>
                </h4>
                <div className="text-[10px] font-mono text-slate-600 mt-2">{"}"});</div>
              </div>
            </div>

            {/* Options as assertions */}
            <div className="px-5 pb-5 space-y-2">
              {activeQuestion.options.map((opt, idx) => {
                const isSelected = selectedAnswer === idx;
                const isCorrect = idx === activeQuestion.correctAnswerIndex;

                let containerClass = "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12]";
                let labelClass = "bg-white/[0.06] text-slate-500 border-white/[0.08]";
                let textClass = "text-slate-300";

                if (isAnswerSubmitted) {
                  if (isCorrect) {
                    containerClass = "bg-emerald-950/30 border-emerald-500/50";
                    labelClass = "bg-emerald-500 text-white border-emerald-400";
                    textClass = "text-emerald-200 font-semibold";
                  } else if (isSelected) {
                    containerClass = "bg-rose-950/30 border-rose-500/50";
                    labelClass = "bg-rose-500 text-white border-rose-400";
                    textClass = "text-rose-300";
                  }
                } else if (isSelected) {
                  containerClass = "bg-indigo-950/30 border-indigo-500/50 shadow-lg shadow-indigo-500/10";
                  labelClass = "bg-indigo-500 text-white border-indigo-400";
                  textClass = "text-indigo-100 font-semibold";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all duration-200 flex items-center gap-4 group ${containerClass}`}
                  >
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-mono font-extrabold border flex-shrink-0 transition ${labelClass}`}>
                      {optionLabels[idx]}
                    </span>
                    <span className={`text-xs font-mono leading-relaxed transition ${textClass}`}>
                      {opt}
                    </span>
                    <div className="ml-auto flex-shrink-0">
                      {isAnswerSubmitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      {isAnswerSubmitted && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-400" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {isAnswerSubmitted && (
              <div className="mx-5 mb-5 p-4 rounded-xl bg-[#0c1220] border border-indigo-500/20 animate-fade-in">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-emerald-400 font-mono text-[11px]">/*</span>
                  <span className="text-[10px] font-mono font-extrabold text-indigo-400 uppercase tracking-wider">Explanation</span>
                  <span className="text-emerald-400 font-mono text-[11px]">*/</span>
                </div>
                <p className="text-xs font-mono text-slate-400 leading-relaxed pl-4 border-l-2 border-indigo-500/30">
                  {activeQuestion.explanation}
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex justify-end gap-3 px-5 pb-5">
              {!isAnswerSubmitted ? (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={selectedAnswer === null}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-mono font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>run test()</span>
                </button>
              ) : (
                <button
                  onClick={handleNextQuiz}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-mono font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>{currentQuizIndex < quizzes.length - 1 ? "next()" : "finish()"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══════ FLASHCARDS TAB ═══════ */}
      {activeTab === "flashcards" && activeCard && (
        <div className="max-w-2xl mx-auto space-y-5">
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="cursor-pointer group"
          >
            <div className="bg-[#0a0d14] rounded-2xl border border-white/[0.08] overflow-hidden hover:border-indigo-500/30 transition-all duration-300 shadow-2xl hover:shadow-indigo-500/5">
              {/* Card file tab */}
              <div className="flex items-center justify-between px-4 py-2 bg-white/[0.02] border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <Layers className="w-3 h-3 text-purple-400" />
                  <span className="text-[11px] font-mono text-slate-400">
                    flashcard_<span className="text-purple-300">{currentFlashcardIndex + 1}</span>.md
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold border ${
                    isFlipped
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  }`}>
                    {isFlipped ? "ANSWER" : "QUESTION"}
                  </span>
                  <span className="text-[10px] font-mono text-slate-600">
                    {currentFlashcardIndex + 1}/{flashcards.length}
                  </span>
                </div>
              </div>

              {/* Category tag */}
              <div className="px-5 pt-4">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-mono font-bold text-indigo-400">
                  <Hash className="w-2.5 h-2.5" />
                  {activeCard.category}
                </span>
              </div>

              {/* Card content with code-style rendering */}
              <div className="px-5 py-8 flex items-center justify-center min-h-[200px]">
                <div className="text-center max-w-md space-y-3">
                  {!isFlipped && (
                    <span className="text-[10px] font-mono text-slate-600 block">
                      {"// click to reveal answer"}
                    </span>
                  )}
                  <p className="text-base font-bold text-white leading-relaxed">
                    {isFlipped ? activeCard.back : activeCard.front}
                  </p>
                  {isFlipped && (
                    <span className="text-[10px] font-mono text-slate-600 block mt-2">
                      {"// click to see question"}
                    </span>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-2 bg-white/[0.01] border-t border-white/[0.04] flex items-center justify-center">
                <span className="text-[10px] font-mono text-slate-600 group-hover:text-slate-400 transition">
                  <RotateCcw className="w-2.5 h-2.5 inline mr-1.5" />
                  click to flip
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                setIsFlipped(false);
                setCurrentFlashcardIndex((i) => Math.max(0, i - 1));
              }}
              disabled={currentFlashcardIndex === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] disabled:opacity-20 text-slate-300 text-xs font-mono font-semibold hover:bg-white/[0.06] transition"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>prev()</span>
            </button>

            {/* Progress dots */}
            <div className="flex items-center gap-1">
              {flashcards.slice(0, Math.min(flashcards.length, 12)).map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition ${
                    i === currentFlashcardIndex ? "bg-indigo-400 scale-125" : "bg-white/10"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => {
                setIsFlipped(false);
                setCurrentFlashcardIndex((i) => Math.min(flashcards.length - 1, i + 1));
              }}
              disabled={currentFlashcardIndex === flashcards.length - 1}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-20 text-white text-xs font-mono font-bold shadow-lg shadow-indigo-600/20 transition"
            >
              <span>next()</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* ═══════ ROADMAP TAB ═══════ */}
      {activeTab === "roadmap" && (
        <div className="max-w-3xl mx-auto">
          <div className="bg-[#0a0d14] rounded-2xl border border-white/[0.08] overflow-hidden">
            {/* File tab */}
            <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.02] border-b border-white/[0.06]">
              <GitBranch className="w-3 h-3 text-emerald-400" />
              <span className="text-[11px] font-mono text-slate-400">
                ONBOARDING_ROADMAP<span className="text-emerald-300">.md</span>
              </span>
            </div>

            <div className="p-5 space-y-0">
              {roadmap.map((step, idx) => (
                <div key={step.step} className="relative flex gap-4">
                  {/* Vertical connector line */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center font-mono font-extrabold text-xs shadow-lg shadow-indigo-600/30 relative z-10">
                      {step.step}
                    </div>
                    {idx < roadmap.length - 1 && (
                      <div className="w-px flex-1 bg-gradient-to-b from-indigo-500/40 to-transparent my-1" />
                    )}
                  </div>

                  {/* Step content */}
                  <div className="pb-6 pt-1 flex-1 min-w-0">
                    <h5 className="text-xs font-bold text-white font-mono">
                      <span className="text-purple-400">step</span>.<span className="text-amber-300">{step.title.toLowerCase().replace(/\s+/g, "_")}</span>()
                    </h5>
                    <p className="text-xs text-slate-400 leading-relaxed mt-1.5 font-mono">
                      <span className="text-slate-600">// </span>{step.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5 mt-3">
                      <span className="text-[10px] text-slate-600 font-mono mr-1">import from</span>
                      {step.recommendedFiles.map((f) => (
                        <span
                          key={f}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-mono text-indigo-300 hover:bg-indigo-500/20 transition cursor-pointer"
                        >
                          <FileCode2 className="w-2.5 h-2.5" />
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
