import type { Metadata } from "next"
import {
  Brain,
  Timer,
  Users,
  Terminal,
  Award,
  BookOpen,
  GitPullRequest,
  CheckCircle2,
  Palette,
  Server,
  Sparkles,
  Rocket,
  Layers,
  Star,
} from "lucide-react"
import { LandingHeader } from "@/components/landing-header"
import { LandingFooter } from "@/components/landing-footer"
import { HeroSection } from "@/components/hero-section"
import { GithubIcon } from "@/components/icons"
import { getManuals } from "@/lib/api"

export const metadata: Metadata = {
  title: "Domine Sistemas Linux com IA Interativa",
  description:
    "A plataforma de aprendizagem de Linux baseada nos manuais oficiais. Estuda, pratica e prepara-te para os exames de certificação LPI com IA interativa e quizzes inteligentes.",
  openGraph: {
    title: "Linux de Camões — Plataforma de Aprendizagem de Linux",
    description:
      "A plataforma de aprendizagem de Linux baseada nos manuais oficiais. Do universo ao marketplace — uma ponte entre formação certificada e experiência real.",
    type: "website",
  },
}

const STACK_COLUMNS = [
  {
    title: "Frontend",
    icon: Palette,
    color: "var(--primary)",
    items: ["Next.js 16", "React 19", "Tailwind v4", "shadcn/ui"],
  },
  {
    title: "Backend",
    icon: Server,
    color: "var(--coral)",
    items: ["FastAPI", "SQLAlchemy", "PostgreSQL", "Alembic"],
  },
  {
    title: "IA / ML",
    icon: Sparkles,
    color: "var(--amber)",
    items: ["FAISS", "Groq", "sentence-transformers", "RAG"],
  },
  {
    title: "DevOps",
    icon: Rocket,
    color: "var(--primary)",
    items: ["Kubernetes", "Docker", "CI/CD", "WebSockets"],
  },
]

async function getStats() {
  const [manualsResult, githubResult] = await Promise.allSettled([
    getManuals(),
    fetch("https://api.github.com/repos/linuxdecamoes/linuxdecamoes", {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: 3600 },
    }).then((res) => (res.ok ? res.json() : null)),
  ])

  const manuals = manualsResult.status === "fulfilled" ? manualsResult.value : []
  const totalManuais = manuals.length
  const totalTopicos = manuals.reduce((sum, m) => sum + (m.total_topics ?? 0), 0)
  const stars =
    githubResult.status === "fulfilled" && githubResult.value
      ? (githubResult.value.stargazers_count as number)
      : null

  return { totalManuais, totalTopicos, stars }
}

