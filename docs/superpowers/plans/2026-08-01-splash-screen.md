# Splash Screen Animado — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar um loading screen (splash) animado que aparece uma vez por sessao de browser, exibindo o logo SVG `linuxdecamoes_bk.svg` com animacao cinematografica de 2.5s.

**Architecture:** Client Component `<SplashScreen>` montado no `layout.tsx` raiz. Gate via `sessionStorage` com script inline anti-flash no `<head>`. SVG inline com 4 tiers de paths animados via CSS keyframes (ADR-001: zero deps runtime).

**Tech Stack:** Next.js 16 · React 19 · CSS keyframes + tw-animate-css · TypeScript · sessionStorage

---

## Estrutura de Ficheiros

| Ficheiro | Acao | Responsabilidade |
|----------|------|-----------------|
| `frontend/src/components/splash-screen.tsx` | **Novo** | Client Component: SVG inline, estado, sessionStorage gate, handlers |
| `frontend/src/app/layout.tsx` | **Editar** | Script anti-flash no `<head>`, `<SplashScreen />` mount |
| `frontend/src/app/globals.css` | **Editar** | +3 keyframes, +token `--splash-glow`, +timing/stagger, +reduced-motion |

---

### Task 1: CSS — Keyframes, token, timing, reduced-motion

**Files:**
- Modify: `frontend/src/app/globals.css`

- [ ] **Step 1: Adicionar token `--splash-glow` em `:root` e `@theme inline`**

No `:root`, junto aos outros tokens (procurar `:root {`):

```css
:root {
  /* ...existentes... */
  --splash-glow: oklch(0.55 0.20 260 / 0.3); /* primary com alpha */
}
```

No `@theme inline`, junto aos outros tokens CSS (procurar `@theme inline {`):

```css
@theme inline {
  /* ...existentes... */
  --splash-glow: oklch(0.55 0.20 260 / 0.3);
}
```

- [ ] **Step 2: Adicionar 3 novos keyframes**

Procurar pelo ultimo keyframe definido (atualmente `slideTech` ~linha 441) e adicionar depois:

```css
@keyframes splash-draw {
  0% {
    opacity: 0;
    transform: scale(0.92);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes splash-glow {
  0% {
    opacity: 0;
    transform: scale(1);
  }
  50% {
    opacity: 0.15;
  }
  100% {
    opacity: 0;
    transform: scale(1.5);
  }
}

@keyframes splash-name {
  0% {
    opacity: 0;
    transform: translateY(12px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes splash-fadeout {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
```

- [ ] **Step 3: Adicionar classes de timing e stagger**

No fim do ficheiro, depois de todos os keyframes + utilitarios existentes:

```css
/* ================================================================
   Splash Screen — Timing & Stagger
   ================================================================ */

.splash-overlay {
  opacity: 1;
  animation: splash-fadeout 0.4s ease-in 2.4s forwards;
}

.splash-bg {
  opacity: 0;
  animation: fadeIn 0.4s ease-out forwards;
}

.splash-logo {
  opacity: 0;
  transform: scale(0.85);
  animation: pop-in 0.4s ease-out 0.05s forwards;
  will-change: transform, opacity;
}

.splash-tier-1,
.splash-tier-2,
.splash-tier-3,
.splash-tier-4 {
  opacity: 0;
  animation: splash-draw 0.5s ease-out forwards;
}

.splash-tier-1 { animation-delay: 0.3s; }
.splash-tier-2 { animation-delay: 0.45s; }
.splash-tier-3 { animation-delay: 0.6s; }
.splash-tier-4 { animation-delay: 0.75s; }

.splash-glow-ring {
  position: absolute;
  inset: -8%;
  border-radius: 50%;
  border: 2px solid var(--splash-glow);
  opacity: 0;
  animation: splash-glow 0.4s ease-out 1.6s forwards;
  pointer-events: none;
}

.splash-name {
  opacity: 0;
  transform: translateY(12px);
  animation: splash-name 0.4s ease-out 1.9s forwards;
}

/* Anti-flash: esconde overlay para quem regressa na sessao */
html[data-splash="skip"] .splash-overlay {
  display: none !important;
  animation: none !important;
}

/* ================================================================
   Splash Screen — Reduced Motion
   ================================================================ */

@media (prefers-reduced-motion: reduce) {
  .splash-tier-1,
  .splash-tier-2,
  .splash-tier-3,
  .splash-tier-4,
  .splash-glow-ring,
  .splash-name {
    animation: none;
    opacity: 1;
    transform: none;
  }

  .splash-logo {
    animation: none;
    opacity: 1;
    transform: none;
  }

  .splash-overlay {
    animation: splash-fadeout 0.3s ease-in 0.6s forwards;
  }
}
```

