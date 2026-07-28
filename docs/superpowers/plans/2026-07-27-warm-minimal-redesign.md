# Warm Minimal Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the landing page and dashboard with a "Warm Minimal" personality — dark hero sections, bold typography, clean cards with accent borders, and a sleek tech-academy feel.

**Architecture:** Add new CSS tokens and component classes to `globals.css`, then rewrite the landing page (hero, features, CTA) and dashboard (hero, card refinements). No new dependencies. All visual changes via CSS tokens and Tailwind classes.

**Tech Stack:** Next.js 16, React 19, Tailwind v4, shadcn/ui, OKLCH tokens, CSS keyframes (ADR-001 compliant)

---

## File Map

| File | Responsibility |
|------|---------------|
| `src/app/globals.css` | New tokens + component classes |
| `src/components/landing-header.tsx` | Button CTA → primary |
| `src/app/page.tsx` | Landing: hero + features + CTA rewrite |
| `src/app/(dashboard)/dashboard/page.tsx` | Dashboard hero rewrite |
| `src/components/dashboard/terminal-card.tsx` | rounded-2xl, border-top accent |
| `src/components/dashboard/chat-card.tsx` | rounded-2xl, border-top accent |
| `src/components/dashboard/quizzes-card.tsx` | rounded-2xl, border-top accent, % visível |
| `src/components/dashboard/progress-card.tsx` | rounded-2xl, border-top accent, 2 barras |
| `src/components/dashboard/manuals-card.tsx` | rounded-2xl, border-top accent |
| `src/components/dashboard/streak-card.tsx` | rounded-2xl, border-top accent |
| `src/components/dashboard/study-card.tsx` | rounded-2xl, border-top accent |
| `src/components/dashboard/topics-card.tsx` | rounded-2xl, border-top accent |

---

### Task 1: Add CSS tokens and component classes

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add new tokens to `:root`**

Add after the `--shadow-card-elevated` block (around line 193):

```css
/* --- Warm Minimal: hero dark sections --- */
--hero-dark-bg: oklch(0.16 0.025 260);
--hero-dark-gradient: radial-gradient(ellipse 80% 60% at 20% 50%,
  oklch(0.55 0.13 265 / 0.15) 0%,
  oklch(0.65 0.14 25 / 0.08) 50%,
  transparent 80%);

/* --- Warm Minimal: dashboard hero --- */
--dashboard-hero-bg: oklch(0.18 0.025 260);
--dashboard-hero-gradient: radial-gradient(ellipse 70% 50% at 25% 50%,
  oklch(0.55 0.13 265 / 0.12) 0%,
  oklch(0.65 0.14 25 / 0.06) 50%,
  transparent 75%);
```

- [ ] **Step 2: Expose tokens in `@theme inline`**

Add inside the `@theme inline` block (after the `--shadow-card-elevated` line):

```css
--color-hero-dark-bg: var(--hero-dark-bg);
--color-dashboard-hero-bg: var(--dashboard-hero-bg);
```

- [ ] **Step 3: Add component classes**

Add inside the existing `@layer components` block (after the `.stagger-list` rules):

```css
/* Warm Minimal: dark hero sections */
.hero-dark {
  background: var(--hero-dark-bg);
  background-image: var(--hero-dark-gradient);
}

.dashboard-hero {
  background: var(--dashboard-hero-bg);
  background-image: var(--dashboard-hero-gradient);
}

/* Warm Minimal: card accent top border */
.card-accent-top {
  position: relative;
}
.card-accent-top::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
  background: var(--accent-color, var(--primary));
}

/* Warm Minimal: gradient text */
.text-gradient-iris-coral {
  background: linear-gradient(135deg,
    oklch(0.65 0.14 25) 0%,
    oklch(0.55 0.13 265) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

- [ ] **Step 4: Verify build passes**

Run: `cmd /c "npm run lint"`
Expected: PASS

Run: `cmd /c "npm run build"`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: add warm minimal CSS tokens and component classes"
```

---

### Task 2: Update landing header button

**Files:**
- Modify: `src/components/landing-header.tsx:84-89`

