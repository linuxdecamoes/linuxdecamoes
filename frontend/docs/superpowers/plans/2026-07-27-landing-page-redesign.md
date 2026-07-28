# Landing Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the landing page (homepage, header, footer) to match the "Linux de Camões" visual identity with slate/blue/orange palette, Merriweather serif accents, Bento Grid layout, and new sections (tech stack + community).

**Architecture:** Landing-scoped CSS tokens via `.landing-theme` wrapper class on `page.tsx`. New Merriweather + Fira Code fonts added to `layout.tsx`. Three components rewritten: `page.tsx` (hero + bento + stack + community), `landing-header.tsx` (nav + logo + mobile), `landing-footer.tsx` (3-column + copyright).

**Tech Stack:** Next.js 16.2.10 (App Router, Turbopack) · React 19 · Tailwind v4 · shadcn/ui · Lucide React · next/font/google

---

## File Structure

| File | Action | Purpose |
|------|--------|---------|
| `src/app/globals.css` | Modify (append) | Add `.landing-theme` CSS variables, `.dot-pattern`, `.bento-card`, `@keyframes fadeIn`, `@keyframes slideUp`, `@keyframes pulse-slow` |
| `src/app/layout.tsx` | Modify | Add Merriweather + Fira Code font imports and CSS variables |
| `src/app/page.tsx` | Full rewrite | Hero + Bento Grid (12-col) + Tech Stack + Community sections |
| `src/components/landing-header.tsx` | Full rewrite | Sticky nav with Linux SVG logo, serif brand name, mobile hamburger dropdown |
| `src/components/landing-footer.tsx` | Full rewrite | 3-column footer (Brand, Plataforma, Código Aberto) + copyright |

---

### Task 1: Add New Font Imports to Layout

**Files:**
- Modify: `src/app/layout.tsx:1-14`

- [ ] **Step 1: Add Merriweather and Fira Code font imports**

Replace the font imports section in `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter, JetBrains_Mono, Merriweather, Fira_Code } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
```

- [ ] **Step 2: Update the html className to include new font variables**

Replace the `<html>` tag in the `RootLayout` function:

```tsx
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="pt"
        className={`${inter.variable} ${jetbrainsMono.variable} ${merriweather.variable} ${firaCode.variable} h-full`}
      >
        <body className="min-h-full flex flex-col antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
```

- [ ] **Step 3: Verify layout builds**

Run: `cmd /c "cd frontend && npm run build"`
Expected: Build succeeds (layout changes are additive, no breaking changes)

---

### Task 2: Add Landing Theme CSS Variables

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Append `.landing-theme` CSS variables to globals.css**

Add the following block after the existing `:root` block (after line 220, before `@layer base`):

```css
/* --- Landing Page Theme (Phase 1) --- */
/* Scoped to .landing-theme wrapper on page.tsx — does NOT affect dashboard/manuals */
.landing-theme {
  --lp-bg: oklch(0.97 0.003 250);
  --lp-bg-card: oklch(0.99 0.002 250);
  --lp-text: oklch(0.13 0.03 260);
  --lp-text-secondary: oklch(0.45 0.02 260);
  --lp-border: oklch(0.88 0.01 250);
  --lp-primary: oklch(0.55 0.20 260);
  --lp-primary-hover: oklch(0.50 0.20 260);
  --lp-accent: oklch(0.65 0.19 40);
  --lp-surface: oklch(0.96 0.005 250);
  --lp-dark: oklch(0.13 0.03 260);
  --lp-dark-card: oklch(0.18 0.02 260);
}
```

- [ ] **Step 2: Append new keyframe animations**

Add after the existing `@keyframes` block (after line 303, before `@media (prefers-reduced-motion)`):

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse-slow {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; }
}
```

- [ ] **Step 3: Append `.landing-theme` component styles**

Add inside the existing `@layer components` block (before the closing `}`), or append a new block:

```css
/* Landing Page Components */
.dot-pattern {
  background-image: radial-gradient(circle, oklch(0.85 0.01 250 / 0.4) 1px, transparent 1px);
  background-size: 24px 24px;
}