export default async function Home() {
  const stats = await getStats()
  const hasManualStats = stats.totalManuais > 0

  return (
    <div className="flex min-h-screen flex-col">
      <LandingHeader />

      <main className="flex-1">
        <HeroSection />

        {/* Bento Grid */}
        <section id="lpi" className="mx-auto max-w-6xl px-4 py-24">
          <h2 className="mb-4 text-center text-2xl font-bold text-foreground sm:text-3xl">
            Navegue nos Mares do Conhecimento
          </h2>
          <p className="mb-12 text-center text-base text-muted-foreground">
            Tudo o que precisa para dominar Linux — num só lugar.
          </p>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-12 auto-rows-[minmax(180px,auto)]">
            {/* Manuais Oficiais */}
            <div className="bento-card relative border border-border bg-card p-6 sm:col-span-2 lg:col-span-8">
              <div className="mb-3 flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">
                  Manuais Oficiais
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Estuda diretamente dos manuais oficiais — 114 tópicos organizados,
                pesquisáveis e em português. Sem necessidade de comprar livros ou
                navegar entre PDFs avulsos.
              </p>
              <BookOpen className="absolute bottom-4 right-4 h-16 w-16 text-primary opacity-5" />
            </div>

            {/* Motor RAG */}
            <div className="bento-card border border-card-dark bg-card-dark p-6 text-white lg:col-span-4">
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

            {/* SM-2 Quizzes */}
            <div className="bento-card border border-border bg-card p-6 lg:col-span-4">
              <div className="mb-3 flex items-center gap-2">
                <Timer className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">
                  Quizzes SM-2
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Fixa o que aprendeste com quizzes inteligentes — o sistema adapta-se
                ao teu ritmo e volta a perguntar nos dias certos para não esqueceres
                nada antes do exame.
              </p>
            </div>

            {/* Apoio Universitário */}
            <div className="bento-card border border-border bg-card p-6 lg:col-span-4">
              <div className="mb-3 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">
                  Apoio Universitário
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Professores podem integrar a plataforma nas suas disciplinas e alunos
                podem estudar juntos — o projeto cresce com a participação de
                quem ensina e de quem aprende.
              </p>
            </div>

            {/* Labs K8s */}
            <div className="bento-card border border-dashed border-border bg-secondary p-6 lg:col-span-4">
              <div className="mb-3 flex items-center gap-2">
                <Terminal className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold text-foreground">
                  Labs Kubernetes
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Prática comandos reais num ambiente isolado — sem medo de quebrar
                nada. Ideal para quem quer ganhar confiança antes de tocar num
                servidor de produção.
              </p>
              <span className="mt-3 inline-block rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                Em breve
              </span>
            </div>
          </div>
        </section>

        {/* Prova Social */}
        {(hasManualStats || stats.stars !== null) && (
          <section className="mx-auto max-w-6xl px-4 pb-24">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {hasManualStats && (
                <>
                  <div className="border border-border bg-card p-6 text-center">
                    <Layers className="mx-auto h-6 w-6 text-primary" />
                    <p className="mt-3 text-3xl font-bold text-foreground">
                      {stats.totalManuais}
                    </p>
                    <p className="text-sm text-muted-foreground">Manuais Oficiais</p>
                  </div>
                  <div className="border border-border bg-card p-6 text-center">
                    <BookOpen className="mx-auto h-6 w-6 text-primary" />
                    <p className="mt-3 text-3xl font-bold text-foreground">
                      {stats.totalTopicos}
                    </p>
                    <p className="text-sm text-muted-foreground">Tópicos Estudáveis</p>
                  </div>
                </>
              )}
              {stats.stars !== null && (
                <div className="border border-border bg-card p-6 text-center">
                  <Star className="mx-auto h-6 w-6 text-primary" />
                  <p className="mt-3 text-3xl font-bold text-foreground">
                    {stats.stars}
                  </p>
                  <p className="text-sm text-muted-foreground">Estrelas no GitHub</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Stack Tecnológica */}
        <section id="stack" className="bg-card-dark py-24">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="mb-12 text-center text-2xl font-bold text-white sm:text-3xl">
              Uma Arquitetura de Excelência
            </h2>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {STACK_COLUMNS.map((col) => (
                <div key={col.title}>
                  <div className="mb-4 flex items-center gap-2 border-b pb-3" style={{ borderColor: "oklch(1 0 0 / 0.1)" }}>
                    <col.icon className="h-5 w-5" style={{ color: col.color }} />
                    <h3 className="font-semibold text-white">{col.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {col.items.map((item) => (
                      <li key={item} className="font-mono text-sm text-white/60">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comunidade */}
        <section id="comunidade" className="border-t border-border bg-background py-24">
          <div className="mx-auto max-w-4xl px-4">
            <div className="relative overflow-hidden border border-border bg-card p-8 sm:p-12">
              <GithubIcon className="absolute -right-8 -top-8 h-64 w-64 text-foreground opacity-[0.03]" />

              <div className="relative">
                <span className="inline-block rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
                  Licença MIT
                </span>

                <h2 className="mt-6 text-2xl font-bold text-foreground sm:text-3xl">
                  Desenvolvido pela Comunidade.
                  <br />
                  Para a Comunidade.
                </h2>

                <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
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
                    className="inline-flex items-center gap-2 rounded-lg bg-card-dark px-6 py-3 text-sm font-semibold text-white transition-colors"
                  >
                    <GithubIcon className="h-4 w-4" />
                    Repositório no GitHub
                  </a>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
                    <GitPullRequest className="h-3.5 w-3.5" />
                    Pull Requests Bem-Vindos
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
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