- [ ] **Step 1: Change CTA button classes**

Find the desktop CTA button (line 84-89):
```tsx
<Button
  className="bg-cta text-cta-foreground hover:bg-cta/90"
  size="lg"
>
  Aceder ao Dashboard
</Button>
```

Replace with:
```tsx
<Button
  className="bg-primary text-primary-foreground hover:bg-primary/90"
  size="lg"
>
  Aceder ao Dashboard
</Button>
```

Also change the mobile CTA button (line 132):
```tsx
<Button className="w-full bg-cta text-cta-foreground hover:bg-cta/90">
```

Replace with:
```tsx
<Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
```

- [ ] **Step 2: Verify build passes**

Run: `cmd /c "npm run lint"`
Expected: PASS

Run: `cmd /c "npm run build"`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/landing-header.tsx
git commit -m "feat: landing header CTA button → primary color"
```

---

### Task 3: Rewrite landing page hero

**Files:**
- Modify: `src/app/page.tsx:15-45`

- [ ] **Step 1: Replace the hero section**

Replace the entire `<section>` from line 15 to line 45 with:

```tsx
{/* Hero Section */}
<section className="relative overflow-hidden hero-dark border-b border-white/10">
  <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
  <div className="relative mx-auto max-w-5xl px-4 py-24 text-center sm:py-32 lg:py-40">
    <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-iris/30 bg-iris-soft/80 px-4 py-1.5 text-sm text-iris">
      <Terminal className="h-4 w-4" />
      <span>Pratica Linux com IA</span>
    </div>
    <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
      Domina Linux{" "}
      <span className="text-gradient-iris-coral">com IA Interativa</span>
    </h1>
    <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/60">
      Plataforma de aprendizagem com consola real, chat IA baseado nos
      manuais LPI e sistema gamificado de quizzes com revisões espaçadas.
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
```

- [ ] **Step 2: Verify build passes**

Run: `cmd /c "npm run lint"`
Expected: PASS

Run: `cmd /c "npm run build"`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: landing hero → dark section with gradient text"
```

---

### Task 4: Rewrite landing page features

**Files:**
- Modify: `src/app/page.tsx:47-110`

- [ ] **Step 1: Replace the features section**

Replace the `<section id="funcionalidades">` block (lines 47-110) with:

```tsx
{/* Features */}
<section
  id="funcionalidades"
  className="mx-auto max-w-6xl px-4 py-24"
>
  <h2 className="mb-4 text-center text-2xl font-bold text-foreground">
    Tudo o que precisas para dominar Linux
  </h2>
  <p className="mb-12 text-center text-muted-foreground">
    Ferramentas pensadas para aprendizagem prática e eficaz
  </p>
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <div className="group rounded-2xl p-6 transition-colors hover:bg-muted/50">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-iris-soft">
        <Terminal className="h-7 w-7 text-iris" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">
        Consola Real
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Pratica comandos Linux num terminal real orquestrado por
        Kubernetes.
      </p>
    </div>
    <div className="group rounded-2xl p-6 transition-colors hover:bg-muted/50">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-coral-soft">
        <Brain className="h-7 w-7 text-coral" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">
        Chat IA RAG
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Tira dúvidas com IA treinada nos manuais oficiais LPI.
      </p>
    </div>
    <div className="group rounded-2xl p-6 transition-colors hover:bg-muted/50">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-sage-soft">
        <BookOpen className="h-7 w-7 text-sage" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">
        Manuais LPI
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        114 tópicos dos manuais oficiais, processados e pesquisáveis.
      </p>
    </div>
    <div className="group rounded-2xl p-6 transition-colors hover:bg-muted/50">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-amber-soft">
        <Trophy className="h-7 w-7 text-amber" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">
        Quizzes Gamificados
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Sistema de revisões espaçadas para fixar o conhecimento.
      </p>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Verify build passes**

Run: `cmd /c "npm run lint"`
Expected: PASS

Run: `cmd /c "npm run build"`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: landing features → minimal cards with accent colors"
```

---

### Task 5: Rewrite landing page CTA

