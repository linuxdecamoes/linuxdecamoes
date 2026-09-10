# Homepage — Reescrita "Aprender → Praticar → Certificar" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reescrever a homepage (`src/app/page.tsx`) para vender aprendizagem de Linux a "qualquer pessoa", removendo a secção de stack técnica e reduzindo a secção de comunidade, organizando o conteúdo numa jornada de 3 etapas: Aprender → Praticar → Certificar.

**Architecture:** A homepage atual concentra tudo num único ficheiro grande (`page.tsx`, ~310 linhas) com um array de stack tecnológica embutido. Este plano extrai cada etapa da jornada para o seu próprio Server Component em `src/components/` (seguindo a convenção já usada por `hero-section.tsx`, `landing-footer.tsx` — ficheiros planos, sem subpastas), e `page.tsx` passa a ser apenas composição dessas secções + a lógica de fetch de estatísticas que já existe.

**Tech Stack:** Next.js 16 (App Router, Server Components), React 19, Tailwind CSS v4 (tokens `var(--...)`), lucide-react para ícones.

**Nota sobre verificação:** este projeto não tem suite de testes automatizados para componentes React (`package.json` só define `dev`/`build`/`start`/`lint`). Em vez de testes unitários, cada tarefa é verificada com `npm run lint` e, na tarefa final, uma passagem visual no browser via `preview_start` — o mesmo padrão usado nas specs anteriores deste repositório (ex.: `docs/superpowers/specs/2026-07-24-sobre-page-design.md`).

---

## Mapa de Ficheiros

- **Modificar:** `frontend/src/components/hero-section.tsx` — novo H1/subtítulo, troca CTA "git clone --contribuir" por "Criar Conta", CTA principal passa a "Ver Manuais".
- **Criar:** `frontend/src/components/learn-section.tsx` — secção "Aprender" (prévia real de manuais + card do motor RAG).
- **Criar:** `frontend/src/components/practice-section.tsx` — secção "Praticar" (quizzes SM-2 + Labs Kubernetes).
- **Criar:** `frontend/src/components/certify-section.tsx` — secção "Certificar" (roadmap + stats + nota para educadores).
- **Criar:** `frontend/src/components/community-section.tsx` — secção "Comunidade" reduzida.
- **Modificar:** `frontend/src/app/page.tsx` — remove bento grid antigo, stack tecnológica, prova social e comunidade extensa; compõe as 4 novas secções.

Cada secção é um ficheiro isolado com uma única responsabilidade (uma etapa da jornada), sem estado partilhado entre si — `CertifySection` recebe `totalManuais`/`totalTopicos`/`stars` como props porque só `page.tsx` (Server Component) faz o fetch dos dados.

---

### Task 1: Reescrever o Hero (`hero-section.tsx`)

**Files:**
- Modify: `frontend/src/components/hero-section.tsx`

- [ ] **Step 1: Substituir o conteúdo do ficheiro**

Substitui todo o conteúdo de `frontend/src/components/hero-section.tsx` por:

