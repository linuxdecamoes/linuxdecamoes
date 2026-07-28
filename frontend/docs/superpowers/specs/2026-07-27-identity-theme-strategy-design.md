# Identity & Theme Strategy — Linux de Camões

> **Data:** 2026-07-27
> **Skills aplicadas:** design-taste-frontend, impeccable, vercel-react-best-practices
> **Estado:** Aprovado pelo utilizador

---

## 0. Design Read

> Educational platform landing + dashboard for Portuguese-speaking Linux learners, with a warm-tech language, leaning toward Tailwind v4 + shadcn/ui + OKLCH custom tokens. Currently caught between "generic SaaS" and "intentional warm identity."

**Audience:** Students (university + self-taught), professionals certifying LPI, Portuguese-speaking community.

### Dials

| Dial | Value | Reasoning |
|------|-------|-----------|
| DESIGN_VARIANCE | 6 | Educational — needs personality but not chaos |
| MOTION_INTENSITY | 4 | CSS-only (ADR-001) + educational focus |
| VISUAL_DENSITY | 3 | Learning platform — breathing room |

---

## 1. Critical Issues Found

| Issue | Severity | Location | Fix |
|-------|----------|----------|-----|
| Font mismatch | Critical | `globals.css:8` maps to Inter, agents.md claims IBM Plex | Keep Inter, fix docs |
| Inconsistent hero treatment | High | Landing=dark, Sobre=light, Manuals=none, Lab=hardcoded | Universal dark hero pattern |
| Dead links | High | Footer: Licença MIT→#, Roadmap→#anchor, Discord→# | Fix or remove |
| No dark mode | Medium | No `prefers-color-scheme: dark` | Single theme (warm) is fine for now |
| Inconsistent Card usage | Medium | Landing=no Card, Sobre=shadcn Card, Dashboard=custom | Universal card-accent-top pattern |
| Generic auth pages | Medium | Bare Clerk components, zero branding | Branded wrapper |
| No brand motif | High | Nothing visual repeats across pages | "Grade Técnica" pattern |
| Copy without personality | Medium | Functional but generic | "Professor técnico que também é hacker" |
| Dashboard hero impersonal | Low | "Olá, Estudante" | Use Clerk firstName |

---

## 2. Identity System

### Brand Motif — "Grade Técnica"

A subtle technical grid pattern that appears in all dark sections (heroes, footers, CTAs). Already exists as `grid.svg` on landing — expand universally.

**Recurring visual elements:**
- **Grid pattern** (`grid.svg`) — dark section backgrounds
- **Accent top border** (3px) — all cards via `.card-accent-top`
- **Dark sections** — hero + footer + CTA always dark
- **Gradient iris→coral** — project signature (`.text-gradient-iris-coral`)

### Typography Hierarchy

| Use | Font | Weight | Size |
|-----|------|--------|------|
| Display (hero titles) | Inter | 800 (extrabold) | 4xl→6xl |
| Heading (section titles) | Inter | 700 (bold) | 2xl→3xl |
| Body | Inter | 400 (regular) | base→lg |
| Code/Terminal | JetBrains Mono | 400 | sm→base |
| Caption/Label | Inter | 500 (medium) | xs→sm |

### Color Role System

| Color | Role | Usage |
|-------|------|-------|
| Coral | Primary / CTA | Primary buttons, action links, CTAs |
| Iris | Navigation / Info | Header nav, badges, info callouts |
| Sage | Success / Progress | Progress bars, checkmarks, quiz completion |
| Amber | Alert / Streak | Streak flame, warnings, pending badges |
| Terracotta | Dark accent | Card borders, secondary dark elements |
| Cream | Light surface | Background, card surfaces |
| card-dark | Dark anchor | Dark sections, terminal, footer |

---

## 3. Page-by-Page Treatment

### Landing (`/`) — Status: ✅ Mostly done
- Fix dead links in footer (Licença MIT → `/sobre#licenca`, Roadmap → `/sobre#roadmap`)
- Remove placeholder links (Discord, Guia de Contribuição) or link to real pages
- Footer copy: "Licenciado sob MIT · Desenvolvido pela comunidade"

### Sobre (`/sobre`) — Status: ❌ Needs full refresh
- **Hero:** dark treatment (`hero-dark` class), badge "Open Source · MIT · PT-PT", white title
- **Mission cards:** `card-accent-top` with color per theme (iris=missão, coral=público, sage=filosofia)
- **Stack table:** keep functional, add accent colors per category
- **Roadmap:** keep gantt + phase cards (good)
- **Community cards:** `card-accent-top` with iris
- **New section:** "Licença MIT" with badge + link to LICENSE file
- **Copy refresh:** personal, less corporate

### Manuals (`/manuals`) — Status: ❌ Needs personality
- Add dark header treatment (mini-hero with "Manuais LPI" badge)
- Manual cards: `card-accent-top` with iris
- Keep layout (functional)

### Lab (`/lab`) — Status: ❌ Outside design system
- Replace `bg-[#0E1525]` with `bg-[var(--card-dark)]` (token-ize)
- Add consistent header treatment
- Keep layout (sidebar + terminal + chat)

### Auth (`/sign-in`, `/sign-up`) — Status: ❌ Zero branding
- Wrapper with dark bg (`card-dark`) + logo + tagline
- Layout: 2 columns (branding left, Clerk form right) on desktop
- Mobile: centered form with dark bg

