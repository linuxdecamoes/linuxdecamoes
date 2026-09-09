import Link from "next/link"
import type { Metadata } from "next"
import { Home, BookOpen } from "lucide-react"
import { NotFoundTerminal } from "@/components/not-found-terminal"

export const metadata: Metadata = {
  title: "Página não encontrada",
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-10 px-4 py-20 text-center">
      <div style={{ animation: "slideUp 0.6s ease-out 0s both" }}>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
          $ cat /var/log/erro
        </p>
        <h1 className="mt-4 font-heading text-4xl font-bold leading-tight text-foreground sm:text-5xl">
          404
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-7 text-muted-foreground">
          A página que procuras não existe ou foi movida. Verifica o URL ou
          navega para uma das secções abaixo.
        </p>
      </div>

      <div style={{ animation: "slideUp 0.6s ease-out 0.1s both" }}>
        <NotFoundTerminal />
      </div>

      <div
        className="flex flex-col gap-3 sm:flex-row"
        style={{ animation: "slideUp 0.6s ease-out 0.2s both" }}
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 border border-primary bg-primary px-6 py-3 font-mono text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Home className="h-4 w-4" />
          $ cd ~
        </Link>
        <Link
          href="/manuals"
          className="inline-flex items-center gap-2 border border-border px-6 py-3 font-mono text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <BookOpen className="h-4 w-4" />
          $ ls /manuals
        </Link>
      </div>
    </main>
  )
}