**Files:**
- Modify: `src/app/page.tsx:112-132`

- [ ] **Step 1: Replace the CTA section**

Replace the `<section className="border-t...">` block (lines 112-132) with:

```tsx
{/* CTA */}
<section className="hero-dark border-t border-white/10">
  <div className="mx-auto max-w-5xl px-4 py-16 text-center">
    <h2 className="text-2xl font-bold text-white">
      Pronto para dominar Linux?
    </h2>
    <p className="mt-2 text-white/60">
      Começa agora gratuitamente com a plataforma mais completa para
      aprender Linux.
    </p>
    <div className="mt-6">
      <Link
        href="/sign-up"
        className={buttonVariants({ size: "lg" })}
      >
        Criar Conta Grátis
        <ChevronRight className="ml-1 h-4 w-4" />
      </Link>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Verify build passes**

Run: `cmd /c "npm run lint"`
Expected: PASS

Run: `cmd /c "npm run build"`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: landing CTA → dark section matching hero"
```

---

### Task 6: Rewrite dashboard hero

**Files:**
- Modify: `src/app/(dashboard)/dashboard/page.tsx:29-37`

- [ ] **Step 1: Replace the dashboard hero**

Replace the hero `<div>` (lines 29-37) with:

```tsx
{/* Hero */}
<div className="mb-6 rounded-2xl dashboard-hero p-8 lg:p-10">
  <h1 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight text-white">
    Olá, Estudante
  </h1>
  <p className="mt-2 text-base text-white/60">
    Continua onde paraste
  </p>
</div>
```

Note: The `auth()` call already exists in the component. To use the user's name, we can import `currentUser` from Clerk. However, since the spec says "usar firstName do Clerk se disponível, senão Estudante", and the current code already has `auth()`, we'll keep "Estudante" for now and note this as a follow-up enhancement.

- [ ] **Step 2: Verify build passes**

Run: `cmd /c "npm run lint"`
Expected: PASS

