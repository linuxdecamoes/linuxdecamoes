# Dashboard Bento Grid Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the generic 4-card stat dashboard with an asymmetric Bento Grid featuring animated SVG micro-illustrations, bold typography, and warm oklch color blocking.

**Architecture:** 7 independent server components (one per card) + CSS keyframes in globals.css + a grid-assembly page.tsx. All animations are pure CSS (zero new dependencies). Data is hardcoded/mock.

**Tech Stack:** Next.js 16 (React 19, RSC), Tailwind CSS v4 (CSS-first config), oklch colors, inline SVG, CSS @keyframes

**Spec:** `docs/superpowers/specs/2026-07-17-dashboard-bento-design.md`

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `src/app/globals.css` | Modify | Add 8 color variables + 8 @keyframes + reduced-motion |
| `src/components/dashboard/terminal-card.tsx` | Create | Terminal Lab card (dark, 8col, floating bubbles) |
| `src/components/dashboard/topics-card.tsx` | Create | Tópicos card (cream, 4col, radial arc) |
| `src/components/dashboard/chat-card.tsx` | Create | Chat IA card (sage, 5col, message bubbles) |
| `src/components/dashboard/quizzes-card.tsx` | Create | Quizzes card (orange, 3col, ring progress) |
| `src/components/dashboard/manuals-card.tsx` | Create | Manuais LPI card (terracotta dark, 4col, book) |
| `src/components/dashboard/progress-card.tsx` | Create | Progresso card (peach, 4col, bar chart) |
| `src/components/dashboard/streak-card.tsx` | Create | Streak card (amber, 4col, flame) |
| `src/app/(dashboard)/dashboard/page.tsx` | Replace | Bento grid assembly + hero section |

---

### Task 1: CSS Keyframes & Color Variables

**Files:**
- Modify: `frontend/src/app/globals.css:49-83` (append to `:root` block) and append after `@layer base`

- [ ] **Step 1: Add color variables to `:root` block**

Add these 8 variables inside the existing `:root` block in `globals.css`, after line 82 (`--sidebar-ring`):

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

- [ ] **Step 2: Add @keyframes and reduced-motion**

Append after the `@layer base` block (after line 95) in `globals.css`:

```css
@keyframes float {
  0%, 100% { transform: translateY(0); opacity: 0.8; }
  50% { transform: translateY(-8px); opacity: 1; }
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

@keyframes fill-arc {
  from { stroke-dashoffset: 220; }
  to { stroke-dashoffset: 44; }
}

@keyframes pop-in {
  from { transform: scale(0); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes ring-fill {
  from { stroke-dashoffset: 314; }
  to { stroke-dashoffset: 94; }
}

@keyframes page-flip {
  0%, 100% { transform: rotateY(0deg); }
  50% { transform: rotateY(5deg); }
}

@keyframes bar-fill {
  from { width: 0%; }
}

@keyframes flicker {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.9; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 3: Verify build passes**

Run: `cd frontend && npx next build`
Expected: Build succeeds, no CSS errors

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(dashboard): add bento grid color palette and CSS keyframes"
```

---

### Task 2: Terminal Lab Card

**Files:**
- Create: `frontend/src/components/dashboard/terminal-card.tsx`

- [ ] **Step 1: Create the component**

