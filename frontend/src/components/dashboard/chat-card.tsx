import Link from "next/link"

export function ChatCard() {
  return (
    <Link href="/dashboard/chat" className="group block h-full">
      <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-bento transition-all hover:shadow-bento-hover lg:p-8">
        <div className="relative z-10">
          <h2 className="text-xl lg:text-2xl font-bold text-foreground">
            Chat IA
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Tira dúvidas com IA baseada nos manuais
          </p>
        </div>

        <div className="relative z-10 mt-6 flex flex-col gap-3">
          <div
            className="self-end max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-4 py-2 text-sm text-primary-foreground"
            style={{ animation: "pop-in 0.3s ease-out 0.2s both" }}
          >
            O que é o <code className="font-mono">chmod 755</code>?
          </div>
          <div
            className="self-start max-w-[85%] rounded-2xl rounded-bl-sm bg-muted px-4 py-2 text-sm text-foreground"
            style={{ animation: "pop-in 0.3s ease-out 0.5s both" }}
          >
            Define permissões: owner rwx, grupo r-x, outros r-x...
          </div>
          <div
            className="self-end max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-4 py-2 text-sm text-primary-foreground"
            style={{ animation: "pop-in 0.3s ease-out 0.8s both" }}
          >
            E o <code className="font-mono">chmod +x</code>?
          </div>
        </div>
      </div>
    </Link>
  )
}