```tsx
import Link from "next/link"
import { BookOpen, GraduationCap } from "lucide-react"

export function HeroSection() {
  return (
    <section id="projeto" className="relative overflow-hidden border-b border-border bg-background">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-20 sm:py-28 lg:grid-cols-[minmax(0,26rem)_1fr] lg:gap-16 lg:py-32">
        <div>
          <p
            className="font-mono text-xs uppercase tracking-[0.2em] text-primary"
            style={{ animation: "slideUp 0.6s ease-out 0s both" }}
          >
            $ cat /etc/motto
          </p>

          <h1
            className="mt-4 font-heading text-4xl font-bold leading-tight text-foreground sm:text-5xl"
            style={{ animation: "slideUp 0.6s ease-out 0.1s both" }}
          >
            Aprende Linux, ao teu ritmo,
            <br />
            em português.
          </h1>

          <p
            className="mt-6 max-w-md text-base leading-7 text-muted-foreground"
            style={{ animation: "slideUp 0.6s ease-out 0.2s both" }}
          >
            Não precisas de saber nada de antemão. Estuda pelos manuais
            oficiais, pratica com quizzes inteligentes e, se quiseres,
            prepara-te para a certificação LPI.
          </p>

          <div
            className="mt-8 flex flex-col gap-3 sm:flex-row"
            style={{ animation: "slideUp 0.6s ease-out 0.3s both" }}
          >
            <Link
              href="/manuals"
              className="inline-flex items-center gap-2 border border-primary bg-primary px-6 py-3 font-mono text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <BookOpen className="h-4 w-4" />
              $ ver --manuais
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 border border-border px-6 py-3 font-mono text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <GraduationCap className="h-4 w-4" />
              $ criar --conta
            </Link>
          </div>
        </div>

        <div
          className="hero-grid-bg relative h-72 overflow-hidden border border-border bg-card-dark sm:h-96 lg:h-[26rem] lg:w-[calc(100%+4rem)] lg:justify-self-end"
          aria-hidden="true"
        >
          <div className="relative z-10 flex h-full flex-col justify-center gap-3 px-6 font-mono text-sm text-white/80">
            <div style={{ animation: "float 3s ease-in-out infinite" }}>$ uname -a</div>
            <div className="text-primary" style={{ animation: "float 3s ease-in-out infinite 0.6s" }}>
              Linux camoes 6.8.0 x86_64 GNU/Linux
            </div>
            <div style={{ animation: "float 3s ease-in-out infinite 1.2s" }}>
              $ systemctl status linux-de-camoes
            </div>
            <div className="text-primary" style={{ animation: "float 3s ease-in-out infinite 1.8s" }}>
              ● active (learning)
            </div>
            <div className="text-white/40">
              <span style={{ animation: "blink 1s step-end infinite" }}>_</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
```

Nota: `GithubIcon` deixa de ser usado aqui — o link para o GitHub passa a viver só na `CommunitySection` (Task 5). O slider animado de palavras ("SysAdmin. DevOps. Cloud Native. Segurança.") sai porque comunicava um público de carreira técnica específico, contrariando a decisão de público amplo ("qualquer pessoa que queira aprender Linux").

- [ ] **Step 2: Lint**

Run: `cd frontend && npm run lint`
Expected: sem erros novos relacionados com `hero-section.tsx` (pode haver avisos pré-existentes noutros ficheiros, ignora-os).

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/hero-section.tsx
git commit -m "feat(home): reescreve hero para publico amplo, CTAs Ver Manuais/Criar Conta"
```

---

### Task 2: Criar a secção "Aprender" (`learn-section.tsx`)

**Files:**
- Create: `frontend/src/components/learn-section.tsx`

- [ ] **Step 1: Criar o ficheiro**

```tsx
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
```

Os 4 pares `code`/`slug` de `PREVIEW_TOPICS` já foram confirmados contra `frontend/src/lib/manuals.ts` (existem de facto) — os títulos exibidos vêm sempre de `getManual()`, nunca são escritos à mão, por isso não podem divergir dos dados reais nem apontar para uma rota inexistente.

- [ ] **Step 2: Lint**

Run: `cd frontend && npm run lint`
Expected: sem erros novos.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/learn-section.tsx
git commit -m "feat(home): cria seccao Aprender com previa real de manuais"
```

---

### Task 3: Criar a secção "Praticar" (`practice-section.tsx`)

**Files:**
- Create: `frontend/src/components/practice-section.tsx`

- [ ] **Step 1: Criar o ficheiro**

```tsx
import { Terminal, Timer } from "lucide-react"

export function PracticeSection() {
  return (
    <section id="praticar" className="border-t border-border bg-card/40 py-24">
      <div className="mx-auto max-w-6xl px-4">
        <p className="mb-4 text-center font-mono text-xs uppercase tracking-[0.2em] text-primary">
          $ ./quiz --run
        </p>
        <h2 className="mb-4 text-center font-heading text-2xl font-bold text-foreground sm:text-3xl">
          Pratica o que aprendeste
        </h2>
        <p className="mb-12 text-center text-base text-muted-foreground">
          Teoria sem prática esquece-se depressa — por isso a plataforma ajuda-te a fixar e a aplicar.
        </p>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="border border-border bg-card p-6">
            <div className="mb-3 flex items-center gap-2">
              <Timer className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">Quizzes SM-2</h3>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Fixa o que aprendeste com quizzes inteligentes — o sistema adapta-se
              ao teu ritmo e volta a perguntar nos dias certos para não esqueceres
              nada antes do exame.
            </p>
          </div>

          <div className="border border-dashed border-border bg-secondary p-6">
            <div className="mb-3 flex items-center gap-2">
              <Terminal className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold text-foreground">Labs Kubernetes</h3>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Pratica comandos reais num ambiente isolado — sem medo de quebrar
              nada. Ideal para quem quer ganhar confiança antes de tocar num
              servidor de produção.
            </p>
            <span className="mt-3 inline-block border border-border px-2.5 py-0.5 font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Em breve
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Lint**

Run: `cd frontend && npm run lint`
Expected: sem erros novos.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/practice-section.tsx
git commit -m "feat(home): cria seccao Praticar com quizzes SM-2 e labs"
```

