import Link from "next/link"

type QuizzesCardProps = {
  dueCount?: number
  totalCount?: number
}

export function QuizzesCard({ dueCount = 0, totalCount = 0 }: QuizzesCardProps) {
  const pct = totalCount > 0 ? Math.round(((totalCount - dueCount) / totalCount) * 100) : 0
  const circumference = 314
  const offset = circumference - (circumference * pct) / 100

  return (
    <Link href="/dashboard/quizzes" className="group block h-full">
      <div className="flex h-full flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-bento transition-all hover:shadow-bento-hover lg:p-8">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-foreground">
            Quizzes
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {dueCount > 0
              ? `${dueCount} pendente${dueCount !== 1 ? "s" : ""} hoje`
              : "Tudo em dia"}
          </p>
        </div>

        <div className="mt-6 flex items-center justify-end">
          <svg
            width="80" height="80" viewBox="0 0 100 100"
            className="-rotate-90"
          >
            <circle
              cx="50" cy="50" r="40"
              fill="none"
              stroke="var(--muted)"
              strokeWidth="8"
            />
            <circle
              cx="50" cy="50" r="40"
              fill="none"
              stroke="var(--primary)"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="animate-[ring-fill_1s_ease-out_forwards]"
            />
          </svg>
        </div>
      </div>
    </Link>
  )
}
