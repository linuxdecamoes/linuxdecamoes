import type { ReactNode } from "react";
import type { Accent } from "@/lib/manuals";
import { accentClasses } from "@/lib/manuals";

type ExerciseDifficulty = "guided" | "exploratory";

type ExerciseCardProps = {
  number: number;
  title: string;
  difficulty?: ExerciseDifficulty;
  accent?: Accent;
  children: ReactNode;
};

const difficultyLabel: Record<ExerciseDifficulty, string> = {
  guided: "Guiado",
  exploratory: "Exploratório",
};

// Ribbon gradient por accent — classes estáticas (Norma 01). O Tailwind v4
// gera from-*/to-* a partir dos --color-{accent} expostos em @theme inline.
const ribbonClass: Record<Accent, string> = {
  sage: "bg-gradient-to-r from-sage to-sage-soft",
  coral: "bg-gradient-to-r from-coral to-coral-soft",
  amber: "bg-gradient-to-r from-amber to-amber-soft",
  terracotta: "bg-gradient-to-r from-terracotta to-peach",
  iris: "bg-gradient-to-r from-iris to-iris-soft",
};

export function ExerciseCard({
  number,
  title,
  difficulty = "guided",
  accent = "sage",
  children,
}: ExerciseCardProps) {
  const a = accentClasses[accent];

  return (
    <article className="relative my-8 overflow-hidden rounded-2xl border border-border/40 bg-background/80 shadow-sm backdrop-blur-sm">
      {/* Ribbon accent top (4px gradient) */}
      <div className={`h-1 w-full ${ribbonClass[accent]}`} aria-hidden />
      <div className="p-6">
        <header className="mb-5 flex flex-wrap items-center gap-3">
          <span
            className={
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-bold shadow-sm " +
              a.soft +
              " " +
              a.strong
            }
            aria-label={`Exercício ${number}`}
          >
            {String(number).padStart(2, "0")}
          </span>
          <h4 className="flex-1 text-lg font-bold text-foreground">
            {title}
          </h4>
          <span
            className={
              "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider " +
              a.soft +
              " " +
              a.strong
            }
          >
            {difficultyLabel[difficulty]}
          </span>
        </header>
        <div
          className={
            "[&>p]:mb-3 [&>p]:text-sm [&>p]:leading-relaxed [&>p]:text-foreground [&>p:last-child]:mb-0 " +
            "[&_strong]:font-semibold [&_strong]:text-foreground " +
            "[&_em]:italic [&_em]:text-muted-foreground " +
            "[&_code]:rounded [&_code]:border [&_code]:border-border [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_code]:text-foreground " +
            "[&_table]:w-full [&_table]:border-collapse [&_table]:overflow-hidden [&_table]:rounded-lg " +
            "[&_thead]:bg-cream " +
            "[&_th]:border [&_th]:border-border [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:text-xs [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-foreground " +
            "[&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_td]:text-sm [&_td]:text-muted-foreground " +
            "[&_tr:last-child_td]:border-b-0"
          }
        >
          {children}
        </div>
      </div>
    </article>
  );
}
