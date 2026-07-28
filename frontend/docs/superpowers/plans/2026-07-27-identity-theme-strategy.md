# Identity & Theme Strategy — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply a unified "Academia Técnica" identity across all website pages — dark heroes, card-accent-top pattern, fixed dead links, branded auth, personalized dashboard, consistent copy.

**Architecture:** Extend existing CSS tokens/classes in `globals.css`, apply universal hero-dark and card-accent-top patterns to Sobre/Manuals/Lab/Auth/Dashboard pages, fix footer dead links, replace inline GithubIcon with lucide, fix font docs (IBM Plex → Inter).

**Tech Stack:** Next.js 16, React 19, Tailwind v4, shadcn/ui, OKLCH tokens, Clerk auth, lucide-react

---

## File Map

| File | Changes |
|------|---------|
| `src/components/landing-footer.tsx` | Fix dead links, remove empty sections, update copyright copy |
| `src/app/(auth)/layout.tsx` | Branded wrapper: dark bg, tagline, 2-col layout on desktop |
| `src/app/(auth)/sign-in/[[...sign-in]]/page.tsx` | No changes needed (layout wraps it) |
| `src/app/(auth)/sign-up/[[...sign-up]]/page.tsx` | No changes needed (layout wraps it) |
| `src/app/sobre/page.tsx` | Dark hero, card-accent-top on mission/community cards, copy refresh, MIT section, fix IBM Plex in stack table |
| `src/app/manuals/page.tsx` | Add dark hero header with badge |
| `src/app/(dashboard)/lab/page.tsx` | Replace `bg-[#0E1525]` with `bg-[var(--card-dark)]` |
| `src/app/(dashboard)/dashboard/page.tsx` | Personalize hero with Clerk firstName |
| `src/components/landing-header.tsx` | Replace inline GithubIcon with lucide `Github` |
| `agents.md` | Fix "IBM Plex Sans/Mono" → "Inter + JetBrains Mono" |
| `README.md` | Fix "IBM Plex Sans/Mono" → "Inter + JetBrains Mono" |

---

### Task 1: Fix Footer Dead Links and Copy

**Files:**
- Modify: `src/components/landing-footer.tsx`

- [ ] **Step 1: Replace footer sections data and copyright**

Replace the entire `footerSections` array and copyright text. The current file has dead links (`#` for Licença MIT, `#roadmap` anchor that doesn't exist, Discord/Guia de Contribuição that don't exist).

```tsx
const footerSections = [
  {
    title: "Projeto",
    links: [
      { href: "/sobre", label: "Sobre Nós" },
      { href: "/sobre#roadmap", label: "Roadmap" },
      { href: "https://github.com/linuxdecamoes/blob/master/LICENSE", label: "Licença MIT", external: true },
    ],
  },
  {
    title: "Comunidade",
    links: [
      {
        href: "https://github.com/linuxdecamoes",
        label: "GitHub",
        external: true,
      },
      {
        href: "https://github.com/linuxdecamoes/issues",
        label: "Reportar Issue",
        external: true,
      },
    ],
  },
  {
    title: "Recursos",
    links: [
      { href: "/manuals", label: "Manuais LPI" },
      { href: "/lab", label: "Laboratório" },
      { href: "/dashboard/chat", label: "Motor RAG" },
    ],
  },
]
```

- [ ] **Step 2: Update copyright line**

Replace:
```tsx
<p>&copy; 2026 Linux de Camões. Todos os direitos reservados.</p>
<p className="mt-1">Desenvolvido pela comunidade</p>
```

With:
```tsx
<p>&copy; 2026 Linux de Camões. Licenciado sob MIT.</p>
<p className="mt-1">Desenvolvido pela comunidade</p>
```

- [ ] **Step 3: Verify changes**

Run: `cmd /c "cd frontend && npm run lint"`
Expected: 0 errors (warnings OK)

---

### Task 2: Branded Auth Layout

**Files:**
- Modify: `src/app/(auth)/layout.tsx`

- [ ] **Step 1: Replace auth layout with branded wrapper**

The current layout is a simple centered container with logo. Replace with a dark branded wrapper that gives the auth pages personality.

