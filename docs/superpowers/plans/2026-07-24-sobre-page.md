# Página "/sobre" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar a página standalone `/sobre` com diagramas Mermaid.js, tabelas de stack, roadmap visual e secção de comunidade, acessível via link no rodapé.

**Architecture:** Server Component para conteúdo estático (SEO), Client Component isolado para Mermaid.js (lazy-loaded via `next/dynamic`). Página segue padrão da landing page com `LandingHeader` + `LandingFooter` inline.

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS v4, shadcn/ui, mermaid ^11.x, lucide-react, OKLCH tokens

---

## File Structure

| Ficheiro | Ação | Responsabilidade |
|---|---|---|
| `src/components/mermaid-diagram.tsx` | Criar | Client Component que renderiza diagramas Mermaid.js |
| `src/app/sobre/page.tsx` | Criar | Server Component principal com Hero, Stack, Roadmap, Comunidade |
| `src/components/landing-footer.tsx` | Editar | Atualizar link "Sobre Nós" de `#sobre` para `/sobre` |
| `package.json` | Editar | Adicionar dependência `mermaid` |

---

### Task 1: Instalar mermaid

- [ ] **Step 1: Instalar mermaid**

Run: `cmd /c "npm install mermaid"` (workdir: `C:\Users\ROG\Documents\manuais Linux\linuxdecamoes\frontend`)

Expected: `mermaid` adicionado a `dependencies` em `package.json`

- [ ] **Step 2: Verificar instalação**

Run: `cmd /c "npm ls mermaid"` (workdir: `C:\Users\ROG\Documents\manuais Linux\linuxdecamoes\frontend`)

Expected: `mermaid@11.x.x` listed

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add mermaid dependency for about page diagrams"
```

---

### Task 2: Criar MermaidDiagram Client Component

**Files:**
- Create: `src/components/mermaid-diagram.tsx`

- [ ] **Step 1: Criar o componente**

```tsx
"use client"

import { useEffect, useRef, useState } from "react"

interface MermaidDiagramProps {
  chart: string
  className?: string
}

