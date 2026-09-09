import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getUserGlobalProgress } from "@/lib/api";
import { accentClasses, getManual } from "@/lib/manuals";

export default async function StudyPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  let progress;
  try {
    progress = await getUserGlobalProgress(userId);
  } catch {
    progress = null;
  }

  return (
    <div className="mx-auto w-full max-w-[1560px] px-4 md:px-8 xl:px-12 py-8">
      <div className="mb-6">
        <h1 className="font-heading text-3xl lg:text-4xl font-bold tracking-tight">
          Estudo
        </h1>
        <p className="mt-1 text-muted-foreground">
          Progresso global nos manuais LPI
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {progress?.manuals.map((m) => {
          const manual = getManual(m.code);
          const accent = manual?.accent ?? "sage";
          const classes = accentClasses[accent];
          const pct = m.total_topics > 0
            ? Math.round((m.completed_topics / m.total_topics) * 100)
            : 0;

          return (
            <Link
              key={m.code}
              href={`/dashboard/study/${m.code}`}
              className="surface p-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`inline-block w-3 h-3 ${classes.dot}`} />
                <h2 className="font-heading text-lg font-bold">{m.title}</h2>
              </div>
              <p className="font-mono text-xs text-muted-foreground">
                {m.completed_topics}/{m.total_topics} tópicos · {m.modules_completed}/{m.modules_total} módulos
              </p>
              <div className="mt-4">
                <div className="h-3 bg-muted overflow-hidden">
                  <div
                    className={`h-full ${classes.dot} transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="mt-2 text-right font-mono text-xs tabular-nums text-muted-foreground">{pct}%</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
