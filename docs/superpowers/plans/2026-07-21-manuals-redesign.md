# Manuais LPI Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir o visualizador estático básico de `/manuals` por uma experiência premium inspirada em quiet luxury — cards glassmorphism com staggered entrance, accordion Base UI por objective, e tópico com layout 3-zone (TOC sticky + leitura central + meta sticky), CommandTable interativa com copy-to-clipboard, tudo em CSS puro honrando o ADR-001.

**Architecture:** Abordagem A — Component layer primeiro. Sete fases encadeadas (design tokens → mockup HTML → lib → componentes markdown → 3 verticais por rota) com commits pequenos e reversíveis. Toda cor/sombra é token OKLCH em `:root` + `@theme inline` (Norma 01). Animações via `tw-animate-css` + keyframes CSS próprios + View Transitions API nativa. Única nova dependência runtime: `gray-matter` (build-time, não viola ADR-001).

**Tech Stack:** Next.js 16.2.10 (App Router, Turbopack), React 19.2.4, Tailwind CSS v4 (`@tailwindcss/postcss`), shadcn `base-nova` com `@base-ui/react` (Accordion `multiple` + Collapsible), lucide-react, `tw-animate-css`, react-markdown 10 + remark-gfm 4, gray-matter.

**Spec:** `docs/superpowers/specs/2026-07-21-manuals-redesign-design.md`

---

## Constraints Globais (aplicam-se a TODAS as tasks)

Antes de qualquer commit, verificar SEMPRE:

1. **Windows PowerShell**: `npm`/`npx` via `.ps1` estão bloqueados pela execution policy. Correr sempre `cmd /c "npm run ..."` a partir de `linuxdecamoes/frontend/`.
2. **ADR-001**: zero novas dependências runtime de animação (sem Framer Motion/Lottie/GSAP). Apenas `tw-animate-css` (já instalado) + CSS keyframes.
3. **Norma 01**: zero cores hex/rgb/hsl inline em `.tsx`. Toda cor/sombra é token OKLCH em `:root` + exposta em `@theme inline`.
4. **Norma 03**: PT-PT em toda comunicação e comentários. Identificadores de código em EN/PT conforme legibilidade (seguir estilo do envolvente).
5. **Next.js 16 ≠ Next.js 15**: antes de usar APIs Next não triviais (Server Components, routing, metadata, caching), ler `node_modules/next/dist/docs/` relevante.
6. **Base UI ≠ Radix**: API difere em sítios chave (ex.: `Accordion.Root multiple` em vez de `type="multiple"`). Verificar imports em [`node_modules/@base-ui/react/`](file://linuxdecamoes/frontend/node_modules/@base-ui/react/) antes de assumir.
7. **Sem testes formais**: verificação por `cmd /c "npm run build"` + `cmd /c "npm run lint"` + smoke visual no browser.

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `frontend/src/app/globals.css` | Modify | Adicionar tokens glass, sombras, gradientes, keyframes, utilities (Norma 01) |
| `frontend/mockup-manuals.html` | Create | Visual companion standalone (Tailwind via CDN + tokens inline) |
| `frontend/package.json` | Modify | Adicionar dependência `gray-matter` |
| `frontend/src/lib/manuals.ts` | Modify | Adicionar campo `level: "essentials" \| "lpic1"` ao tipo `Manual` + aos 6 manuais |
| `frontend/src/lib/topic-loader.ts` | Create | Ler markdown do Vault, parser frontmatter (gray-matter), resolver wikilinks `[[X\|Y]]`, derive slug |
| `frontend/src/components/markdown/is-command-table.ts` | Create | Heurística pura — deteta se uma tabela markdown é de comandos |
| `frontend/src/components/markdown/copy-button.tsx` | Create | Botão copy-to-clipboard com feedback `aria-live` |
| `frontend/src/components/markdown/code-block.tsx` | Create | Block de código com header + CopyButton (sem syntax highlight rico, v1) |
| `frontend/src/components/markdown/details-disclosure.tsx` | Create | Wrapper Base UI `Collapsible` para `<details>` markdown |
| `frontend/src/components/markdown/comparison-table.tsx` | Create | Tabela polida sem copy-button (fallback) |
| `frontend/src/components/markdown/command-table.tsx` | Create | Tabela de comandos interativa (hover + copy + expand flags) |
| `frontend/src/components/markdown/prose-elements.tsx` | Create | Map de elementos tipográficos (h1/h2/p/ul/blockquote/…) |
| `frontend/src/components/markdown/markdown-renderer.tsx` | Create | Substitui `markdown-content.tsx`; integra todos os componentes acima |
| `frontend/src/components/manuals/manual-card.tsx` | Create | Card glassmorphism com staggered entrance por índice |
| `frontend/src/components/manuals/manual-level-group.tsx` | Create | Wrapper que agrupa manuais por nível (Essentials vs LPIC-1) |
| `frontend/src/components/manuals/topic-accordion.tsx` | Create | Accordion Base UI com `multiple`, agrupar tópicos por objective |
| `frontend/src/components/manuals/topic-row.tsx` | Create | Linha dentro de Accordion.Panel — link para o tópico |
| `frontend/src/components/manuals/topic-toc.tsx` | Create | Sidebar sticky com scroll-spy via IntersectionObserver |
| `frontend/src/components/manuals/topic-meta.tsx` | Create | Sidebar sticky com weight, tags, CTA quiz |
| `frontend/src/components/manuals/prev-next-nav.tsx` | Create | Navegação anterior/seguinte |
| `frontend/src/components/manuals/reading-progress.tsx` | Create | Barra 2px fixed top com scroll listener (CSS var `--progress`) |
| `frontend/src/app/manuals/page.tsx` | Replace | Listagem com `ManualLevelGroup` + staggered |
| `frontend/src/app/manuals/[code]/page.tsx` | Replace | Accordion por objective |
| `frontend/src/app/manuals/[code]/[slug]/page.tsx` | Replace | Layout 3-zone com `MarkdownRenderer` + TOC + Meta + ReadingProgress |
| `frontend/src/app/manuals/layout.tsx` | Modify | Adicionar wrapper com `bg-radial-warm` decorativo |
| `frontend/src/components/markdown-content.tsx` | Delete | Substituído por `markdown/markdown-renderer.tsx` |

**Ordem de execução:** Task 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11.

---

## Task 1: Adicionar design tokens a `globals.css`

**Files:**
- Modify: `frontend/src/app/globals.css:5-65` (`@theme inline`) + `:67-119` (`:root`) + adicionar keyframes após `:170` + adicionar `@layer components` antes do fecho do ficheiro

Este task adiciona os tokens OKLCH novos (glassmorphism, sombras refinadas, gradientes), keyframes novos, e utilities (`.glass-card`, `.stagger-child`, `.stagger-list`) que todos os componentes subsequentes vão consumir.

- [ ] **Step 1: Ler o ficheiro atual para confirmação**

Run: `Get-Content frontend/src/app/globals.css | Measure-Object -Line` (PowerShell)
Expected: ~178 linhas, termina com `@media (prefers-reduced-motion: reduce)` block.

- [ ] **Step 2: Adicionar exposures em `@theme inline` (após linha 64, antes do fecho `}`)**

Localizar o fecho do bloco `@theme inline { ... }` (linha 65) e inserir antes do `}`:

```css
  /* --- Manuals Redesign (Task 1) --- */
  --color-glass-bg: var(--glass-bg);
  --color-glass-bg-strong: var(--glass-bg-strong);
  --color-glass-border: var(--glass-border);
  --color-gradient-warm: var(--gradient-warm);
  --color-gradient-accent: var(--gradient-accent);
  --color-bg-radial-warm: var(--bg-radial-warm);
  --shadow-soft: var(--shadow-soft);
  --shadow-float: var(--shadow-float);
  --shadow-glass: var(--shadow-glass);
```

- [ ] **Step 3: Adicionar valores de tokens em `:root` (após linha 118, antes do fecho `}`)**

Localizar o fecho do bloco `:root { ... }` (linha 119) e inserir antes do `}`:

```css
  /* --- Manuals Redesign: glassmorphism, sombras refinadas, gradientes --- */
  --glass-bg: oklch(0.99 0.003 80 / 0.65);
  --glass-bg-strong: oklch(0.99 0.003 80 / 0.85);
  --glass-border: oklch(0.88 0.01 80 / 0.5);
  --glass-blur: 12px;

  --shadow-soft: 0 1px 2px oklch(0 0 0 / 0.04),
                 0 1px 3px oklch(0 0 0 / 0.02);
  --shadow-float: 0 8px 24px oklch(0 0 0 / 0.06),
                  0 2px 6px oklch(0 0 0 / 0.04);
  --shadow-glass: 0 4px 30px oklch(0 0 0 / 0.04),
                  inset 0 1px 0 oklch(1 0 0 / 0.4);

  --gradient-warm: linear-gradient(135deg,
    oklch(0.96 0.02 75) 0%,
    oklch(0.94 0.04 60) 60%,
    oklch(0.92 0.05 45) 100%);
  --gradient-accent: linear-gradient(135deg,
    oklch(0.70 0.18 45) 0%,
    oklch(0.55 0.14 30) 100%);

  --bg-radial-warm: radial-gradient(circle at 20% 0%,
    oklch(0.94 0.05 60 / 0.6) 0%,
    transparent 50%);
```

- [ ] **Step 4: Adicionar keyframes novos (após linha 170, antes do `@media (prefers-reduced-motion)`)**

Inserir após o fecho do último `@keyframes flicker`:

```css
@keyframes stagger-in {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes pulse-soft {
  0%, 100% { box-shadow: 0 0 0 0 oklch(0.70 0.18 45 / 0); }
  50%      { box-shadow: 0 0 0 4px oklch(0.70 0.18 45 / 0.15); }
}

@keyframes reading-progress {
  from { width: 0%; }
  to   { width: var(--progress, 0%); }
}

@keyframes copy-feedback {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.15); }
  100% { transform: scale(1); }
}

@keyframes accordion-down {
  from { height: 0; opacity: 0; }
  to   { height: var(--base-accordion-content-height); opacity: 1; }
}

@keyframes accordion-up {
  from { height: var(--base-accordion-content-height); opacity: 1; }
  to   { height: 0; opacity: 0; }
}
```

- [ ] **Step 5: Adicionar `@layer components` no fim do ficheiro**

Acrescentar no fim do ficheiro (após o `@media (prefers-reduced-motion: reduce)` block):

```css
@layer components {
  .glass-card {
    background: var(--glass-bg);
    backdrop-filter: blur(var(--glass-blur));
    -webkit-backdrop-filter: blur(var(--glass-blur));
    border: 1px solid var(--glass-border);
    box-shadow: var(--shadow-glass);
    transition: background 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
  }
  .glass-card:hover {
    background: var(--glass-bg-strong);
    box-shadow: var(--shadow-float), var(--shadow-glass);
  }
  .stagger-child {
    animation: stagger-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) backwards;
  }
  .stagger-list > *:nth-child(1)     { animation-delay: 0ms; }
  .stagger-list > *:nth-child(2)     { animation-delay: 60ms; }
  .stagger-list > *:nth-child(3)     { animation-delay: 120ms; }
  .stagger-list > *:nth-child(4)     { animation-delay: 180ms; }
  .stagger-list > *:nth-child(5)     { animation-delay: 240ms; }
  .stagger-list > *:nth-child(6)     { animation-delay: 300ms; }
  .stagger-list > *:nth-child(7)     { animation-delay: 360ms; }
  .stagger-list > *:nth-child(8)     { animation-delay: 420ms; }
  .stagger-list > *:nth-child(n+9)   { animation-delay: 480ms; }
}

@supports not (backdrop-filter: blur(1px)) {
  .glass-card {
    background: var(--glass-bg-strong);
  }
}
```

- [ ] **Step 6: Verificar build passa**

Run: `cmd /c "npm run build"` em `frontend/`
Expected: Build succeeds, no CSS errors, no warnings novos sobre tokens desconhecidos.

- [ ] **Step 7: Verificar lint passa**

Run: `cmd /c "npm run lint"` em `frontend/`
Expected: Lint succeeds sem erros.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/app/globals.css
git commit -m "feat(design-system): expandir tokens OKLCH com glassmorphism e gradientes"
```

---

## Task 2: Criar `mockup-manuals.html`

**Files:**
- Create: `frontend/mockup-manuals.html`

Mockup standalone que serve de fonte de verdade visual (convention idêntica a `frontend/mockup-dashboard.html`). Abrir no browser para iterar estética antes de portar para React.

- [ ] **Step 1: Confirmar convention do mockup-dashboard**

Run: `Get-Content frontend/mockup-dashboard.html -TotalCount 30`
Expected: HTML estático com `<script src="https://cdn.tailwindcss.com">`, `<style>` com tokens OKLCH em `:root`, e secções de exemplo.

- [ ] **Step 2: Criar `frontend/mockup-manuals.html`**

Criar ficheiro com 3 secções representativas (listagem glass+staggered, accordion lateral, tópico 3-zone com command table interativa). Estrutura:

```html
<!DOCTYPE html>
<html lang="pt-PT">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Manuais LPI — Mockup Visual Companion</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />
  <style>
    :root {
      /* Cole exatamente os tokens de frontend/src/app/globals.css (Task 1) */
      --background: oklch(0.97 0.005 80);
      --foreground: oklch(0.20 0.02 60);
      --card: oklch(0.99 0.003 80);
      --primary: oklch(0.70 0.18 45);
      --primary-foreground: oklch(0.99 0 0);
      --muted: oklch(0.94 0.008 80);
      --muted-foreground: oklch(0.50 0.02 60);
      --border: oklch(0.88 0.01 80);
      --cream: oklch(0.96 0.02 75);
      --terracotta: oklch(0.35 0.10 40);
      --peach: oklch(0.90 0.03 60);
      --sage: oklch(0.72 0.10 150);       --sage-soft: oklch(0.95 0.03 150);
      --coral: oklch(0.65 0.14 25);       --coral-soft: oklch(0.94 0.04 25);
      --amber: oklch(0.75 0.12 70);       --amber-soft: oklch(0.94 0.05 70);
      --iris: oklch(0.55 0.13 265);       --iris-soft: oklch(0.94 0.04 265);

      /* Tokens novos (Task 1) */
      --glass-bg: oklch(0.99 0.003 80 / 0.65);
      --glass-bg-strong: oklch(0.99 0.003 80 / 0.85);
      --glass-border: oklch(0.88 0.01 80 / 0.5);
      --glass-blur: 12px;
      --shadow-soft: 0 1px 2px oklch(0 0 0 / 0.04), 0 1px 3px oklch(0 0 0 / 0.02);
      --shadow-float: 0 8px 24px oklch(0 0 0 / 0.06), 0 2px 6px oklch(0 0 0 / 0.04);
      --shadow-glass: 0 4px 30px oklch(0 0 0 / 0.04), inset 0 1px 0 oklch(1 0 0 / 0.4);
      --gradient-warm: linear-gradient(135deg, oklch(0.96 0.02 75) 0%, oklch(0.94 0.04 60) 60%, oklch(0.92 0.05 45) 100%);
      --gradient-accent: linear-gradient(135deg, oklch(0.70 0.18 45) 0%, oklch(0.55 0.14 30) 100%);
      --bg-radial-warm: radial-gradient(circle at 20% 0%, oklch(0.94 0.05 60 / 0.6) 0%, transparent 50%);
    }

    body {
      font-family: "IBM Plex Sans", system-ui, sans-serif;
      background: var(--background);
      color: var(--foreground);
    }

    /* Utilities replicadas de globals.css */
    .glass-card {
      background: var(--glass-bg);
      backdrop-filter: blur(var(--glass-blur));
      -webkit-backdrop-filter: blur(var(--glass-blur));
      border: 1px solid var(--glass-border);
      box-shadow: var(--shadow-glass);
      transition: background 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
    }
    .glass-card:hover {
      background: var(--glass-bg-strong);
      box-shadow: var(--shadow-float), var(--shadow-glass);
    }
    .stagger-child { animation: stagger-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) backwards; }
    .stagger-list > *:nth-child(1) { animation-delay: 0ms; }
    .stagger-list > *:nth-child(2) { animation-delay: 60ms; }
    .stagger-list > *:nth-child(3) { animation-delay: 120ms; }
    .stagger-list > *:nth-child(4) { animation-delay: 180ms; }

    @keyframes stagger-in {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* Page sections */
    .section { padding: 4rem 1.5rem; max-width: 80rem; margin: 0 auto; }
    .section + .section { border-top: 1px dashed var(--border); }
    .section-title { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-foreground); margin-bottom: 1.5rem; }
  </style>