export function MermaidDiagram({ chart, className }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [svg, setSvg] = useState<string>("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function render() {
      try {
        const mermaid = (await import("mermaid")).default
        mermaid.initialize({
          startOnLoad: false,
          theme: "neutral",
          securityLevel: "loose",
          fontFamily: "var(--font-sans)",
        })

        const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`
        const { svg: rendered } = await mermaid.render(id, chart)

        if (!cancelled) {
          setSvg(rendered)
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Erro ao renderizar diagrama"
          )
        }
      }
    }

    render()
    return () => {
      cancelled = true
    }
  }, [chart])

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Erro ao renderizar diagrama: {error}
      </div>
    )
  }

  if (!svg) {
    return (
      <div
        className="flex h-32 items-center justify-center rounded-lg border border-border bg-muted/30"
        aria-busy="true"
      >
        <span className="text-sm text-muted-foreground">
          A carregar diagrama...
        </span>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={className}
      role="img"
      aria-label="Diagrama ilustrativo"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
```

- [ ] **Step 2: Verificar que o ficheiro compila**

Run: `cmd /c "npx tsc --noEmit src/components/mermaid-diagram.tsx"` (workdir: `C:\Users\ROG\Documents\manuais Linux\linuxdecamoes\frontend`)

Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/mermaid-diagram.tsx
git commit -m "feat: add MermaidDiagram client component"
```

---

### Task 3: Criar página /sobre — Hero e Introdução

**Files:**
- Create: `src/app/sobre/page.tsx`

- [ ] **Step 1: Criar o ficheiro da página com metadata e Hero**

```tsx
import type { Metadata } from "next"
import Link from "next/link"
import { Target, Users, Leaf, ChevronRight } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { LandingHeader } from "@/components/landing-header"
import { LandingFooter } from "@/components/landing-footer"

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
  },
  {
    icon: Users,
    title: "Público",
    description:
      "Estudantes universitários, professores, profissionais de TI e qualquer pessoa que queira aprender ou dominar sistemas Linux.",
  },
  {
    icon: Leaf,
    title: "Filosofia",
    description:
      "100% open-source sob licença MIT. Custo zero para todos os participantes. Desenvolvido pela comunidade, para a comunidade.",
  },
]

export default function SobrePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-background via-background to-accent/10">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
          <div className="relative mx-auto max-w-5xl px-4 py-24 text-center sm:py-32">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
              <span>Open Source · MIT License · PT-PT</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              O Linux de Camões
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
              Num trocadilho com o nome do nosso poeta e autor de grandes obras e
              feitos, Luís de Camões — o <strong className="text-foreground">Linux de Camões</strong> é
              uma plataforma open-source focada na aprendizagem e domínio de
              sistemas operativos Linux, totalmente em língua portuguesa (PT-PT).
            </p>
          </div>
        </section>

        {/* Missão / Público / Filosofia */}
        <section className="mx-auto max-w-5xl px-4 py-24">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {missionCards.map((card) => (
              <Card key={card.title} className="transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <card.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Stack + Roadmap + Comunidade serão adicionados nas tasks seguintes */}
      </main>

      <LandingFooter />
    </div>
  )
}
```

- [ ] **Step 2: Verificar build**

Run: `cmd /c "npm run build"` (workdir: `C:\Users\ROG\Documents\manuais Linux\linuxdecamoes\frontend`)

Expected: Build succeeds, `/sobre` page generated

- [ ] **Step 3: Commit**

```bash
git add src/app/sobre/page.tsx
git commit -m "feat: create /sobre page with hero and mission section"
```

---

### Task 4: Adicionar secção Stack Tecnológica

**Files:**
- Modify: `src/app/sobre/page.tsx`

> **Nota:** Esta task edita o ficheiro criado na Task 3. Todos os imports devem ser consolidados no topo do ficheiro. A import final deve ser:
> ```tsx
> import type { Metadata } from "next"
> import Link from "next/link"
> import dynamic from "next/dynamic"
> import { Target, Users, Leaf, ChevronRight, Layers, Roadmap, Code2, Coins, Globe, GraduationCap } from "lucide-react"
> import { buttonVariants } from "@/components/ui/button"
> import { Card, CardContent } from "@/components/ui/card"
> import { LandingHeader } from "@/components/landing-header"
> import { LandingFooter } from "@/components/landing-footer"
>
> const MermaidDiagram = dynamic(
>   () => import("@/components/mermaid-diagram").then((mod) => mod.MermaidDiagram),
>   { ssr: false }
> )
> ```

- [ ] **Step 1: Adicionar dados da stack e secção à página**

Adicionar o array `stackData` e a secção JSX correspondente ao ficheiro `src/app/sobre/page.tsx`. Inserir após a secção de missão e antes do comentário placeholder.

Substituir o comentário `{/* Stack + Roadmap + Comunidade serão adicionados nas tasks seguintes */}` por:

```tsx
        {/* Stack Tecnológica */}
        <section className="section-band">
          <div className="mx-auto max-w-5xl px-4 py-24">
            <div className="mb-12 text-center">
              <Layers className="mx-auto mb-4 h-8 w-8 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">
                Stack Tecnológica
              </h2>
              <p className="mt-2 text-muted-foreground">
                Mais de 45 tecnologias ativas num ecossistema robusto
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <caption className="sr-only">
                  Stack tecnológica do projeto Linux de Camões
                </caption>
                <thead>
                  <tr className="border-b border-border bg-[var(--table-header-bg)]">
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-foreground">Categoria</th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-foreground">Tecnologia</th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-foreground">Estado</th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-foreground">Descrição</th>
                  </tr>
                </thead>
                <tbody>
                  {stackData.map((row, i) => (
                    <tr
                      key={row.tech}
                      className={`border-b border-border last:border-0 ${i % 2 === 1 ? "bg-muted/30" : ""}`}
                    >
                      <td className="px-4 py-3 font-medium text-foreground">{row.category}</td>
                      <td className="px-4 py-3 text-foreground">{row.tech}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${row.active ? "bg-sage-soft text-sage" : "bg-amber-soft text-amber"}`}>
                          {row.active ? "✅ Ativo" : "⏳ Planeado"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{row.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
```

Adicionar o array `stackData` antes do componente `SobrePage`:

```tsx
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
```

- [ ] **Step 2: Verificar build**

Run: `cmd /c "npm run build"` (workdir: `C:\Users\ROG\Documents\manuais Linux\linuxdecamoes\frontend`)

Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/app/sobre/page.tsx
git commit -m "feat: add stack tecnológica table to /sobre page"
```

---

### Task 5: Adicionar secção Roadmap com diagrama Mermaid

**Files:**
- Modify: `src/app/sobre/page.tsx`

- [ ] **Step 1: Adicionar secção roadmap**

Substituir o comentário `{/* Stack + Roadmap + Comunidade serão adicionados nas tasks seguintes */}` (ou o conteúdo após a secção Stack) pela secção roadmap. Inserir após a secção Stack:

```tsx
        {/* Roadmap / Fases */}
        <section className="mx-auto max-w-5xl px-4 py-24">
          <div className="mb-12 text-center">
            <Roadmap className="mx-auto mb-4 h-8 w-8 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">
              Roadmap do Projeto
            </h2>
            <p className="mt-2 text-muted-foreground">
              7 fases de desenvolvimento, desde a conceição até aos laboratórios interativos
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border bg-card p-4">
            <MermaidDiagram
              chart={`gantt
    title Roadmap Linux de Camões
    dateFormat X
    axisFormat %s

    section Concluído
    Fase 0 — Cofre de Contexto    :done, f0, 0, 1
    Fase 1 — Init Repo            :done, f1, 1, 2
    Fase 2 — Frontend Base        :done, f2, 2, 3
    Fase 3 — Backend API          :done, f3, 3, 4
    Fase 4 — RAG                  :done, f4, 4, 5

    section Em curso
    Fase 6 — Quizzes              :active, f6, 5, 6

    section Pendente
    Fase 5 — Terminal K8s         :f5, 6, 7`}
              className="min-h-[300px]"
            />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {phases.map((phase) => (
              <div
                key={phase.id}
                className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-md"
              >
                <span className="mt-0.5 text-lg">{phase.icon}</span>
                <div>
                  <h3 className="font-semibold text-foreground">{phase.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{phase.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
```

Adicionar o array `phases` antes do componente `SobrePage`:

```tsx
const phases = [
  { id: 0, icon: "🗄️", title: "Fase 0 — Cofre de Contexto", description: "Vault Obsidian criado para memória central do projeto." },
  { id: 1, icon: "📦", title: "Fase 1 — Init Repo", description: "Next.js 16 + Clerk + shadcn/ui inicializados." },
  { id: 2, icon: "🎨", title: "Fase 2 — Frontend Base", description: "Layout OKLCH, autenticação, dashboard Bento, /lab." },
  { id: 3, icon: "⚙️", title: "Fase 3 — Backend API", description: "FastAPI + SQLAlchemy + PostgreSQL operacionais." },
  { id: 4, icon: "🧠", title: "Fase 4 — RAG", description: "FAISS + Groq Llama 3 integrados, pipeline funcional." },
  { id: 5, icon: "💻", title: "Fase 5 — Terminal K8s", description: "Pods efémeros + xterm.js via WebSockets." },
  { id: 6, icon: "❓", title: "Fase 6 — Quizzes", description: "Sistema de quizzes com repetição espaçada SM-2." },
]
```

- [ ] **Step 2: Verificar build**

Run: `cmd /c "npm run build"` (workdir: `C:\Users\ROG\Documents\manuais Linux\linuxdecamoes\frontend`)

Expected: Build succeeds (Mermaid lazy-loaded, não bloqueia SSG)

- [ ] **Step 3: Commit**

```bash
git add src/app/sobre/page.tsx
git commit -m "feat: add roadmap section with Mermaid gantt diagram"
```

---

### Task 6: Adicionar secção Comunidade & Contribuição

**Files:**
- Modify: `src/app/sobre/page.tsx`

- [ ] **Step 1: Adicionar secção comunidade e CTA final**

Inserir antes de `</main>`:

```tsx
        {/* Comunidade & Contribuição */}
        <section className="section-band">
          <div className="mx-auto max-w-5xl px-4 py-24">
            <div className="mb-12 text-center">
              <h2 className="text-2xl font-bold text-foreground">
                Desenvolvido pela Comunidade
              </h2>
              <p className="mt-2 text-muted-foreground">
                O projeto ideal para alunos de licenciaturas e recém-formados se envolverem
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {communityCards.map((card) => (
                <Card key={card.title} className="transition-shadow hover:shadow-md">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <card.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {card.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {card.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link
                href="https://github.com/linuxdecamoes"
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ size: "lg" })}
              >
                Contribui no GitHub
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
```

Adicionar o array `communityCards` antes do componente `SobrePage`:

```tsx
const communityCards = [
  {
    icon: Code2,
    title: "Tecnologias de Ponta",
    description:
      "Ganha experiência real com as ferramentas mais requisitadas no mercado: Next.js, Python, FastAPI, Kubernetes e IA/ML.",
  },
  {
    icon: Coins,
    title: "Custo Zero",
    description:
      "A filosofia arquitetural garante que todas as ferramentas utilizadas são gratuitas ou possuem um nível gratuito (free tier).",
  },
  {
    icon: Globe,
    title: "Língua Portuguesa",
    description:
      "A documentação e o código operam totalmente em PT-PT, reduzindo barreiras de entrada para a comunidade lusófona.",
  },
  {
    icon: GraduationCap,
    title: "Material LPI Integrado",
    description:
      "A participação no código envolve exposição direta aos conteúdos vitais do LPI: Linux Essentials, Security, Web Dev, Administração e Networking.",
  },
]
```

- [ ] **Step 2: Verificar build**

Run: `cmd /c "npm run build"` (workdir: `C:\Users\ROG\Documents\manuais Linux\linuxdecamoes\frontend`)

Expected: Build succeeds, `/sobre` page fully generated

- [ ] **Step 3: Commit**

```bash
git add src/app/sobre/page.tsx
git commit -m "feat: add community section and CTA to /sobre page"
```

---

### Task 7: Atualizar footer link

**Files:**
- Modify: `src/components/landing-footer.tsx:8`

- [ ] **Step 1: Atualizar link "Sobre Nós"**

Em `src/components/landing-footer.tsx`, alterar a linha:

```tsx
      { href: "#sobre", label: "Sobre Nós" },
```

para:

```tsx
      { href: "/sobre", label: "Sobre Nós" },
```

- [ ] **Step 2: Verificar build**

Run: `cmd /c "npm run build"` (workdir: `C:\Users\ROG\Documents\manuais Linux\linuxdecamoes\frontend`)

Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/components/landing-footer.tsx
git commit -m "fix: update footer 'Sobre Nós' link to /sobre route"
```

---

### Task 8: Verificação final

- [ ] **Step 1: Lint**

Run: `cmd /c "npm run lint"` (workdir: `C:\Users\ROG\Documents\manuais Linux\linuxdecamoes\frontend`)

Expected: No errors

- [ ] **Step 2: Build completo**

Run: `cmd /c "npm run build"` (workdir: `C:\Users\ROG\Documents\manuais Linux\linuxdecamoes\frontend`)

Expected: 131+ páginas SSG geradas (incluindo `/sobre`)

- [ ] **Step 3: Verificar que `/sobre` aparece no output**

No output do build, verificar linha com `/sobre` e status `○` (SSG)

- [ ] **Step 4: Commit final (se necessário)**

Se houver fixes adicionais, commitar com mensagem apropriada.
