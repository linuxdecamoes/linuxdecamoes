const bars = [
  { label: "Fundamentos", width: "72%", delay: "0s" },
  { label: "Administração", width: "45%", delay: "0.3s" },
  { label: "Redes", width: "28%", delay: "0.6s" },
]

export function ProgressCard() {
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-bento transition-all hover:shadow-bento-hover lg:p-8">
      <div>
        <h2 className="text-xl lg:text-2xl font-bold text-foreground">
          Progresso
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Por domínio LPI
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {bars.map((bar) => (
          <div key={bar.label}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-foreground">{bar.label}</span>
              <span className="tabular-nums text-muted-foreground">{bar.width}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{
                  width: bar.width,
                  animation: `bar-fill 1s ease-out ${bar.delay} both`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