</head>
<body class="min-h-screen">

  <!-- ============ Section 1: Listagem /manuals ============ -->
  <section class="section" id="listagem" style="background: var(--bg-radial-warm);">
    <p class="section-title">/manuals — listagem</p>
    <h1 class="text-4xl font-bold tracking-tight mb-2">Manuais LPI</h1>
    <p class="text-muted-foreground mb-10" style="color: var(--muted-foreground);">92 tópicos dos manuais oficiais LPI, processados e pesquisáveis com IA.</p>

    <p class="text-sm font-semibold mb-4" style="color: var(--terracotta);">Essentials</p>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-list mb-12">
      <!-- Card 010 -->
      <a href="#" class="glass-card stagger-child block rounded-3xl p-6 group">
        <div class="flex items-start justify-between mb-3">
          <span class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium" style="background: var(--sage-soft); color: var(--sage);">010</span>
          <span class="opacity-0 group-hover:opacity-100 transition-opacity" style="color: var(--primary);">→</span>
        </div>
        <h3 class="text-lg font-semibold mb-2">Linux Essentials</h3>
        <p class="text-sm" style="color: var(--muted-foreground);">Fundamentos do Linux — ficheiros, permissões, processos e shell básica.</p>
        <p class="text-xs mt-3" style="color: var(--muted-foreground);">19 tópicos</p>
      </a>
      <!-- Repetir padrão para 020 (coral), 030 (amber), 050 (terracotta) -->
      <a href="#" class="glass-card stagger-child block rounded-3xl p-6 group">
        <div class="flex items-start justify-between mb-3">
          <span class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium" style="background: var(--coral-soft); color: var(--coral);">020</span>
          <span class="opacity-0 group-hover:opacity-100 transition-opacity" style="color: var(--primary);">→</span>
        </div>
        <h3 class="text-lg font-semibold mb-2">Security Essentials</h3>
        <p class="text-sm" style="color: var(--muted-foreground);">Conceitos de segurança — autenticação, permissões, criptografia.</p>
        <p class="text-xs mt-3" style="color: var(--muted-foreground);">18 tópicos</p>
      </a>
      <!-- Card 030 e 050 — mesmo padrão, mudar accent -->
      <div class="glass-card stagger-child rounded-3xl p-6" style="background: var(--amber-soft);">
        <span class="text-xs">030 (amber) — preencher</span>
      </div>
      <div class="glass-card stagger-child rounded-3xl p-6" style="background: var(--peach);">
        <span class="text-xs">050 (terracotta) — preencher</span>
      </div>
    </div>

    <p class="text-sm font-semibold mb-4" style="color: var(--terracotta);">LPIC-1 · Certificação</p>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 stagger-list">
      <a href="#" class="glass-card stagger-child block rounded-3xl p-8 group">
        <span class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium mb-3" style="background: var(--peach); color: var(--terracotta);">101</span>
        <h3 class="text-2xl font-semibold">LPIC-1 Parte 1</h3>
        <p class="text-sm mt-2" style="color: var(--muted-foreground);">Arquitetura do Linux, gestão de pacotes, kernels, boot e filesystems.</p>
      </a>
      <a href="#" class="glass-card stagger-child block rounded-3xl p-8 group">
        <span class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium mb-3" style="background: var(--iris-soft); color: var(--iris);">102</span>
        <h3 class="text-2xl font-semibold">LPIC-1 Parte 2</h3>
        <p class="text-sm mt-2" style="color: var(--muted-foreground);">Shell avançado, administração de sistemas, redes, segurança.</p>
      </a>
    </div>
  </section>

  <!-- ============ Section 2: Accordion /manuals/[code] ============ -->
  <section class="section" id="accordion">
    <p class="section-title">/manuals/101 — accordion por objective</p>
    <a href="#listagem" class="text-sm mb-4 inline-block" style="color: var(--muted-foreground);">← Manuais</a>
    <div class="flex items-center gap-3 mb-2">
      <span class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium" style="background: var(--peach); color: var(--terracotta);">101</span>
      <h1 class="text-3xl font-bold">LPIC-1 Parte 1</h1>
    </div>
    <p class="mb-8" style="color: var(--muted-foreground);">Arquitetura do Linux, gestão de pacotes, kernels, boot e filesystems.</p>

    <!-- Accordion mock (sem JS — details/summary nativo só para ilustrar UX) -->
    <div class="space-y-3">
      <details open class="glass-card rounded-2xl overflow-hidden">
        <summary class="p-5 cursor-pointer list-none flex items-center justify-between font-semibold">
          <span>101 · Tópico 1 — Hardware, Boot & Filesystems</span>
          <span class="text-xl transition-transform">▼</span>
        </summary>
        <div class="px-5 pb-5 space-y-1">
          <a href="#" class="flex items-center justify-between p-3 rounded-lg hover:bg-white/40 transition-colors">
            <span class="flex items-center gap-3">
              <span class="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold" style="background: var(--peach); color: var(--terracotta);">01</span>
              <span class="text-sm font-medium">101.1 Determinar e definir configurações de hardware</span>
            </span>
            <span style="color: var(--muted-foreground);">→</span>
          </a>
          <a href="#" class="flex items-center justify-between p-3 rounded-lg hover:bg-white/40 transition-colors">
            <span class="flex items-center gap-3">
              <span class="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold" style="background: var(--peach); color: var(--terracotta);">02</span>
              <span class="text-sm font-medium">101.2 Inicialização do sistema</span>
            </span>
            <span style="color: var(--muted-foreground);">→</span>
          </a>
        </div>
      </details>
      <details class="glass-card rounded-2xl overflow-hidden">
        <summary class="p-5 cursor-pointer list-none flex items-center justify-between font-semibold">
          <span>102 · Tópico 2 — Gestão de pacotes</span>
          <span class="text-xl">▼</span>
        </summary>
        <div class="px-5 pb-5 space-y-1">
          <p class="text-sm" style="color: var(--muted-foreground);">… 6 tópicos …</p>
        </div>
      </details>
    </div>
  </section>

  <!-- ============ Section 3: Tópico 3-zone com command table ============ -->
  <section class="section" id="topico">
    <p class="section-title">/manuals/101/101-1-determinar-e-definir-configuracoes-de-hardware — tópico 3-zone</p>

    <div class="grid gap-8" style="grid-template-columns: 14rem 1fr 16rem;">
      <!-- TOC -->
      <aside class="hidden lg:block">
        <p class="text-xs uppercase tracking-wider mb-3" style="color: var(--muted-foreground);">Neste tópico</p>
        <nav class="space-y-2 text-sm">
          <a href="#resumo" class="block pl-3 border-l-2" style="border-color: var(--primary); color: var(--primary);">Resumo Conciso</a>
          <a href="#comandos" class="block pl-3 border-l-2 border-transparent hover:border-current" style="color: var(--muted-foreground);">Comandos para inspeção</a>
          <a href="#exercicios" class="block pl-3 border-l-2 border-transparent hover:border-current" style="color: var(--muted-foreground);">Exercícios Guiados</a>
        </nav>
      </aside>

      <!-- Conteúdo central -->
      <article class="max-w-3xl">
        <h1 class="text-4xl font-bold mb-2">T01 — Determinar e definir configurações de hardware</h1>
        <p class="mb-8" style="color: var(--muted-foreground);">Peso 2 · Tópico 101</p>

        <h2 id="resumo" class="text-2xl font-semibold mt-12 mb-4 pb-2 border-b" style="border-color: var(--border);">Resumo Conciso</h2>
        <p class="leading-relaxed mb-4">A detecção de hardware em Linux é feita por uma combinação de ferramentas userspace e módulos kernel. Os comandos <code class="bg-muted px-1.5 py-0.5 rounded text-sm" style="background: var(--muted); font-family: 'IBM Plex Mono', monospace;">lspci</code>, <code class="bg-muted px-1.5 py-0.5 rounded text-sm" style="background: var(--muted); font-family: 'IBM Plex Mono', monospace;">lsusb</code> e <code class="bg-muted px-1.5 py-0.5 rounded text-sm" style="background: var(--muted); font-family: 'IBM Plex Mono', monospace;">lsmod</code> listam dispositivos PCI, USB e módulos carregados.</p>

        <h3 id="comandos" class="text-xl font-semibold mt-8 mb-3">Comandos para inspeção</h3>

        <!-- CommandTable mock -->
        <div class="rounded-xl overflow-hidden border" style="border-color: var(--border);">
          <div class="grid grid-cols-[10rem_1fr_14rem] gap-2 p-3 text-xs uppercase tracking-wider font-semibold" style="background: var(--cream); color: var(--muted-foreground);">
            <span>Comando</span><span>Função</span><span>Opções importantes</span>
          </div>
          <div class="grid grid-cols-[10rem_1fr_14rem] gap-2 p-3 items-center hover:translate-x-1 transition-transform" style="border-top: 1px solid var(--border);">
            <div class="flex items-center gap-2">
              <code style="font-family: 'IBM Plex Mono', monospace; font-weight: 500;">lspci</code>
              <button class="text-xs opacity-50 hover:opacity-100" title="Copiar">⧉</button>
            </div>
            <span class="text-sm">Lista dispositivos PCI</span>
            <span class="text-xs" style="color: var(--muted-foreground); font-family: 'IBM Plex Mono', monospace;">-v, -k, -s &lt;addr&gt;</span>
          </div>
          <div class="grid grid-cols-[10rem_1fr_14rem] gap-2 p-3 items-center hover:translate-x-1 transition-transform" style="border-top: 1px solid var(--border);">
            <div class="flex items-center gap-2">
              <code style="font-family: 'IBM Plex Mono', monospace; font-weight: 500;">lsusb</code>
              <button class="text-xs opacity-50 hover:opacity-100" title="Copiar">⧉</button>
            </div>
            <span class="text-sm">Lista dispositivos USB</span>
            <span class="text-xs" style="color: var(--muted-foreground); font-family: 'IBM Plex Mono', monospace;">-v, -d &lt;vendor&gt;</span>
          </div>
          <div class="grid grid-cols-[10rem_1fr_14rem] gap-2 p-3 items-center hover:translate-x-1 transition-transform" style="border-top: 1px solid var(--border);">
            <div class="flex items-center gap-2">
              <code style="font-family: 'IBM Plex Mono', monospace; font-weight: 500;">lsmod</code>
              <button class="text-xs opacity-50 hover:opacity-100" title="Copiar">⧉</button>
            </div>
            <span class="text-sm">Lista módulos kernel carregados</span>
            <span class="text-xs" style="color: var(--muted-foreground); font-family: 'IBM Plex Mono', monospace;">(sem flags)</span>
          </div>
        </div>

        <h2 id="exercicios" class="text-2xl font-semibold mt-12 mb-4 pb-2 border-b" style="border-color: var(--border);">Exercícios Guiados</h2>
        <details class="glass-card rounded-xl p-4 mb-3">
          <summary class="cursor-pointer font-medium">Exercício 1: Identificar o controlador USB</summary>
          <p class="mt-3 text-sm" style="color: var(--muted-foreground);">Utilize <code>lsusb -v</code> para listar…</p>
        </details>
      </article>

      <!-- Meta -->
      <aside class="hidden lg:block">
        <div class="glass-card rounded-2xl p-5">
          <p class="text-xs uppercase tracking-wider mb-3" style="color: var(--muted-foreground);">Meta</p>
          <dl class="space-y-2 text-sm">
            <div><dt class="inline" style="color: var(--muted-foreground);">Peso: </dt><dd class="inline font-medium">2</dd></div>
            <div><dt class="inline" style="color: var(--muted-foreground);">Tópico: </dt><dd class="inline font-medium">101</dd></div>
            <div><dt class="inline" style="color: var(--muted-foreground);">Tags: </dt><dd class="inline font-medium">LPIC-1 5.0</dd></div>
          </dl>
          <button class="w-full mt-4 rounded-lg px-4 py-2 text-sm font-medium" style="background: var(--primary); color: var(--primary-foreground);">Praticar com quiz →</button>
        </div>
      </aside>
    </div>
  </section>

