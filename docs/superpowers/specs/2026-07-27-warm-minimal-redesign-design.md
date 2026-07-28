---
tipo: spec
titulo: "Redesign Warm Minimal — Landing + Dashboard"
data: 2026-07-27
estado: aprovado
versao: "1.0"
---

# Spec: Redesign Warm Minimal — Landing + Dashboard

## Contexto

O UI atual do Linux de Camões é funcional mas genérico — parece um template SaaS padrão sem personalidade distinguishable. O utilizador pediu melhorias de personalidade com direção **Tech Academy moderna** (estilo Vercel/Linear/Raycast): minimal, sleek, tipografia bold como elemento decorativo, muito espaço branco, animações subtis.

A abordagem escolhida foi **Warm Minimal** (Abordagem A): manter a palette OKLCH quente existente mas comprimi-la para um visual mais limpo e sofisticado, com hero sections em fundo escuro para contraste.

## Restrições

- **ADR-001:** zero dependências de runtime para animação — apenas CSS keyframes + `tw-animate-css`
- **Norma 01:** zero cores inline em `.tsx` — toda cor é token em `:root` + `@theme inline`
- **Norma 02:** Bento Grid 12 colunas mantida (soma = 12 no `lg`)
- **shadcn/ui:** reutilizar componentes existentes (`Card`, `Button`, `NavigationMenu`)
- **PT-PT:** todo o conteúdo em português europeu
- **Next.js 16:** respeitar breaking changes do framework

## Secção 1 — Landing Page

### 1.1 Header (`landing-header.tsx`)
- Manter sticky + glassmorphism existente (está funcional)
- Botão "Aceder ao Dashboard": mudar de `bg-cta text-cta-foreground` para `bg-primary text-primary-foreground` — consistência visual
- Nav links: adicionar `hover:text-foreground transition-colors` (já parcialmente existe)

### 1.2 Hero (`page.tsx`)
**Antes:** `bg-gradient-to-br from-background via-background to-accent/10` com grid.svg sutil
**Depois:** fundo escuro com gradient radial de iris/coral

Estrutura visual:
```
┌─────────────────────────────────────────────┐
│ bg: card-dark (oklch 0.20 0.03 260)         │
│ gradient: radial iris (15%) + coral (8%)     │
│ grid.svg: white/5 opacity                    │
│                                              │
│ badge: "Pratica Linux com IA"                │
│   bg: iris-soft, text: iris                  │
│   icon: Terminal (iris)                      │
│                                              │
│ h1: "Domina Linux" (white, extrabold, 4xl→6xl)│
│     "com IA Interativa"                      │
│     (gradient: coral → iris via bg-clip-text) │
│                                              │
│ p: descritivo (white/60, max-w-2xl)          │
│                                              │
│ buttons:                                     │
│   "Começar Agora" → bg-primary, lg           │
│   "Ver Manuais" → outline white, lg          │
└─────────────────────────────────────────────┘
```

**Novo CSS necessário:**
- Token `--hero-dark-bg` para o fundo
- Token `--hero-dark-gradient` para o radial overlay
- Classe `.hero-dark` em `@layer components`
- Classe `.text-gradient-iris-coral` para o heading gradient (CSS `background-clip: text`)

### 1.3 Features Section (`page.tsx`)
**Antes:** 4 cards idênticos com `Card` shadcn + `bg-primary/10` no icon
**Depois:** grid 2col (sm) → 4col (lg), cards sem border, hover sutil

Estrutura por card:
```
┌──────────────────────────┐
│ (sem border, bg transparente)│
│ hover: bg-muted/50        │
│                            │
│ icon: h-14 w-14            │
│   bg: [cor-acent]-soft     │
│   color: [cor-acent]       │
│                            │
│ h3: text-lg, font-semibold │
│ p: text-sm, muted-fg       │
└──────────────────────────┘
```

Cores de acento por card:
| Card | Cor |
|------|-----|
| Consola Real | `iris` |
| Chat IA RAG | `coral` |
| Manuais LPI | `sage` |
| Quizzes Gamificados | `amber` |

### 1.4 CTA Section (`page.tsx`)
**Antes:** `bg-card/50` genérico
**Depois:** fundo escuro (`card-dark`) simétrico ao hero

```
┌─────────────────────────────────────────────┐
│ bg: card-dark                                │
│ gradient: radial sutil (mesmo do hero)       │
│                                              │
│ h2: "Pronto para dominar Linux?" (white)     │
│ p: descritivo (white/60)                     │
│ button: "Criar Conta Grátis" (primary, lg)   │
└─────────────────────────────────────────────┘
```

## Secção 2 — Dashboard

### 2.1 Hero do Dashboard (`dashboard/page.tsx`)
**Antes:** `bg-gradient-to-br from-cream to-sage-soft`, "Olá, Estudante"
**Depois:** fundo escuro com gradient radial

