const dayLabels = ["D", "S", "T", "Q", "Q", "S", "S"]
const now = new Date()

function getDayLabel(i: number) {
  const d = new Date(now)
  d.setDate(d.getDate() - (6 - i))
  return dayLabels[d.getDay()]
}

type StreakCardProps = {
  streak?: number
}

export function StreakCard({ streak = 0 }: StreakCardProps) {
  const activeDays = Array.from({ length: 7 }, (_, i) => i >= 7 - Math.min(streak, 7))

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-bento transition-all hover:shadow-bento-hover lg:p-8">
      <div>
        <h2 className="text-xl lg:text-2xl font-bold text-foreground">
          Sequência
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Dias consecutivos de estudo
        </p>
      </div>

      <div className="mt-6 flex items-center gap-4">
        {streak > 0 && (
          <svg
            width="40" height="40" viewBox="0 0 48 48"
            style={{ animation: "flicker 2s ease-in-out infinite" }}
          >
            <path
              d="M24 4 C24 4 32 14 32 24 C32 30 28 34 24 36 C20 34 16 30 16 24 C16 14 24 4 24 4Z"
              fill="var(--amber)"
            />
            <path
              d="M24 14 C24 14 28 20 28 26 C28 30 26 32 24 33 C22 32 20 30 20 26 C20 20 24 14 24 14Z"
              fill="var(--coral)"
            />
          </svg>
        )}

        <div className="flex gap-1.5">
          {activeDays.map((active, i) => (
            <div
              key={i}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {getDayLabel(i)}
            </div>
          ))}
        </div>

        <div className="ml-auto text-right">
          <p className="text-2xl font-extrabold tabular-nums text-foreground">{streak}</p>
          <p className="text-xs text-muted-foreground">dias</p>
        </div>
      </div>
    </div>
  )
}