</body>
</html>
```

- [ ] **Step 3: Abrir no browser e iterar estética**

Run: `start frontend/mockup-manuals.html` (Windows abre no browser default)
Expected: 3 secções renderizam com glassmorphism, staggered animation visível ao recarregar, command table com hover translational.

Iterar até a estética fechar (típico: 2-3 ciclos de ajuste fino de espaçamentos/sombras).

- [ ] **Step 4: Commit**

```bash
git add frontend/mockup-manuals.html
git commit -m "chore(mockup): criar mockup-manuals.html como visual companion"
```

Nota: o mockup é standalone e não entra no bundle Next. Não há build a verificar.

---

## Task 3: Instalar `gray-matter` + estender `lib/manuals.ts` com `level`

**Files:**
- Modify: `frontend/package.json` (via `npm install`)
- Modify: `frontend/src/lib/manuals.ts:8-14` (interface `Manual`) + `:52-215` (os 6 objetos do array `manuals`)

Adiciona a única nova dependência runtime (build-time parser YAML) e o campo `level` que distingue Essentials (010/020/030/050) de LPIC-1 (101/102).

- [ ] **Step 1: Instalar `gray-matter`**

Run: `cmd /c "npm install gray-matter"` em `frontend/`
Expected: `added 1 package` (ou similar). `gray-matter@^4.0.3` aparece em `dependencies` do `package.json`.

- [ ] **Step 2: Verificar que `gray-matter` resolve em TypeScript**

Run: `cmd /c "node -e "const m = require('gray-matter'); console.log(typeof m)"` em `frontend/`
Expected: imprime `object` (sem erros de resolução).

- [ ] **Step 3: Estender a interface `Manual` em `lib/manuals.ts:8-14`**

Substituir o bloco:

```ts
export interface Manual {
  code: string
  title: string
  description: string
  accent: Accent
  topics: ManualTopic[]
}
```

por:

```ts
export type ManualLevel = "essentials" | "lpic1"

export interface Manual {
  code: string
  title: string
  description: string
  accent: Accent
  level: ManualLevel
  topics: ManualTopic[]
}
```

- [ ] **Step 4: Adicionar `level: "essentials"` aos 4 manuais Essentials (010, 020, 030, 050)**

