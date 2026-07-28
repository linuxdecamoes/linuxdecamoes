# Cyber Terminal Landing Page — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reescrever a landing page (/) com estética "Cyber Terminal" — dark-tech, monospace, manifesto scroll, typing animation, zero deps runtime.

**Architecture:** Tokens OKLCH novos são adicionados ao `:root` existente (paleta quente mantida para dashboard). Componentes CSS novos em `@layer components`. A landing page (`page.tsx`) é reescrita como "boot sequence" com 5 secções. Header e footer são adaptados para cores escuras.

**Tech Stack:** Next.js 16, React 19, Tailwind v4, shadcn/ui, OKLCH tokens, CSS-only animations (ADR-001)

---

## File Map

| Ficheiro | Alterações |
|----------|-----------|
| `src/app/globals.css` | +12 tokens `:root`, +9 exports `@theme inline`, +8 classes `@layer components`, +2 keyframes |
| `src/app/page.tsx` | Reescrita completa (hero typing, manifesto, ls features, neofetch, CTA) |
| `src/components/landing-header.tsx` | Adaptar cores para dark theme |
| `src/components/landing-footer.tsx` | Adaptar cores para dark theme |

---

### Task 1: Add Cyber Terminal CSS tokens and classes to globals.css

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add new tokens to `:root` (after existing tokens, before closing `}`)**

Add these tokens inside `:root { }` after the `--hero-watermark` line (line ~235), before the closing `}`:

```css
  /* --- Cyber Terminal: paleta dark-tech para landing page --- */
  --bg-void: oklch(0.10 0.02 260);
  --bg-surface: oklch(0.14 0.02 260);
  --bg-elevated: oklch(0.18 0.02 260);
  --text-primary: oklch(0.95 0 0);
  --text-secondary: oklch(0.60 0.02 260);
  --text-dim: oklch(0.40 0.02 260);
  --accent-cyan: oklch(0.75 0.15 195);
  --accent-green: oklch(0.80 0.18 145);
  --accent-magenta: oklch(0.65 0.20 330);
  --accent-yellow: oklch(0.90 0.15 95);
  --border-subtle: oklch(0.20 0.02 260);
  --border-glow: oklch(0.75 0.15 195 / 0.3);
```

- [ ] **Step 2: Add @theme inline exports (after existing exports, before closing `}`)**

Add these inside `@theme inline { }` after the `--color-dashboard-hero-bg` line (line ~102), before the closing `}`:

```css
  --color-bg-void: var(--bg-void);
  --color-bg-surface: var(--bg-surface);
  --color-bg-elevated: var(--bg-elevated);
  --color-accent-cyan: var(--accent-cyan);
  --color-accent-green: var(--accent-green);
  --color-accent-magenta: var(--accent-magenta);
  --color-accent-yellow: var(--accent-yellow);
  --color-text-dim: var(--text-dim);
  --color-border-glow: var(--border-glow);
```

- [ ] **Step 3: Add new component classes to `@layer components`**

Add these inside `@layer components { }` after the `.text-gradient-iris-coral` block (after line ~450), before the closing `}`:

```css
  /* Cyber Terminal: terminal prompt line */
  .terminal-prompt {
    font-family: var(--font-mono);
    color: var(--accent-green);
  }
  .terminal-prompt::before {
    content: "> ";
    color: var(--accent-cyan);
  }

  /* Cyber Terminal: typing animation */
  .typing-line {
    overflow: hidden;
    white-space: nowrap;
    border-right: 2px solid var(--accent-green);
    width: 0;
    animation: typing 2s steps(40) forwards 0.5s, blink 0.7s step-end infinite;
  }

  /* Cyber Terminal: feature card */
  .terminal-card {
    background: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-2xl);
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
  }
  .terminal-card:hover {
    border-color: var(--border-glow);
    background: var(--bg-elevated);
    box-shadow: 0 0 20px oklch(0.75 0.15 195 / 0.08);
  }

  /* Cyber Terminal: glow text */
  .text-glow-cyan {
    color: var(--accent-cyan);
    text-shadow: 0 0 20px oklch(0.75 0.15 195 / 0.3);
  }

  /* Cyber Terminal: manifesto line */
  .manifesto-line {
    font-family: var(--font-mono);
    font-size: 0.875rem;
    line-height: 2;
    color: var(--text-primary);
  }

  /* Cyber Terminal: stat number */
  .stat-number {
    font-size: 3rem;
    font-weight: 800;
    color: var(--accent-cyan);
    line-height: 1;
    text-shadow: 0 0 30px oklch(0.75 0.15 195 / 0.2);
  }

  /* Cyber Terminal: line number */
  .line-number {
    color: var(--text-dim);
    font-family: var(--font-mono);
    user-select: none;
  }
```