```tsx
import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Branding panel — dark side */}
      <div className="hidden w-1/2 hero-dark relative overflow-hidden lg:flex lg:flex-col lg:items-center lg:justify-center">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
        <div className="relative z-10 flex flex-col items-center text-center px-8">
          <Link href="/" className="mb-8 flex items-center gap-3">
            <Image
              src="/linuxdecamoes.svg"
              alt="Linux de Camões"
              width={56}
              height={75}
              className="h-[75px] w-auto"
            />
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Linux de{" "}
            <span className="text-gradient-iris-coral">Camões</span>
          </h1>
          <p className="mt-4 max-w-sm text-base leading-relaxed text-white/60">
            Plataforma open-source de aprendizagem de Linux com IA interativa,
            baseada nos manuais oficiais LPI.
          </p>
          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-iris/30 bg-iris-soft/80 px-4 py-1.5 text-sm text-iris">
            <span>Open Source · MIT · PT-PT</span>
          </div>
        </div>
      </div>

      {/* Form panel — light side */}
      <div className="flex flex-1 flex-col items-center justify-center bg-background px-4">
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <Image
            src="/linuxdecamoes.svg"
            alt="Linux de Camões"
            width={40}
            height={54}
            className="h-[54px] w-auto"
          />
          <span className="text-lg font-semibold text-foreground">Linux de Camões</span>
        </div>
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify changes**

Run: `cmd /c "cd frontend && npm run lint"`
Expected: 0 errors

---

### Task 3: Sobre Page Full Refresh

**Files:**
- Modify: `src/app/sobre/page.tsx`

- [ ] **Step 1: Update imports**

Replace the import block. Remove `Card`/`CardContent` (no longer used), add `Shield` for MIT section.

Current:
```tsx
import { Card, CardContent } from "@/components/ui/card"
```

New — remove that import entirely. The rest stays.

- [ ] **Step 2: Replace hero section**

Current hero (lines 104-121):
```tsx
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
```

Replace with:
```tsx
<section className="hero-dark relative overflow-hidden border-b border-white/10">
  <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
  <div className="relative mx-auto max-w-5xl px-4 py-24 text-center sm:py-32">
    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-iris/30 bg-iris-soft/80 px-4 py-1.5 text-sm text-iris">
      <span>Open Source · MIT · PT-PT</span>
    </div>
    <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
      O projeto construído{" "}
      <span className="text-gradient-iris-coral">pela comunidade</span>
    </h1>
    <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-white/60">
      Num trocadilho com o nome do nosso poeta — Luís de Camões — a plataforma
      é open-source, focada na aprendizagem de Linux, totalmente em PT-PT.
    </p>
  </div>