### Dashboard (`/dashboard`) — Status: ⚠️ Good bento, generic hero
- Hero: "Olá, {firstName}" using Clerk user data
- Keep bento grid (excellent)

### Footer (all landing pages) — Status: ⚠️ Dead links
- Fix all links or remove empty sections
- "Licença MIT" → real link to LICENSE file on GitHub
- "Roadmap" → `/sobre#roadmap`
- Remove "Discord / Chat" and "Guia de Contribuição" if they don't exist

---

## 4. Component Patterns

### Hero Pattern (universal)
```tsx
<section className="hero-dark border-b border-white/10 relative overflow-hidden">
  <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
  <div className="relative mx-auto max-w-5xl px-4 py-24 text-center">
    {/* Badge: rounded-full, iris accent */}
    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-iris/30 bg-iris-soft/80 px-4 py-1.5 text-sm text-iris">
      <Icon /> <span>Label</span>
    </div>
    {/* Title: extrabold, white */}
    <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
      Title <span className="text-gradient-iris-coral">Accent</span>
    </h1>
    {/* Subtitle: white/60 */}
    <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/60">
      Description
    </p>
  </div>
</section>
```

### Card Pattern (universal)
```tsx
<div
  className="card-accent-top rounded-2xl bg-card p-6 transition-shadow hover:shadow-md"
  style={{ "--accent-color": "var(--iris)" }}
>
  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-iris-soft">
    <Icon className="h-6 w-6 text-iris" />
  </div>
  <h3 className="text-lg font-semibold text-foreground">Title</h3>
  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Description</p>
</div>
```

### CTA Pattern
```tsx
<section className="hero-dark border-t border-white/10">
  <div className="mx-auto max-w-5xl px-4 py-16 text-center">
    <h2 className="text-2xl font-bold text-white">CTA Title</h2>
    <p className="mt-2 text-white/60">CTA description</p>
    <div className="mt-6">
      <Link href="/sign-up" className={buttonVariants({ size: "lg" })}>
        Action <ChevronRight className="ml-1 h-4 w-4" />
      </Link>
    </div>
  </div>
</section>
```

### Section Band (alternating rhythm)
Keep existing `.section-band` class for alternating sections.

### Footer Pattern
Dark treatment, 4-column grid, real links only.

---

## 5. Copy & Voice

### Tone of Voice
**"Professor técnico que também é hacker"** — authority + accessibility. Not corporate, not too casual.

| Context | Tone | Example |
|---------|------|---------|
| Hero titles | Direct, motivating | "Domina Linux" (short, strong) |
| Descriptions | Clear, explanatory | "Pratica comandos Linux num terminal real" |
| CTAs | Actionable | "Começar Agora", "Ver Manuais" |
| Error states | Helpful, not alarmist | "Algo correu mal. Tenta novamente." |
| Empty states | Encouraging | "Ainda não tens quizzes. Começa por estudar um manual." |

### Sobre Page Copy Refresh
- Hero: "O projeto construído pela comunidade, para a comunidade"
- Missão: "Preparar qualquer pessoa para os exames LPI"
- Público: "Estudantes, profissionais e curiosos de todo o mundo lusófono"
- Filosofia: "Custo zero. Código aberto. PT-PT."

### Footer Copy
- Change "Todos os direitos reservados" → "Licenciado sob MIT · Desenvolvido pela comunidade"

### Badge/Label System
| Badge Style | Meaning |
|-------------|---------|
| `border-iris/30 bg-iris-soft/80 text-iris` | Informational |
| `bg-sage-soft text-sage` | Active / Completed |
| `bg-amber-soft text-amber` | Pending / Warning |
| `bg-coral-soft text-coral` | Action needed |

---

## 6. React Best Practices Fixes

| Issue | Location | Fix |
|-------|----------|-----|
| Inline SVG in component | `landing-header.tsx:8-18` | Extract GithubIcon to shared icons or use lucide-react `Github` |
| No Suspense boundaries | `dashboard/page.tsx` | Wrap cards in `<Suspense>` for streaming |
| Missing error handling | `dashboard/page.tsx:23` | Add error UI or proper fallback |
| Client component oversized | `landing-header.tsx:1` | Consider server component with client islands |
| No loading.tsx | All route groups | Add loading states |

---

## 7. Implementation Scope

### In Scope
1. CSS tokens/classes for consistent identity (extend `globals.css`)
2. Sobre page full refresh (dark hero, cards, copy)
3. Manuals header treatment
4. Lab token-ize (replace hardcoded bg)
5. Auth branded wrapper
6. Dashboard hero personalization
7. Footer fix (dead links, copy)
8. Landing page minor fixes
9. Documentation fix (IBM Plex → Inter)

### Out of Scope
- Dark mode toggle (single warm theme is intentional)
- New font loading (Inter is fine)
- Animation changes (ADR-001 respected)
- Dashboard card redesign (already good)
- MDX template changes (already premium)

---

## 8. Constraints

- **ADR-001:** Zero runtime animation dependencies (CSS-only)
- **Norma 01:** OKLCH tokens only, zero inline colors in .tsx
- **Norma 03:** PT-PT in all content, UI, commits, docs
- **Existing build:** 132/132 pages must continue passing
- **Clerk integration:** Auth pages must work with Clerk components