```tsx
import Link from "next/link";

export function TerminalCard() {
  return (
    <Link href="/lab" className="group block h-full">
      <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-3xl bg-[oklch(0.20_0.03_260)] p-6 lg:p-8 shadow-[0_2px_20px_oklch(0_0_0/0.04)] transition-shadow hover:shadow-[0_4px_30px_oklch(0_0_0/0.08)]">
        <div className="relative z-10">
          <h2 className="text-xl lg:text-2xl font-bold text-white/90">Terminal Lab</h2>
          <p className="mt-1 text-sm text-white/60">
            Pratica comandos Linux num terminal real
          </p>
        </div>

        <div className="relative z-10 mt-6 flex flex-col gap-3 overflow-x-auto whitespace-pre">
          <div
            className="w-fit rounded-xl bg-white/10 px-3 py-1.5 font-mono text-xs text-white/80"
            style={{ animation: "float 3s ease-in-out infinite" }}
          >
            $ ls -la /etc/nginx
          </div>
          <div
            className="w-fit rounded-xl bg-white/10 px-3 py-1.5 font-mono text-xs text-white/80"
            style={{ animation: "float 3s ease-in-out infinite 1.2s" }}
          >
            $ grep -r "server_name" /etc
          </div>
          <div
            className="w-fit rounded-xl bg-white/10 px-3 py-1.5 font-mono text-xs text-white/80"
            style={{ animation: "float 3s ease-in-out infinite 2.4s" }}
          >
            $ chmod +x deploy.sh
          </div>
          <div className="font-mono text-xs text-white/40">
            <span style={{ animation: "blink 1s step-end infinite" }}>_</span>
          </div>
        </div>

        <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-white/5" />
        <div className="absolute -top-6 -left-6 h-24 w-24 rounded-full bg-white/5" />
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Verify build passes**

Run: `cd frontend && npx next build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/terminal-card.tsx
git commit -m "feat(dashboard): add Terminal Lab bento card with floating bubbles"
```

---

### Task 3: Tópicos Card

**Files:**
- Create: `frontend/src/components/dashboard/topics-card.tsx`

- [ ] **Step 1: Create the component**

```tsx
export function TopicsCard() {
  return (
    <div className="flex h-full flex-col justify-between rounded-3xl bg-[oklch(0.96_0.02_75)] p-6 lg:p-8 shadow-[0_2px_20px_oklch(0_0_0/0.04)] transition-shadow hover:shadow-[0_4px_30px_oklch(0_0_0/0.08)]">
      <div>
        <h2 className="text-xl lg:text-2xl font-bold text-[oklch(0.20_0.02_260)]">
          Tópicos
        </h2>
        <p className="mt-1 text-sm text-[oklch(0.45_0.03_260)]">
          Dos manuais oficiais LPI
        </p>
      </div>

      <div className="flex items-center gap-6 mt-6">
        <svg width="100" height="100" viewBox="0 0 100 100" className="shrink-0">
          <circle
            cx="50" cy="50" r="38"
            fill="none"
            stroke="oklch(0.90 0.02 75)"
            strokeWidth="8"
          />
          <circle
            cx="50" cy="50" r="38"
            fill="none"
            stroke="oklch(0.65 0.12 50)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="239"
            strokeDashoffset="44"
            transform="rotate(-90 50 50)"
            style={{ animation: "fill-arc 1.5s ease-out forwards" }}
          />
        </svg>
        <div>
          <p className="text-3xl lg:text-4xl font-extrabold tabular-nums text-[oklch(0.20_0.02_260)]">
            114
          </p>
          <p className="text-sm text-[oklch(0.45_0.03_260)]">tópicos</p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build passes**

Run: `cd frontend && npx next build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/topics-card.tsx
git commit -m "feat(dashboard): add Tópicos bento card with radial arc chart"
```

---

### Task 4: Chat IA Card

**Files:**
- Create: `frontend/src/components/dashboard/chat-card.tsx`

- [ ] **Step 1: Create the component**

```tsx
import Link from "next/link";

export function ChatCard() {
  return (
    <Link href="/dashboard/chat" className="group block h-full">
      <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-3xl bg-[oklch(0.97_0.015_155)] p-6 lg:p-8 shadow-[0_2px_20px_oklch(0_0_0/0.04)] transition-shadow hover:shadow-[0_4px_30px_oklch(0_0_0/0.08)]">
        <div className="relative z-10">
          <h2 className="text-xl lg:text-2xl font-bold text-[oklch(0.20_0.02_260)]">
            Chat IA
          </h2>
          <p className="mt-1 text-sm text-[oklch(0.45_0.03_260)]">
            Tira dúvidas com IA baseada nos manuais
          </p>
        </div>

        <div className="relative z-10 mt-6 flex flex-col gap-3">
          <div
            className="self-end max-w-[80%] rounded-2xl rounded-br-sm bg-[oklch(0.65_0.14_25)] px-4 py-2 text-sm text-white"
            style={{ animation: "pop-in 0.3s ease-out 0.2s both" }}
          >
            O que é o <code>chmod 755</code>?
          </div>
          <div
            className="self-start max-w-[85%] rounded-2xl rounded-bl-sm bg-white px-4 py-2 text-sm text-[oklch(0.20_0.02_260)] shadow-sm"
            style={{ animation: "pop-in 0.3s ease-out 0.5s both" }}
          >
            Define permissões: owner rwx, grupo r-x, outros r-x...
          </div>
          <div
            className="self-end max-w-[80%] rounded-2xl rounded-br-sm bg-[oklch(0.65_0.14_25)] px-4 py-2 text-sm text-white"
            style={{ animation: "pop-in 0.3s ease-out 0.8s both" }}
          >
            E o <code>chmod +x</code>?
          </div>
        </div>

        <div className="absolute -bottom-10 -right-10 h-28 w-28 rounded-full bg-white/40" />
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Verify build passes**

Run: `cd frontend && npx next build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/chat-card.tsx
git commit -m "feat(dashboard): add Chat IA bento card with animated bubbles"
```

---

### Task 5: Quizzes Card

**Files:**
- Create: `frontend/src/components/dashboard/quizzes-card.tsx`

- [ ] **Step 1: Create the component**

```tsx
import Link from "next/link";

export function QuizzesCard() {
  return (
    <Link href="/dashboard/quizzes" className="group block h-full">
      <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-3xl bg-[oklch(0.92_0.06_50)] p-6 lg:p-8 shadow-[0_2px_20px_oklch(0_0_0/0.04)] transition-shadow hover:shadow-[0_4px_30px_oklch(0_0_0/0.08)]">
        <div className="relative z-10">
          <h2 className="text-xl lg:text-2xl font-bold text-[oklch(0.20_0.02_260)]">
            Quizzes
          </h2>
          <p className="mt-1 text-sm text-[oklch(0.45_0.03_260)]">
            Revisões espaçadas
          </p>
        </div>

        <div className="relative z-10 mt-6 flex justify-center">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle
              cx="60" cy="60" r="50"
              fill="none"
              stroke="oklch(0.85 0.04 50)"
              strokeWidth="8"
            />
            <circle
              cx="60" cy="60" r="50"
              fill="none"
              stroke="oklch(0.65 0.14 25)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="314"
              strokeDashoffset="94"
              transform="rotate(-90 60 60)"
              style={{ animation: "ring-fill 1.2s ease-out forwards" }}
            />
            <text
              x="60" y="60"
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-[oklch(0.20_0.02_260)] text-lg font-bold"
            >
              70%
            </text>
          </svg>
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Verify build passes**

Run: `cd frontend && npx next build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/quizzes-card.tsx
git commit -m "feat(dashboard): add Quizzes bento card with ring progress"
```

---

### Task 6: Manuais LPI Card

**Files:**
- Create: `frontend/src/components/dashboard/manuals-card.tsx`

- [ ] **Step 1: Create the component**

```tsx
export function ManualsCard() {
  return (
    <div className="flex h-full flex-col justify-between rounded-3xl bg-[oklch(0.28_0.08_30)] p-6 lg:p-8 shadow-[0_2px_20px_oklch(0_0_0/0.04)] transition-shadow hover:shadow-[0_4px_30px_oklch(0_0_0/0.08)]">
      <div>
        <h2 className="text-xl lg:text-2xl font-bold text-white/90">
          Manuais LPI
        </h2>
        <p className="mt-1 text-sm text-white/60">
          114 tópicos dos manuais oficiais, pesquisáveis.
        </p>
      </div>

      <div className="mt-6 flex justify-center">
        <svg
          width="64" height="64" viewBox="0 0 64 64"
          style={{ animation: "page-flip 4s ease-in-out infinite", transformOrigin: "left center" }}
        >
          <rect x="12" y="8" width="40" height="48" rx="3" fill="white" fillOpacity="0.15" />
          <rect x="8" y="12" width="40" height="48" rx="3" fill="white" fillOpacity="0.25" />
          <line x1="16" y1="24" x2="40" y2="24" stroke="white" strokeOpacity="0.4" strokeWidth="2" />
          <line x1="16" y1="32" x2="36" y2="32" stroke="white" strokeOpacity="0.3" strokeWidth="2" />
          <line x1="16" y1="40" x2="32" y2="40" stroke="white" strokeOpacity="0.2" strokeWidth="2" />
        </svg>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build passes**

Run: `cd frontend && npx next build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/manuals-card.tsx
git commit -m "feat(dashboard): add Manuais LPI bento card with page flip animation"
```

---

### Task 7: Progresso Card

**Files:**
- Create: `frontend/src/components/dashboard/progress-card.tsx`

- [ ] **Step 1: Create the component**

```tsx
const bars = [
  { label: "Fundamentos", width: "72%", delay: "0s" },
  { label: "Administração", width: "45%", delay: "0.3s" },
  { label: "Redes", width: "28%", delay: "0.6s" },
];

export function ProgressCard() {
  return (
    <div className="flex h-full flex-col justify-between rounded-3xl bg-[oklch(0.98_0.01_85)] p-6 lg:p-8 shadow-[0_2px_20px_oklch(0_0_0/0.04)] transition-shadow hover:shadow-[0_4px_30px_oklch(0_0_0/0.08)]">
      <div>
        <h2 className="text-xl lg:text-2xl font-bold text-[oklch(0.20_0.02_260)]">
          Progresso
        </h2>
        <p className="mt-1 text-sm text-[oklch(0.45_0.03_260)]">
          Por domínio LPI
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {bars.map((bar) => (
          <div key={bar.label}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-[oklch(0.20_0.02_260)]">{bar.label}</span>
              <span className="tabular-nums text-[oklch(0.45_0.03_260)]">{bar.width}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-[oklch(0.92_0.02_75)]">
              <div
                className="h-full rounded-full bg-[oklch(0.65_0.14_25)]"
                style={{
                  width: bar.width,
                  animation: `bar-fill 1s ease-out ${bar.delay} both`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build passes**

Run: `cd frontend && npx next build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/progress-card.tsx
git commit -m "feat(dashboard): add Progresso bento card with animated bars"
```

---

### Task 8: Streak Card

**Files:**
- Create: `frontend/src/components/dashboard/streak-card.tsx`

- [ ] **Step 1: Create the component**

```tsx
const days = ["S", "T", "Q", "Q", "S", "S", "D"];
const activeDays = [false, false, false, false, false, false, false];

export function StreakCard() {
  return (
    <div className="flex h-full flex-col justify-between rounded-3xl bg-[oklch(0.96_0.04_70)] p-6 lg:p-8 shadow-[0_2px_20px_oklch(0_0_0/0.04)] transition-shadow hover:shadow-[0_4px_30px_oklch(0_0_0/0.08)]">
      <div>
        <h2 className="text-xl lg:text-2xl font-bold text-[oklch(0.20_0.02_260)]">
          Sequência
        </h2>
        <p className="mt-1 text-sm text-[oklch(0.45_0.03_260)]">
          Dias consecutivos
        </p>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <svg
          width="48" height="48" viewBox="0 0 48 48"
          style={{ animation: "flicker 2s ease-in-out infinite" }}
        >
          <path
            d="M24 4 C24 4 32 14 32 24 C32 30 28 34 24 36 C20 34 16 30 16 24 C16 14 24 4 24 4Z"
            fill="oklch(0.75 0.12 70)"
          />
          <path
            d="M24 14 C24 14 28 20 28 26 C28 30 26 32 24 33 C22 32 20 30 20 26 C20 20 24 14 24 14Z"
            fill="oklch(0.85 0.14 80)"
          />
          <path
            d="M24 22 C24 22 26 26 26 28 C26 30 25 31 24 31.5 C23 31 22 30 22 28 C22 26 24 22 24 22Z"
            fill="oklch(0.92 0.10 90)"
          />
        </svg>

        <div className="flex gap-2">
          {days.map((day, i) => (
            <div
              key={i}
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
                activeDays[i]
                  ? "bg-[oklch(0.75_0.12_70)] text-white"
                  : "bg-[oklch(0.90_0.03_70)] text-[oklch(0.45_0.03_260)]"
              }`}
            >
              {day}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build passes**

Run: `cd frontend && npx next build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/streak-card.tsx
git commit -m "feat(dashboard): add Streak bento card with flame animation"
```

---

### Task 9: Dashboard Page — Grid Assembly

**Files:**
- Replace: `frontend/src/app/(dashboard)/dashboard/page.tsx`

- [ ] **Step 1: Replace the entire page.tsx**

```tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { TerminalCard } from "@/components/dashboard/terminal-card";
import { TopicsCard } from "@/components/dashboard/topics-card";
import { ChatCard } from "@/components/dashboard/chat-card";
import { QuizzesCard } from "@/components/dashboard/quizzes-card";
import { ManualsCard } from "@/components/dashboard/manuals-card";
import { ProgressCard } from "@/components/dashboard/progress-card";
import { StreakCard } from "@/components/dashboard/streak-card";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="mx-auto w-full max-w-[1560px] 2xl:max-w-[1920px] px-4 md:px-8 xl:px-12 py-8">
      {/* Hero */}
      <div className="mb-6 rounded-3xl bg-gradient-to-br from-[oklch(0.95_0.03_75)] to-[oklch(0.97_0.02_155)] p-8 lg:p-10">
        <h1 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight text-[oklch(0.20_0.02_260)]">
          Olá, Estudante
        </h1>
        <p className="mt-2 text-base text-[oklch(0.45_0.03_260)]">
          Continua onde paraste
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-5">
        {/* Terminal Lab — 8col × 2row */}
        <div className="md:col-span-6 lg:col-span-8 lg:row-span-2 min-h-[200px]">
          <TerminalCard />
        </div>

        {/* Tópicos — 4col × 2row */}
        <div className="md:col-span-3 lg:col-span-4 lg:row-span-2 min-h-[200px]">
          <TopicsCard />
        </div>

        {/* Chat IA — 5col × 2row */}
        <div className="md:col-span-3 lg:col-span-5 lg:row-span-2 min-h-[200px]">
          <ChatCard />
        </div>

        {/* Quizzes — 3col × 2row */}
        <div className="md:col-span-3 lg:col-span-3 lg:row-span-2 min-h-[200px]">
          <QuizzesCard />
        </div>

        {/* Progresso — 4col × 2row */}
        <div className="md:col-span-6 lg:col-span-4 lg:row-span-2 min-h-[200px]">
          <ProgressCard />
        </div>

        {/* Manuais + Streak row */}
        <div className="md:col-span-6 lg:col-span-4 min-h-[140px]">
          <ManualsCard />
        </div>
        <div className="md:col-span-6 lg:col-span-4 min-h-[140px]">
          <StreakCard />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build passes**

Run: `cd frontend && npx next build`
Expected: Build succeeds, no TypeScript errors

- [ ] **Step 3: Visual verification at multiple viewports**

Rebuild the Docker container and verify:
- 1920px: full 12-col bento, hero full width
- 1440px: 12-col, cards resize naturally
- 768px: 6-col tablet, Manuais+Streak side by side
- 375px: single column, all stacked, terminal scrolls horizontally

Run: `cd /d "C:\Users\ROG\Documents\manuais Linux\linuxdecamoes" && docker compose up -d --build frontend`

- [ ] **Step 4: Commit**

```bash
git add src/app/\(dashboard\)/dashboard/page.tsx
git commit -m "feat(dashboard): replace with bento grid layout + hero section"
```

---

### Task 10: Final Verification

- [ ] **Step 1: Full production build**

Run: `cd frontend && npx next build`
Expected: Build succeeds with zero errors

- [ ] **Step 2: Docker rebuild and smoke test**

```bash
cd "C:\Users\ROG\Documents\manuais Linux\linuxdecamoes"
docker compose up -d --build frontend
docker logs linuxdecamoes-frontend-1
```
Expected: "Ready in 0ms", no Clerk errors

- [ ] **Step 3: Check all card components render**

From inside the container:
```bash
docker exec linuxdecamoes-frontend-1 wget -qO- http://localhost:3000/ 2>&1 | grep -o "Terminal Lab\|Tópicos\|Chat IA\|Quizzes\|Manuais LPI\|Progresso\|Sequência"
```
Expected: All 7 card titles appear in the HTML

- [ ] **Step 4: Verify no lint errors**

Run: `cd frontend && npx next lint`
Expected: No errors (warnings acceptable)
