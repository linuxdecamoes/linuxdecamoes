export function TopicsCard() {
  return (
    <div className="surface-static relative flex h-full flex-col justify-between p-6 lg:p-8">
      <div className="corner-tick corner-tick--tl" />
      <div className="corner-tick corner-tick--br" />
      <span className="card-tag" aria-hidden="true">FIG-02</span>

      <div>
        <h2 className="text-xl lg:text-2xl font-bold text-foreground">
          Tópicos
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Dos manuais oficiais LPI
        </p>
      </div>

      <div className="mt-6">
        <p className="text-3xl lg:text-4xl font-extrabold tabular-nums text-foreground">
          114
        </p>
        <p className="text-sm text-muted-foreground">tópicos</p>
      </div>
    </div>
  )
}