</section>
```

- [ ] **Step 3: Replace mission cards**

Current (lines 123-142) uses `Card`/`CardContent`. Replace with `card-accent-top` pattern.

Replace:
```tsx
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
```

With:
```tsx
<section className="mx-auto max-w-5xl px-4 py-24">
  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {missionCards.map((card) => (
      <div
        key={card.title}
        className="card-accent-top rounded-2xl bg-card p-6 transition-shadow hover:shadow-md"
        style={{ "--accent-color": card.accentColor }}
      >
        <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${card.iconBg}`}>
          <card.icon className={`h-6 w-6 ${card.iconColor}`} />
        </div>
        <h3 className="text-lg font-semibold text-foreground">
          {card.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {card.description}
        </p>
      </div>
    ))}
  </div>
</section>
```

- [ ] **Step 4: Update missionCards data**

Add accent fields and refresh copy:

```tsx
const missionCards = [
  {
    icon: Target,
    title: "Missão",
    description:
      "Preparar qualquer pessoa para os exames de certificação do LPI e outras entidades reconhecidas, com conteúdo baseado nos manuais oficiais.",
    accentColor: "var(--iris)",
    iconBg: "bg-iris-soft",
    iconColor: "text-iris",
  },
  {
    icon: Users,
    title: "Público",
    description:
      "Estudantes, profissionais e curiosos de todo o mundo lusófono — qualquer pessoa que queira aprender ou dominar Linux.",
    accentColor: "var(--coral)",
    iconBg: "bg-coral-soft",
    iconColor: "text-coral",
  },
  {
    icon: Leaf,
    title: "Filosofia",
    description:
      "Custo zero. Código aberto. PT-PT. Desenvolvido pela comunidade, para a comunidade.",
    accentColor: "var(--sage)",
    iconBg: "bg-sage-soft",
    iconColor: "text-sage",
  },
]
```

- [ ] **Step 5: Fix stack table — IBM Plex → Inter**

Current (line 47):
```tsx
{ category: "Frontend", tech: "IBM Plex Sans/Mono", active: true, description: "Tipografia profissional" },
```

Replace with:
```tsx
{ category: "Frontend", tech: "Inter + JetBrains Mono", active: true, description: "Tipografia profissional" },
```

- [ ] **Step 6: Replace community cards**

Current (lines 243-285) uses `Card`/`CardContent`. Replace with `card-accent-top` pattern and update copy:

```tsx
<section className="section-band">
  <div className="mx-auto max-w-5xl px-4 py-24">
    <div className="mb-12 text-center">
      <h2 className="text-2xl font-bold text-foreground">
        Desenvolvido pela Comunidade
      </h2>
      <p className="mt-2 text-muted-foreground">
        O projeto ideal para alunos e profissionais se envolverem com Linux e open-source
      </p>
    </div>

    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {communityCards.map((card) => (
        <div
          key={card.title}
          className="card-accent-top rounded-2xl bg-card p-6 transition-shadow hover:shadow-md"
          style={{ "--accent-color": "var(--iris)" }}
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-iris-soft">
            <card.icon className="h-6 w-6 text-iris" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            {card.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {card.description}
          </p>
        </div>
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

- [ ] **Step 7: Add Licença MIT section before footer**

Add a new section after the community section, before `</main>`:

```tsx
{/* Licença MIT */}
<section className="mx-auto max-w-5xl px-4 py-16 text-center">
  <div className="inline-flex items-center gap-2 rounded-full border border-sage/30 bg-sage-soft/80 px-4 py-1.5 text-sm text-sage mb-6">
    <Shield className="h-4 w-4" />
    <span>Licença MIT</span>
  </div>
  <h2 className="text-2xl font-bold text-foreground">
    Livre para usar, modificar e distribuir
  </h2>
  <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
    O Linux de Camões é licenciado sob MIT — podes usar o código em qualquer
    projeto, pessoal ou comercial, sem restrições.
  </p>
  <div className="mt-6">
    <Link
      href="https://github.com/linuxdecamoes/blob/master/LICENSE"
      target="_blank"
      rel="noopener noreferrer"
      className={buttonVariants({ variant: "outline" })}
    >
      Ver Licença no GitHub
      <ChevronRight className="ml-1 h-4 w-4" />
    </Link>
  </div>
</section>
```

Also add `Shield` to the lucide imports at the top of the file.

- [ ] **Step 8: Verify changes**

Run: `cmd /c "cd frontend && npm run lint"`
Expected: 0 errors

---

### Task 4: Manuals Dark Hero Header

**Files:**
- Modify: `src/app/manuals/page.tsx`

- [ ] **Step 1: Replace manuals page with dark hero header**

Current page is 27 lines with a plain `<header>`. Replace entire file:

```tsx
import { BookOpen } from "lucide-react"
import { manuals } from "@/lib/manuals"
import { ManualLevelGroup } from "@/components/manuals/manual-level-group"

export default function ManualsPage() {
  const totalTopics = manuals.reduce((sum, m) => sum + m.topics.length, 0)
  const essentials = manuals.filter((m) => m.level === "essentials")
  const lpic1 = manuals.filter((m) => m.level === "lpic1")

  return (
    <div className="flex min-h-screen flex-col">
      {/* Dark hero header */}
      <section className="hero-dark relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
        <div className="relative mx-auto max-w-5xl px-4 py-16 text-center sm:py-20">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-iris/30 bg-iris-soft/80 px-4 py-1.5 text-sm text-iris">
            <BookOpen className="h-4 w-4" />
            <span>{totalTopics} tópicos · 5 manuais</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Manuais{" "}
            <span className="text-gradient-iris-coral">LPI</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/60">
            Conteúdo dos manuais oficiais de certificação LPI, processado e
            pesquisável com IA.
          </p>
        </div>
      </section>

      {/* Content */}
      <div className="mx-auto w-full max-w-7xl px-4 py-12">
        <ManualLevelGroup level="essentials" manuals={essentials} />
        <ManualLevelGroup level="lpic1" manuals={lpic1} />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify changes**

Run: `cmd /c "cd frontend && npm run lint"`
Expected: 0 errors

---

### Task 5: Lab Token-ize Background

**Files:**
- Modify: `src/app/(dashboard)/lab/page.tsx`

- [ ] **Step 1: Replace hardcoded bg**

Current (line 71):
```tsx
<div className="flex-1 bg-[#0E1525] p-4 font-mono text-sm text-green-400">
```

Replace with:
```tsx
<div className="flex-1 bg-card-dark p-4 font-mono text-sm text-green-400">
```

- [ ] **Step 2: Verify changes**

Run: `cmd /c "cd frontend && npm run lint"`
Expected: 0 errors

---

### Task 6: Dashboard Hero Personalization

**Files:**
- Modify: `src/app/(dashboard)/dashboard/page.tsx`

- [ ] **Step 1: Add Clerk user query and personalize hero**

Current dashboard page uses `auth()` for userId only. We need to also get the user's first name.

Replace the imports and function body. Current:
```tsx
import { auth } from "@clerk/nextjs/server";
```

Replace with:
```tsx
import { auth, currentUser } from "@clerk/nextjs/server";
```

Current hero (lines 30-37):
```tsx
<div className="mb-6 rounded-2xl dashboard-hero p-8 lg:p-10">
  <h1 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight text-white">
    Olá, Estudante
  </h1>
  <p className="mt-2 text-base text-white/60">
    Continua onde paraste
  </p>
</div>
```

Replace with:
```tsx
<div className="mb-6 rounded-2xl dashboard-hero p-8 lg:p-10">
  <h1 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight text-white">
    Olá, {user?.firstName || "Estudante"}
  </h1>
  <p className="mt-2 text-base text-white/60">
    Continua onde paraste
  </p>
</div>
```

And add after `const { userId } = await auth();`:
```tsx
const user = await currentUser();
```

- [ ] **Step 2: Verify changes**

Run: `cmd /c "cd frontend && npm run lint"`
Expected: 0 errors

---

### Task 7: Replace Inline GithubIcon with Lucide

**Files:**
- Modify: `src/components/landing-header.tsx`

- [ ] **Step 1: Replace inline GithubIcon function with lucide import**

Current (lines 6-19):
```tsx
import { MenuIcon } from "lucide-react"

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}
```

Replace with:
```tsx
import { MenuIcon, Github } from "lucide-react"
```

- [ ] **Step 2: Update GithubIcon references to Github**

In the JSX, find both occurrences of `<GithubIcon` and replace with `<Github`:

Line 81: `<GithubIcon className="size-4" />` → `<Github className="size-4" />`
Line 128: `<GithubIcon className="mr-2 size-4" />` → `<Github className="mr-2 size-4" />`

- [ ] **Step 3: Verify changes**

Run: `cmd /c "cd frontend && npm run lint"`
Expected: 0 errors

---

### Task 8: Fix Font Documentation (IBM Plex → Inter)

**Files:**
- Modify: `agents.md` (line 104)
- Modify: `README.md` (line 35)

- [ ] **Step 1: Fix agents.md**

In `agents.md` line 104, the stack table has:
```
| **Frontend** | Next.js **16.2.10** (App Router, Turbopack) · React 19 · Tailwind **v4** (`@tailwindcss/postcss`) · shadcn/ui (estilo `base-nova`, `@base-ui/react`) · Clerk · IBM Plex Sans/Mono · lucide-react · `tw-animate-css` | ✅ |
```

Replace `IBM Plex Sans/Mono` with `Inter + JetBrains Mono`:
```
| **Frontend** | Next.js **16.2.10** (App Router, Turbopack) · React 19 · Tailwind **v4** (`@tailwindcss/postcss`) · shadcn/ui (estilo `base-nova`, `@base-ui/react`) · Clerk · Inter + JetBrains Mono · lucide-react · `tw-animate-css` | ✅ |
```

- [ ] **Step 2: Fix README.md**

In `README.md` line 35, same pattern:
```
| **Frontend** | Next.js 16.2.10 (App Router, Turbopack) · React 19 · Tailwind v4 · shadcn/ui (`@base-ui/react`) · Clerk · IBM Plex Sans/Mono · lucide-react | ✅ |
```

Replace `IBM Plex Sans/Mono` with `Inter + JetBrains Mono`:
```
| **Frontend** | Next.js 16.2.10 (App Router, Turbopack) · React 19 · Tailwind v4 · shadcn/ui (`@base-ui/react`) · Clerk · Inter + JetBrains Mono · lucide-react | ✅ |
```

- [ ] **Step 3: Verify changes**

Run: `cmd /c "cd frontend && npm run lint"`
Expected: 0 errors

---

### Task 9: Final Verification

**Files:** None (verification only)

- [ ] **Step 1: Run lint**

Run: `cmd /c "cd frontend && npm run lint"`
Expected: 0 errors (warnings OK — pre-existing)

- [ ] **Step 2: Run build**

Run: `cmd /c "cd frontend && npm run build"`
Expected: 132/132 pages generated successfully

- [ ] **Step 3: Docker rebuild**

Run: `cmd /c "cd linuxdecamoes && docker compose up --build -d frontend"`
Expected: Build succeeds, container recreated

- [ ] **Step 4: Browser cache clear**

Instruct user: Ctrl+Shift+R to hard refresh and verify all pages.