Run: `cmd /c "npm run build"`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/app/\(dashboard\)/dashboard/page.tsx
git commit -m "feat: dashboard hero → dark section with gradient"
```

---

### Task 7: Update all dashboard cards — rounded-2xl + border-top

**Files:**
- Modify: `src/components/dashboard/terminal-card.tsx`
- Modify: `src/components/dashboard/chat-card.tsx`
- Modify: `src/components/dashboard/quizzes-card.tsx`
- Modify: `src/components/dashboard/progress-card.tsx`
- Modify: `src/components/dashboard/manuals-card.tsx`
- Modify: `src/components/dashboard/streak-card.tsx`
- Modify: `src/components/dashboard/study-card.tsx`
- Modify: `src/components/dashboard/topics-card.tsx`

- [ ] **Step 1: Update terminal-card.tsx**

Find `rounded-3xl` and replace with `rounded-2xl`. Add `card-accent-top` class and inline style for accent color:

```tsx
<div className="relative flex h-full flex-col justify-between overflow-hidden rounded-2xl bg-card-dark p-6 lg:p-8 shadow-bento transition-shadow hover:shadow-bento-hover card-accent-top" style={{ "--accent-color": "var(--iris)" } as React.CSSProperties}>
```

- [ ] **Step 2: Update chat-card.tsx**

Find `rounded-3xl` and replace with `rounded-2xl`. Add `card-accent-top` class:

```tsx
<div className="relative flex h-full flex-col justify-between overflow-hidden rounded-2xl bg-sage-soft p-6 lg:p-8 shadow-bento transition-shadow hover:shadow-bento-hover card-accent-top" style={{ "--accent-color": "var(--sage)" } as React.CSSProperties}>
```

- [ ] **Step 3: Update quizzes-card.tsx**

Find `rounded-3xl` (it uses Card component, so we need to add classes to the Card):

The Card component wraps with `<Card className="h-full bg-amber-soft shadow-bento transition-shadow hover:shadow-bento-hover">`. Add `rounded-2xl card-accent-top` and inline style:

```tsx
<Card className="h-full bg-amber-soft shadow-bento transition-shadow hover:shadow-bento-hover rounded-2xl card-accent-top" style={{ "--accent-color": "var(--amber)" } as React.CSSProperties}>
```

- [ ] **Step 4: Update progress-card.tsx**

Find `rounded-3xl` and replace with `rounded-2xl`. Add `card-accent-top` class:

```tsx
<div className="flex h-full flex-col justify-between rounded-2xl bg-cream p-6 lg:p-8 shadow-bento transition-shadow hover:shadow-bento-hover card-accent-top" style={{ "--accent-color": "var(--coral)" } as React.CSSProperties}>
```

Also simplify from 3 bars to 2 — remove the "Redes" bar (the third one):

```tsx
const bars = [
  { label: "Fundamentos", width: "72%", delay: "0s" },
  { label: "Administração", width: "45%", delay: "0.3s" },
];
```

- [ ] **Step 5: Update manuals-card.tsx**

Find `rounded-3xl` and replace with `rounded-2xl`. Add `card-accent-top` class:

```tsx
<div className="flex h-full flex-col justify-between rounded-2xl bg-card-dark-alt p-6 lg:p-8 shadow-bento transition-shadow hover:shadow-bento-hover card-accent-top" style={{ "--accent-color": "var(--terracotta)" } as React.CSSProperties}>
```

- [ ] **Step 6: Update streak-card.tsx**

Find `rounded-3xl` and replace with `rounded-2xl`. Add `card-accent-top` class:

```tsx
<div className="flex h-full flex-col justify-between rounded-2xl bg-amber-soft p-6 lg:p-8 shadow-bento transition-shadow hover:shadow-bento-hover card-accent-top" style={{ "--accent-color": "var(--amber)" } as React.CSSProperties}>
```

- [ ] **Step 7: Update study-card.tsx**

The Card component wraps. Add `rounded-2xl card-accent-top`:

```tsx
<Card className="h-full bg-cream shadow-bento hover:shadow-bento-hover transition-shadow duration-300 rounded-2xl card-accent-top" style={{ "--accent-color": "var(--primary)" } as React.CSSProperties}>
```

- [ ] **Step 8: Update topics-card.tsx**

Find `rounded-3xl` and replace with `rounded-2xl`. Add `card-accent-top` class:

```tsx
<div className="flex h-full flex-col justify-between rounded-2xl bg-cream p-6 lg:p-8 shadow-bento transition-shadow hover:shadow-bento-hover card-accent-top" style={{ "--accent-color": "var(--primary)" } as React.CSSProperties}>
```

- [ ] **Step 9: Update dashboard page rounded-3xl → rounded-2xl**

In `src/app/(dashboard)/dashboard/page.tsx`, the hero div already got `rounded-2xl` in Task 6. Verify no other `rounded-3xl` remains in the dashboard page.

- [ ] **Step 10: Verify build passes**

Run: `cmd /c "npm run lint"`
Expected: PASS

Run: `cmd /c "npm run build"`
Expected: PASS

- [ ] **Step 11: Commit**

```bash
git add src/components/dashboard/
git commit -m "feat: dashboard cards → rounded-2xl with accent top borders"
```

---

### Task 8: Final verification and cleanup

- [ ] **Step 1: Full lint**

Run: `cmd /c "npm run lint"`
Expected: PASS

- [ ] **Step 2: Full build**

Run: `cmd /c "npm run build"`
Expected: PASS (131/131 pages SSG)

- [ ] **Step 3: Visual check — landing page**

Verify in browser or by reviewing code:
- Hero section has dark background with gradient
- "com IA Interativa" has iris→coral gradient text
- Features section has 4 cards with different accent colors
- CTA section matches hero dark style
- Header CTA button is primary color

- [ ] **Step 4: Visual check — dashboard**

Verify:
- Dashboard hero has dark background with gradient
- All cards have `rounded-2xl` (not `rounded-3xl`)
- All cards have top accent border
- Progress card has 2 bars (not 3)

- [ ] **Step 5: Final commit (if any cleanup needed)**

```bash
git add -A
git commit -m "chore: warm minimal redesign cleanup"
```
