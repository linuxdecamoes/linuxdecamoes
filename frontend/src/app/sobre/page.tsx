import type { Metadata } from "next"
import Link from "next/link"
import {
  Target,
  Users,
  Leaf,
  Layers,
  BookOpen,
  Shield,
  GitPullRequest,
  CheckCircle2,
} from "lucide-react"
import { LandingHeader } from "@/components/landing-header"
import { LandingFooter } from "@/components/landing-footer"
import { GithubIcon } from "@/components/hero-section"

export const metadata: Metadata = {
  title: "Sobre — Linux de Camões",
  description:
    "Conhece o projeto Linux de Camões: plataforma open-source de aprendizagem de Linux, baseada nos manuais oficiais de certificação LPI.",
  openGraph: {
    title: "Sobre — Linux de Camões",
    description:
      "Plataforma open-source de aprendizagem de Linux com IA interativa.",
    type: "website",
  },
}

const missionCards = [
  {
    icon: Target,
    title: "Missão",
    description:
      "Preparar qualquer pessoa para os exames de certificação do LPI e outras entidades reconhecidas, com conteúdo baseado nos manuais oficiais.",
    color: "var(--primary)",
  },
  {
    icon: Users,
    title: "Público",
    description:
      "Estudantes universitários, professores, profissionais de TI e qualquer pessoa que queira aprender ou dominar sistemas Linux.",
    color: "var(--accent)",
  },
  {
    icon: Leaf,
    title: "Filosofia",
    description:
      "100% open-source sob licença MIT. Custo zero para todos os participantes. Desenvolvido pela comunidade, para a comunidade.",
    color: "var(--sage)",
  },
]

const stackData = [
  { category: "Frontend", tech: "Next.js 16 + React 19", active: true, description: "App Router, Turbopack, Server Components" },
  { category: "Frontend", tech: "Tailwind CSS v4 + shadcn/ui", active: true, description: "Design system OKLCH, Bento Grid" },
  { category: "Frontend", tech: "Clerk", active: true, description: "Autenticação JWT, tier grátis 10k MAU" },
  { category: "Frontend", tech: "IBM Plex Sans/Mono", active: true, description: "Tipografia profissional" },
  { category: "Backend", tech: "FastAPI + Uvicorn", active: true, description: "API REST assíncrona (ASGI)" },
  { category: "Backend", tech: "PostgreSQL 16 + SQLAlchemy 2.0", active: true, description: "ORM async, Alembic migrations" },
  { category: "Backend", tech: "pgvector", active: false, description: "Armazenamento vetorial integrado (futuro)" },
  { category: "IA / ML", tech: "PyTorch 2.6 + sentence-transformers", active: true, description: "Embeddings multilíngues (384 dims)" },
  { category: "IA / ML", tech: "FAISS", active: true, description: "Busca vetorial por similaridade" },
  { category: "IA / ML", tech: "Groq API + OpenAI GPT-OSS 20B", active: true, description: "Inferência cloud para RAG" },
  { category: "IA / ML", tech: "Algoritmo SM-2", active: true, description: "Repetição espaçada nos quizzes" },
  { category: "DevOps", tech: "Docker + Docker Compose", active: true, description: "Containerização e orquestração local" },
  { category: "DevOps", tech: "Kubernetes (K8s)", active: false, description: "Pods efémeros para sandboxes por utilizador" },
  { category: "DevOps", tech: "xterm.js + WebSockets", active: false, description: "Terminal Linux real no browser" },
  { category: "DevOps", tech: "Redis", active: false, description: "Cache de sessões e dados em tempo real" },
]

