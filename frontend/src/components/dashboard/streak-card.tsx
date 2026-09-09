type StreakCardProps = {
  streak?: number
}

const TIMELINE_X = [8, 24, 40, 56, 72, 88] as const
const TODAY_X = 96

export function StreakCard({ streak = 0 }: StreakCardProps) {
  const activeDots = Math.min(streak, TIMELINE_X.length)

  return (
    <div className="surface-static relative flex h-full flex-col justify-between p-6 lg:p-8">
      <div className="corner-tick corner-tick--tl" />
      <div className="corner-tick corner-tick--br" />
      <span className="card-tag" aria-hidden="true">SEQ-06</span>

      <div>
        <h2 className="text-xl lg:text-2xl font-bold text-foreground">
          Sequência
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Dias consecutivos de estudo
        </p>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <svg width="100%" height="30" viewBox="0 0 104 30" className="flex-1">
          <line x1="2" y1="15" x2="100" y2="15" stroke="var(--border)" strokeWidth="1" strokeDasharray="2 3" />
          {TIMELINE_X.map((x, i) => (
            <circle key={x} cx={x} cy={15} r={3} fill={i >= TIMELINE_X.length - activeDots ? "var(--primary)" : "var(--muted)"} />
          ))}
          <circle cx={TODAY_X} cy={15} r={4} fill="var(--card)" stroke="var(--coral)" strokeWidth={2} />
        </svg>

        <div className="shrink-0 text-right">
          <p className="text-2xl font-extrabold tabular-nums text-foreground">{streak}</p>
          <p className="text-xs text-muted-foreground">dias</p>
        </div>
      </div>
    </div>
  )
}
