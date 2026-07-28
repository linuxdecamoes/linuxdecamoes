# Design Spec: Dashboard Bento Grid Redesign

**Date:** 2026-07-17
**Status:** Approved
**Scope:** Visual-only — all data remains mocked/hardcoded
**Approach:** CSS pure keyframes + inline SVG (zero new dependencies)

---

## 1. Overview

Redesign the Linux de Camões dashboard from a generic 4-card stat grid into a visually rich, asymmetric Bento Grid with animated micro-illustrations, bold typography hierarchy, and warm oklch color blocking.

**Reference mockup:** `frontend/mockup-dashboard.html`

---

## 2. Layout & Grid

**Grid system:** CSS Grid, 12 columns (lg:), 6 columns (md:), 1 column (mobile).

**Max-width responsive:**
- `xl:max-w-[1560px]` — standard desktop
- `2xl:max-w-[1920px]` — ultrawide/2K/4K
- Mobile: full width with `px-4` padding

**Card layout (lg: 12-col grid):**

| Card | lg: col-span | md: behavior | Mobile |
|------|-------------|--------------|--------|
| Terminal Lab | 8 cols, 2 rows | Full width top | Full width |
| Tópicos | 4 cols, 2 rows | 3 cols | Full width |
| Chat IA | 5 cols, 2 rows | 3 cols | Full width |
| Quizzes | 3 cols, 2 rows | 3 cols | Full width |
| Manuais LPI | 4 cols, 1 row | Side-by-side with Streak | Full width |
| Progresso | 4 cols, 2 rows | Full width | Full width |
| Streak | 4 cols, 1 row | Side-by-side with Manuais | Full width |

**Responsive rules:**
- **Mobile (default):** `grid-cols-1` — all cards stacked, auto height
- **Tablet (md:):** `grid-cols-6` — Terminal full width, others fill 3 cols each
- **Desktop (lg:):** `grid-cols-12` — full asymmetric Bento layout
- **Manuais + Streak on tablet:** `md:flex-row` (side by side), `lg:flex-col` (stacked in grid)

**Grid gap:** `gap-5` (20px)

**Border radius:** All cards `rounded-3xl` (24px)

**Card shadow:** `shadow-[0_2px_20px_oklch(0_0_0/0.04)]`

---

## 3. Hero Section

Above the grid, full width within the container.

**Background:** Linear gradient `oklch(0.95 0.03 75)` to `oklch(0.97 0.02 155)`
**Border radius:** `rounded-3xl`
**Padding:** `p-8 lg:p-10`
**Margin bottom:** `mb-6`

**Content:**
- Title: `"Olá, {first_name}"` — `text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight text-[oklch(0.20_0.02_260)]`
- Subtitle: `"Continua onde paraste"` — `text-base text-[oklch(0.45_0.03_260)] mt-2`

---

## 4. Card Visual Specifications

### 4.1 Terminal Lab (dark card, 8col × 2row)
- **Background:** `bg-[oklch(0.20_0.03_260)]`
- **Text:** `text-white/90`
- **Title:** "Terminal Lab" + subtitle "Pratica comandos Linux num terminal real"
- **SVG illustration:** 3-4 floating command bubbles (`ls -la`, `grep -r`, `chmod +x`, `docker ps`)
  - Each bubble: `bg-white/10 rounded-xl px-3 py-1.5 font-mono text-xs`
  - Animation: `@keyframes float` — translateY oscillation (±8px, 3s infinite)
  - Staggered delays: 0s, 1.2s, 2.4s, 3.6s
- **Cursor blink:** `@keyframes blink` on a `_` character, 1s infinite

### 4.2 Tópicos (cream card, 4col × 2row)
- **Background:** `bg-[oklch(0.96_0.02_75)]`
- **Title:** "114 Tópicos" (stat number `text-3xl lg:text-4xl font-extrabold tabular-nums`)
- **SVG:** Radial arc chart
  - Stroke: `oklch(0.65 0.12 50)`, width 8px, radius 50px
  - `@keyframes fill-arc` — `stroke-dashoffset` animates from full to target (ease-out, 1.5s)
  - Background track: `oklch(0.90 0.02 75)`

