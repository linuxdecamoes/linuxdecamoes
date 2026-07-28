import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { TerminalCard } from "@/components/dashboard/terminal-card";
import { TopicsCard } from "@/components/dashboard/topics-card";
import { ChatCard } from "@/components/dashboard/chat-card";
import { QuizzesCard } from "@/components/dashboard/quizzes-card";
import { ManualsCard } from "@/components/dashboard/manuals-card";
import { ProgressCard } from "@/components/dashboard/progress-card";
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
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-bento sm:flex-row sm:items-center sm:justify-between lg:p-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
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

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-5">
        {/* Terminal Lab — 8col × 2row */}
        <div className="md:col-span-6 lg:col-span-8 lg:row-span-2 min-h-[200px]">
          <TerminalCard />
        </div>

        {/* Estudo — 4col × 2row */}
        <div className="md:col-span-3 lg:col-span-4 lg:row-span-2 min-h-[200px]">
          {studyProgress ? (
            <StudyCard progress={studyProgress} />
          ) : (
            <TopicsCard />
          )}
        </div>

        {/* Chat IA — 5col × 2row */}
        <div className="md:col-span-3 lg:col-span-5 lg:row-span-2 min-h-[200px]">
          <ChatCard />
        </div>

        {/* Quizzes — 3col × 2row */}
        <div className="md:col-span-3 lg:col-span-3 lg:row-span-2 min-h-[200px]">
          <QuizzesCard
            dueCount={studyProgress?.due_quiz_count ?? 0}
            totalCount={studyProgress?.total_quizzes_taken ?? 0}
          />
        </div>

        {/* Progresso — 4col × 2row */}
        <div className="md:col-span-6 lg:col-span-4 lg:row-span-2 min-h-[200px]">
          <ProgressCard />
        </div>

        {/* Manuais + Streak row — 6 + 6 preenche os 12 (sem buraco) */}
        <div className="md:col-span-6 lg:col-span-6 min-h-[140px]">
          <ManualsCard />
        </div>
        <div className="md:col-span-6 lg:col-span-6 min-h-[140px]">
          <StreakCard streak={studyProgress?.streak_consecutive_days ?? 0} />
        </div>
      </div>
    </div>
  );
}