.bento-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.bento-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px oklch(0 0 0 / 0.08);
}
```

- [ ] **Step 4: Verify CSS compiles**

Run: `cmd /c "cd frontend && npm run build"`
Expected: Build succeeds, new CSS variables available under `.landing-theme`

---

### Task 3: Rewrite Landing Header

**Files:**
- Rewrite: `src/components/landing-header.tsx`

- [ ] **Step 1: Rewrite the complete landing-header.tsx component**

Replace the entire file with:

```tsx
"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Menu, X, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"

function LinuxIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15.5v-2c-3.07-.37-5.5-2.8-5.87-5.87H3.5c.37 4.17 3.56 7.64 7.75 8.37v1.5h-.25zm1-3.5v2h.25c3.07.37 5.5 2.8 5.87 5.87h1.63c-.37-4.17-3.56-7.64-7.75-8.37v-1.5h0zM12 4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z" />
    </svg>
  )
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}

const navLinks = [
  { href: "#projeto", label: "O Projeto" },
  { href: "#lpi", label: "Certificação LPI" },
  { href: "#stack", label: "Stack Tecnológica" },
  { href: "#comunidade", label: "Comunidade" },
]

export function LandingHeader() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md transition-shadow ${
        scrolled ? "shadow-md" : ""
      }`}
      style={{ borderColor: "var(--lp-border)" }}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <LinuxIcon className="h-7 w-7" style={{ color: "var(--lp-primary)" }} />
          <span
            className="text-lg font-semibold"
            style={{ color: "var(--lp-text)", fontFamily: "var(--font-merriweather), serif" }}
          >
            Linux de <span style={{ color: "var(--lp-accent)" }}>Camões</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-black/5"
              style={{ color: "var(--lp-text-secondary)" }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href="https://github.com/linuxdecamoes"
            target="_blank"
            rel="noopener noreferrer"
          >
            <GithubIcon className="h-5 w-5" style={{ color: "var(--lp-text-secondary)" }} />
          </a>
          <Button
            size="sm"
            style={{
              backgroundColor: "var(--lp-primary)",
              color: "white",
            }}
          >
            <LogIn className="mr-1.5 h-3.5 w-3.5" />
            Entrar
          </Button>
        </div>

        <button
          className="flex items-center justify-center rounded-lg p-2 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          style={{ color: "var(--lp-text)" }}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div
          className="border-t md:hidden"
          style={{ borderColor: "var(--lp-border)", backgroundColor: "var(--lp-bg-card)" }}
        >
          <nav className="flex flex-col gap-1 px-4 py-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-black/5"
                style={{ color: "var(--lp-text-secondary)" }}
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="flex flex-col gap-2 border-t px-4 py-3" style={{ borderColor: "var(--lp-border)" }}>
            <a
              href="https://github.com/linuxdecamoes"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="w-full">
                <GithubIcon className="mr-2 h-4 w-4" />
                GitHub
              </Button>
            </a>
            <Button
              className="w-full"
              style={{ backgroundColor: "var(--lp-primary)", color: "white" }}
            >
              <LogIn className="mr-1.5 h-3.5 w-3.5" />
              Entrar
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
```

- [ ] **Step 2: Verify header renders**

Run: `cmd /c "cd frontend && npm run build"`
Expected: Build succeeds, no TypeScript errors

---

### Task 4: Rewrite Landing Footer

**Files:**
- Rewrite: `src/components/landing-footer.tsx`

- [ ] **Step 1: Rewrite the complete landing-footer.tsx component**

Replace the entire file with:

