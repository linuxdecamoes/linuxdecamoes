import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Play, BookOpen } from "lucide-react";
import { manuals, accentClasses } from "@/lib/manuals";

export default async function QuizzesPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const allTopics = manuals.flatMap((m) =>
    m.topics.map((t) => ({
      ...t,
      manual: m.code,
      manualTitle: m.title,
      accent: m.accent,
      level: m.level,
    })),
  );

  const grouped = manuals.map((m) => ({
    ...m,
    topics: m.topics.map((t) => ({ ...t, manual: m.code })),
  }));

  return (
    <div className="mx-auto w-full max-w-[1560px] 2xl:max-w-[1920px] px-4 md:px-8 xl:px-12 py-8">
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-bento sm:flex-row sm:items-center sm:justify-between lg:p-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Quizzes
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Repetição espaçada baseada no algoritmo SM-2
          </p>
        </div>
        <div className="flex gap-6">
          <div>
            <p className="text-2xl font-bold tabular-nums text-foreground">{allTopics.length}</p>
            <p className="text-xs text-muted-foreground">tópicos</p>
          </div>
          <div className="border-l border-border pl-6">
            <p className="text-2xl font-bold tabular-nums text-foreground">{manuals.length}</p>
            <p className="text-xs text-muted-foreground">manuais</p>
          </div>
        </div>
      </div>

      {grouped.map((manual) => {
        const a = accentClasses[manual.accent];
        return (
          <div key={manual.code} className="mb-8">
            <div className="mb-3 flex items-center gap-3">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${a.badge}`}>
                <BookOpen className="h-3 w-3" />
                {manual.code}
              </span>
              <h2 className="text-lg font-bold text-foreground">{manual.title}</h2>
              <span className="text-xs text-muted-foreground">({manual.topics.length} tópicos)</span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {manual.topics.map((topic) => (
                <Link
                  key={`${manual.code}-${topic.slug}`}
                  href={`/dashboard/quizzes/${manual.code}/${topic.slug}`}
                >
                  <div className="group flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-bento transition-all hover:shadow-bento-hover">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        {topic.title}
                      </h3>
                    </div>
                    <span className="ml-3 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Play className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
