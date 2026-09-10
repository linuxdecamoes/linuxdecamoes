import Link from "next/link"
import { BookOpen, CheckCircle2, Layers, Lock, Star } from "lucide-react"

const ROADMAP = [
  {
    phase: "Fase 1",
    title: "Essentials",
    description: "Fundamentos de Linux, segurança, web e open source para todos os utilizadores.",
    status: "available" as const,
  },
  {
    phase: "Fase 2",
    title: "LPIC-1",
    description: "Certificação profissional de administração de sistemas Linux (nível júnior).",
    status: "available" as const,
  },
  {
    phase: "Fase 3",
    title: "LPIC-2",
    description: "Administração avançada — redes, segurança e otimização de sistemas.",
    status: "soon" as const,
  },
]

interface CertifySectionProps {
  totalManuais: number
  totalTopicos: number
  stars: number | null
}

export function CertifySection({ totalManuais, totalTopicos, stars }: CertifySectionProps) {
  const hasManualStats = totalManuais > 0

  return (
    <section id="certificar" className="border-t border-border py-24">
      <div className="mx-auto max-w-6xl px-4">
        <p className="mb-4 text-center font-mono text-xs uppercase tracking-[0.2em] text-primary">
          $ cat roadmap.yml
        </p>
        <h2 className="mb-4 text-center font-heading text-2xl font-bold text-foreground sm:text-3xl">
          O teu percurso de certificação
        </h2>
        <p className="mb-12 text-center text-base text-muted-foreground">
          Do iniciante ao profissional — segue o roadmap ao teu ritmo, ou aprende só pelo prazer de aprender.
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          {ROADMAP.map((phase) => (
            <div
              key={phase.phase}
              className={`border border-border bg-card p-6 ${phase.status === "soon" ? "opacity-60" : ""}`}
            >
              <div className="mb-3 flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {phase.phase}
                </span>
                {phase.status === "soon" ? (
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5 text-sage" aria-hidden />
                )}
              </div>
              <h3 className="text-xl font-bold text-foreground">{phase.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{phase.description}</p>
            </div>
          ))}
        </div>

        {(hasManualStats || stars !== null) && (
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {hasManualStats && (
              <>
                <div className="border border-border bg-card p-6 text-center">
                  <Layers className="mx-auto h-6 w-6 text-primary" />
                  <p className="mt-3 text-3xl font-bold text-foreground">{totalManuais}</p>
                  <p className="text-sm text-muted-foreground">Manuais Oficiais</p>
                </div>
                <div className="border border-border bg-card p-6 text-center">
                  <BookOpen className="mx-auto h-6 w-6 text-primary" />
                  <p className="mt-3 text-3xl font-bold text-foreground">{totalTopicos}</p>
                  <p className="text-sm text-muted-foreground">Tópicos Estudáveis</p>
                </div>
              </>
            )}
            {stars !== null && (
              <div className="border border-border bg-card p-6 text-center">
                <Star className="mx-auto h-6 w-6 text-primary" />
                <p className="mt-3 text-3xl font-bold text-foreground">{stars}</p>
                <p className="text-sm text-muted-foreground">Estrelas no GitHub</p>
              </div>
            )}
          </div>
        )}

        <p className="mt-12 text-center text-sm text-muted-foreground">
          És professor?{" "}
          <Link href="/sobre" className="font-semibold text-primary hover:underline">
            Integra estes manuais na tua disciplina
          </Link>
          .
        </p>
      </div>
    </section>
  )
}