export default function SobrePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingHeader />

      <main className="flex-1">
        {/* Hero */}
        <section
          className="relative overflow-hidden border-b py-24 sm:py-32"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
          <div
            className="absolute inset-0"
            style={{
              background: "radial-gradient(ellipse at 70% 20%, oklch(0.55 0.20 260 / 0.06), transparent 60%)",
            }}
          />
          <div className="relative mx-auto max-w-4xl px-4 text-center">
            <div
              className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--card)", color: "var(--muted-foreground)" }}
            >
              <Shield className="h-3.5 w-3.5" style={{ color: "var(--primary)" }} />
              Open Source · MIT License · PT-PT
            </div>
            <h1
              className="text-4xl font-bold tracking-tight sm:text-5xl"
              style={{ color: "var(--foreground)" }}
            >
              O Linux de Camões
            </h1>
            <p
              className="mx-auto mt-6 max-w-3xl text-lg leading-8"
              style={{ color: "var(--muted-foreground)" }}
            >
              Num trocadilho com o nome do nosso poeta e autor de grandes obras e
              feitos, Luís de Camões — o <strong style={{ color: "var(--foreground)" }}>Linux de Camões</strong> é
              uma plataforma open-source focada na aprendizagem e domínio de
              sistemas operativos Linux, totalmente em língua portuguesa (PT-PT).
            </p>
          </div>
        </section>

        {/* Missão / Público / Filosofia */}
        <section className="mx-auto max-w-6xl px-4 py-24">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {missionCards.map((card) => (
              <div
                key={card.title}
                className="bento-card relative rounded-2xl border p-6"
                style={{ borderColor: "var(--border)", backgroundColor: "var(--background-card)" }}
              >
                <div className="mb-3 flex items-center gap-2">
                  <card.icon className="h-5 w-5" style={{ color: card.color }} />
                  <h3 className="font-semibold" style={{ color: "var(--foreground)" }}>
                    {card.title}
                  </h3>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Stack Tecnológica — dark band, same as landing */}
        <section
          id="stack"
          className="py-24"
          style={{ backgroundColor: "var(--card-dark)" }}
        >
          <div className="mx-auto max-w-6xl px-4">
            <div className="mb-12 text-center">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Stack Tecnológica
              </h2>
              <p className="mt-3 text-sm text-white/60">
                Mais de 15 tecnologias ativas num ecossistema robusto
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border" style={{ borderColor: "oklch(1 0 0 / 0.1)" }}>
              <table className="w-full text-sm">
                <caption className="sr-only">
                  Stack tecnológica do projeto Linux de Camões
                </caption>
                <thead>
                  <tr className="border-b" style={{ borderColor: "oklch(1 0 0 / 0.1)" }}>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-white">Categoria</th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-white">Tecnologia</th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-white">Estado</th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-white">Descrição</th>
                  </tr>
                </thead>
                <tbody>
                  {stackData.map((row, i) => (
                    <tr
                      key={row.tech}
                      className="border-b last:border-0"
                      style={{
                        borderColor: "oklch(1 0 0 / 0.06)",
                        backgroundColor: i % 2 === 1 ? "oklch(1 0 0 / 0.03)" : "transparent",
                      }}
                    >
                      <td className="px-4 py-3 font-medium text-white">{row.category}</td>
                      <td className="px-4 py-3 font-mono text-white/80">{row.tech}</td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                          style={{
                            backgroundColor: row.active ? "oklch(0.85 0.08 150 / 0.2)" : "oklch(0.80 0.10 80 / 0.2)",
                            color: row.active ? "#86efac" : "#fcd34d",
                          }}
                        >
                          {row.active ? "Ativo" : "Planeado"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white/60">{row.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Contribuir — community card, same as landing */}
        <section
          id="comunidade"
          className="border-t py-24"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--background)" }}
        >
          <div className="mx-auto max-w-4xl px-4">
            <div className="relative overflow-hidden rounded-3xl bg-white p-8 shadow-xl sm:p-12">
              <GithubIcon
                className="absolute -right-8 -top-8 h-64 w-64 opacity-[0.03]"
                style={{ color: "var(--foreground)" }}
              />

              <div className="relative">
                <span
                  className="inline-block rounded-full px-3 py-1 text-xs font-semibold"
                  style={{ backgroundColor: "var(--primary)", color: "white" }}
                >
                  Licença MIT
                </span>

                <h2
                  className="mt-6 text-2xl font-bold sm:text-3xl"
                  style={{ color: "var(--foreground)" }}
                >
                  Desenvolvido pela Comunidade.
                  <br />
                  Para a Comunidade.
                </h2>

                <p
                  className="mt-4 max-w-xl text-base leading-relaxed"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Esta plataforma não existe sem a tua ajuda. Se sabes Linux,
                  contribui com código, traduções ou novos quizzes. Se estás a
                  aprender, usa e partilha com outros estudantes. Juntos
                  construímos algo que nenhum curso pago consegue dar.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <a
                    href="https://github.com/linuxdecamoes"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-colors"
                    style={{ backgroundColor: "var(--card-dark)", color: "white" }}
                  >
                    <GithubIcon className="h-4 w-4" />
                    Repositório no GitHub
                  </a>
                  <Link
                    href="/manuals"
                    className="inline-flex items-center gap-2 rounded-lg border px-6 py-3 text-sm font-semibold transition-colors hover:bg-black/5"
                    style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                  >
                    <BookOpen className="h-4 w-4" />
                    Explorar Manuais
                  </Link>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium"
                    style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
                  >
                    <GitPullRequest className="h-3.5 w-3.5" />
                    Pull Requests Bem-Vindos
                  </span>
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium"
                    style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Issues Respondidas Ativamente
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  )
}
