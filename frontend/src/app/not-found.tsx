import Link from "next/link"
import type { Metadata } from "next"
import { Home, BookOpen } from "lucide-react"

export const metadata: Metadata = {
  title: "Página não encontrada",
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <span
        className="mb-6 text-[120px] font-bold leading-none"
        style={{ color: "var(--primary)", opacity: 0.3 }}
      >
        404
      </span>
      <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
        Página não encontrada
      </h1>
      <p
        className="mt-3 max-w-md text-base"
        style={{ color: "var(--muted-foreground)" }}
      >
        A página que procuras não existe ou foi movida. Verifica o URL ou navega
        para uma das secções abaixo.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors hover:opacity-90"
          style={{ backgroundColor: "var(--card-dark)", color: "white" }}
        >
          <Home className="h-4 w-4" />
          Página Inicial
        </Link>
        <Link
          href="/manuais"
          className="inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-black/5"
          style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
        >
          <BookOpen className="h-4 w-4" />
          Explorar Manuais
        </Link>
      </div>
    </main>
  )
}