---

### Task 4: Criar a secção "Certificar" (`certify-section.tsx`)

**Files:**
- Create: `frontend/src/components/certify-section.tsx`

- [ ] **Step 1: Criar o ficheiro**

```tsx
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
```

- [ ] **Step 2: Lint**

Run: `cd frontend && npm run lint`
Expected: sem erros novos.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/certify-section.tsx
git commit -m "feat(home): cria seccao Certificar consolidando roadmap e stats"
```

---

### Task 5: Criar a secção "Comunidade" reduzida (`community-section.tsx`)

**Files:**
- Create: `frontend/src/components/community-section.tsx`

- [ ] **Step 1: Criar o ficheiro**

```tsx
import { GithubIcon } from "@/components/icons"

export function CommunitySection() {
  return (
    <section id="comunidade" className="border-t border-border bg-background py-24">
      <div className="mx-auto max-w-4xl px-4">
        <div className="relative overflow-hidden border border-border bg-card p-8 text-center sm:p-12">
          <GithubIcon className="absolute -right-8 -top-8 h-64 w-64 text-foreground opacity-[0.03]" />

          <div className="relative">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
              $ git clone community
            </p>
            <span className="mt-4 inline-block border border-primary bg-primary px-3 py-1 font-mono text-xs font-semibold uppercase tracking-wider text-primary-foreground">
              Licença MIT
            </span>

            <h2 className="mt-6 font-heading text-2xl font-bold text-foreground sm:text-3xl">
              Open-source, feito pela comunidade.
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
              Usa, aprende, e se quiseres, contribui.
            </p>

            <div className="mt-8 flex justify-center">
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
          </div>
        </div>
      </div>
    </section>
  )
}
```

Isto substitui a secção "Desenvolvido pela Comunidade. Para a Comunidade." atual — sai a lista "Pull Requests Bem-Vindos" / "Issues Respondidas Ativamente" e o parágrafo sobre como contribuir com código/traduções/quizzes (isso fica só no README do GitHub).

- [ ] **Step 2: Lint**

Run: `cd frontend && npm run lint`
Expected: sem erros novos.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/community-section.tsx
git commit -m "feat(home): reduz seccao Comunidade a um convite curto"
```

---

### Task 6: Recompor `page.tsx` com as novas secções

**Files:**
- Modify: `frontend/src/app/page.tsx`

- [ ] **Step 1: Substituir o conteúdo do ficheiro**

Substitui todo o conteúdo de `frontend/src/app/page.tsx` por:

```tsx
import type { Metadata } from "next"
import { LandingHeader } from "@/components/landing-header"
import { LandingFooter } from "@/components/landing-footer"
import { HeroSection } from "@/components/hero-section"
import { LearnSection } from "@/components/learn-section"
import { PracticeSection } from "@/components/practice-section"
import { CertifySection } from "@/components/certify-section"
import { CommunitySection } from "@/components/community-section"
import { getManuals } from "@/lib/api"

export const metadata: Metadata = {
  title: "Aprende Linux, ao teu ritmo, em português",
  description:
    "A plataforma de aprendizagem de Linux baseada nos manuais oficiais. Estuda, pratica e prepara-te para os exames de certificação LPI com IA interativa e quizzes inteligentes.",
  openGraph: {
    title: "Linux de Camões — Aprende Linux em português",
    description:
      "A plataforma de aprendizagem de Linux baseada nos manuais oficiais, feita para qualquer pessoa que queira aprender Linux, do zero ou até à certificação.",
    type: "website",
  },
}

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

  return (
    <div className="flex min-h-screen flex-col">
      <LandingHeader />

      <main className="flex-1">
        <HeroSection />
        <LearnSection />
        <PracticeSection />
        <CertifySection
          totalManuais={stats.totalManuais}
          totalTopicos={stats.totalTopicos}
          stars={stats.stars}
        />
        <CommunitySection />
      </main>

      <LandingFooter />
    </div>
  )
}
```