### 4.3 Chat IA (sage card, 5col × 2row)
- **Background:** `bg-[oklch(0.97_0.015_155)]`
- **Title:** "Chat IA" + subtitle
- **SVG:** 2-3 mini message bubbles staggered
  - User bubble (right-aligned): `bg-[oklch(0.65_0.14_25)] text-white rounded-2xl rounded-br-sm`
  - AI bubble (left-aligned): `bg-white rounded-2xl rounded-bl-sm shadow-sm`
  - `@keyframes pop-in` — scale 0→1 + opacity 0→1 (0.3s, staggered 0.2s apart)

### 4.4 Quizzes (orange card, 3col × 2row)
- **Background:** `bg-[oklch(0.92_0.06_50)]`
- **Title:** "Quizzes" + subtitle
- **SVG:** Circular progress ring
  - Circle: 120px diameter, stroke-width 8
  - Stroke: `oklch(0.65 0.14 25)` (coral), track: `oklch(0.85 0.04 50)`
  - `@keyframes ring-fill` — `stroke-dashoffset` animation (1.2s ease-out)
  - Center: trophy icon or percentage

### 4.5 Manuais LPI (terracotta dark card, 4col × 1row)
- **Background:** `bg-[oklch(0.28_0.08_30)]`
- **Text:** `text-white/90`
- **Title:** "Manuais LPI" + "114 tópicos dos manuais oficiais"
- **SVG:** Open book icon with `@keyframes page-flip` (subtle rotateY ±5deg, 4s infinite)

### 4.6 Progresso (peach card, 4col × 2row)
- **Background:** `bg-[oklch(0.98_0.01_85)]`
- **Title:** "Progresso" 
- **SVG:** 3 horizontal progress bars
  - Labels: "Fundamentos", "Administração", "Redes"
  - Bar track: `bg-[oklch(0.92_0.02_75)]`, fill: `bg-[oklch(0.65_0.14_25)]`
  - `@keyframes bar-fill` — width 0% → target% (1s ease-out, staggered 0.3s)

### 4.7 Streak (amber card, 4col × 1row)
- **Background:** `bg-[oklch(0.96_0.04_70)]`
- **Title:** "Sequência" + "0 dias"
- **SVG:** Flame icon (3 layers: orange/amber/yellow) with `@keyframes flicker` (scale ±5%, opacity ±10%, 2s infinite)
- 7 mini dots for weekday, active days highlighted in solid amber

---

## 5. Typography

| Level | Usage | Classes | Size range |
|-------|-------|---------|------------|
| Hero | Greeting title | `text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight` | 36→60px |
| Card Title | Card headings | `text-xl lg:text-2xl font-bold` | 20→24px |
| Stat Number | Big numbers | `text-3xl lg:text-4xl font-extrabold tabular-nums` | 30→36px |
| Label | Subtitles, meta | `text-sm font-medium text-muted-foreground` | 14px |

**Font families:** IBM Plex Sans (body), IBM Plex Mono (terminal bubbles, code)
**Text color:** `oklch(0.20 0.02 260)` (warm near-black) — never pure `#000`
**Dark cards:** `text-white/90`

---

## 6. Color Palette Extension

New CSS variables added to `:root` in `globals.css`:

```css
--color-coral: oklch(0.65 0.14 25);
--color-amber: oklch(0.75 0.12 70);
--color-sage: oklch(0.92 0.04 155);
--color-terracota: oklch(0.35 0.10 40);
--color-peach: oklch(0.90 0.03 60);
--color-cream: oklch(0.96 0.02 75);
--color-card-dark: oklch(0.20 0.03 260);
--color-card-dark-alt: oklch(0.28 0.08 30);
```

These complement (do not replace) existing `--primary`, `--muted`, etc.

---

## 7. Animations (CSS Keyframes)

All keyframes defined in `globals.css`. All respect `prefers-reduced-motion: reduce` (disables animations).

