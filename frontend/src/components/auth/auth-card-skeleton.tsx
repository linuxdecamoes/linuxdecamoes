export function AuthCardSkeleton({ title }: { title: "Entrar" | "Criar Conta" }) {
  return (
    <div
      className="w-full max-w-md animate-pulse rounded-2xl border border-border bg-card p-8 shadow-lg"
      role="status"
      aria-label={`A carregar ${title.toLowerCase()}...`}
    >
      <div className="mb-6 space-y-2 text-center">
        <div className="mx-auto h-6 w-32 rounded bg-muted" />
        <div className="mx-auto mt-2 h-4 w-48 rounded bg-muted" />
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="h-3 w-16 rounded bg-muted" />
          <div className="h-10 w-full rounded-lg bg-muted" />
        </div>

        <div className="space-y-2">
          <div className="h-3 w-24 rounded bg-muted" />
          <div className="h-10 w-full rounded-lg bg-muted" />
        </div>

        <div className="h-10 w-full rounded-lg bg-muted" />
      </div>

      <div className="mt-4 flex justify-center">
        <div className="h-4 w-40 rounded bg-muted" />
      </div>

      <span className="sr-only">A carregar formulário de {title.toLowerCase()}...</span>
    </div>
  )
}