Em `lib/manuals.ts`, em cada um dos 4 objetos manuais com `code: "010"`, `"020"`, `"030"`, `"050"`, adicionar a linha imediatamente após a linha `accent: ...`:

```ts
    accent: "sage",
    level: "essentials",
```

(Em 010 é `"sage"`; em 020 `"coral"`; em 030 `"amber"`; em 050 `"terracotta"` — o `level` é sempre `"essentials"`.)

- [ ] **Step 5: Adicionar `level: "lpic1"` aos 2 manuais LPIC-1 (101, 102)**

Em cada um dos objetos com `code: "101"` e `"102"`, adicionar a linha após `accent: ...`:

```ts
    accent: "terracotta",  // ou "iris" para o 102
    level: "lpic1",
```

- [ ] **Step 6: Verificar build passa**

Run: `cmd /c "npm run build"` em `frontend/`
Expected: Build sem erros de tipo. Se algum consumer de `Manual` falhar por falta de `level`, os consumers existentes (3 page.tsx + lib usage) não acedem a `level`, por isso não deve haver quebras.

- [ ] **Step 7: Verificar lint passa**

Run: `cmd /c "npm run lint"` em `frontend/`
Expected: sem erros.

- [ ] **Step 8: Commit**

```bash
git add frontend/package.json frontend/package-lock.json frontend/src/lib/manuals.ts
git commit -m "feat(lib): adicionar gray-matter e campo level aos manuais"
```

---

## Task 4: Criar `lib/topic-loader.ts`

**Files:**
- Create: `frontend/src/lib/topic-loader.ts`

Loader que lê ficheiros markdown do Vault (`../Vault/`), parseia YAML frontmatter com `gray-matter`, e converte wikilinks Obsidian `[[X|Y]]` em links markdown canónicos. Usado pelo Server Component da rota `/manuals/[code]/[slug]`.

- [ ] **Step 1: Confirmar a localização real do Vault relativamente a `frontend/`**

Run: `Get-ChildItem -Path "..\Vault" -Directory | Select-Object -First 5 -ExpandProperty Name` em `frontend/`
Expected: vê pastas como `010 - Linux Essentials`, `101-500 - LPIC-1 (parte 1)`, etc.

- [ ] **Step 2: Confirmar a estrutura de um ficheiro de tópico**

Run: `Get-Content "..\Vault\101-500 - LPIC-1 (parte 1)\T01 - 101.1 Determinar e definir configurações de hardware.md" -TotalCount 15`
Expected: YAML frontmatter com `title:`, `objective:`, `topic:`, `weight:`, `tags:`, `prev:`, `next:`; depois body markdown com `## Resumo Conciso`.

- [ ] **Step 3: Criar `frontend/src/lib/topic-loader.ts`**

```ts
import fs from "node:fs/promises"
import path from "node:path"
import matter from "gray-matter"

const VAULT_ROOT = path.resolve(process.cwd(), "..", "Vault")

export type TopicFrontmatter = {
  title: string
  objective?: string
  topic?: string
  weight?: number | string
  tags?: string[]
  prev?: string
  next?: string
}

export type LoadedTopic = {
  frontmatter: TopicFrontmatter
  content: string
  headings: TocItem[]
}

export type TocItem = {
  id: string
  level: 2 | 3
  text: string
}

const WIKILINK_REGEX = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g

function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function resolveWikilinks(markdown: string): string {
  return markdown.replace(WIKILINK_REGEX, (_match, target: string, label?: string) => {
    const text = label ?? target
    const slug = slugify(target)
    // v1: wikilinks viram âncoras in-page. Cross-topic (apontar para outro
    // /manuals/[code]/[slug]) fica para v2 — exigiria lookup reverso no
    // manifesto. Ver spec §10 (Riscos) e §9 (Out of scope implícito).
    return `[${text}](#${slug})`
  })
}

function extractHeadings(markdown: string): TocItem[] {
  const lines = markdown.split("\n")
  const headings: TocItem[] = []
  let inFence = false
  for (const line of lines) {
    if (line.trimStart().startsWith("```")) {
      inFence = !inFence
      continue
    }
    if (inFence) continue
    const h2 = /^##\s+(.+)$/.exec(line)
    if (h2) {
      const text = h2[1].trim()
      headings.push({ id: slugify(text), level: 2, text })
      continue
    }
    const h3 = /^###\s+(.+)$/.exec(line)
    if (h3) {
      const text = h3[1].trim()
      headings.push({ id: slugify(text), level: 3, text })
    }
  }
  return headings
}

const VAULT_DIRS = [
  "101-500 - LPIC-1 (parte 1)",
  "102-500 - LPIC-1 (parte 2)",
  "010 - Linux Essentials",
  "020 - Security Essentials",
  "030 - Web Development Essentials",
  "050 - Open Source Essentials",
]

function matchesGlob(name: string, pattern: string): boolean {
  const re = new RegExp(
    "^" + pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*") + "$"
  )
  return re.test(name)
}

async function findTopicFile(slug: string): Promise<string | null> {
  for (const dir of VAULT_DIRS) {
    const fullDir = path.join(VAULT_ROOT, dir)
    let entries: string[]
    try {
      entries = await fs.readdir(fullDir)
    } catch {
      continue
    }
    // Padrões comuns: "T01 - <slug>.md", "<slug>.md", ou ficheiro que contenha o slug
    const patterns = [`T* - ${slug}.md`, `${slug}.md`]
    for (const pattern of patterns) {
      const match = entries.find((entry) => matchesGlob(entry, pattern))
      if (match) return path.join(fullDir, match)
    }
  }
  return null
}

export async function loadTopicBySlug(slug: string): Promise<LoadedTopic | null> {
  const filePath = await findTopicFile(slug)
  if (!filePath) {
    console.warn(`[topic-loader] Tópico não encontrado no Vault: ${slug}`)
    return null
  }

  const raw = await fs.readFile(filePath, "utf8")
  const parsed = matter(raw)
  const frontmatter = parsed.data as TopicFrontmatter
  const contentWithLinks = resolveWikilinks(parsed.content)
  const headings = extractHeadings(parsed.content)

  return {
    frontmatter,
    content: contentWithLinks,
    headings,
  }
}
```

Nota: `findTopicFile` itera sobre 6 diretórios do Vault e tenta 2 padrões de glob por diretório (12 tentativas no pior caso). Para 92 tópicos carregados individualmente por SSG/ISR, o custo é desprezável. Se houver latência em dev, adicionar cache simples com `Map<string, LoadedTopic>` em memória.

- [ ] **Step 4: Adicionar tipo `TocItem` re-export em `lib/manuals.ts`**

Para evitar duplicação, no fim de `lib/manuals.ts` adicionar:

```ts
export type { TocItem, TopicFrontmatter } from "./topic-loader"
```

- [ ] **Step 5: Verificar build passa**

Run: `cmd /c "npm run build"` em `frontend/`
Expected: sem erros de tipo. Pode haver warning sobre `fs.readdirSync` em build (Next 16 bundling) — se acontecer, garantir que a página que consome este loader é Server Component (Task 10).

- [ ] **Step 6: Verificar lint passa**

Run: `cmd /c "npm run lint"` em `frontend/`
Expected: sem erros.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/lib/topic-loader.ts frontend/src/lib/manuals.ts
git commit -m "feat(lib): topic-loader com gray-matter e resolucao de wikilinks"
```

---

## Task 5: Criar `is-command-table.ts`

**Files:**
- Create: `frontend/src/components/markdown/is-command-table.ts`

Heurística pura (sem React) que decide se uma tabela markdown é uma CommandTable ou uma ComparisonTable. Exportada como função pura para inspeção/debug fácil.

- [ ] **Step 1: Criar o ficheiro**

```ts
import type { Table, TableCell, TableRow } from "mdast"

type PhrasingContent = { type: string; value?: string }

function cellToText(cell: TableCell): string {
  return cell.children
    .map((child: PhrasingContent) => {
      if (child.type === "text" || child.type === "inlineCode") {
        return child.value ?? ""
      }
      return ""
    })
    .join("")
}

function rowHasInlineCodeFirst(row: TableRow): boolean {
  const first = row.children[0]
  if (!first || first.type !== "tableCell") return false
  return first.children.some((c: PhrasingContent) => c.type === "inlineCode")
}

export function isCommandTable(node: Table): boolean {
  if (!node.children || node.children.length < 2) return false

  const headerRow = node.children[0]
  const headers = headerRow.children.map(cellToText).map((s) => s.toLowerCase())

  const headerIndicatesCommand = headers.some((h) =>
    /(comando|command|flag|op[cç][a-z]o|opt|syntax|sintaxe)/i.test(h)
  )

  const bodyRows = node.children.slice(1)
  const allFirstColsAreCode = bodyRows.every(rowHasInlineCodeFirst)

  return headerIndicatesCommand || allFirstColsAreCode
}
```

- [ ] **Step 2: Verificar que o tipo `mdast` está disponível**

Run: `cmd /c "npm ls mdast 2>&1"` em `frontend/`
Expected: `mdast` listado (transitivo via `react-markdown`). Se NÃO estiver exposto, adicionar `@types/mdast`:

Run: `cmd /c "npm install -D @types/mdast"` em `frontend/` (só se o passo anterior falhar)

- [ ] **Step 3: Verificar build passa**

Run: `cmd /c "npm run build"` em `frontend/`
Expected: sem erros.

- [ ] **Step 4: Smoke manual (rápido)**

Criar ficheiro temporário `frontend/tmp/smoke-is-command.mjs`:

```js
import { isCommandTable } from "../src/components/markdown/is-command-table.ts"

const commandTable = {
  type: "table",
  children: [
    { type: "tableRow", children: [
      { type: "tableCell", children: [{ type: "text", value: "Comando" }] },
      { type: "tableCell", children: [{ type: "text", value: "Função" }] },
    ]},
    { type: "tableRow", children: [
      { type: "tableCell", children: [{ type: "inlineCode", value: "lspci" }] },
      { type: "tableCell", children: [{ type: "text", value: "Lista PCI" }] },
    ]},
  ],
}

console.log("should be true:", isCommandTable(commandTable))
```

