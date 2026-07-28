---
tipo: design-system
titulo: "Design System — OKLCH, Grelha 12 e Responsividade Mobile→4K"
projeto: Linux de Camões
data_criacao: 2026-07-17
estado: aprovado
fonte_de_verdade: src/app/globals.css + mockup-dashboard.html
---

# 🎨 Design System — OKLCH · Grelha 12 · Mobile→4K

> **Estado de consistência:** desde 2026-07-17 (refactor crítico #1) a fonte
> canónica é **única = `globals.css`**. Os 7 cartões Bento já não declaram cores
> inline; todas as cores/sombras consomem tokens registados em `@theme inline`.
> As regras de uso estão formalizadas em
> [_Norma 01 — Sistema de Tokens e Cores_](./Norma%2001%20-%20Sistema%20de%20Tokens%20e%20Cores.md).

---

## 1. Modelo de Cor — OKLCH

OKLCH é o modelo **aprovado e único**. Razões: gamut P3-ready, leveza perceptual
uniforme (lightness `L` linear à percepção humana) e consistência entre tons.

### 1.1 Tokens semânticos (shadcn — base do tema)

| Token | OKLCH | Uso |
|-------|-------|-----|
| `--background` | `oklch(0.97 0.005 80)` | fundo da app |
| `--foreground` | `oklch(0.20 0.02 60)` | texto base |
| `--card` | `oklch(0.99 0.003 80)` | superfície de cartão claro |
| `--primary` | `oklch(0.70 0.18 45)` | acção principal / laranja quente |
| `--primary-foreground` | `oklch(0.99 0 0)` | texto sobre `primary` |
| `--secondary` | `oklch(0.93 0.01 80)` | superfícies secundárias |
| `--muted` | `oklch(0.94 0.008 80)` | fundos neutros |
| `--muted-foreground` | `oklch(0.50 0.02 60)` | texto secundário |
| `--accent` | `oklch(0.75 0.15 55)` | realces suaves |
| `--destructive` | `oklch(0.60 0.20 25)` | erros / vermelho |
| `--border` | `oklch(0.88 0.01 80)` | separadores |

### 1.2 Paleta quente Bento (semântica por cartão)

Definidas em `:root` (nome nu) **e** registadas em `@theme inline` (prefixo
`--color-`, gera utilities). Cada acento tem um par **forte + `-soft`** (fundo
suave). Snapshot canónico:

| Token (`:root`) | OKLCH | Utility | Aplicado a |
|-----------------|-------|---------|------------|
| `--coral` | `oklch(0.65 0.14 25)` | `bg-coral` | Chat IA (acentos), progresso |
| `--coral-soft` | `oklch(0.94 0.04 25)` | `bg-coral-soft` | fundo suave coral |
| `--amber` | `oklch(0.75 0.12 70)` | `bg-amber` | streak ativo |
| `--amber-soft` | `oklch(0.94 0.05 70)` | `bg-amber-soft` | Quizzes / Streak |
| `--sage` | `oklch(0.72 0.10 150)` | `bg-sage` | sucesso / "Conectado" / prompt Terminal |
| `--sage-soft` | `oklch(0.95 0.03 150)` | `bg-sage-soft` | fundo Chat IA |
| `--terracotta` | `oklch(0.35 0.10 40)` | `bg-terracotta` | textos escuros sobre fundos quentes |
| `--peach` | `oklch(0.90 0.03 60)` | `bg-peach` | streak inativo |
| `--cream` | `oklch(0.96 0.02 75)` | `bg-cream` | Tópicos / Progresso |
| `--card-dark` | `oklch(0.20 0.03 260)` | `bg-card-dark` | Terminal (escuro neutro) |
| `--card-dark-alt` | `oklch(0.28 0.08 30)` | `bg-card-dark-alt` | Manuais (escuro quente) |
| `--shadow-bento` | `0 2px 20px oklch(0 0 0/0.04)` | `shadow-bento` | sombra de repouso |
| `--shadow-bento-hover` | `0 4px 30px oklch(0 0 0/0.08)` | `hover:shadow-bento-hover` | sombra de hover |

> ✅ Tokens **registados e ativos** desde 2026-07-17. As utilities (`bg-coral`,
> `bg-card-dark`, `shadow-bento`, …) já existem. Regras de uso formalizadas em
> [_Norma 01_](./Norma%2001%20-%20Sistema%20de%20Tokens%20e%20Cores.md).

### 1.3 Tipografia

| Papel | Família (next/font) | Variável CSS |
|-------|---------------------|--------------|
| Sans / UI / headings | IBM Plex Sans (400, 500, 600) | `--font-ibm-lex-sans` |
| Mono / terminal / números | IBM Plex Mono (400, 500) | `--font-ibm-plex-mono` |

Números em cartões usam `tabular-nums` + `font-mono` para alinhamento estável.

---

## 2. Layout — Grelha Assimétrica de 12 Colunas

O dashboard é uma **Bento Grid** com densidade variável (cartões de tamanhos
diferentes, propositadamente assimétrica).

### 2.1 Spans canónicos (breakpoint `lg`)

```
linha 1–2 │ Terminal (8)            │ Tópicos (4)            │
linha 3–4 │ Chat IA (5) │ Quizzes(3)│ Progresso (4)          │
linha 5   │ Manuais (6)          │ Streak (6)             │
```

> ✅ **Buraco corrigido (2026-07-17):** a última linha passou de Manuais(4) +
> Streak(4) = 8 para **Manuais(6) + Streak(6) = 12**, preenchendo as 12 colunas
> sem espaço vazio. Regra de preenchimento formalizada em
> [_Norma 02 — Layout Bento_](./Norma%2002%20-%20Layout%20Bento%20e%20Grelha.md).

### 2.2 Container

```
mx-auto w-full max-w-[1560px] 2xl:max-w-[1920px] px-4 md:px-8 xl:px-12 py-8
```

### 2.3 Geometria do cartão (base Bento)

```
rounded-3xl · p-6 lg:p-8 · shadow-bento hover:shadow-bento-hover
```

Raio-base `--radius: 0.625rem`, escalado por `--radius-{sm..4xl}` (×0.6 até ×2.6).

---

## 3. Responsividade — Breakpoints Mobile → 4K

| Breakpoint | Largura | Colunas Bento | Comportamento |
|------------|---------|---------------|---------------|
| `base` | < 768 px | **1 coluna** | Cartões em stack vertical; padding `px-4` |
| `md` | ≥ 768 px | **6 colunas** | Primeiro refinamento; `px-8` |
| `lg` | ≥ 1024 px | **12 colunas** | Bento completo (spans da secção 2.1) |
| `xl` | ≥ 1280 px | 12 (mantém) | `px-12`; tipografia escala |
| `2xl` | ≥ 1536 px | 12 (mantém) | `max-w` salta para **1920 px** |
| 2K | ≥ 2048 px | 12 (mantém) | Centrado, margens laterais crescem |
| 4K | ≥ 3840 px | 12 (mantém) | Centrado a 1920 px; sem upscale de fonte |

### Princípios

- **Mobile-first:** a grelha nasce a 1 coluna e cresce; nunca o inverso.
- **Cap dura de 1920 px** para o conteúdo, mesmo em 4K — evita linhas de leitura
  infinitas e mantém o dashboard coeso em monitores gigantes.
- **Type fluido** via `clamp()` só no hero (`clamp(42px, 5vw, 64px)`); restante
  tipografia escala por breakpoints (`text-xl lg:text-2xl`, etc.).
- **Sem scroll horizontal** em qualquer resolução (Bento reflow garante).

### ⚠️ Lacuna vs. requisito

O requisito fala em **"breakpoints específicos para 2K/4K"**. Actualmente só `2xl`
(1536 px) é custom; **não há breakpoints próprios para 2K (2048 px) nem 4K
(3840 px)** — em vez disso optámos por **teto centrado a 1920 px**. Decisão a
confirmar: manter o teto (recomendado, evita tipografia gigante) ou adicionar
breakpoints `min(2048px)` / `min(3840px)` com scaling adicional.

---

## 4. Componentes shadcn vs Cartões Bento

Coexistem **dois sistemas de cartão** (intencional):

- **`<Card>` shadcn** (`components/ui/card.tsx`, estilo `base-nova`) → usado na
  landing page e páginas de manuais. Usa `ring-1 ring-foreground/10`,
  `--card-spacing`, `data-slot`.
- **Cartões Bento** (`components/dashboard/*.tsx`) → `<div>` com classes próprias,
  porque precisam de gradientes OKLCH, fundos escuros e decorações SVG que o
  `<Card>` shadcn não cobre.

A extracção de um `<BentoCard>` primitivo (ver _Trabalho pendente_) deve **unificar
a base visual** sem forçar os cartões a herdar do `<Card>` shadcn.

---

## 5. Trabalho pendente (débitico técnico de design system)

1. ✅ ~~**Registar paleta Bento em `@theme inline`**~~ — feito 2026-07-17
   (utilities `bg-coral`, `bg-sage-soft`, `bg-card-dark`, `shadow-bento`, … ativas).
2. ✅ ~~**Substituir todos os `bg-[oklch(...)]` inline** nos 7 cartões~~ — feito
   2026-07-17 (zero `oklch(` em `.tsx`; ver [_Norma 01_](./Norma%2001%20-%20Sistema%20de%20Tokens%20e%20Cores.md)).
3. ✅ ~~**Reconciliar divergências** mockup ↔ globals.css ↔ componentes~~ — feito
   2026-07-17 (fonte canónica única = `globals.css`).
4. ✅ ~~**Corrigir o buraco de 4 colunas** na última linha do Bento.~~ — feito
   2026-07-17 (Manuais+Streak → 6+6; ver [_Norma 02_](./Norma%2002%20-%20Layout%20Bento%20e%20Grelha.md)).
5. **Adicionar `focus-visible:` ring** a todos os cartões-click (`<Link>`).
6. **Decidir teto 1920 vs breakpoints 2K/4K** explícitos.
7. ✅ ~~Corrigir typo `--color-terracota` → `--terracotta`~~ — feito 2026-07-17.