- [ ] **Step 4: Verificar que `fadeIn` e `pop-in` existem**

Confirmar que `@keyframes fadeIn` e `@keyframes pop-in` ja estao definidos (linhas ~305 e ~250 do globals.css atual). Se nao, adicionar:

```css
@keyframes fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

@keyframes pop-in {
  0% {
    opacity: 0;
    transform: scale(0.85);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
```

Estes ja existem no ficheiro. Confirmar via grep.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/globals.css
git commit -m "feat(splash): CSS keyframes, timing, reduced-motion para splash screen"
```

---

### Task 2: Componente `<SplashScreen>` com SVG inline

**Files:**
- Create: `frontend/src/components/splash-screen.tsx`

- [ ] **Step 1: Criar o ficheiro base do componente**

```tsx
"use client";

import { useState, useEffect, useRef } from "react";

export function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const overlayRef = useRef<HTMLDivElement>(null);
  const safetyRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    try {
      if (sessionStorage.getItem("ldc:splash-shown") === "1") {
        setVisible(false);
        return;
      }
    } catch {
      // Sem sessionStorage (ex: SSR, iframe) — mostrar sempre
    }

    // Safety: se onAnimationEnd nao disparar, forca unmount aos 3.5s
    safetyRef.current = setTimeout(() => {
      setVisible(false);
      try {
        sessionStorage.setItem("ldc:splash-shown", "1");
      } catch {}
    }, 3500);

    return () => {
      if (safetyRef.current) clearTimeout(safetyRef.current);
    };
  }, []);

  const handleAnimationEnd = (e: React.AnimationEvent) => {
    // So responde ao fadeout final do overlay (ignora bubbles dos filhos)
    if (e.animationName === "splash-fadeout") {
      setVisible(false);
      try {
        sessionStorage.setItem("ldc:splash-shown", "1");
      } catch {}
      if (safetyRef.current) clearTimeout(safetyRef.current);
    }
  };

  if (!visible) return null;

  return (
    <div
      ref={overlayRef}
      className="splash-overlay fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background"
      role="presentation"
      aria-hidden="true"
      onAnimationEnd={handleAnimationEnd}
    >
      <div className="splash-bg fixed inset-0 bg-background" />

      <div className="splash-logo relative w-[180px] h-[180px]">
        {/* SVG inline — ver Step 2 */}
      </div>

      <p className="splash-name mt-8 font-merriweather text-2xl font-semibold text-foreground tracking-tight">
        Linux de Camoes
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Substituir comentario SVG inline pelo markup real**

Ler o ficheiro `frontend/public/linuxdecamoes_bk.svg` completo. Extrair o `<circle class="fil0">` e todos os `<path>`.

Agrupar os paths em 4 tiers seguindo a ordem natural do SVG:

**Tier 1** — paths grandes estruturais (os 4 primeiros `<path class="fil1">`)
**Tier 2** — paths secundarios (o 5º `<path class="fil1">` truncado + primeiros 4 `<path class="fil2">`)
**Tier 3** — detalhes interiores (path `d="M813 878.88..."` + 3 paths seguintes)
**Tier 4** — detalhes finos (ultimos 3 paths pequenos)

Substituir a secao de SVG com:

```tsx
<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 1586.42 1586.42"
  className="w-full h-full"
  aria-hidden="true"
>
  <circle
    cx="793.21"
    cy="793.21"
    r="793.21"
    className="fill-black"
  />

  <g className="splash-tier-1">
    {/* Paths 1-4 do SVG original (fil1, d="M596.18...", d="M849.23...", d="M1089.31...", d="M500.48...") */}
    <!-- COPIAR OS 4 PRIMEIROS PATH class="fil1" DO SVG ORIGINAL AQUI, trocando `class="fil1"` por `className="fill-white"` -->
  </g>

  <g className="splash-tier-2">
    {/* Paths seguintes (fil1 restantes + primeiros 4 fil2) */}
    <!-- COPIAR do SVG original -->
  </g>

  <g className="splash-tier-3">
    {/* Paths detalhe intermedio (fil2 meio) */}
    <!-- COPIAR do SVG original -->
  </g>

  <g className="splash-tier-4">
    {/* Paths detalhe fino (ultimos fil2) */}
    <!-- COPIAR do SVG original -->
  </g>
</svg>
```

**IMPORTANTE:** Ler o ficheiro `frontend/public/linuxdecamoes_bk.svg` completo (41 linhas) e copiar EXATAMENTE os `d="..."` de cada `<path>`. Substituir `class="fil1"` por `className="fill-white"` e `class="fil2"` por `className="fill-white"`.

- [ ] **Step 3: Adicionar o glow ring dentro do container do logo**

Dentro de `<div className="splash-logo ...">`, depois do `</svg>`:

```tsx
<div className="splash-glow-ring" />
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/splash-screen.tsx
git commit -m "feat(splash): componente SplashScreen com SVG inline e sessionStorage gate"
```

---

### Task 3: Integracao no root layout + script anti-flash

**Files:**
- Modify: `frontend/src/app/layout.tsx`

- [ ] **Step 1: Adicionar o script anti-flash no `<head>`**

No `layout.tsx`, dentro do `<html>`, antes do `<body>`, o `<head>` ja tem um script JSON-LD (~linha 137-141). Adicionar o script anti-flash **antes** do script JSON-LD:

```tsx
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "Plataforma open-source de aprendizagem de Linux baseada nos manuais oficiais de certificacao LPI.",
    inLanguage: "pt-PT",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/manuals?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <ClerkProvider>
      <html
        lang="pt"
        className={`${inter.variable} ${jetbrainsMono.variable} ${merriweather.variable} ${firaCode.variable} h-full`}
      >
        <head>
          <script
            dangerouslySetInnerHTML={{
              __html: `
(function(){
  try {
    if (sessionStorage.getItem("ldc:splash-shown") === "1") {
      document.documentElement.setAttribute("data-splash", "skip");
    }
  } catch(e) {}
})();
              `.trim(),
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        </head>
        <body className="min-h-full flex flex-col antialiased">
          <SplashScreen />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
```

- [ ] **Step 2: Adicionar o import do SplashScreen**

No topo do ficheiro, junto aos outros imports:

```tsx
import { SplashScreen } from "@/components/splash-screen";
```

Posicionar algures depois dos imports de fontes e antes dos metadados.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/layout.tsx
git commit -m "feat(splash): integrar SplashScreen no root layout + script anti-flash"
```

---

### Task 4: Verificacao (lint + build)

**Files:** Nenhum (verificacao apenas)

- [ ] **Step 1: Correr lint**

```bash
cmd /c "npm run lint"
```

Esperado: 0 erros novos. Warnings pre-existentes (terceiros, ~143) aceitaveis.

Atencao: o SVG inline usa `className` em elementos `<circle>`, `<path>`, `<g>`. O linter pode lancar regra `react/no-unknown-property` — se lancar, verificar se a regra ja esta configurada (ver `.eslintrc.json`). Em Next.js 16 com JSX, `className` em elementos SVG nativos e suportado.

- [ ] **Step 2: Correr build**

```bash
cmd /c "npm run build"
```

Esperado: 134/134 paginas geradas com sucesso. O SplashScreen e Client Component — nao afeta SSG.

- [ ] **Step 3: Commit (se houve correcoes)**

```bash
git add .
git commit -m "fix(splash): correcoes pos-lint/build"
```

---

### Task 5: Commit final e push

- [ ] **Step 1: Commit final (se necessario)**

Verificar `git status`. Se tudo committed, push:

```bash
git push origin master
```
