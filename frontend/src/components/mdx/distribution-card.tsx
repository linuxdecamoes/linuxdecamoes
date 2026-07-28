import type { ReactNode } from "react";
import { Box } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Accent } from "@/lib/manuals";
import { accentClasses } from "@/lib/manuals";

// Background suave + border-left por accent — classes estáticas (Norma 01).
const accentSurface: Record<Accent, string> = {
  sage: "bg-sage-soft/40 border-l-sage",
  coral: "bg-coral-soft/40 border-l-coral",
  amber: "bg-amber-soft/40 border-l-amber",
  terracotta: "bg-peach/50 border-l-terracotta",
  iris: "bg-iris-soft/40 border-l-iris",
};

type DistributionCardProps = {
  name: string;
  manager?: string;
  icon?: LucideIcon;
  accent?: Accent;
  children: ReactNode;
};

export function DistributionCard({
  name,
  manager,
  icon,
  accent = "sage",
  children,
}: DistributionCardProps) {
  const Icon = icon ?? Box;
  const a = accentClasses[accent];
  const surface = accentSurface[accent];

  return (
    <article
      className={
        "group relative my-5 overflow-hidden rounded-2xl border-l-4 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-float " +
        surface
      }
    >
      <div className="relative p-6">
        <header className="mb-4 flex flex-wrap items-center gap-3">
          <span
            className={
              "flex h-12 w-12 items-center justify-center rounded-xl shadow-sm " +
              a.soft
            }
          >
            <Icon className={"h-6 w-6 " + a.strong} aria-hidden />
          </span>
          <div>
            <h4 className="text-xl font-bold text-foreground">{name}</h4>
            {manager ? (
              <code className="mt-0.5 inline-block rounded-md border border-border bg-background/60 px-2 py-0.5 font-mono text-xs text-muted-foreground">
                {manager}
              </code>
            ) : null}
          </div>
        </header>
        <div
          className={
            "[&>p]:mb-2 [&>p]:text-sm [&>p]:leading-relaxed [&>p]:text-foreground/90 [&>p:last-child]:mb-0 " +
            "[&>ul]:mb-0 [&>ul]:list-disc [&>ul]:space-y-1.5 [&>ul]:pl-5 [&>ul]:text-sm [&>ul]:text-foreground/80 [&_ul]:marker:text-primary/50 " +
            "[&>ul>li:last-child]:mb-0 [&_strong]:font-semibold [&_strong]:text-foreground [&_code]:rounded [&_code]:border [&_code]:border-border [&_code]:bg-background/60 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_code]:text-foreground"
          }
        >
          {children}
        </div>
      </div>
    </article>
  );
}
