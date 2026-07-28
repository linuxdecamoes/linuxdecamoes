import Link from "next/link";
import type { GlobalProgress } from "@/lib/api";
import { accentClasses } from "@/lib/manuals";
import { getManual } from "@/lib/manuals";

type StudyCardProps = {
  progress: GlobalProgress;
};

export function StudyCard({ progress }: StudyCardProps) {
  return (
    <Link href="/dashboard/study" className="group block h-full">
      <div className="flex h-full flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-bento transition-all hover:shadow-bento-hover lg:p-8">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-foreground">
            Estudo
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {progress.total_topics_completed}/{progress.total_topics} tópicos
          </p>
        </div>
        <div className="mt-6 flex flex-col gap-3">
          {progress.manuals.map((m) => {
            const manual = getManual(m.code);
            const accent = manual?.accent ?? "sage";
            const classes = accentClasses[accent];
            const pct = m.total_topics > 0
              ? Math.round((m.completed_topics / m.total_topics) * 100)
              : 0;

            return (
              <div key={m.code} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-semibold ${classes.strong}`}>
                    {m.title}
                  </span>
                  <span className="text-muted-foreground">
                    {m.modules_completed}/{m.modules_total} mód.
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full ${classes.dot} transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Link>
  );
}
