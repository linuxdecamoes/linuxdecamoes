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
      <div className="surface-static mb-6 flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between lg:p-8">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Quizzes
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Repetição espaçada baseada no algoritmo SM-2
          </p>
        </div>
        <div className="flex gap-6">
          <div>
            <p className="font-mono text-2xl font-bold tabular-nums text-foreground">{allTopics.length}</p>
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">tópicos</p>
          </div>
          <div className="border-l border-border pl-6">
            <p className="font-mono text-2xl font-bold tabular-nums text-foreground">{manuals.length}</p>
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">manuais</p>
          </div>
        </div>
      </div>

      {grouped.map((manual) => {
        const a = accentClasses[manual.accent];
        return (
          <div key={manual.code} className="mb-8">
            <div className="mb-3 flex items-center gap-3">
              {/* accentClasses (a.badge) usa bg-sage-soft/text-sage, que falha
                  AA. O código de cor por manual precisa de ser redesenhado por
                  inteiro — aqui usa-se a superfície neutra do Blueprint. */}
              <span className="inline-flex items-center gap-1.5 border border-border bg-muted px-2.5 py-1 font-mono text-xs uppercase tracking-wider text-foreground">
                <BookOpen className="h-3 w-3" />
                {manual.code}
              </span>
              <h2 className="font-heading text-lg font-bold text-foreground">{manual.title}</h2>
              <span className="font-mono text-xs text-muted-foreground">({manual.topics.length} tópicos)</span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {manual.topics.map((topic) => (
                // As classes vivem no <Link>, não num <div> interior: assim o
                // alvo focável é o mesmo que tem o estilo, e a navegação por
                // teclado passa a ter indicador.
                <Link
                  key={`${manual.code}-${topic.slug}`}
                  href={`/dashboard/quizzes/${manual.code}/${topic.slug}`}
                  className="group flex items-center justify-between border border-border bg-card p-4 transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
                >
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {topic.title}
                    </h3>
                  </div>
                  <span className="ml-3 inline-flex h-8 w-8 shrink-0 items-center justify-center bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Play className="h-3.5 w-3.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
