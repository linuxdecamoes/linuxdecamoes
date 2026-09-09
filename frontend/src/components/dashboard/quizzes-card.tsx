import Link from "next/link"

type QuizzesCardProps = {
  dueCount?: number
  totalCount?: number
}

export function QuizzesCard({ dueCount = 0, totalCount = 0 }: QuizzesCardProps) {
  const pct = totalCount > 0 ? Math.round(((totalCount - dueCount) / totalCount) * 100) : 0

  return (
    <Link href="/dashboard/quizzes" className="group block h-full">
      <div className="surface-card">
        <div className="corner-tick corner-tick--tl" />
        <div className="corner-tick corner-tick--br" />
        <span className="card-tag" aria-hidden="true">QZ-04</span>

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

        <div className="mt-4 flex items-center justify-end">
          <svg width="110" height="64" viewBox="0 0 110 64">
            <path
              d="M8 60 A47 47 0 0 1 102 60"
              fill="none"
              stroke="var(--muted)"
              strokeWidth="6"
            />
            <path
              d="M8 60 A47 47 0 0 1 102 60"
              fill="none"
              stroke="var(--primary)"
              strokeWidth="6"
              pathLength={100}
              strokeDasharray={100}
              strokeDashoffset={100 - pct}
              className="animate-[ring-fill_1s_ease-out_forwards]"
            />
            <text
              x="55" y="50"
              textAnchor="middle"
              fontFamily="var(--font-mono)"
              fontSize="16"
              fontWeight="700"
              fill="var(--foreground)"
            >
              {pct}%
            </text>
          </svg>
        </div>
      </div>
    </Link>
  )
}
