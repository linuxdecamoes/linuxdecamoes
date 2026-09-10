import Link from "next/link"
import { ArrowRight, BookOpen, Brain } from "lucide-react"
import { getManual } from "@/lib/manuals"

const PREVIEW_TOPICS: { code: string; slug: string }[] = [
  { code: "010", slug: "a-evolucao-do-linux-e-sistemas-operacionais-populares" },
  { code: "010", slug: "o-basico-sobre-a-linha-de-comando" },
  { code: "010", slug: "gerenciando-permissoes-e-donos-de-arquivos" },
  { code: "101", slug: "103-1-trabalho-na-linha-de-comando" },
]

export function LearnSection() {
  const previewLinks = PREVIEW_TOPICS.flatMap(({ code, slug }) => {
    const manual = getManual(code)
    const topic = manual?.topics.find((t) => t.slug === slug)
    if (!manual || !topic) return []
    return [{ code, slug, manualTitle: manual.title, topicTitle: topic.title }]
  })

  return (
    <section id="aprender" className="mx-auto max-w-6xl px-4 py-24">
      <p className="mb-4 text-center font-mono text-xs uppercase tracking-[0.2em] text-primary">
        $ cat manuais/*
      </p>
      <h2 className="mb-4 text-center font-heading text-2xl font-bold text-foreground sm:text-3xl">
        Aprende com os manuais oficiais
      </h2>
      <p className="mb-12 text-center text-base text-muted-foreground">
        Estuda diretamente dos manuais oficiais do LPI, traduzidos e organizados em português.
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Alguns tópicos para começar</h3>
          </div>
          <ul className="space-y-3">
            {previewLinks.map(({ code, slug, manualTitle, topicTitle }) => (
              <li key={`${code}/${slug}`}>
                <Link
                  href={`/manuals/${code}/${slug}`}
                  className="group flex items-center justify-between gap-3 border border-transparent px-3 py-2 text-sm transition-colors hover:border-border hover:bg-secondary"
                >
                  <span className="text-foreground">
                    {topicTitle}
                    <span className="ml-2 text-xs text-muted-foreground">— {manualTitle}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/manuals"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            Ver todos os manuais
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="border border-card-dark bg-card-dark p-6 text-white">
          <div className="mb-3 flex items-center gap-2">
            <Brain className="h-5 w-5" style={{ color: "var(--accent)" }} />
            <h3 className="font-semibold">Motor RAG</h3>
          </div>
          <p className="text-sm leading-relaxed opacity-80">
            Não percebeste um conceito? Pergunta em português e recebe uma
            resposta fundamentada diretamente dos manuais — sem alucinações,
            com referências ao tópico.
          </p>
        </div>
      </div>
    </section>
  )
}