```
┌─────────────────────────────────────────────┐
│ bg: card-dark + radial iris/coral            │
│                                              │
│ h1: "Olá, [Nome]" (white, extrabold)         │
│   (usar firstName do Clerk se disponível,    │
│    senão "Estudante")                        │
│ p: "Continua onde paraste" (white/60)        │
│ badge: "X dias seguidos" (amber-soft)        │
│   (condicional — só se streak > 0)           │
└─────────────────────────────────────────────┘
```

### 2.2 Bento Grid — Cartões Refinados

Mudanças transversais a todos os cartões:
- `rounded-3xl` → `rounded-2xl` (mais sleek)
- Adicionar `border-top: 3px solid [cor-acent]` via classe CSS
- Sombras mantidas (`shadow-bento` / `hover:shadow-bento-hover`)

| Cartão | Background | Border-top | Mudanças específicas |
|--------|-----------|------------|---------------------|
| Terminal | `card-dark` | `iris` | Manter. Melhorar simulação de comandos |
| Chat IA | `sage-soft` | `sage` | Melhorar bubbles com avatar sutil |
| Quizzes | `amber-soft` | `amber` | Adicionar % visível no ring |
| Progresso | `cream` | `coral` | Simplificar para 2 barras |
| Estudo/Tópicos | `cream` | `primary` | Manter como está |
| Manuais | `card-dark-alt` | `terracotta` | Manter SVG animado |
| Sequência | `amber-soft` | `amber` | Manter flame SVG |

### 2.3 Novos tokens/dashboard
```css
/* Dashboard hero */
--dashboard-hero-bg: oklch(0.18 0.025 260);
--dashboard-hero-gradient: radial-gradient(ellipse 70% 50% at 25% 50%,
  oklch(0.55 0.13 265 / 0.12) 0%,
  oklch(0.65 0.14 25 / 0.06) 50%,
  transparent 75%);
```

## Secção 3 — Tokens e CSS

### 3.1 Novos tokens em `:root`
```css
/* Hero dark sections */
--hero-dark-bg: oklch(0.16 0.025 260);
--hero-dark-gradient: radial-gradient(ellipse 80% 60% at 20% 50%,
  oklch(0.55 0.13 265 / 0.15) 0%,
  oklch(0.65 0.14 25 / 0.08) 50%,
  transparent 80%);

/* Dashboard hero */
--dashboard-hero-bg: oklch(0.18 0.025 260);
--dashboard-hero-gradient: radial-gradient(ellipse 70% 50% at 25% 50%,
  oklch(0.55 0.13 265 / 0.12) 0%,
  oklch(0.65 0.14 25 / 0.06) 50%,
  transparent 75%);
```

### 3.2 Novas component classes
```css
@layer components {
  .hero-dark {
    background: var(--hero-dark-bg);
    background-image: var(--hero-dark-gradient);
  }

  .dashboard-hero {
    background: var(--dashboard-hero-bg);
    background-image: var(--dashboard-hero-gradient);
  }

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

  .text-gradient-iris-coral {
    background: linear-gradient(135deg,
      oklch(0.65 0.14 25) 0%,
      oklch(0.55 0.13 265) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}
```

### 3.3 Novos tokens expostos em `@theme inline`
```css
--color-hero-dark-bg: var(--hero-dark-bg);
--color-dashboard-hero-bg: var(--dashboard-hero-bg);
```

## Ficheiros a modificar

| Ficheiro | Tipo de mudança |
|----------|----------------|
| `src/app/globals.css` | +4 tokens, +4 component classes, +2 theme exports |
| `src/app/page.tsx` | Hero + features + CTA reescritos |
| `src/app/(dashboard)/dashboard/page.tsx` | Hero reescrito |
| `src/components/landing-header.tsx` | Botão CTA → primary |
| `src/components/dashboard/terminal-card.tsx` | rounded-2xl, border-top |
| `src/components/dashboard/chat-card.tsx` | rounded-2xl, border-top |
| `src/components/dashboard/quizzes-card.tsx` | rounded-2xl, border-top, % visível |
| `src/components/dashboard/progress-card.tsx` | rounded-2xl, border-top, 2 barras |
| `src/components/dashboard/manuals-card.tsx` | rounded-2xl, border-top |
| `src/components/dashboard/streak-card.tsx` | rounded-2xl, border-top |
| `src/components/dashboard/study-card.tsx` | rounded-2xl, border-top |
| `src/components/dashboard/topics-card.tsx` | rounded-2xl, border-top |

## Fora do escopo

- Página `/sobre` — não alterada nesta ronda
- Página `/manuals` — não alterada nesta ronda
- Página `/lab` — não alterada nesta ronda (já documentado como exceção a eliminar separadamente)
- Headers/Footer do dashboard — não alterados
- Componentes shadcn/ui base — não alterados

## Verificação

Antes de cada commit:
1. `cmd /c "npm run lint"` — zero erros
2. `cmd /c "npm run build"` — build passa (131/131 páginas SSG)
3. Verificar visualmente: landing page, dashboard, responsive (320px → 4K)
