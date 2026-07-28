"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, Loader2, RotateCcw, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getQuizzesBySlug, submitQuizAnswer, generateQuizzesForTopic, completeTopic } from "@/lib/api";
import type { Quiz, QuizSubmitResult } from "@/lib/api";

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const { userId } = useAuth();
  const slug = params.slug as string;
  const manual = params.manual as string;

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<QuizSubmitResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const loadQuizzes = useCallback(async () => {
    try {
      setError(null);
      const data = await getQuizzesBySlug(manual, slug);
      if (data.length === 0) {
        setGenerating(true);
        try {
          const generated = await generateQuizzesForTopic(slug);
          setQuizzes(generated.quizzes);
        } catch {
          setError("Não foi possível gerar questões. Verifica se o backend está a correr.");
        }
        setGenerating(false);
      } else {
        setQuizzes(data);
      }
    } catch {
      setError("Não foi possível carregar quizzes. Verifica se o backend está a correr.");
      setLoading(false);
    }
  }, [manual, slug]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      await loadQuizzes();
      if (!cancelled) setLoading(false);
    };
    run();
    return () => { cancelled = true; };
  }, [loadQuizzes]);

  const handleAnswer = async () => {
    if (!selected || !quizzes[current]) return;
    setSubmitting(true);
    try {
      const res = await submitQuizAnswer({
        clerk_id: userId ?? "anonymous",
        quiz_id: quizzes[current].id,
        answer: selected,
      });
      setResult(res);
      setScore((prev) => ({
        correct: prev.correct + (res.is_correct ? 1 : 0),
        total: prev.total + 1,
      }));
    } catch {
      setResult({ is_correct: selected === parseOptions(quizzes[current].options)[0], next_review: new Date().toISOString(), interval_days: 1 });
      setScore((prev) => ({
        correct: prev.correct + 1,
        total: prev.total + 1,
      }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (current < quizzes.length - 1) {
      setCurrent((c) => c + 1);
      setSelected(null);
      setResult(null);
    } else {
      const pct = Math.round((score.correct / score.total) * 100);
      if (userId && quizzes.length > 0) {
        completeTopic(quizzes[0].topic_id, userId, pct).catch(() => {});
      }
      setFinished(true);
    }
  };

  function parseOptions(raw: string): string[] {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
    return raw.split("\n").filter(Boolean);
  }

  if (loading || generating) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          {generating ? "A gerar questões com IA..." : "A carregar quizzes..."}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-bento">
          <p className="text-muted-foreground">{error}</p>
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-1 h-4 w-4" />
              Voltar
            </Button>
            <Button onClick={() => { setLoading(true); setError(null); loadQuizzes(); }}>
              Tentar Novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-bento">
          <p className="text-muted-foreground">
            Não foi possível gerar questões para este tópico.
          </p>
          <Button variant="outline" onClick={() => router.back()} className="mt-4">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  if (finished) {
    const pct = Math.round((score.correct / score.total) * 100);
    const passed = pct >= 70;
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-bento sm:p-12">
          <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${passed ? "bg-sage-soft" : "bg-coral-soft"}`}>
            <Trophy className={`h-8 w-8 ${passed ? "text-sage" : "text-coral"}`} />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Quiz Concluído!</h1>
          <p className={`mt-4 text-5xl font-extrabold ${passed ? "text-sage" : "text-coral"}`}>{pct}%</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {score.correct} de {score.total} corretas
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Button variant="outline" onClick={() => router.back()}>
              Voltar
            </Button>
            <Button onClick={() => { setCurrent(0); setSelected(null); setResult(null); setFinished(false); setScore({ correct: 0, total: 0 }); setLoading(true); loadQuizzes(); }}>
              <RotateCcw className="mr-1 h-4 w-4" />
              Repetir
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const quiz = quizzes[current];
  const options = parseOptions(quiz.options);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <button
        onClick={() => router.back()}
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </button>

      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Pergunta {current + 1} de {quizzes.length}
        </p>
        <div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${((current + 1) / quizzes.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-bento sm:p-8">
        <h2 className="text-lg font-semibold text-foreground">
          {quiz.question}
        </h2>

        <div className="mt-6 space-y-3">
          {options.map((option, i) => {
            const letter = String.fromCharCode(65 + i);
            const isCorrect = option === quiz.correct_answer;
            const isSelected = selected === option;
            const showResult = result !== null;

            return (
              <button
                key={i}
                onClick={() => !result && setSelected(option)}
                disabled={!!result}
                className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left text-sm transition-all ${
                  showResult && isCorrect
                    ? "border-sage bg-sage-soft text-foreground"
                    : showResult && isSelected && !result?.is_correct
                      ? "border-destructive bg-destructive/10 text-foreground"
                      : isSelected
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border hover:bg-muted text-foreground"
                }`}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border text-xs font-medium">
                  {showResult && isCorrect ? (
                    <CheckCircle className="h-4 w-4 text-sage" />
                  ) : showResult && isSelected ? (
                    <XCircle className="h-4 w-4 text-destructive" />
                  ) : (
                    letter
                  )}
                </span>
                <span className="flex-1">{option}</span>
              </button>
            );
          })}
        </div>

        {result && quiz.explanation && (
          <div className="mt-4 rounded-xl border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
            <strong className="text-foreground">Explicação:</strong>{" "}
            {quiz.explanation}
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        {!result ? (
          <Button onClick={handleAnswer} disabled={!selected || submitting}>
            {submitting ? "A verificar..." : "Confirmar"}
          </Button>
        ) : (
          <Button onClick={handleNext}>
            {current < quizzes.length - 1 ? (
              <>
                Próxima <ArrowRight className="ml-1 h-4 w-4" />
              </>
            ) : (
              "Ver Resultado"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
