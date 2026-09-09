import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { TerminalCard } from "@/components/dashboard/terminal-card";
import { TopicsCard } from "@/components/dashboard/topics-card";
import { ChatCard } from "@/components/dashboard/chat-card";
import { QuizzesCard } from "@/components/dashboard/quizzes-card";
import { ManualsCard } from "@/components/dashboard/manuals-card";
import { StreakCard } from "@/components/dashboard/streak-card";
import { StudyCard } from "@/components/dashboard/study-card";
import { getUserGlobalProgress } from "@/lib/api";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();
  const firstName = user?.firstName || "Estudante";

  let studyProgress = null;
  try {
    studyProgress = await getUserGlobalProgress(userId);
  } catch {
    // Silently fail — study card will render without data
  }

  return (
    <div className="mx-auto w-full max-w-[1560px] 2xl:max-w-[1920px] px-4 md:px-8 xl:px-12 py-8">
      {/* Hero */}
      <div className="mb-6 flex flex-col gap-4 border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between lg:p-8">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Olá, {firstName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Continua onde paraste
          </p>
        </div>
        <div className="flex gap-6">
          <div>
            <p className="text-2xl font-bold tabular-nums text-foreground">
              {studyProgress ? studyProgress.total_topics : "—"}
            </p>
            <p className="text-xs text-muted-foreground">tópicos</p>
          </div>
          <div className="border-l border-border pl-6">
            <p className="text-2xl font-bold tabular-nums text-foreground">
              {studyProgress ? studyProgress.total_topics_completed : "—"}
            </p>
            <p className="text-xs text-muted-foreground">completos</p>
          </div>
        </div>
      </div>

      {/* Bento Grid — Terminal como faixa de abertura, 4 widgets em linha, Chat como faixa de fecho */}
      <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-5">
        {/* Terminal Lab — faixa larga */}
        <div className="md:col-span-6 lg:col-span-12 min-h-[180px]">
          <TerminalCard />
        </div>

        {/* Sequência */}
        <div className="md:col-span-3 lg:col-span-3 min-h-[160px]">
          <StreakCard streak={studyProgress?.streak_consecutive_days ?? 0} />
        </div>

        {/* Quizzes */}
        <div className="md:col-span-3 lg:col-span-3 min-h-[160px]">
          <QuizzesCard
            dueCount={studyProgress?.due_quiz_count ?? 0}
            totalCount={studyProgress?.total_quizzes_taken ?? 0}
          />
        </div>

        {/* Estudo */}
        <div className="md:col-span-3 lg:col-span-3 min-h-[160px]">
          {studyProgress ? (
            <StudyCard progress={studyProgress} />
          ) : (
            <TopicsCard />
          )}
        </div>

        {/* Manuais */}
        <div className="md:col-span-3 lg:col-span-3 min-h-[160px]">
          <ManualsCard />
        </div>

        {/* Chat IA — faixa larga */}
        <div className="md:col-span-6 lg:col-span-12 min-h-[200px]">
          <ChatCard />
        </div>
      </div>
    </div>
  );
}