```tsx
import Link from "next/link"
import { Heart } from "lucide-react"

function LinuxIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15.5v-2c-3.07-.37-5.5-2.8-5.87-5.87H3.5c.37 4.17 3.56 7.64 7.75 8.37v1.5h-.25zm1-3.5v2h.25c3.07.37 5.5 2.8 5.87 5.87h1.63c-.37-4.17-3.56-7.64-7.75-8.37v-1.5h0zM12 4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z" />
    </svg>
  )
}

const footerSections = [
  {
    title: "Plataforma",
    links: [
      { href: "/manuals", label: "Manuais LPI" },
      { href: "/dashboard/chat", label: "Motor RAG" },
      { href: "/dashboard/quizzes", label: "Quizzes" },
      { href: "/lab", label: "Labs (Kubernetes)" },
    ],
  },
  {
    title: "Código Aberto",
    links: [
      { href: "https://github.com/linuxdecamoes", label: "GitHub", external: true },
      { href: "#", label: "Licença MIT" },
      { href: "#", label: "Guia de Contribuição" },
      { href: "#", label: "Reportar Issue" },
    ],
  },
]

export function LandingFooter() {
  return (
    <footer
      id="footer"
      className="border-t"
      style={{ borderColor: "var(--lp-border)", backgroundColor: "var(--lp-bg-card)" }}
    >
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5">
              <LinuxIcon className="h-6 w-6" style={{ color: "var(--lp-primary)" }} />
              <span
                className="text-base font-semibold"
                style={{ color: "var(--lp-text)", fontFamily: "var(--font-merriweather), serif" }}
              >
                Linux de <span style={{ color: "var(--lp-accent)" }}>Camões</span>
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed" style={{ color: "var(--lp-text-secondary)" }}>
              Plataforma open-source de aprendizagem de Linux, baseada nos
              manuais oficiais de certificação LPI.
            </p>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <h3
                className="text-sm font-semibold"
                style={{ color: "var(--lp-text)" }}
              >
                {section.title}
              </h3>
              <ul className="mt-3 space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors hover:underline"
                      style={{ color: "var(--lp-text-secondary)" }}
                      {...(link.external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="mt-12 border-t pt-6 text-center text-sm"
          style={{ borderColor: "var(--lp-border)", color: "var(--lp-text-secondary)" }}
        >
          <p>&copy; 2026 Comunidade Linux de Camões. Código sob licença MIT.</p>
          <p className="mt-1 flex items-center justify-center gap-1">
            Desenvolvido com <Heart className="h-3.5 w-3.5" style={{ color: "var(--lp-accent)" }} /> pela comunidade
          </p>
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 2: Verify footer renders**

Run: `cmd /c "cd frontend && npm run build"`
Expected: Build succeeds

---

### Task 5: Rewrite Homepage (Hero + Bento + Stack + Community)

**Files:**
- Rewrite: `src/app/page.tsx`

- [ ] **Step 1: Rewrite the complete page.tsx with all sections**

Replace the entire file with:

```tsx
import Link from "next/link"
import {
  GraduationCap,
  Brain,
  Timer,
  Users,
  Terminal,
  Award,
  BookOpen,
  Info,
  GitPullRequest,
  CheckCircle2,
} from "lucide-react"
import { LandingHeader } from "@/components/landing-header"
import { LandingFooter } from "@/components/landing-footer"

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
    </svg>
  )
}

