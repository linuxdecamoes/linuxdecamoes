"use client";

import { useState } from "react";
import type { Quiz } from "@/lib/api";
import { submitQuizAnswer } from "@/lib/api";

type TopicQuizProps = {
  quizzes: Quiz[];
  userId: string;
  onPass: (score: number) => void;
};

const LETTERS = ["A", "B", "C", "D", "E", "F"];

const CTA_CLASS =
  "inline-flex items-center gap-2 border border-primary bg-primary px-6 py-3 font-mono text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:hover:bg-primary";

export function TopicQuiz({ quizzes, userId, onPass }: TopicQuizProps) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [finished, setFinished] = useState(false);

  if (quizzes.length === 0) {
    return (
      <div className="surface-static p-6 text-center">
        <p className="font-mono text-xs uppercase tracking-wider text-primary">
          $ ls quizzes/
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Sem quizzes disponíveis para este tópico. Gera quizzes primeiro.
        </p>
      </div>
    );
  }

  const quiz = quizzes[current];
  const options: string[] = JSON.parse(quiz.options);

  const isRight = (value: string) =>
    value.trim().toLowerCase() === quiz.correct_answer.trim().toLowerCase();

  const handleSubmit = async () => {
    if (!selected) return;
    setSubmitted(true);
    if (isRight(selected)) setCorrect((c) => c + 1);

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
      <div
        className={`border p-6 text-center ${
          passed
            ? "border-primary bg-primary/5"
            : "border-destructive bg-destructive/5"
        }`}
      >
        <p className="mb-2 font-heading text-3xl font-bold tabular-nums text-foreground">
          {correct}/{quizzes.length} — {score}%
        </p>
        <p
          className={`font-mono text-sm font-semibold ${
            passed ? "text-primary" : "text-destructive-fg"
          }`}
        >
          {passed ? "Aprovado! Próximo desbloqueado." : "Reprovado. Tenta novamente."}
        </p>
      </div>
    );
  }

  return (
    <div className="surface-static p-6">
      <p className="mb-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
        Pergunta [{current + 1}/{quizzes.length}]
      </p>
      <p className="mb-6 font-heading text-lg leading-snug text-foreground">
        {quiz.question}
      </p>

      <div className="space-y-2">
        {options.map((opt, i) => {
          const isSelected = selected === opt;
          const right = isRight(opt);

          // Estado nunca vive só na cor: cada variante muda borda, superfície
          // e o chip da letra (WCAG 1.4.1).
          let state = "border-border bg-card hover:border-primary";
          let chip = "border-border text-muted-foreground";
          if (submitted) {
            if (right) {
              state = "border-primary bg-primary/10 font-medium text-foreground";
              chip = "border-primary text-primary";
            } else if (isSelected) {
              state = "border-destructive bg-destructive/10 text-foreground";
              chip = "border-destructive text-destructive-fg";
            } else {
              state = "border-border bg-muted/40 text-muted-foreground";
              chip = "border-border text-muted-foreground";
            }
          } else if (isSelected) {
            state = "border-primary bg-primary/5 text-foreground";
            chip = "border-primary text-primary";
          }

          return (
            <button
              key={opt}
              onClick={() => !submitted && setSelected(opt)}
              disabled={submitted}
              className={`flex w-full items-center gap-3 border p-3 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] ${state}`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center border font-mono text-xs ${chip}`}
                aria-hidden
              >
                {LETTERS[i] ?? i + 1}
              </span>
              <span className="min-w-0 flex-1">{opt}</span>
            </button>
          );
        })}
      </div>

      {submitted && quiz.explanation && (
        <div className="mt-4 border-l-2 border-primary bg-muted/40 p-4 text-sm">
          <p className="mb-1 font-mono text-xs uppercase tracking-wider text-primary">
            Explicação
          </p>
          <p>{quiz.explanation}</p>
        </div>
      )}

      <div className="mt-4 flex justify-end">
        {!submitted ? (
          <button onClick={handleSubmit} disabled={!selected} className={CTA_CLASS}>
            Responder
          </button>
        ) : (
          <button onClick={handleNext} className={CTA_CLASS}>
            {current + 1 < quizzes.length ? "Próxima" : "Ver Resultado"}
          </button>
        )}
      </div>
    </div>
  );
}
