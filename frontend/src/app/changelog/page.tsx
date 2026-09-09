import type { Metadata } from "next"
import { History, Calendar, CheckCircle2 } from "lucide-react"
import { LandingHeader } from "@/components/landing-header"
import { LandingFooter } from "@/components/landing-footer"
import { changelog } from "@/lib/changelog"

export const metadata: Metadata = {
  title: "Atualizações",
  description:
    "Histórico de atualizações do Linux de Camões: principais novidades, correções e versões, uma entrada por semana de trabalho.",
  keywords: [
    "Linux de Camões", "atualizações", "changelog", "novidades",
    "versionamento", "histórico de versões", "PT-PT",
  ],
  robots: { index: true, follow: true },
  alternates: { canonical: "/changelog" },
  openGraph: {
    title: "Atualizações — Linux de Camões",
    description:
      "Histórico de atualizações da plataforma: principais novidades, correções e versões.",
    type: "website",
    locale: "pt_PT",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Linux de Camões",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Atualizações — Linux de Camões",
    description: "Histórico de atualizações da plataforma.",
    images: ["/opengraph-image"],
  },
}

export default function ChangelogPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingHeader />

      <main className="flex-1">
        <section className="relative overflow-hidden border-b py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
              <History className="h-3.5 w-3.5 text-primary" />
              Atualizações · Versionamento
            </div>
            <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Atualizações
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              O que mudou no Linux de Camões, versão a versão. No máximo uma
              entrada por semana de trabalho.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-16">
          <ol className="relative space-y-10 border-l border-border pl-8 sm:pl-10">
            {changelog.map((entry) => (
              <li key={entry.version} className="relative">
                <span
                  className="absolute -left-[2.6rem] top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-primary sm:-left-[3.1rem]"
                  aria-hidden
                />

                <div className="mb-2 flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center rounded-md bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                    v{entry.version}
                  </span>
                  <time
                    dateTime={entry.isoDate}
                    className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground"
                  >
                    <Calendar className="h-3.5 w-3.5" aria-hidden />
                    {entry.dateLabel}
                  </time>
                </div>

                <h2 className="font-heading text-xl font-semibold text-foreground sm:text-2xl">
                  {entry.title}
                </h2>

                <ul className="mt-4 space-y-2.5">
                  {entry.highlights.map((highlight, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 text-sm leading-relaxed text-muted-foreground sm:text-base"
                    >
                      <CheckCircle2
                        className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                        aria-hidden
                      />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <LandingFooter />
    </div>
  )
}
