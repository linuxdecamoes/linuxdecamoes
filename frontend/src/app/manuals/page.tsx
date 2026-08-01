import type { Metadata } from "next"
import Link from "next/link"
import {
  BookOpen,
  GraduationCap,
  Brain,
  Terminal,
  ArrowRight,
  Compass,
  CheckCircle2,
  Lock,
} from "lucide-react"
import { manuals } from "@/lib/manuals"
import { ManualsExplorer } from "@/components/manuals/manuals-explorer"

export const metadata: Metadata = {
  title: "Manuais LPI",
  description:
    "114 tópicos dos manuais oficiais do Linux Professional Institute (LPI), traduzidos, enriquecidos e pesquisáveis com inteligência artificial. Estuda Linux Essentials e LPIC-1 em português europeu.",
  keywords: [
    "manuais LPI", "Linux Essentials", "LPIC-1", "certificação Linux",
    "tópicos Linux", "estudo Linux", "manuais oficiais LPI", "PT-PT",
  ],
  robots: { index: true, follow: true },
  alternates: { canonical: "/manuals" },
  openGraph: {
    title: "Manuais LPI — Linux de Camões",
    description:
      "114 tópicos dos manuais oficiais do Linux Professional Institute (LPI), traduzidos e pesquisáveis com IA.",
    type: "website",
    locale: "pt_PT",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Manuais LPI" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Manuais LPI — Linux de Camões",
    description:
      "114 tópicos dos manuais oficiais LPI, traduzidos e pesquisáveis com IA.",
    images: ["/opengraph-image"],
  },
}

export default function ManualsPage() {
  const totalTopics = manuals.reduce((sum, m) => sum + m.topics.length, 0)
  const essentials = manuals.filter((m) => m.level === "essentials")
  const lpic1 = manuals.filter((m) => m.level === "lpic1")
  const essentialsTopics = essentials.reduce((sum, m) => sum + m.topics.length, 0)
  const lpic1Topics = lpic1.reduce((sum, m) => sum + m.topics.length, 0)

  const stats = [
    { value: String(totalTopics), label: "Tópicos" },
    { value: String(manuals.length), label: "Manuais" },
    { value: "2", label: "Níveis de Certificação" },
    { value: "100%", label: "Open Source" },
  ]

  const roadmap = [
    {
      phase: "Fase 1",
      title: "Essentials",
      description: "Fundamentos de Linux, segurança, web e open source para todos os utilizadores.",
      count: `${essentials.length} manuais · ${essentialsTopics} tópicos`,
      status: "available" as const,
    },
    {
      phase: "Fase 2",
      title: "LPIC-1",
      description: "Certificação profissional de administração de sistemas Linux (nível júnior).",
      count: `${lpic1.length} manuais · ${lpic1Topics} tópicos`,
      status: "available" as const,
    },
    {
      phase: "Fase 3",
      title: "LPIC-2",
      description: "Administração avançada — redes, segurança e otimização de sistemas.",
      count: "Em planeamento",
      status: "soon" as const,
    },
  ]

  const steps = [
    {
      icon: Compass,
      title: "1. Escolhe um manual",
      description: "Navega pelos 6 manuais e escolhe o tema que queres dominar.",
    },
    {
      icon: BookOpen,
      title: "2. Estuda os tópicos",
      description: "Cada manual tem tópicos detalhados com exemplos práticos e comandos reais.",
    },
    {
      icon: Brain,
      title: "3. Testa com quizzes",
      description: "Repetição espaçada SM-2 que te ajuda a fixar conhecimento a longo prazo.",
    },
    {
      icon: Terminal,
      title: "4. Pratica no Lab",
      description: "Terminal real em pods Kubernetes para aplicar o que aprendeste. (em breve)",
    },
  ]

  return (
    <>
      <section
        className="relative overflow-hidden border-b border-border"
        style={{ background: "var(--gradient-warm)" }}
      >
        <div
          className="absolute left-[8%] top-[15%] h-[350px] w-[350px] rounded-full blur-[120px]"
          style={{ backgroundColor: "var(--primary)", opacity: 0.05 }}
          aria-hidden
        />
        <div
          className="absolute right-[10%] top-[30%] h-[280px] w-[280px] rounded-full blur-[100px]"
          style={{ backgroundColor: "var(--accent)", opacity: 0.04 }}
          aria-hidden
        />
        <div className="dot-pattern absolute inset-0 opacity-20" aria-hidden />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground">
              <BookOpen className="h-3.5 w-3.5" aria-hidden />
              Manuais oficiais LPI em português
            </span>

            <h1
              className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
              style={{ animation: "slideUp 0.6s ease-out 0.1s both" }}
            >
              Manuais LPI
            </h1>

            <p
              className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted-foreground"
              style={{ animation: "slideUp 0.6s ease-out 0.2s both" }}
            >
              {totalTopics} tópicos dos manuais oficiais do Linux Professional Institute,
              traduzidos, enriquecidos e pesquisáveis com inteligência artificial.
            </p>

            <div
              className="mx-auto mt-8 flex max-w-2xl flex-wrap items-center justify-center gap-3"
              style={{ animation: "slideUp 0.6s ease-out 0.3s both" }}
            >
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="flex min-w-[7rem] flex-col items-center rounded-2xl border border-border bg-card/80 px-5 py-3 text-center backdrop-blur-sm"
                >
                  <span className="text-2xl font-bold text-foreground">{s.value}</span>
                  <span className="mt-0.5 text-xs text-muted-foreground">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl flex-1 px-4 py-16">
        <ManualsExplorer manuals={manuals} />
      </section>

      <section className="border-t border-border bg-card/40">
        <div className="mx-auto max-w-5xl px-4 py-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              O teu percurso de certificação
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Do iniciante ao profissional — um caminho estruturado para dominares Linux.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {roadmap.map((phase, i) => (
              <div key={phase.phase} className="relative">
                {i < roadmap.length - 1 && (
                  <div
                    className="absolute left-full top-1/2 hidden h-px w-6 -translate-y-1/2 bg-border md:block"
                    aria-hidden
                  />
                )}
                <div
                  className={`glass-card h-full rounded-3xl p-6 ${
                    phase.status === "soon" ? "opacity-60" : ""
                  }`}
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
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {phase.description}
                  </p>
                  <p className="mt-4 text-xs font-medium text-terracotta">{phase.count}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto max-w-5xl px-4 py-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              Como funciona
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Quatro passos para transformar teoria em prática.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div
                key={step.title}
                className="glass-card rounded-3xl p-6 text-center"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                  <step.icon className="h-6 w-6 text-primary" aria-hidden />
                </div>
                <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-all hover:scale-[1.02] hover:shadow-lg"
              style={{ backgroundColor: "var(--card-dark)", color: "white" }}
            >
              <GraduationCap className="h-4 w-4" />
              Começar a Aprender
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
