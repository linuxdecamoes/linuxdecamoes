import type { Metadata } from "next"
import Link from "next/link"
import {
  Brain,
  Timer,
  Users,
  Terminal,
  Award,
  BookOpen,
  GitPullRequest,
  CheckCircle2,
} from "lucide-react"
import { LandingHeader } from "@/components/landing-header"
import { LandingFooter } from "@/components/landing-footer"
import { HeroSection } from "@/components/hero-section"
import { GithubIcon } from "@/components/hero-section"

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

function DiscordIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style} aria-hidden="true">
      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
    </svg>
  )
}

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingHeader />

      <main className="flex-1">
        <h1 className="sr-only">
          Domine Sistemas Linux — SysAdmin, DevOps, Cloud Native, Segurança.
        </h1>
        <HeroSection />

        {/* Bento Grid */}
        <section id="lpi" className="mx-auto max-w-6xl px-4 py-24">
          <h2
            className="mb-4 text-center text-2xl font-bold sm:text-3xl"
            style={{ color: "var(--foreground)" }}
          >
            Navegue nos Mares do Conhecimento
          </h2>
          <p
            className="mb-12 text-center text-base"
            style={{ color: "var(--muted-foreground)" }}
          >
            Tudo o que precisa para dominar Linux — num só lugar.
          </p>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-12 auto-rows-[minmax(180px,auto)]">
            {/* Manuais Oficiais */}
            <div
              className="bento-card relative rounded-2xl border p-6 sm:col-span-2 lg:col-span-8"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--background-card)",
              }}
            >
              <div className="mb-3 flex items-center gap-2">
                <Award className="h-5 w-5" style={{ color: "var(--primary)" }} />
                <h3 className="font-semibold" style={{ color: "var(--foreground)" }}>
                  Manuais Oficiais
                </h3>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                Estuda diretamente dos manuais oficiais — 114 tópicos organizados,
                pesquisáveis e em português. Sem necessidade de comprar livros ou
                navegar entre PDFs avulsos.
              </p>
              <BookOpen
                className="absolute bottom-4 right-4 h-16 w-16 opacity-5"
                style={{ color: "var(--primary)" }}
              />
            </div>

            {/* Motor RAG */}
            <div
              className="bento-card rounded-2xl border p-6 lg:col-span-4"
              style={{
                borderColor: "var(--card-dark)",
                backgroundColor: "var(--card-dark)",
                color: "white",
              }}
            >
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
            <div
              className="bento-card rounded-2xl border p-6 lg:col-span-4"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--background-card)",
              }}
            >
              <div className="mb-3 flex items-center gap-2">
                <Timer className="h-5 w-5" style={{ color: "var(--primary)" }} />
                <h3 className="font-semibold" style={{ color: "var(--foreground)" }}>
                  Quizzes SM-2
                </h3>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                Fixa o que aprendeste com quizzes inteligentes — o sistema adapta-se
                ao teu ritmo e volta a perguntar nos dias certos para não esqueceres
                nada antes do exame.
              </p>
            </div>

            {/* Apoio Universitário */}
            <div
              className="bento-card rounded-2xl border p-6 lg:col-span-4"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--background-card)",
              }}
            >
              <div className="mb-3 flex items-center gap-2">
                <Users className="h-5 w-5" style={{ color: "var(--primary)" }} />
                <h3 className="font-semibold" style={{ color: "var(--foreground)" }}>
                  Apoio Universitário
                </h3>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                Professores podem integrar a plataforma nas suas disciplinas e alunos
                podem estudar juntos — o projeto cresce com a participação de
                quem ensina e de quem aprende.
              </p>
            </div>

            {/* Labs K8s */}
            <div
              className="bento-card rounded-2xl border border-dashed p-6 lg:col-span-4"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--secondary)",
              }}
            >
              <div className="mb-3 flex items-center gap-2">
                <Terminal className="h-5 w-5" style={{ color: "var(--muted-foreground)" }} />
                <h3 className="font-semibold" style={{ color: "var(--foreground)" }}>
                  Labs Kubernetes
                </h3>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                Prática comandos reais num ambiente isolado — sem medo de quebrar
                nada. Ideal para quem quer ganhar confiança antes de tocar num
                servidor de produção.
              </p>
              <span
                className="mt-3 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
                style={{ backgroundColor: "var(--secondary)", color: "var(--muted-foreground)" }}
              >
                Em breve
              </span>
            </div>
          </div>
        </section>

        {/* Stack Tecnológica */}
        <section
          id="stack"
          className="py-24"
          style={{ backgroundColor: "var(--card-dark)" }}
        >
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="mb-12 text-center text-2xl font-bold text-white sm:text-3xl">
              Uma Arquitetura de Excelência
            </h2>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: "Frontend",
                  icon: "🎨",
                  color: "var(--primary)",
                  items: ["Next.js 16", "React 19", "Tailwind v4", "shadcn/ui"],
                },
                {
                  title: "Backend",
                  icon: "⚙️",
                  color: "#22c55e",
                  items: ["FastAPI", "SQLAlchemy", "PostgreSQL", "Alembic"],
                },
                {
                  title: "IA / ML",
                  icon: "🧠",
                  color: "#a855f7",
                  items: ["FAISS", "Groq", "sentence-transformers", "RAG"],
                },
                {
                  title: "DevOps",
                  icon: "🚀",
                  color: "var(--primary)",
                  items: ["Kubernetes", "Docker", "CI/CD", "WebSockets"],
                },
              ].map((col) => (
                <div key={col.title}>
                  <div className="mb-4 flex items-center gap-2 border-b pb-3" style={{ borderColor: "oklch(1 0 0 / 0.1)" }}>
                    <span className="text-xl">{col.icon}</span>
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
                  <a
                    href="#"
                    className="inline-flex items-center gap-2 rounded-lg border px-6 py-3 text-sm font-semibold transition-colors hover:bg-black/5"
                    style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                  >
                    <DiscordIcon className="h-4 w-4" />
                    Juntar ao Discord
                  </a>
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