Run: `cmd /c "node tmp/smoke-is-command.mjs"` em `frontend/`
Expected: imprime `should be true: true`. Apagar `tmp/smoke-is-command.mjs` depois.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/markdown/is-command-table.ts
git commit -m "feat(markdown): is-command-table heuristica pura para auto-deteccao"
```

---

## Task 6: Primitivos markdown — CopyButton, CodeBlock, DetailsDisclosure

**Files:**
- Create: `frontend/src/components/markdown/copy-button.tsx`
- Create: `frontend/src/components/markdown/code-block.tsx`
- Create: `frontend/src/components/markdown/details-disclosure.tsx`

Estes são os primitivos usados pelos componentes maiores (CommandTable, MarkdownRenderer) nas tasks seguintes. Todos consomem apenas Base UI + tokens Task 1.

- [ ] **Step 1: Confirmar imports do Base UI Button**

Run: `Get-Content frontend/node_modules/@base-ui/react/button/index.d.ts`
Expected: exporta `Button` namespace com `Button.Root`.

(Alternative: usar o componente `Button` shadcn existente em `@/components/ui/button` se já estiver shimmed para Base UI.)

- [ ] **Step 2: Criar `frontend/src/components/markdown/copy-button.tsx`**

```tsx
"use client"

import { useState, useCallback } from "react"
import { Copy, Check } from "lucide-react"

type CopyButtonProps = {
  value: string
  label?: string
  copiedLabel?: string
  className?: string
}

export function CopyButton({
  value,
  label = "Copiar",
  copiedLabel = "Copiado!",
  className = "",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard indisponível (HTTPS exigido); silencioso
    }
  }, [value])

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-live="polite"
      aria-label={copied ? copiedLabel : label}
      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors ${className}`}
    >
      {copied ? (
        <Check
          className="h-3.5 w-3.5"
          style={{ animation: "copy-feedback 0.3s ease" }}
          aria-hidden
        />
      ) : (
        <Copy className="h-3.5 w-3.5" aria-hidden />
      )}
      <span>{copied ? copiedLabel : label}</span>
    </button>
  )
}
```

- [ ] **Step 3: Criar `frontend/src/components/markdown/code-block.tsx`**

```tsx
import { CopyButton} from "./copy-button"

type CodeBlockProps = {
  code: string
  lang?: string
}

export function CodeBlock({ code, lang }: CodeBlockProps) {
  return (
    <div className="group relative my-6 overflow-hidden rounded-xl border border-border bg-card-dark">
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-2">
        <span className="font-mono text-xs text-white/50">
          {lang ?? "shell"}
        </span>
        <CopyButton
          value={code}
          label="Copiar"
          copiedLabel="Copiado!"
          className="text-white/70 hover:text-white hover:bg-white/5"
        />
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
        <code className="font-mono text-white/90">{code}</code>
      </pre>
    </div>
  )
}
```

- [ ] **Step 4: Criar `frontend/src/components/markdown/details-disclosure.tsx`**

Wrapper sobre Base UI `Collapsible` (`@base-ui/react/collapsible`) que substitui o `<details>` nativo do markdown.

```tsx
"use client"

import * as React from "react"
import { Collapsible } from "@base-ui/react/collapsible"
import { ChevronDown } from "lucide-react"

type DetailsDisclosureProps = {
  summary: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
}

export function DetailsDisclosure({
  summary,
  children,
  defaultOpen = false,
}: DetailsDisclosureProps) {
  return (
    <Collapsible.Root
      defaultOpen={defaultOpen}
      className="glass-card my-3 overflow-hidden rounded-xl"
    >
      <Collapsible.Trigger className="group flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-foreground hover:bg-muted/40 transition-colors">
        <span className="flex-1">{summary}</span>
        <ChevronDown
          className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[panel-open]:rotate-180"
          aria-hidden
        />
      </Collapsible.Trigger>
      <Collapsible.Panel className="px-4 pb-4 text-sm text-muted-foreground">
        {children}
      </Collapsible.Panel>
    </Collapsible.Root>
  )
}
```

Nota: Base UI Collapsible usa `data-panel-open` no trigger quando o painel está aberto. Se o seletor `group-data-[panel-open]` não funcionar, validar abrindo o React DevTools no browser e inspecionar o atributo real; alternativas: `[data-state="open"]`, `[aria-expanded="true"]`.

- [ ] **Step 5: Verificar build passa**

Run: `cmd /c "npm run build"` em `frontend/`
Expected: sem erros de tipo nem de import.

- [ ] **Step 6: Verificar lint passa**

Run: `cmd /c "npm run lint"` em `frontend/`
Expected: sem erros.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/components/markdown/copy-button.tsx frontend/src/components/markdown/code-block.tsx frontend/src/components/markdown/details-disclosure.tsx
git commit -m "feat(markdown): primitivos CopyButton CodeBlock DetailsDisclosure"
```

---

## Task 7: CommandTable, ComparisonTable, ProseElements, MarkdownRenderer

**Files:**
- Create: `frontend/src/components/markdown/comparison-table.tsx`
- Create: `frontend/src/components/markdown/command-table.tsx`
- Create: `frontend/src/components/markdown/prose-elements.tsx`
- Create: `frontend/src/components/markdown/markdown-renderer.tsx`
- Delete: `frontend/src/components/markdown-content.tsx`

Monta o `MarkdownRenderer` final que substitui o `markdown-content.tsx` atual. Mapeia elementos AST do `react-markdown` para os componentes premium.

- [ ] **Step 1: Criar `frontend/src/components/markdown/comparison-table.tsx`**

```tsx
type ComparisonTableProps = {
  headers: string[]
  rows: string[][]
}