export default function Home() {
  return (
    <div className="landing-theme flex min-h-screen flex-col">
      <LandingHeader />

      <main className="flex-1">
        {/* Hero */}
        <section
          id="projeto"
          className="relative overflow-hidden"
          style={{ backgroundColor: "var(--lp-bg)" }}
        >
          <div className="dot-pattern absolute inset-0 opacity-50" />
          <div
            className="absolute -left-32 top-1/4 h-64 w-64 rounded-full blur-3xl"
            style={{ backgroundColor: "var(--lp-primary)", opacity: 0.15, animation: "pulse-slow 4s ease-in-out infinite" }}
          />
          <div
            className="absolute -right-32 top-1/3 h-64 w-64 rounded-full blur-3xl"
            style={{ backgroundColor: "var(--lp-accent)", opacity: 0.15, animation: "pulse-slow 4s ease-in-out infinite 2s" }}
          />

          <div className="relative mx-auto max-w-4xl px-4 py-24 text-center sm:py-32 lg:py-40">
            <div
              className="mb-8 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm"
              style={{
                borderColor: "var(--lp-border)",
                backgroundColor: "var(--lp-bg-card)",
                color: "var(--lp-text-secondary)",
                animation: "slideUp 0.6s ease-out",
              }}
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "#22c55e" }} />
              100% Open-Source e em PT-PT
            </div>

            <h1
              className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
              style={{
                color: "var(--lp-text)",
                animation: "slideUp 0.6s ease-out 0.1s both",
              }}
            >
              Domine Sistemas Linux.
              <br />
              <span
                className="font-serif italic"
                style={{
                  background: "linear-gradient(135deg, var(--lp-primary), var(--lp-accent))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Na nossa língua.
              </span>
            </h1>

            <p
              className="mx-auto mt-6 max-w-2xl text-lg leading-8"
              style={{
                color: "var(--lp-text-secondary)",
                animation: "slideUp 0.6s ease-out 0.2s both",
              }}
            >
              A plataforma de aprendizagem de Linux baseada nos manuais oficiais LPI.
              Do universito ao marketplace — numa ponte entre formação certificada e experiência real.
            </p>

            <div
              className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
              style={{ animation: "slideUp 0.6s ease-out 0.3s both" }}
            >
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-colors"
                style={{
                  backgroundColor: "var(--lp-dark)",
                  color: "white",
                }}
              >
                <GraduationCap className="h-4 w-4" />
                Começar a Aprender
              </Link>
              <a
                href="https://github.com/linuxdecamoes"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border px-6 py-3 text-sm font-semibold transition-colors hover:bg-black/5"
                style={{
                  borderColor: "var(--lp-border)",
                  color: "var(--lp-text)",
                }}
              >
                <GithubIcon className="h-4 w-4" />
                Contribuir no GitHub
              </a>
            </div>
          </div>
        </section>

        {/* Bento Grid */}
        <section id="lpi" className="mx-auto max-w-6xl px-4 py-24">
          <h2
            className="mb-4 text-center text-2xl font-bold sm:text-3xl"
            style={{ color: "var(--lp-text)" }}
          >
            Navegue nos Mares do Conhecimento
          </h2>
          <p
            className="mb-12 text-center text-base"
            style={{ color: "var(--lp-text-secondary)" }}
          >
            Tudo o que precisa para dominar Linux — num só lugar.
          </p>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-12 auto-rows-[minmax(180px,auto)]">
            {/* LPI Manuais */}
            <div
              className="bento-card rounded-2xl border p-6 sm:col-span-2 lg:col-span-8"
              style={{
                borderColor: "var(--lp-border)",
                backgroundColor: "var(--lp-bg-card)",
              }}
            >
              <div className="mb-3 flex items-center gap-2">
                <Award className="h-5 w-5" style={{ color: "var(--lp-primary)" }} />
                <h3 className="font-semibold" style={{ color: "var(--lp-text)" }}>
                  Manuais LPI
                </h3>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--lp-text-secondary)" }}>
                114 tópicos dos manuais oficiais de certificação LPI, processados e pesquisáveis.
                De Linux Essentials a LPIC-1 — conteúdo estruturado para o exame.
              </p>
              <BookOpen
                className="absolute bottom-4 right-4 h-16 w-16 opacity-5"
                style={{ color: "var(--lp-primary)" }}
              />
            </div>

            {/* Motor RAG */}
            <div
              className="bento-card rounded-2xl border p-6 lg:col-span-4"
              style={{
                borderColor: "var(--lp-dark)",
                backgroundColor: "var(--lp-dark)",
                color: "white",
              }}
            >
              <div className="mb-3 flex items-center gap-2">
                <Brain className="h-5 w-5" style={{ color: "var(--lp-accent)" }} />
                <h3 className="font-semibold">Motor RAG</h3>
              </div>
              <p className="text-sm leading-relaxed opacity-80">
                IA treinada nos manuais LPI com FAISS + Groq. Tire dúvidas em português sobre qualquer tópico.
              </p>
            </div>

            {/* SM-2 Quizzes */}
            <div
              className="bento-card rounded-2xl border p-6 lg:col-span-4"
              style={{
                borderColor: "var(--lp-border)",
                backgroundColor: "var(--lp-bg-card)",
              }}
            >
              <div className="mb-3 flex items-center gap-2">
                <Timer className="h-5 w-5" style={{ color: "var(--lp-primary)" }} />
                <h3 className="font-semibold" style={{ color: "var(--lp-text)" }}>
                  Quizzes SM-2
                </h3>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--lp-text-secondary)" }}>
                Sistema de repetição espaçada (algoritmo SM-2) para fixar o conhecimento de forma eficiente.
              </p>
            </div>

            {/* Apoio Universitário */}
            <div
              className="bento-card rounded-2xl border p-6 lg:col-span-4"
              style={{
                borderColor: "var(--lp-border)",
                backgroundColor: "var(--lp-bg-card)",
              }}
            >
              <div className="mb-3 flex items-center gap-2">
                <Users className="h-5 w-5" style={{ color: "var(--lp-primary)" }} />
                <h3 className="font-semibold" style={{ color: "var(--lp-text)" }}>
                  Apoio Universitário
                </h3>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--lp-text-secondary)" }}>
                Professores e alunos de universidades portuguesas podem usar a plataforma como recurso pedagógico.
              </p>
            </div>

            {/* Labs K8s */}
            <div
              className="bento-card rounded-2xl border border-dashed p-6 lg:col-span-4"
              style={{
                borderColor: "var(--lp-border)",
                backgroundColor: "var(--lp-surface)",
              }}
            >
              <div className="mb-3 flex items-center gap-2">
                <Terminal className="h-5 w-5" style={{ color: "var(--lp-text-secondary)" }} />
                <h3 className="font-semibold" style={{ color: "var(--lp-text)" }}>
                  Labs Kubernetes
                </h3>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--lp-text-secondary)" }}>
                Terminal real em pods efémeros de Kubernetes — para praticar comandos num ambiente seguro.
              </p>
              <span
                className="mt-3 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
                style={{ backgroundColor: "var(--lp-surface)", color: "var(--lp-text-secondary)" }}
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
          style={{ backgroundColor: "var(--lp-dark)" }}
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
                  color: "var(--lp-primary)",
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
                  color: "var(--lp-primary)",
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

            <div
              className="mt-12 flex items-center gap-3 rounded-xl border p-4"
              style={{ borderColor: "oklch(1 0 0 / 0.1)", backgroundColor: "var(--lp-dark-card)" }}
            >
              <Info className="h-5 w-5 shrink-0 text-white/60" />
              <div>
                <p className="text-sm font-medium text-white/80">
                  Decisão Arquitetural (ADR-001)
                </p>
                <p className="text-xs text-white/50">
                  Zero dependências de runtime para animações — CSS puro e SVG inline. O orçamento CPU/GPU é reservado para xterm.js e streaming RAG.
                </p>
              </div>
              <div className="ml-auto flex gap-2">
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-mono text-white/60">
                  TypeScript
                </span>
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-mono text-white/60">
                  Python
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Comunidade */}
        <section
          id="comunidade"
          className="border-t py-24"
          style={{ borderColor: "var(--lp-border)", backgroundColor: "var(--lp-bg)" }}
        >
          <div className="mx-auto max-w-4xl px-4">
            <div className="relative overflow-hidden rounded-3xl bg-white p-8 shadow-xl sm:p-12">
              <GithubIcon
                className="absolute -right-8 -top-8 h-64 w-64 opacity-[0.03]"
                style={{ color: "var(--lp-text)" }}
              />

              <div className="relative">
                <span
                  className="inline-block rounded-full px-3 py-1 text-xs font-semibold"
                  style={{ backgroundColor: "var(--lp-primary)", color: "white" }}
                >
                  Licença MIT
                </span>

                <h2
                  className="mt-6 text-2xl font-bold sm:text-3xl"
                  style={{ color: "var(--lp-text)" }}
                >
                  Desenvolvido pela Comunidade.
                  <br />
                  Para a Comunidade.
                </h2>

                <p
                  className="mt-4 max-w-xl text-base leading-relaxed"
                  style={{ color: "var(--lp-text-secondary)" }}
                >
                  Código aberto, licença MIT, sem portas fechadas. Contribui com
                  melhorias, reporta bugs, ou apenas usa e partilha. Esta plataforma
                  é tua.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <a
                    href="https://github.com/linuxdecamoes"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-colors"
                    style={{ backgroundColor: "var(--lp-dark)", color: "white" }}
                  >
                    <GithubIcon className="h-4 w-4" />
                    Repositório no GitHub
                  </a>
                  <a
                    href="#"
                    className="inline-flex items-center gap-2 rounded-lg border px-6 py-3 text-sm font-semibold transition-colors hover:bg-black/5"
                    style={{ borderColor: "var(--lp-border)", color: "var(--lp-text)" }}
                  >
                    <DiscordIcon className="h-4 w-4" />
                    Juntar ao Discord
                  </a>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium"
                    style={{ borderColor: "var(--lp-border)", color: "var(--lp-text-secondary)" }}
                  >
                    <GitPullRequest className="h-3.5 w-3.5" />
                    Guias de Contribuição Ativos
                  </span>
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium"
                    style={{ borderColor: "var(--lp-border)", color: "var(--lp-text-secondary)" }}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Issues Geridas Ativamente
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
```

- [ ] **Step 2: Verify full build**

Run: `cmd /c "cd frontend && npm run build"`
Expected: Build succeeds, all pages compile

- [ ] **Step 3: Run lint**

Run: `cmd /c "cd frontend && npm run lint"`
Expected: No errors

---

### Task 6: Final Verification

- [ ] **Step 1: Full build verification**

Run: `cmd /c "cd frontend && npm run build"`
Expected: Build succeeds with 131+ pages SSG

- [ ] **Step 2: Lint verification**

Run: `cmd /c "cd frontend && npm run lint"`
Expected: No errors

- [ ] **Step 3: Manual review checklist**

Verify:
- Landing page renders with new slate/blue/orange palette
- Dashboard pages (`/dashboard`) still use original warm bege/orange palette
- Manuals pages (`/manuals`) still use original palette
- Header shows Linux icon + "Linux de Camões" (serif) + nav links + "Entrar" CTA
- Mobile menu opens/closes with hamburger button
- Hero has dot-pattern background, blur circles, badge, serif headline
- Bento grid shows 5 cards in 12-column layout
- Tech stack section has dark background with 4 columns
- Community card has GitHub/Discord CTAs + contribution badges
- Footer shows 3 columns + copyright + "Desenvolvido com ❤️ pela comunidade"
- `prefers-reduced-motion` disables animations

---

## Commit Strategy

After Task 6 verification:
```bash
git add src/app/globals.css src/app/layout.tsx src/app/page.tsx src/components/landing-header.tsx src/components/landing-footer.tsx
git commit -m "feat: landing page redesign — Linux de Camões visual identity

- Novo tema landing-scoped (.landing-theme) com paleta slate/azul/laranja
- Merriweather (serif) + Fira Code (mono) via next/font/google
- Hero com dot-pattern, blur circles, headline serif italic gradient
- Bento Grid 12 colunas (Manuais, RAG, SM-2, Comunidade, Labs K8s)
- Secção Stack Tecnológica (dark bg, 4 colunas + ADR-001 card)
- Secção Comunidade (GitHub/Discord CTAs, badges de contribuição)
- Header sticky com blur, Linux SVG logo, nav 4 links, mobile hamburger
- Footer 3 colunas + copyright + heart icon
- CSS-only animations (ADR-001), prefers-reduced-motion respeitado
- Dashboard/manuals/auth intocados (zero impacto)"
```
