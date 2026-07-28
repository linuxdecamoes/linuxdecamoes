export function TopicsCard() {
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-bento transition-all hover:shadow-bento-hover lg:p-8">
      <div>
        <h2 className="text-xl lg:text-2xl font-bold text-foreground">
          Tópicos
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Dos manuais oficiais LPI
        </p>
      </div>

      <div className="flex items-center gap-6 mt-6">
        <svg width="100" height="100" viewBox="0 0 100 100" className="shrink-0">
          <circle
            cx="50" cy="50" r="38"
            fill="none"
            stroke="var(--muted)"
            strokeWidth="8"
          />
          <circle
            cx="50" cy="50" r="38"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="239"
            strokeDashoffset="44"
            transform="rotate(-90 50 50)"
            style={{ animation: "fill-arc 1.5s ease-out forwards" }}
          />
        </svg>
        <div>
          <p className="text-3xl lg:text-4xl font-extrabold tabular-nums text-foreground">
            114
          </p>
          <p className="text-sm text-muted-foreground">tópicos</p>
        </div>
      </div>
    </div>
  )
}