```css
/* Terminal bubbles floating */
@keyframes float {
  0%, 100% { transform: translateY(0); opacity: 0.8; }
  50% { transform: translateY(-8px); opacity: 1; }
}

/* Cursor blink */
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* Arc/chart fill */
@keyframes fill-arc {
  from { stroke-dashoffset: var(--arc-total); }
  to { stroke-dashoffset: var(--arc-target); }
}

/* Chat bubble pop */
@keyframes pop-in {
  from { transform: scale(0); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

/* Progress ring */
@keyframes ring-fill {
  from { stroke-dashoffset: var(--ring-total); }
  to { stroke-dashoffset: var(--ring-target); }
}

/* Book page flip */
@keyframes page-flip {
  0%, 100% { transform: rotateY(0deg); }
  50% { transform: rotateY(5deg); }
}

/* Progress bars fill */
@keyframes bar-fill {
  from { width: 0%; }
  to { width: var(--bar-target); }
}

/* Flame flicker */
@keyframes flicker {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.9; }
}

/* Reduced motion override */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 8. Component Architecture

**Server Components (no `"use client"`):** All dashboard card components are React Server Components. Animations are pure CSS — no JavaScript animation runtime needed.

**File structure:**

```
src/app/(dashboard)/dashboard/
  page.tsx              — Grid layout, imports all cards

src/components/dashboard/
  terminal-card.tsx     — Terminal Lab card + SVG
  topics-card.tsx       — Tópicos card + radial SVG
  chat-card.tsx         — Chat IA card + bubbles SVG
  quizzes-card.tsx      — Quizzes card + ring SVG
  manuals-card.tsx      — Manuais LPI card + book SVG
  progress-card.tsx     — Progresso card + bars SVG
  streak-card.tsx       — Streak card + flame SVG
```

Each card component receives no props (all data hardcoded). Each exports a single default function component.

**Grid assembly in `page.tsx`:**

```tsx
<div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-5">
  <div className="md:col-span-6 lg:col-span-8 lg:row-span-2">
    <TerminalCard />
  </div>
  <div className="md:col-span-3 lg:col-span-4 lg:row-span-2">
    <TopicsCard />
  </div>
  {/* ... etc */}
</div>
```

---

## 9. Terminal Lab — Mobile Protection

The terminal card MUST NOT break the grid on small screens:

```tsx
<div className="overflow-x-auto whitespace-pre">
  {/* SVG with command bubbles */}
</div>
```

This ensures horizontal scroll instead of layout overflow on mobile.

---

## 10. Constraints & Decisions

| Decision | Rationale |
|----------|-----------|
| CSS keyframes over Framer Motion | Zero new dependencies, sufficient for looping animations |
| Server Components | No client JS needed — CSS handles all animation |
| Hardcoded data | Backend endpoints for stats/streak/progress are future work |
| oklch everywhere | Consistent with existing theme, perceptually uniform |
| No new shadcn components | All cards are custom — shadcn Card only for structural shell |
| `prefers-reduced-motion` | Accessibility requirement — all animations disabled |

---

## 11. Files Modified

| File | Action |
|------|--------|
| `src/app/(dashboard)/dashboard/page.tsx` | Replace entirely |
| `src/app/globals.css` | Add keyframes + color variables |
| `src/components/dashboard/terminal-card.tsx` | Create |
| `src/components/dashboard/topics-card.tsx` | Create |
| `src/components/dashboard/chat-card.tsx` | Create |
| `src/components/dashboard/quizzes-card.tsx` | Create |
| `src/components/dashboard/manuals-card.tsx` | Create |
| `src/components/dashboard/progress-card.tsx` | Create |
| `src/components/dashboard/streak-card.tsx` | Create |

---

## 12. Verification

After implementation:
1. `npm run build` — no errors
2. Visual check at 1920px, 1440px, 768px, 375px viewports
3. All animations playing smoothly
4. `prefers-reduced-motion: reduce` disables all animations
5. Terminal card scrolls horizontally on mobile without breaking grid
6. Manuais + Streak side-by-side on tablet, stacked on desktop
