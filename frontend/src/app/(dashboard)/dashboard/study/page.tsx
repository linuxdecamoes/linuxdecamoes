import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
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
        <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight">
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
            <Link key={m.code} href={`/dashboard/study/${m.code}`}>
              <Card className="h-full bg-cream shadow-bento hover:shadow-bento-hover transition-shadow duration-300 cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-block w-3 h-3 rounded-full ${classes.dot}`} />
                    <CardTitle className="text-lg font-bold">{m.title}</CardTitle>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {m.completed_topics}/{m.total_topics} tópicos · {m.modules_completed}/{m.modules_total} módulos
                  </p>
                </CardHeader>
                <div className="px-6 pb-5">
                  <div className="h-3 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${classes.dot} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground text-right">{pct}%</p>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