Isto remove do ficheiro: o array `STACK_COLUMNS`, o bento grid antigo (`#lpi`), a secção "Prova Social" isolada e a secção "Comunidade" extensa — tudo consolidado ou movido para os componentes das Tasks 2-5. Repara que o título/description da metadata também mudam para refletir o novo H1 (consistente com o trabalho de SEO já feito).

- [ ] **Step 2: Lint**

Run: `cd frontend && npm run lint`
Expected: sem erros (nenhum import por usar, nenhuma variável órfã).

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/page.tsx
git commit -m "feat(home): recompoe homepage em torno da jornada Aprender/Praticar/Certificar"
```

---

### Task 7: Verificação visual no browser

**Files:** nenhum (apenas verificação)

- [ ] **Step 1: Arrancar o dev server**

Usa `preview_start` com o nome de configuração já existente em `.claude/launch.json` (ou cria uma entrada `{"name": "frontend-dev", "runtimeExecutable": "npm", "runtimeArgs": ["run", "dev"], "port": 3001}` dentro de `frontend/` se ainda não existir) e abre `http://localhost:3001`.

- [ ] **Step 2: Confirmar a secção Hero**

Com `read_page` ou `get_page_text`, confirmar que o H1 mostra "Aprende Linux, ao teu ritmo, em português." e que existem dois links: um para `/manuals` com texto "$ ver --manuais" e outro para `/sign-up` com texto "$ criar --conta".

- [ ] **Step 3: Confirmar a secção Aprender e testar os links reais**

Clicar em cada um dos 4 links de tópicos da secção "Aprende com os manuais oficiais" (via `computer` click ou `navigate` direto ao `href`) e confirmar que cada um carrega uma página de tópico real (não 404) — os URLs esperados são:
- `/manuals/010/a-evolucao-do-linux-e-sistemas-operacionais-populares`
- `/manuals/010/o-basico-sobre-a-linha-de-comando`
- `/manuals/010/gerenciando-permissoes-e-donos-de-arquivos`
- `/manuals/101/103-1-trabalho-na-linha-de-comando`

- [ ] **Step 4: Confirmar as restantes secções**

Fazer scroll e confirmar visualmente (`computer` screenshot) que aparecem, por esta ordem: Praticar (Quizzes SM-2 + Labs Kubernetes), Certificar (roadmap de 3 fases + stats + nota para professores linkando a `/sobre`), Comunidade (card único com botão "Repositório no GitHub", sem tabela de PRs/issues).

- [ ] **Step 5: Testar tema escuro**

Usar `resize_window` com `colorScheme: "dark"` e voltar a tirar um screenshot para confirmar que os tokens de cor (`var(--card-dark)`, etc.) continuam legíveis.

- [ ] **Step 6: Build de produção**

Run: `cd frontend && npm run build`
Expected: build termina sem erros (confirma que as páginas estáticas de `/manuals/[code]/[slug]` continuam a gerar-se corretamente e que não há erros de tipos nos novos componentes).

---

## Self-Review (feito pelo autor do plano)

1. **Cobertura da spec:** Hero (§3.1) → Task 1. Aprender (§3.2) → Task 2. Praticar (§3.3) → Task 3. Certificar (§3.4) → Task 4. Comunidade (§3.5) → Task 5. Composição final (§3.6, footer inalterado) → Task 6. Testes da spec (§5: verificação visual, links válidos, lint) → Task 7. Sem lacunas.
2. **Placeholders:** nenhum "TBD"/"TODO" — todos os blocos de código estão completos e prontos a colar.
3. **Consistência de tipos:** `CertifySectionProps` (`totalManuais`, `totalTopicos`, `stars: number | null`) é definido na Task 4 e usado exatamente com esses nomes de props na chamada `<CertifySection totalManuais={...} totalTopicos={...} stars={...} />` na Task 6 — confirmado.
