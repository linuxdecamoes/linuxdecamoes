import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { getManualProgress } from "@/lib/api";
import { getManual } from "@/lib/manuals";
import { StudyRoadmap } from "@/components/study/study-roadmap";

export default async function StudyManualPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const manual = getManual(code);
  if (!manual) notFound();

  let progress;
  try {
    progress = await getManualProgress(code, userId);
  } catch {
    progress = null;
  }

  return (
    <div className="mx-auto w-full max-w-[1560px] px-4 md:px-8 xl:px-12 py-8">
      <div className="mb-6">
        <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight">
          {manual.title}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {progress?.completed_topics ?? 0}/{progress?.total_topics ?? manual.topics.length} tópicos concluídos
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar — Roadmap */}
        <aside className="lg:col-span-4 xl:col-span-3">
          <div className="sticky top-24 bg-cream rounded-2xl shadow-bento p-5">
            <h2 className="text-sm font-bold mb-4 uppercase tracking-wider text-muted-foreground">
              Percurso
            </h2>
            {progress ? (
              <StudyRoadmap
                modules={progress.modules}
                manualCode={code}
                accent={manual.accent}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                Sem dados de progresso.
              </p>
            )}
          </div>
        </aside>

        {/* Main — Content area */}
        <main className="lg:col-span-8 xl:col-span-9">
          <div className="bg-cream rounded-2xl shadow-bento p-8 text-center">
            <p className="text-muted-foreground">
              Seleciona um tópico no percurso ao lado para começar a estudar.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
