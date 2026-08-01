import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Autenticação",
  robots: { index: false, follow: false },
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <a
        href="#auth-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:shadow-lg focus:text-foreground"
      >
        Saltar para o formulário
      </a>

      <main
        id="auth-content"
        className="flex flex-1 flex-col items-center justify-center px-4"
        tabIndex={-1}
      >
        <Link
          href="/"
          className="mb-8 flex items-center gap-2 rounded-lg p-2 transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          aria-label="Página inicial — Linux de Camões"
        >
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg"
            aria-hidden="true"
          >
            L
          </div>
          <span className="text-xl font-semibold text-foreground">
            Linux de Camões
          </span>
        </Link>
        {children}
      </main>

      <footer className="py-4 text-center text-xs text-muted-foreground">
        <p>Linux de Camões &copy; {new Date().getFullYear()} — Open Source · MIT License</p>
      </footer>
    </div>
  )
}