- [ ] **Step 4: Add typing keyframe**

Add this inside `@layer base` is NOT correct — add it after the existing `@keyframes copy-feedback` block (after line ~308), alongside other keyframes:

```css
@keyframes typing {
  from { width: 0; }
  to { width: 100%; }
}
```

- [ ] **Step 5: Verify CSS compiles**

Run: `cmd /c "cd /d \"C:\Users\ROG\Documents\manuais Linux\linuxdecamoes\frontend\" && npm run build"`
Expected: Build succeeds (132/132 pages). If CSS parse error, check token syntax.

- [ ] **Step 6: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(landing): add cyber terminal CSS tokens, classes and keyframes"
```

---

### Task 2: Adapt landing header to dark theme

**Files:**
- Modify: `src/components/landing-header.tsx`

- [ ] **Step 1: Update header background and text colors**

In `landing-header.tsx`, change the `<header>` element's className from:
```
"sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60"
```
to:
```
"sticky top-0 z-50 border-b border-border-subtle/50 bg-bg-void/80 backdrop-blur-xl supports-[backdrop-filter]:bg-bg-void/60"
```

- [ ] **Step 2: Update logo text color**

Change the `<Link>` className from:
```
"flex items-center gap-2 font-semibold text-foreground"
```
to:
```
"flex items-center gap-2 font-semibold text-text-primary"
```

- [ ] **Step 3: Update nav link colors**

In the `navLinks` mapping, the `<a>` tag uses `navigationMenuTriggerStyle()`. This is fine — it inherits from the navigation-menu component. No change needed for nav links.

- [ ] **Step 4: Update CTA button**

Change the desktop CTA `<Button>` from:
```
"bg-primary text-primary-foreground hover:bg-primary/90"
```
to:
```
"bg-accent-cyan text-bg-void hover:bg-accent-cyan/90 font-semibold"
```

- [ ] **Step 5: Update mobile CTA button**

Change the mobile `<Button>` from:
```
"w-full bg-primary text-primary-foreground hover:bg-primary/90"
```
to:
```
"w-full bg-accent-cyan text-bg-void hover:bg-accent-cyan/90 font-semibold"
```

- [ ] **Step 6: Update mobile sheet background**

Change the `<SheetContent>` className from:
```
"w-72"
```
to:
```
"w-72 bg-bg-void"
```

- [ ] **Step 7: Update mobile nav link colors**

Change the mobile nav `<a>` className from:
```
"rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
```
to:
```
"rounded-lg px-3 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-bg-surface"
```

- [ ] **Step 8: Update mobile sheet border**

Change the mobile sheet `<div>` className from:
```
"flex flex-col gap-2 border-t border-border px-4 pt-4"
```
to:
```
"flex flex-col gap-2 border-t border-border-subtle px-4 pt-4"
```

- [ ] **Step 9: Verify lint**

Run: `cmd /c "cd /d \"C:\Users\ROG\Documents\manuais Linux\linuxdecamoes\frontend\" && npm run lint"`
Expected: 0 errors.

- [ ] **Step 10: Commit**

```bash
git add src/components/landing-header.tsx
git commit -m "feat(landing): adapt header to cyber terminal dark theme"
```

---

### Task 3: Adapt landing footer to dark theme

**Files:**
- Modify: `src/components/landing-footer.tsx`

- [ ] **Step 1: Update footer background**

Change the `<footer>` className from:
```
"border-t border-border bg-card/50"
```
to:
```
"border-t border-border-subtle bg-bg-surface"
```

- [ ] **Step 2: Update logo text color**

Change the `<Link>` className from:
```
"inline-flex items-center gap-2 font-semibold text-foreground"
```
to:
```
"inline-flex items-center gap-2 font-semibold text-text-primary"
```

- [ ] **Step 3: Update section title color**

Change the `<h3>` className from:
```
"text-sm font-semibold text-foreground"
```
to:
```
"text-sm font-semibold text-text-primary"
```

- [ ] **Step 4: Update link colors**

Change the `<Link>` className from:
```
"text-sm text-muted-foreground transition-colors hover:text-foreground"
```
to:
```
"text-sm text-text-secondary transition-colors hover:text-text-primary"
```

- [ ] **Step 5: Update copyright border and text**

Change the copyright `<div>` className from:
```
"mt-12 border-t border-border pt-6 text-center text-sm text-muted-foreground"
```
to:
```
"mt-12 border-t border-border-subtle pt-6 text-center text-sm text-text-secondary"
```

- [ ] **Step 6: Verify lint**

Run: `cmd /c "cd /d \"C:\Users\ROG\Documents\manuais Linux\linuxdecamoes\frontend\" && npm run lint"`
Expected: 0 errors.

- [ ] **Step 7: Commit**

```bash
git add src/components/landing-footer.tsx
git commit -m "feat(landing): adapt footer to cyber terminal dark theme"
```

---

### Task 4: Rewrite landing page (page.tsx)

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Replace entire page.tsx content**

Replace the entire file with:

```tsx
import Link from "next/link"
import { Terminal, Brain, BookOpen, Trophy, ChevronRight } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { LandingHeader } from "@/components/landing-header"
import { LandingFooter } from "@/components/landing-footer"

