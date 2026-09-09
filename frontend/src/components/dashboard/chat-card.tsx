import Link from "next/link"

export function ChatCard() {
  return (
    <Link href="/dashboard/chat" className="group block h-full">
      <div className="surface-card">
        <div className="corner-tick corner-tick--tl" />
        <div className="corner-tick corner-tick--br" />
        <span className="card-tag" aria-hidden="true">CHAT-03</span>

        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-foreground">
            Chat IA
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Tira dúvidas com IA baseada nos manuais
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <div className="flex gap-2">
            <span className="font-mono text-xs font-semibold text-primary">Q</span>
            <p className="border-b border-dotted border-border pb-1 text-foreground">
              O que é o <code className="font-mono">chmod 755</code>?
            </p>
          </div>
          <div className="flex gap-2">
            <span className="font-mono text-xs font-semibold text-muted-foreground">A</span>
            <p className="border-b border-dotted border-border pb-1 text-foreground">
              Define permissões: owner rwx, grupo r-x, outros r-x
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}