export function ComparisonTable({ headers, rows }: ComparisonTableProps) {
  return (
    <div className="my-6 overflow-x-auto rounded-xl border border-border">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-cream">
            {headers.map((h, i) => (
              <th
                key={i}
                className="border-b border-border px-4 py-3 text-left font-semibold text-foreground"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr
              key={ri}
              className={ri % 2 === 1 ? "bg-cream/30" : ""}
            >
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className="border-b border-border px-4 py-3 text-muted-foreground"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 2: Criar `frontend/src/components/markdown/command-table.tsx`**

```tsx
"use client"

import { CopyButton } from "./copy-button"

type CommandRow = {
  command: string
  description: string
  flags?: string
}

type CommandTableProps = {
  rows: CommandRow[]
}

export function CommandTable({ rows }: CommandTableProps) {
  return (
    <div className="my-6 overflow-hidden rounded-xl border border-border bg-card">
      <div className="hidden grid-cols-[10rem_1fr_14rem] gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground md:grid bg-cream">
        <span>Comando</span>
        <span>Função</span>
        <span>Opções importantes</span>
      </div>
      <ul className="divide-y divide-border">
        {rows.map((row, i) => (
          <li
            key={i}
            className="grid grid-cols-1 gap-2 px-4 py-3 transition-transform duration-200 hover:translate-x-1 md:grid-cols-[10rem_1fr_14rem] md:items-center"
          >
            <div className="flex items-center gap-2">
              <code className="font-mono text-sm font-medium text-foreground">
                {row.command}
              </code>
              <CopyButton value={row.command} label="" copiedLabel="Copiado!" />
            </div>
            <span className="text-sm text-muted-foreground">{row.description}</span>
            {row.flags ? (
              <span className="font-mono text-xs text-muted-foreground">
                {row.flags}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground/50">—</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

- [ ] **Step 3: Criar `frontend/src/components/markdown/prose-elements.tsx`**

```tsx
import * as React from "react"

export const proseComponents = {
  h1: ({ children }: { children?: React.ReactNode }) => (
    <h1 className="mt-8 mb-6 text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
      {children}
    </h1>
  ),
  h2: ({ children, id }: { children?: React.ReactNode; id?: string }) => (
    <h2
      id={id}
      className="mt-12 mb-4 border-b border-border pb-2 text-2xl font-semibold text-foreground"
    >
      {children}
    </h2>
  ),
  h3: ({ children, id }: { children?: React.ReactNode; id?: string }) => (
    <h3
      id={id}
      className="mt-8 mb-3 text-xl font-semibold text-foreground"
    >
      {children}
    </h3>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="mb-4 text-base leading-relaxed text-foreground">{children}</p>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="mb-4 list-disc space-y-2 pl-6 text-foreground">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="mb-4 list-decimal space-y-2 pl-6 text-foreground">{children}</ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="leading-relaxed">{children}</li>
  ),
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="my-6 border-l-4 border-primary pl-4 italic text-muted-foreground">
      {children}
    </blockquote>
  ),
  a: ({
    children,
    href,
  }: {
    children?: React.ReactNode
    href?: string
  }) => (
    <a
      href={href}
      className="text-primary underline-offset-2 hover:underline"
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  em: ({ children }: { children?: React.ReactNode }) => (
    <em className="italic">{children}</em>
  ),
  hr: () => <hr className="my-6 border-border" />,
} as const
```

- [ ] **Step 4: Criar `frontend/src/components/markdown/markdown-renderer.tsx`**

```tsx
"use client"

import * as React from "react"
import ReactMarkdown, { type Components } from "react-markdown"
import remarkGfm from "remark-gfm"
import type { Table } from "mdast"

import { proseComponents } from "./prose-elements"
import { CodeBlock } from "./code-block"
import { ComparisonTable } from "./comparison-table"
import { CommandTable } from "./command-table"
import { DetailsDisclosure } from "./details-disclosure"
import { isCommandTable } from "./is-command-table"
import type { TopicFrontmatter } from "@/lib/topic-loader"

type MarkdownRendererProps = {
  content: string
  frontmatter: TopicFrontmatter
}

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function extractText(children: React.ReactNode): string {
  if (typeof children === "string") return children
  if (Array.isArray(children)) return children.map(extractText).join("")
  if (React.isValidElement(children)) {
    return extractText(children.props.children)
  }
  return ""
}

function extractRowsFromTable(node: Table): {
  headers: string[]
  rows: string[][]
} {
  const headers = node.children[0]?.children.map((cell) => {
    return cell.children
      .map((c) => ("value" in c ? String(c.value) : ""))
      .join("")
  }) ?? []

  const rows = node.children.slice(1).map((row) =>
    row.children.map((cell) =>
      cell.children
        .map((c) => ("value" in c ? String(c.value) : ""))
        .join("")
    )
  )

  return { headers, rows }
}

const components: Components = {
  ...proseComponents,
  code: ({ className, children }) => {
    const isInline = !className
    if (isInline) {
      return (
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground">
          {children}
        </code>
      )
    }
    const match = /language-(\w+)/.exec(className ?? "")
    return (
      <CodeBlock
        code={String(children).replace(/\n$/, "")}
        lang={match?.[1]}
      />
    )
  },
  pre: ({ children }) => <>{children}</>,
  table: ({ children }) => {
    // react-markdown expõe o node mdast via prop não-tipada
    const node = (children as any)?.props?.node as Table | undefined
    if (node && isCommandTable(node)) {
      const { rows } = extractRowsFromTable(node)
      const commandRows = rows.map((r) => ({
        command: r[0] ?? "",
        description: r[1] ?? "",
        flags: r[2],
      }))
      return <CommandTable rows={commandRows} />
    }
    if (node) {
      const { headers, rows } = extractRowsFromTable(node)
      return <ComparisonTable headers={headers} rows={rows} />
    }
    return <table className="my-6 w-full border-collapse">{children}</table>
  },
  details: ({ summary, children }) => (
    <DetailsDisclosure summary={summary}>{children}</DetailsDisclosure>
  ),
}

export function MarkdownRenderer({ content, frontmatter }: MarkdownRendererProps) {
  // `frontmatter` disponível para uso futuro (ex.: prefixar título com peso).
  // Por agora, é apenas aceite para alinhar com o contrato da spec §4.2.
  void frontmatter
  return (
    <div className="prose prose-neutral max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
```

- [ ] **Step 5: Apagar `frontend/src/components/markdown-content.tsx`**

```bash
git rm frontend/src/components/markdown-content.tsx
```

- [ ] **Step 6: Verificar build passa**

Run: `cmd /c "npm run build"` em `frontend/`
Expected: sem erros. Se houver erro de import noutros ficheiros que ainda referenciem `markdown-content`, são resolvidos na Task 10.

- [ ] **Step 7: Verificar lint passa**

Run: `cmd /c "npm run lint"` em `frontend/`
Expected: sem erros.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/components/markdown/comparison-table.tsx frontend/src/components/markdown/command-table.tsx frontend/src/components/markdown/prose-elements.tsx frontend/src/components/markdown/markdown-renderer.tsx
git rm frontend/src/components/markdown-content.tsx
git commit -m "feat(markdown): MarkdownRenderer com CommandTable ComparisonTable e prose premium"
```

---

## Task 8: Refactor `/manuals` — ManualCard + ManualLevelGroup

**Files:**
- Create: `frontend/src/components/manuals/manual-card.tsx`
- Create: `frontend/src/components/manuals/manual-level-group.tsx`
- Replace: `frontend/src/app/manuals/page.tsx`
- Modify: `frontend/src/app/manuals/layout.tsx`

Refactor da listagem com cards glassmorphism, staggered entrance por índice, e agrupamento por nível (Essentials em 4 cols, LPIC-1 em 2 cols).

- [ ] **Step 1: Criar `frontend/src/components/manuals/manual-card.tsx`**

```tsx
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { accentClasses, type Manual } from "@/lib/manuals"

type ManualCardProps = {
  manual: Manual
  index: number
}

export function ManualCard({ manual, index }: ManualCardProps) {
  const accent = accentClasses[manual.accent]
  const delay = Math.min(index * 60, 480)

  return (
    <Link
      href={`/manuals/${manual.code}`}
      className="glass-card stagger-child group block rounded-3xl p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="mb-3 flex items-start justify-between">
        <span
          className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${accent.badge}`}
        >
          {manual.code}
        </span>
        <ArrowRight
          className="h-4 w-4 -translate-x-1 text-muted-foreground opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-hover:text-primary"
          aria-hidden
        />
      </div>
      <h3 className="text-lg font-semibold text-foreground">
        {manual.title}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        {manual.description}
      </p>
      <p className="mt-3 text-xs text-muted-foreground">
        {manual.topics.length} tópicos
      </p>
    </Link>
  )
}
```

- [ ] **Step 2: Criar `frontend/src/components/manuals/manual-level-group.tsx`**

```tsx
import type { Manual, ManualLevel } from "@/lib/manuals"
import { ManualCard } from "./manual-card"

type ManualLevelGroupProps = {
  level: ManualLevel
  manuals: Manual[]
}

const LABELS: Record<ManualLevel, { heading: string; colsLg: string }> = {
  essentials: {
    heading: "Essentials",
    colsLg: "lg:grid-cols-4",
  },
  lpic1: {
    heading: "LPIC-1 · Certificação",
    colsLg: "lg:grid-cols-2",
  },
}

export function ManualLevelGroup({ level, manuals }: ManualLevelGroupProps) {
  const { heading, colsLg } = LABELS[level]
  return (
    <section className="mb-12">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-terracotta">
        {heading}
      </h2>
      <div className={`stagger-list grid grid-cols-1 gap-4 sm:grid-cols-2 ${colsLg}`}>
        {manuals.map((manual, index) => (
          <ManualCard key={manual.code} manual={manual} index={index} />
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Substituir `frontend/src/app/manuals/page.tsx`**

```tsx
import { BookOpen } from "lucide-react"
import { manuals } from "@/lib/manuals"
import { ManualLevelGroup } from "@/components/manuals/manual-level-group"

export default function ManualsPage() {
  const totalTopics = manuals.reduce((sum, m) => sum + m.topics.length, 0)
  const essentials = manuals.filter((m) => m.level === "essentials")
  const lpic1 = manuals.filter((m) => m.level === "lpic1")

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <header className="mb-12">
        <h1 className="flex items-center gap-3 text-4xl font-bold tracking-tight text-foreground">
          <BookOpen className="h-8 w-8 text-primary" aria-hidden />
          Manuais LPI
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
          {totalTopics} tópicos dos manuais oficiais LPI, processados e
          pesquisáveis com IA.
        </p>
      </header>

      <ManualLevelGroup level="essentials" manuals={essentials} />
      <ManualLevelGroup level="lpic1" manuals={lpic1} />
    </div>
  )
}
```

- [ ] **Step 4: Atualizar `frontend/src/app/manuals/layout.tsx` para incluir fundo decorativo**

Substituir conteúdo:

```tsx
import { Header } from "@/components/header"
import { DashboardFooter } from "@/components/dashboard-footer"

export default function ManualsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[400px] -z-10"
        style={{ background: "var(--bg-radial-warm)" }}
        aria-hidden
      />
      <Header />
      <main className="flex-1">{children}</main>
      <DashboardFooter />
    </div>
  )
}
```

- [ ] **Step 5: Verificar build passa**

Run: `cmd /c "npm run build"` em `frontend/`
Expected: sem erros.

- [ ] **Step 6: Verificar lint passa**

Run: `cmd /c "npm run lint"` em `frontend/`
Expected: sem erros.

- [ ] **Step 7: Smoke visual**

Run: `cmd /c "npm run dev"` em `frontend/`, abrir `http://localhost:3000/manuals`
Expected: 6 cards em 2 grupos (Essentials 4 cols, LPIC-1 2 cols em desktop), staggered animation visível ao recarregar, glassmorphism translúcido sobre o fundo radial.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/components/manuals/manual-card.tsx frontend/src/components/manuals/manual-level-group.tsx frontend/src/app/manuals/page.tsx frontend/src/app/manuals/layout.tsx
git commit -m "refactor(manuals): listagem com ManualCard glassmorphism e agrupamento por nivel"
```

---

## Task 9: Refactor `/manuals/[code]` — TopicAccordion + TopicRow

**Files:**
- Create: `frontend/src/components/manuals/topic-row.tsx`
- Create: `frontend/src/components/manuals/topic-accordion.tsx`
- Replace: `frontend/src/app/manuals/[code]/page.tsx`

Accordion Base UI com `multiple` (vários grupos abertos simultaneamente), agrupamento por objective (primeiros 3 dígitos do slug), e animação CSS no chevron.

- [ ] **Step 1: Confirmar a API do Accordion.Root via TypeScript**

Run: `Get-Content frontend/node_modules/@base-ui/react/accordion/root/AccordionRoot.d.ts | Select-String "multiple|defaultValue"`
Expected: vê `multiple?: boolean | undefined` e `defaultValue?: AccordionValue<Value> | undefined` onde `AccordionValue` é array.

- [ ] **Step 2: Criar `frontend/src/components/manuals/topic-row.tsx`**

```tsx
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { accentClasses, type Accent, type ManualTopic } from "@/lib/manuals"

type TopicRowProps = {
  topic: ManualTopic
  index: number
  manualCode: string
  accent: Accent
}

export function TopicRow({ topic, index, manualCode, accent }: TopicRowProps) {
  const a = accentClasses[accent]
  const paddedNumber = String(index + 1).padStart(2, "0")

  return (
    <Link
      href={`/manuals/${manualCode}/${topic.slug}`}
      className="group flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="flex items-center gap-3">
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${a.soft} ${a.strong}`}
        >
          {paddedNumber}
        </span>
        <span className="text-sm font-medium text-foreground">
          {topic.title}
        </span>
      </span>
      <ChevronRight
        className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary"
        aria-hidden
      />
    </Link>
  )
}
```

- [ ] **Step 3: Criar `frontend/src/components/manuals/topic-accordion.tsx`**

```tsx
"use client"

import * as React from "react"
import { Accordion } from "@base-ui/react/accordion"
import { ChevronDown } from "lucide-react"
import { accentClasses, type Manual, type ManualTopic } from "@/lib/manuals"
import { TopicRow } from "./topic-row"

type TopicAccordionProps = {
  manual: Manual
  defaultOpenTopic?: string
}

function topicGroup(topic: ManualTopic): string {
  // Primeiros 3 dígitos do slug formam o objective: "101-1-..." -> "101"
  const match = /^(\d{3})/.exec(topic.slug)
  return match ? match[1] : "outros"
}

function groupTitle(group: string, topics: ManualTopic[]): string {
  const first = topics[0]
  const match = /^(\d{3}\.\d+)/.exec(first.title)
  if (match) return `${group} · ${first.title.replace(match[1], "").trim() || first.title}`
  return `Tópico ${group}`
}

export function TopicAccordion({ manual, defaultOpenTopic }: TopicAccordionProps) {
  const accent = accentClasses[manual.accent]

  const grouped = React.useMemo(() => {
    const map = new Map<string, ManualTopic[]>()
    for (const topic of manual.topics) {
      const group = topicGroup(topic)
      const list = map.get(group) ?? []
      list.push(topic)
      map.set(group, list)
    }
    return Array.from(map.entries())
  }, [manual.topics])

  const defaultValue = defaultOpenTopic ? [defaultOpenTopic] : grouped[0] ? [topicGroup(grouped[0][1][0])] : []

  return (
    <Accordion.Root multiple defaultValue={defaultValue} className="space-y-3">
      {grouped.map(([group, topics]) => {
        const globalStartIndex = manual.topics.indexOf(topics[0])
        return (
          <Accordion.Item
            key={group}
            value={group}
            className="glass-card overflow-hidden rounded-2xl"
          >
            <Accordion.Header>
              <Accordion.Trigger className="group flex w-full items-center justify-between gap-3 px-5 py-4 text-left font-semibold text-foreground hover:bg-muted/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <span className="flex items-center gap-3">
                  <span
                    className={`inline-flex h-7 items-center rounded-md px-2 text-xs font-bold ${accent.badge}`}
                  >
                    {group}
                  </span>
                  <span>{groupTitle(group, topics)}</span>
                </span>
                <ChevronDown
                  className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[panel-open]:rotate-180"
                  aria-hidden
                />
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Panel className="px-2 pb-2">
              <ul className="space-y-0.5">
                {topics.map((topic, i) => (
                  <li key={topic.slug}>
                    <TopicRow
                      topic={topic}
                      index={globalStartIndex + i}
                      manualCode={manual.code}
                      accent={manual.accent}
                    />
                  </li>
                ))}
              </ul>
            </Accordion.Panel>
          </Accordion.Item>
        )
      })}
    </Accordion.Root>
  )
}
```

Nota sobre `group-data-[panel-open]`: Base UI Collapsible/Accordion colocam `data-panel-open` no trigger quando aberto. Se o atributo for outro (`data-state="open"`), inspecionar no DevTools e ajustar o seletor.

- [ ] **Step 4: Substituir `frontend/src/app/manuals/[code]/page.tsx`**

```tsx
import { ArrowLeft, BookOpen } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { accentClasses, getManual } from "@/lib/manuals"
import { TopicAccordion } from "@/components/manuals/topic-accordion"

export default async function ManualDetailPage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params
  const manual = getManual(code)

  if (!manual) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-foreground">Manual não encontrado</h1>
        <Link href="/manuals" className="mt-4 inline-block">
          <Button variant="outline">Voltar aos Manuais</Button>
        </Link>
      </div>
    )
  }

  const accent = accentClasses[manual.accent]

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <Link
        href="/manuals"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Manuais
      </Link>

      <header className="mb-8">
        <div className="mb-3 flex items-center gap-3">
          <span
            className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${accent.badge}`}
          >
            {manual.code}
          </span>
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {manual.level === "essentials" ? "Essentials" : "LPIC-1"}
          </span>
        </div>
        <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-foreground">
          <BookOpen className="h-7 w-7 text-primary" aria-hidden />
          {manual.title}
        </h1>
        <p className="mt-2 text-muted-foreground">{manual.description}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          {manual.topics.length} tópicos · {manual.topics.filter((t) => /^\d{3}/.test(t.slug)).length} objectives
        </p>
      </header>

      <TopicAccordion manual={manual} />
    </div>
  )
}
```

- [ ] **Step 5: Verificar build passa**

Run: `cmd /c "npm run build"` em `frontend/`
Expected: sem erros.

- [ ] **Step 6: Verificar lint passa**

Run: `cmd /c "npm run lint"` em `frontend/`
Expected: sem erros.

- [ ] **Step 7: Smoke visual**

Abrir `http://localhost:3000/manuals/101`
Expected: accordion com grupos 101/102/103/104, primeiro grupo aberto por defeito, click noutro grupo abre sem fechar o primeiro (multiple). Chevron roda 180° no open.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/components/manuals/topic-row.tsx frontend/src/components/manuals/topic-accordion.tsx frontend/src/app/manuals/[code]/page.tsx
git commit -m "refactor(manuals): TopicAccordion Base UI com agrupamento por objective"
```

---

## Task 10: Refactor `/manuals/[code]/[slug]` — layout 3-zone

**Files:**
- Create: `frontend/src/components/manuals/reading-progress.tsx`
- Create: `frontend/src/components/manuals/prev-next-nav.tsx`
- Create: `frontend/src/components/manuals/topic-toc.tsx`
- Create: `frontend/src/components/manuals/topic-meta.tsx`
- Replace: `frontend/src/app/manuals/[code]/[slug]/page.tsx`

Layout 3-zone completo: TOC sticky esquerda + conteúdo central com `MarkdownRenderer` + Meta sticky direita. ReadingProgress fixed top. Scroll-spy via IntersectionObserver.

- [ ] **Step 1: Criar `frontend/src/components/manuals/reading-progress.tsx`**

```tsx
"use client"

import { useEffect } from "react"

export function ReadingProgress() {
  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement
      const scrollTop = window.scrollY
      const height = doc.scrollHeight - window.innerHeight
      const progress = height > 0 ? Math.min(100, (scrollTop / height) * 100) : 0
      doc.style.setProperty("--progress", `${progress}%`)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div
      role="progressbar"
      aria-label="Progresso de leitura"
      aria-valuemin={0}
      aria-valuemax={100}
      className="fixed inset-x-0 top-0 z-50 h-0.5 bg-transparent"
    >
      <div
        className="h-full transition-[width] duration-100 ease-out"
        style={{
          width: "var(--progress, 0%)",
          background: "var(--gradient-accent)",
        }}
      />
    </div>
  )
}
```

- [ ] **Step 2: Criar `frontend/src/components/manuals/prev-next-nav.tsx`**

```tsx
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { ManualTopic } from "@/lib/manuals"

type PrevNextNavProps = {
  prev?: ManualTopic
  next?: ManualTopic
  manualCode: string
}

export function PrevNextNav({ prev, next, manualCode }: PrevNextNavProps) {
  return (
    <nav className="mt-8 grid grid-cols-2 gap-3" aria-label="Navegação entre tópicos">
      {prev ? (
        <Link
          href={`/manuals/${manualCode}/${prev.slug}`}
          className="glass-card group rounded-xl p-4 transition-colors hover:bg-glass-bg-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <ChevronLeft className="h-3 w-3" aria-hidden />
            Anterior
          </div>
          <p className="mt-1 truncate text-sm font-medium text-foreground">
            {prev.title}
          </p>
        </Link>
      ) : (
        <div aria-hidden />
      )}
      {next ? (
        <Link
          href={`/manuals/${manualCode}/${next.slug}`}
          className="glass-card group rounded-xl p-4 text-right transition-colors hover:bg-glass-bg-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
            Seguinte
            <ChevronRight className="h-3 w-3" aria-hidden />
          </div>
          <p className="mt-1 truncate text-sm font-medium text-foreground">
            {next.title}
          </p>
        </Link>
      ) : (
        <div aria-hidden />
      )}
    </nav>
  )
}
```

- [ ] **Step 3: Criar `frontend/src/components/manuals/topic-toc.tsx`**

```tsx
"use client"

import { useEffect, useState } from "react"
import type { TocItem } from "@/lib/topic-loader"

type TopicTocProps = {
  headings: TocItem[]
}

export function TopicToc({ headings }: TopicTocProps) {
  const [activeId, setActiveId] = useState<string>(headings[0]?.id ?? "")

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) {
          setActiveId(visible[0].target.id)
        }
      },
      {
        rootMargin: "-80px 0px -70% 0px",
        threshold: 0,
      }
    )

    for (const heading of headings) {
      const el = document.getElementById(heading.id)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  return (
    <nav aria-label="Índice do tópico" className="sticky top-24 hidden lg:block">
      <p className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">
        Neste tópico
      </p>
      <ul className="space-y-1 text-sm">
        {headings.map((heading) => {
          const isActive = activeId === heading.id
          return (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                className={
                  "block border-l-2 py-1 transition-colors " +
                  (heading.level === 3 ? "pl-6 " : "pl-3 ") +
                  (isActive
                    ? "border-primary font-medium text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground")
                }
                aria-current={isActive ? "true" : undefined}
              >
                {heading.text}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
```

- [ ] **Step 4: Criar `frontend/src/components/manuals/topic-meta.tsx`**

```tsx
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import type { ManualTopic, TopicFrontmatter } from "@/lib/manuals"
import { PrevNextNav } from "./prev-next-nav"

type TopicMetaProps = {
  frontmatter: TopicFrontmatter
  prev?: ManualTopic
  next?: ManualTopic
  manualCode: string
  topicSlug: string
  topicTitle: string
}

export function TopicMeta({
  frontmatter,
  prev,
  next,
  manualCode,
  topicSlug,
  topicTitle,
}: TopicMetaProps) {
  const chatQuery = encodeURIComponent(
    `Explica o tópico "${topicTitle}" do manual ${manualCode}.`
  )
  const tags = Array.isArray(frontmatter.tags) ? frontmatter.tags : []

  return (
    <aside className="sticky top-24 hidden h-fit w-64 shrink-0 xl:block">
      <div className="glass-card rounded-2xl p-5">
        <p className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">
          Meta
        </p>
        <dl className="space-y-2 text-sm">
          {frontmatter.weight !== undefined && (
            <div>
              <dt className="inline text-muted-foreground">Peso: </dt>
              <dd className="inline font-medium text-foreground">
                {String(frontmatter.weight)}
              </dd>
            </div>
          )}
          {frontmatter.topic && (
            <div>
              <dt className="inline text-muted-foreground">Tópico: </dt>
              <dd className="inline font-medium text-foreground">
                {frontmatter.topic}
              </dd>
            </div>
          )}
          {tags.length > 0 && (
            <div>
              <dt className="inline text-muted-foreground">Tags: </dt>
              <dd className="inline font-medium text-foreground">
                {tags.join(", ")}
              </dd>
            </div>
          )}
        </dl>

        <Link
          href={`/dashboard/chat?q=${chatQuery}`}
          className="mt-4 block"
        >
          <Button className="w-full">
            <Sparkles className="h-4 w-4" />
            Perguntar à IA
          </Button>
        </Link>
      </div>

      <div className="mt-4">
        <PrevNextNav prev={prev} next={next} manualCode={manualCode} />
      </div>
    </aside>
  )
}
```

- [ ] **Step 5: Substituir `frontend/src/app/manuals/[code]/[slug]/page.tsx`**

```tsx
import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronRight, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { accentClasses, getManual } from "@/lib/manuals"
import { loadTopicBySlug } from "@/lib/topic-loader"
import { MarkdownRenderer } from "@/components/markdown/markdown-renderer"
import { ReadingProgress } from "@/components/manuals/reading-progress"
import { TopicToc } from "@/components/manuals/topic-toc"
import { TopicMeta } from "@/components/manuals/topic-meta"
import { PrevNextNav } from "@/components/manuals/prev-next-nav"

export default async function TopicPage({
  params,
}: {
  params: Promise<{ code: string; slug: string }>
}) {
  const { code, slug } = await params
  const manual = getManual(code)

  if (!manual) {
    notFound()
  }

  const topicIndex = manual.topics.findIndex((t) => t.slug === slug)
  if (topicIndex === -1) {
    notFound()
  }

  const topic = manual.topics[topicIndex]
  const accent = accentClasses[manual.accent]
  const prev = topicIndex > 0 ? manual.topics[topicIndex - 1] : undefined
  const next =
    topicIndex < manual.topics.length - 1
      ? manual.topics[topicIndex + 1]
      : undefined

  const loaded = await loadTopicBySlug(slug)
  const content = loaded?.content ?? ""
  const headings = loaded?.headings ?? []
  const frontmatter = loaded?.frontmatter ?? { title: topic.title }

  return (
    <>
      <ReadingProgress />

      <div className="mx-auto max-w-7xl px-4 py-12">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:shadow-lg"
        >
          Saltar para o conteúdo
        </a>

        {/* Breadcrumb */}
        <nav
          aria-label="Caminho de navegação"
          className="mb-6 flex items-center gap-1 text-sm text-muted-foreground"
        >
          <Link href="/manuals" className="hover:text-foreground transition-colors">
            Manuais
          </Link>
          <ChevronRight className="h-3 w-3" aria-hidden />
          <Link
            href={`/manuals/${code}`}
            className="hover:text-foreground transition-colors"
          >
            {manual.title}
          </Link>
        </nav>

        {/* 3-zone grid */}
        <div className="grid gap-8 xl:grid-cols-[14rem_minmax(0,1fr)_16rem]">
          {/* TOC (sticky esquerda) */}
          <TopicToc headings={headings} />

          {/* Conteúdo central */}
          <article
            id="main-content"
            className="min-w-0 max-w-3xl"
            tabIndex={-1}
          >
            <header className="mb-8">
              <span
                className={`mb-3 inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${accent.badge}`}
              >
                {manual.code} · Tópico {String(topicIndex + 1).padStart(2, "0")}
              </span>
              <h1 className="flex items-center gap-3 text-4xl font-bold tracking-tight text-foreground">
                <BookOpen className="h-8 w-8 text-primary" aria-hidden />
                {topic.title}
              </h1>
            </header>

            <MarkdownRenderer content={content} frontmatter={frontmatter} />

            {/* Mobile: Meta inline + PrevNextNav */}
            <div className="mt-12 xl:hidden">
              <PrevNextNav prev={prev} next={next} manualCode={code} />
            </div>
          </article>

          {/* Meta (sticky direita) */}
          <TopicMeta
            frontmatter={frontmatter}
            prev={prev}
            next={next}
            manualCode={code}
            topicSlug={slug}
            topicTitle={topic.title}
          />
        </div>
      </div>
    </>
  )
}
```

- [ ] **Step 6: Verificar build passa**

Run: `cmd /c "npm run build"` em `frontend/`
Expected: sem erros de tipo. Em particular, o loader `topic-loader.ts` usa `fs/promises` e só funciona em Server Components — confirmar que a página é `async function` (Server Component default no App Router).

- [ ] **Step 7: Verificar lint passa**

Run: `cmd /c "npm run lint"` em `frontend/`
Expected: sem erros.

- [ ] **Step 8: Smoke visual em desktop (≥1280px)**

Abrir `http://localhost:3000/manuals/101/101-1-determinar-e-definir-configuracoes-de-hardware`
Expected:
- 3 colunas visíveis (TOC + conteúdo + meta).
- ReadingProgress no topo acompanha o scroll.
- TOC ativo muda conforme se faz scroll para cada h2/h3.
- Command tables aparecem com hover effect + botão Copiar funcional.
- Accordion no MarkdownRenderer (`<details>`) abre/fecha.

- [ ] **Step 9: Smoke visual em mobile (resize <1024px)**

Expected: TOC some, Meta some, conteúdo single-column, PrevNextNav aparece no fundo do conteúdo.

- [ ] **Step 10: Commit**

```bash
git add frontend/src/components/manuals/reading-progress.tsx frontend/src/components/manuals/prev-next-nav.tsx frontend/src/components/manuals/topic-toc.tsx frontend/src/components/manuals/topic-meta.tsx frontend/src/app/manuals/[code]/[slug]/page.tsx
git commit -m "refactor(manuals): topico 3-zone com TOC scroll-spy Meta sticky e ReadingProgress"
```

---

## Task 11: Verificação final

**Files:** nenhum (verificação apenas)

Validação ponta-a-ponta da implementação completa contra os critérios de aceitação da spec (secção 8).

- [ ] **Step 1: Build de produção**

Run: `cmd /c "npm run build"` em `frontend/`
Expected: build succeeds sem erros nem warnings novos.

- [ ] **Step 2: Lint**

Run: `cmd /c "npm run lint"` em `frontend/`
Expected: sem erros.

- [ ] **Step 3: Confirmar ausência de dependências proibidas**

Run: `cmd /c "npm ls framer-motion lottie-react gsap 2>&1"` em `frontend/`
Expected: output `empty` / `UNMET PRODUCTION DEPENDENCY` (não instaladas).

- [ ] **Step 4: Confirmar que `gray-matter` é a única dependência nova**

Comparar `frontend/package.json` com o estado anterior ao Task 3 (via `git diff main -- frontend/package.json` ou similar). As únicas diferenças em `dependencies` devem ser `+ gray-matter`.

- [ ] **Step 5: Smoke visual — `/manuals`**

Abrir `http://localhost:3000/manuals`. Validar:
- [ ] 6 cards em 2 grupos (Essentials + LPIC-1)
- [ ] staggered animation ao recarregar
- [ ] glassmorphism translúcido sobre fundo radial
- [ ] accent badges corretos por manual (010=sage, 020=coral, 030=amber, 050=terracotta, 101=terracotta, 102=iris)
- [ ] hover mostra seta a entrar da esquerda

- [ ] **Step 6: Smoke visual — `/manuals/[code]`**

Abrir `http://localhost:3000/manuals/101`. Validar:
- [ ] Accordion com grupos por objective (101, 102, 103, 104)
- [ ] Primeiro grupo aberto por defeito
- [ ] Múltiplos grupos podem estar abertos simultaneamente (`multiple`)
- [ ] Chevron roda 180° no open
- [ ] TopicRow hover desloca para a direita

- [ ] **Step 7: Smoke visual — `/manuals/[code]/[slug]`**

Abrir `http://localhost:3000/manuals/101/101-1-determinar-e-definir-configuracoes-de-hardware`. Validar:
- [ ] Layout 3-zone em desktop ≥1280px
- [ ] TOC sticky esquerda com scroll-spy ativo
- [ ] Meta sticky direita com CTA quiz/chat
- [ ] ReadingProgress fixed top acompanha scroll
- [ ] CommandTable com hover + copy funcional
- [ ] `<details>` renderiza como Base UI Collapsible
- [ ] Skip-link visível com Tab
- [ ] Em mobile (<1024px): TOC e Meta escondidos, PrevNextNav inline no fundo

- [ ] **Step 8: Verificar acessibilidade básica**

- [ ] Navegar `/manuals/[code]/[slug]` só com teclado: Tab move através de todos os elementos focáveis; Enter ativa links; accordion abre/fecha com Espaço/Enter.
- [ ] Screen reader (NVDA/VoiceOver) anuncia feedback de copy (via `aria-live`).
- [ ] Ativar `prefers-reduced-motion` (DevTools > Rendering) e recarregar — todas as animações cancelam.

- [ ] **Step 9: Lighthouse (opcional, mas recomendado)**

Abrir DevTools > Lighthouse > Performance + Accessibility nas 3 rotas. Targets:
- [ ] A11y ≥ 95
- [ ] Performance ≥ 90 em `/manuals/[code]/[slug]`

Se abaixo: investigar imagens não otimizadas, CSS bloqueante, ou effects caros (backdrop-filter em muitos elementos).

- [ ] **Step 10: Verificar que `markdown-content.tsx` foi removido**

Run: `Test-Path frontend/src/components/markdown-content.tsx` em PowerShell
Expected: `False`.

- [ ] **Step 11: Atualizar docs do Vault**

Abrir `linuxdecamoes/04-*.md` ou o ADR relevante e adicionar entrada no histórico a documentar o redesign dos manuais. Exemplo:

```markdown
| 2026-07-21 | **Redesign `/manuals`:** layout 3-zone, glassmorphism, CommandTable interativa, Accordion Base UI por objective, TOC scroll-spy. Única nova dep: `gray-matter` (build-time). Spec em `docs/superpowers/specs/2026-07-21-manuals-redesign-design.md`. | ✅ |
```

- [ ] **Step 12: Commit final**

```bash
git add linuxdecamoes/04-*.md  # ajustar ao ficheiro real do histórico
git commit -m "docs(vault): registar redesign de /manuals no historico"
```

---

## Notas Finais para a Execução

1. **Cada task é independente e revertível**: se uma task falhar, fazer `git revert HEAD` e voltar à task anterior. Não insistir na mesma abordagem se falhar 2x (Anti-Loop, §2 do AGENTS.md).
2. **Verificar antes de afirmar**: toda claim "passa/funciona/completo" tem de ser confirmada por `cmd /c "npm run build"` + `cmd /c "npm run lint"` + smoke visual.
3. **Adaptar Base UI se necessário**: a API do Base UI pode divergir em pormenores (`data-panel-open` vs `data-state="open"`, etc.). Inspecionar o DOM real no browser antes de ajustar seletores CSS.
4. **Wikilinks não resolvidos**: se o `topic-loader` não encontrar um ficheiro para um slug, logar aviso em build e deixar o link como anchor `#slug`. Não quebra o build.
5. **`prefers-reduced-motion`** já está em `globals.css:172` (cancela todas as animações automaticamente). Não acrescentar media queries adicionais por componente.
