import Link from "next/link"
import type { Metadata } from "next"
import { Home } from "lucide-react"
import { NotFoundTerminal } from "@/components/not-found-terminal"

export const metadata: Metadata = {
  title: "Página não encontrada",
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <main className="hero-grid-bg relative flex min-h-screen flex-col items-center justify-center gap-10 overflow-hidden bg-card-dark px-4 py-20 text-center">
      <div
        className="relative z-10 flex flex-col items-center"
        style={{ animation: "slideUp 0.6s ease-out 0s both" }}
      >
        <Link href="/" className="flex flex-col items-center gap-3">
          <img
            src="/linuxdecamoes_bk.svg"
            alt=""
            className="h-20 w-20"
            style={{
              animation: "pop-in 0.5s ease-out both, pulse-slow 3s ease-in-out 0.6s infinite",
              filter: "drop-shadow(0 0 28px oklch(0.42 0.09 165 / 0.65))",
            }}
          />
          <span className="font-mono text-sm font-semibold tracking-tight text-white">
            Linux de Camões
          </span>
        </Link>

        <p className="mt-10 font-mono text-xs uppercase tracking-[0.2em] text-primary">
          $ cat /var/log/erro
        </p>
        <h1
          className="mt-4 font-heading text-7xl font-bold leading-none text-white sm:text-9xl"
          style={{ textShadow: "0 0 50px oklch(0.42 0.09 165 / 0.55)" }}
        >
          404
        </h1>
        <p className="mx-auto mt-5 max-w-md text-base leading-7 text-white/60">
          A página que procuras não existe ou foi movida. Verifica o URL ou
          volta para a página inicial.
        </p>
      </div>

      <div
        className="relative z-10 w-full"
        style={{ animation: "slideUp 0.6s ease-out 0.15s both" }}
      >
        <NotFoundTerminal />
      </div>

      <div
        className="relative z-10"
        style={{ animation: "slideUp 0.6s ease-out 0.3s both" }}
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 border border-primary bg-primary px-6 py-3 font-mono text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          style={{ boxShadow: "0 0 30px -6px oklch(0.42 0.09 165 / 0.7)" }}
        >
          <Home className="h-4 w-4" />
          $ cd ~
        </Link>
      </div>
    </main>
  )
}