const manifestoLines = [
  { num: "001", text: "Aprender Linux não deve ser um privilégio." },
  { num: "002", text: "Os manuais LPI são a base — nós tornamos-os interativos." },
  { num: "003", text: "Terminal real. IA treinada. Quizzes inteligentes." },
  { num: "004", text: "Open-source. Gratuito. Para sempre." },
  { num: "005", text: "Feito pela comunidade, para a comunidade." },
  { num: "006", text: "Cada tópico, cada comando, cada linha — ensinada." },
]

const features = [
  {
    icon: Terminal,
    name: "consola-real",
    color: "text-accent-green",
    description: "Pratica comandos Linux num terminal real orquestrado por Kubernetes.",
  },
  {
    icon: Brain,
    name: "chat-ia-rag",
    color: "text-accent-cyan",
    description: "Tira dúvidas com IA treinada nos manuais oficiais LPI.",
  },
  {
    icon: BookOpen,
    name: "manuais-lpi",
    color: "text-accent-magenta",
    description: "114 tópicos dos manuais oficiais, processados e pesquisáveis.",
  },
  {
    icon: Trophy,
    name: "quizzes",
    color: "text-accent-yellow",
    description: "Sistema de revisões espaçadas para fixar o conhecimento.",
  },
]

const stats = [
  { label: "Manuais LPI", value: "5" },
  { label: "Tópicos", value: "114" },
]

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-bg-void">
      <LandingHeader />

      <main className="flex-1">
        {/* Hero — $ boot */}
        <section className="relative overflow-hidden border-b border-border-subtle bg-bg-void">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
          <div className="relative mx-auto max-w-5xl px-4 py-24 text-center sm:py-32 lg:py-40">
            {/* Terminal boot sequence */}
            <div className="mx-auto mb-10 max-w-lg text-left font-mono text-sm">
              <div className="terminal-prompt typing-line">
                <span className="text-text-dim">carregando</span>{" "}
                <span className="text-accent-green">linux-de-camoes</span>
                <span className="text-text-dim">...</span>
              </div>
              <div className="mt-2 text-accent-cyan">pronto.</div>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-text-primary sm:text-5xl lg:text-6xl">
              Domina Linux{" "}
              <span className="text-glow-cyan">com IA Interativa</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-text-secondary">
              Plataforma open-source de aprendizagem de Linux com consola real,
              chat IA baseado nos manuais LPI e sistema gamificado de quizzes.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/sign-up"
                className={buttonVariants({ size: "lg" })}
              >
                Começar Agora
              </Link>
              <Link
                href="/manuals"
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                Ver Manuais
              </Link>
            </div>
          </div>
        </section>

        {/* Manifesto — $ cat /etc/manifesto */}
        <section className="border-b border-border-subtle bg-bg-surface">
          <div className="mx-auto max-w-3xl px-4 py-24">
            <div className="mb-8 font-mono text-sm text-accent-cyan">
              $ cat /etc/manifesto
            </div>
            <div className="space-y-1">
              {manifestoLines.map((line) => (
                <div key={line.num} className="manifesto-line flex gap-4">
                  <span className="line-number shrink-0">{line.num}:</span>
                  <span>{line.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features — $ ls /funcionalidades */}
        <section
          id="funcionalidades"
          className="border-b border-border-subtle bg-bg-void"
        >
          <div className="mx-auto max-w-6xl px-4 py-24">
            <div className="mb-4 font-mono text-sm text-accent-cyan">
              $ ls /funcionalidades
            </div>
            <p className="mb-12 text-text-secondary">
              Ferramentas pensadas para aprendizagem prática e eficaz
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => {
                const Icon = feature.icon
                return (
                  <div key={feature.name} className="terminal-card p-6">
                    <div className="mb-4 flex items-center gap-3">
                      <Icon className={`h-5 w-5 ${feature.color}`} />
                      <span className="font-mono text-sm font-semibold text-accent-green">
                        {feature.name}/
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-text-secondary">
                      {feature.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Neofetch — $ neofetch */}
        <section className="border-b border-border-subtle bg-bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-24">
            <div className="mb-12 font-mono text-sm text-accent-cyan">
              $ neofetch
            </div>
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
              {/* ASCII art */}
              <div className="flex items-center justify-center">
                <pre className="font-mono text-xs leading-tight text-accent-green/80 sm:text-sm">
{`    _             _     _   __                    
   / \\   _ __ ___| |__ | | / /_ _ _ __   __ _ ___ 
  / _ \\ | '__/ __| '_ \\| |/ / _\` | '_ \\ / _\` / __|
 / ___ \\| | | (__| | | |   < (_| | | | | (_| \\__ \\
/_/   \\_\\_|  \\___|_| |_|_|\\_\\__,_|_| |_|\\__, |___/
                                         |___/     `}
                </pre>
              </div>
              {/* Stats */}
              <div className="flex flex-col justify-center gap-4 font-mono text-sm">
                <div className="flex gap-4">
                  <span className="text-text-dim">OS:</span>
                  <span className="text-text-primary">Linux de Camões v1.0</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-text-dim">Kernel:</span>
                  <span className="text-text-primary">Next.js 16 + React 19</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-text-dim">Shell:</span>
                  <span className="text-text-primary">FastAPI + PostgreSQL</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-text-dim">CPU:</span>
                  <span className="text-text-primary">RAG (FAISS + Groq)</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-text-dim">Memory:</span>
                  <span className="text-accent-cyan">114 tópicos LPI</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-text-dim">Disk:</span>
                  <span className="text-accent-cyan">1831 chunks processados</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA — $ sudo make install */}
        <section className="bg-bg-void">
          <div className="mx-auto max-w-5xl px-4 py-24 text-center">
            <div className="mb-8 font-mono text-sm text-accent-cyan">
              $ sudo make install
            </div>
            <h2 className="text-2xl font-bold text-text-primary">
              Junta-te à comunidade
            </h2>
            <div className="mt-10 flex flex-col items-center justify-center gap-8 sm:flex-row sm:gap-16">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="stat-number">{stat.value}</div>
                  <div className="mt-2 text-sm text-text-secondary">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/sign-up"
                className={buttonVariants({ size: "lg" })}
              >
                Criar Conta Grátis
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
              <a
                href="https://github.com/linuxdecamoes"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span
                  className={buttonVariants({ variant: "outline", size: "lg" })}
                >
                  Ver no GitHub
                </span>
              </a>
            </div>
            <p className="mt-6 text-sm text-text-dim">
              Open-source. Gratuito. Para sempre.
            </p>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  )
}
```

- [ ] **Step 2: Verify lint**

Run: `cmd /c "cd /d \"C:\Users\ROG\Documents\manuais Linux\linuxdecamoes\frontend\" && npm run lint"`
Expected: 0 errors.

- [ ] **Step 3: Verify build**

Run: `cmd /c "cd /d \"C:\Users\ROG\Documents\manuais Linux\linuxdecamoes\frontend\" && npm run build"`
Expected: 132/132 pages generated.

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat(landing): rewrite as cyber terminal boot sequence"
```

---

### Task 5: Final verification and Docker rebuild

**Files:** None (verification only)

- [ ] **Step 1: Run lint**

Run: `cmd /c "cd /d \"C:\Users\ROG\Documents\manuais Linux\linuxdecamoes\frontend\" && npm run lint"`
Expected: 0 errors (warnings OK if pre-existing).

- [ ] **Step 2: Run build**

Run: `cmd /c "cd /d \"C:\Users\ROG\Documents\manuais Linux\linuxdecamoes\frontend\" && npm run build"`
Expected: 132/132 pages generated successfully.

- [ ] **Step 3: Docker rebuild**

Run: `docker compose up --build -d frontend`
Workdir: `C:\Users\ROG\Documents\manuais Linux\linuxdecamoes`
Expected: Build succeeds, container recreated and started.

- [ ] **Step 4: Verify in browser**

Open `http://localhost:3000`. Verify:
- Dark background (very dark blue)
- Hero shows typing animation (`>` prompt, text types out)
- "pronto." in cyan
- "Domina Linux com IA Interativa" with cyan glow
- Manifesto section with numbered lines
- Features as terminal-style cards
- Neofetch section with ASCII art + stats
- CTA with stat numbers in cyan
- Footer dark themed
- Header dark themed with cyan CTA button
- Mobile responsive (320px+)

- [ ] **Step 5: Final commit (if any fixes needed)**

```bash
git add -A
git commit -m "fix(landing): cyber terminal final adjustments"
```
