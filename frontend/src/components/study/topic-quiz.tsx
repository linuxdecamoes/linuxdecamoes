"use client";

import { useState } from "react";
import type { Quiz } from "@/lib/api";
import { submitQuizAnswer } from "@/lib/api";

type TopicQuizProps = {
  quizzes: Quiz[];
  userId: string;
  onPass: (score: number) => void;
};

export function TopicQuiz({ quizzes, userId, onPass }: TopicQuizProps) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [finished, setFinished] = useState(false);

  if (quizzes.length === 0) {
    return (
      <div className="bg-amber-soft/30 rounded-2xl p-6 text-center">
        <p className="text-muted-foreground">
          Sem quizzes disponíveis para este tópico. Gera quizzes primeiro.
        </p>
      </div>
    );
  }

  const quiz = quizzes[current];
  const options: string[] = JSON.parse(quiz.options);

  const handleSubmit = async () => {
    if (!selected) return;
    setSubmitted(true);
    const isCorrect = selected.trim().toLowerCase() === quiz.correct_answer.trim().toLowerCase();
    if (isCorrect) setCorrect((c) => c + 1);

    await submitQuizAnswer({
      clerk_id: userId,
      quiz_id: quiz.id,
      answer: selected,
    });
  };

  const handleNext = () => {
    if (current + 1 < quizzes.length) {
      setCurrent(current + 1);
      setSelected(null);
      setSubmitted(false);
    } else {
      const score = Math.round((correct / quizzes.length) * 100);
      setFinished(true);
      if (score >= 60) onPass(score);
    }
  };

  if (finished) {
    const score = Math.round((correct / quizzes.length) * 100);
    const passed = score >= 60;
    return (
      <div className={`rounded-2xl p-6 text-center ${passed ? "bg-sage-soft/30" : "bg-coral-soft/30"}`}>
        <p className="text-2xl font-bold mb-2">
          {correct}/{quizzes.length} — {score}%
        </p>
        <p className={`font-semibold ${passed ? "text-sage" : "text-coral"}`}>
          {passed ? "Aprovado! Próximo desbloqueado." : "Reprovado. Tenta novamente."}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-cream rounded-2xl shadow-bento p-6">
      <p className="text-xs text-muted-foreground mb-2">
        Pergunta {current + 1}/{quizzes.length}
      </p>
      <p className="font-semibold mb-4">{quiz.question}</p>

      <div className="space-y-2">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => !submitted && setSelected(opt)}
            disabled={submitted}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-colors border ${
              submitted
                ? opt.trim().toLowerCase() === quiz.correct_answer.trim().toLowerCase()
                  ? "bg-sage-soft border-sage text-sage font-semibold"
                  : opt === selected
                    ? "bg-coral-soft border-coral text-coral"
                    : "bg-muted/30 border-transparent opacity-50"
                : selected === opt
                  ? "border-foreground bg-muted/50"
                  : "border-transparent bg-muted/30 hover:bg-muted/50"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      {submitted && quiz.explanation && (
        <div className="mt-4 p-4 bg-sage-soft/20 rounded-xl text-sm">
          <p className="font-semibold mb-1">Explicação:</p>
          <p>{quiz.explanation}</p>
        </div>
      )}

      <div className="mt-4 flex justify-end">
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={!selected}
            className="px-6 py-2 rounded-xl bg-cta text-cta-foreground font-semibold text-sm disabled:opacity-50"
          >
            Responder
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-6 py-2 rounded-xl bg-cta text-cta-foreground font-semibold text-sm"
          >
            {current + 1 < quizzes.length ? "Próxima" : "Ver Resultado"}
          </button>
        )}
      </div>
    </div>
  );
}
