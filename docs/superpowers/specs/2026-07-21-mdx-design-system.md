# Design System MDX — Especificação

> **Data:** 2026-07-21 · **Versão:** 1.0
> **Estado:** Aprovado pelo product owner — design pilot validado em `010/a-evolucao-do-linux-e-sistemas-operacionais-populares`

## Visão Geral

Todas as páginas de tópicos usam MDX com componentes React premium.
O fallback `MarkdownRenderer` (Vault → Markdown) é eliminado após migração completa.

---

## Paleta de Acentos por Manual

| Manual | Código | Acento | Cor OKLCH | Uso |
|--------|--------|--------|-----------|-----|
| Linux Essentials | 010 | sage | `oklch(0.72 0.10 150)` | Verde suave — distribuições, comandos |
| Security Essentials | 020 | coral | `oklch(0.65 0.14 25)` | Coral — segurança, alertas |
| Web Development Essentials | 030 | amber | `oklch(0.75 0.12 70)` | Âmbar — web, CSS, JS |
| Open Source Essentials | 050 | terracotta | `oklch(0.35 0.10 40)` | Terracotta — licenças, modelos |
| LPIC-1 Parte 1 | 101 | terracotta | `oklch(0.35 0.10 40)` | Terracotta — hardware, partições |
| LPIC-1 Parte 2 | 102 | iris | `oklch(0.55 0.13 265)` | Íris — shell, redes, segurança |

---

## Componentes MDX

### TopicHero

```jsx
<TopicHero
  title="Título do Tópico"
  code="010"           // código do manual
  topicNumber="T01"    // número do tópico (watermark)
  objective="1.1"      // objetivo de aprendizagem
  weight={2}           // peso relativo (1-4)
  pages="11-22"        // páginas do manual
  accent="sage"        // acento do manual
  areas={["Área 1"]}   // áreas temáticas (opcional)
/>
```

- Renderiza `<header class="premium-hero">` — fundo branco, glass-border, ribbon 4px accent
- Watermark "T01" gigante (text-stroke outline) ao fundo
- 4 StatPills: nº tópico, objetivo, weight, páginas
- Badge manual (code + label)

### Callout

```jsx
<Callout variant="info" title="Título" icon={Info}>
Conteúdo. Suporta **bold**, `code`, listas.
</Callout>
```

| Variant | Fundo | Gradiente |
|---------|-------|-----------|
| info | `bg-[oklch(0.94_0.04_265/_0.15)]` | iris diagonal |
| warning | `bg-[oklch(0.94_0.05_70/_0.15)]` | amber diagonal |
| success | `bg-[oklch(0.95_0.03_150/_0.15)]` | sage diagonal |
| tip | `bg-[oklch(0.94_0.04_25/_0.15)]` | coral diagonal |
| note | `bg-[oklch(0.94_0.008_80/_0.15)]` | muted diagonal |

- Ícone circular: `rounded-full bg-*-soft`
- `border-l-4`, `shadow-sm backdrop-blur-sm`

### DistributionCard

```jsx
<DistributionCard name="Debian" manager="dpkg / .deb" accent="sage" icon={Boxes}>
- **Debian** — máxima estabilidade.
</DistributionCard>
```

- Fundo gradiente radial por família (não flat)
- `border-l-4 accent`, `h-12 w-12` ícone com shadow
- `hover:shadow-float`

### ExerciseCard

```jsx
<ExerciseCard number={1} title="Título" difficulty="guided" accent="sage">
<SolutionBlock>...</SolutionBlock>
</ExerciseCard>
```

| Difficulty | Label |
|------------|-------|
| guided | Guiado |
| exploratory | Exploratório |

- Ribbon top 4px gradiente accent
- Badge `h-12 w-12 rounded-full` com nº
- `border border-border/40 bg-background/80 shadow-sm backdrop-blur-sm`

### SolutionBlock

```jsx
<SolutionBlock>
Conteúdo da solução.
</SolutionBlock>
```

- Collapsible (Base UI) com `defaultOpen={true}`
- Tabelas devem ser HTML raw JSX (MDX não processa `| col |` dentro de JSX)

### StatPill

```jsx
<StatPill icon={Target} label="Objetivo" value="1.1" />
```

- `bg-background/80 shadow-sm backdrop-blur-sm`

---

## Padrões de Conteúdo MDX

### Estrutura padrão

```mdx
import { TopicHero, Callout, ExerciseCard, SolutionBlock } from "@/components/mdx"
import { ... } from "lucide-react"

<TopicHero ... />

## Resumo Conciso

### Subseção 1
Conteúdo markdown...

### Subseção 2
Conteúdo com Callouts...

---

## Exercícios Guiados (resolvidos)

<ExerciseCard number={1} title="..." difficulty="guided">
<SolutionBlock>
Solução...
</SolutionBlock>
</ExerciseCard>

---

## Exercícios Exploratórios

<ExerciseCard number={1} title="..." difficulty="exploratory">
<SolutionBlock>
Solução...
</SolutionBlock>
</ExerciseCard>
```

### Tabelas em SolutionBlock

```jsx
<table className="w-full border-collapse my-3 overflow-hidden rounded-lg border border-border">
  <thead className="bg-[oklch(0.96_0.02_75)]">
    <tr>
      <th className="border-b border-border px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wider text-foreground">Coluna</th>
    </tr>
  </thead>
  <tbody>
    <tr className="border-b border-border/50">
      <td className="px-3 py-2 text-sm text-muted-foreground">Valor</td>
    </tr>
  </tbody>
</table>
```

### Code blocks

Fenced code blocks (` ```bash `) recebem chrome de terminal automaticamente
via `TerminalPre` em `mdx-components.tsx`.

### Inline code

`code` inline: `rounded-md border border-border bg-muted px-1.5 py-0.5 text-[0.85em]`

---

## Background da Página

| Camada | Classe | Descrição |
|--------|--------|-----------|
| Atmosfera | `.premium-atmosphere` | 4 radiais warm + SVG grain (fixed, full viewport) |
| Hero | `.premium-hero` | White bg, glass-border, ribbon accent 4px, shadow elevado |
| Cards | `.glass-card` | Translucent bg + backdrop-blur + border + shadow-glass |

---

## Tipografia

| Role | Família | Estilo |
|------|---------|--------|
| h2 | IBM Plex Sans | `font-bold tracking-tight text-2xl lg:text-3xl border-b border-border` + barra accent esquerda |
| h3 | IBM Plex Sans | `font-bold text-xl lg:text-2xl pl-4 border-l-3 border-primary` |
| p | IBM Plex Sans | `text-base leading-[1.75] text-foreground/90` |
| code | IBM Plex Mono | `text-[0.85em] rounded-md border bg-muted` |
| hr | — | `bg-gradient-to-r from-transparent via-border to-transparent` |

---

## Gradientes por Acento (DistributionCard)

| Acento | Gradiente radial |
|--------|-----------------|
| sage | `radial-gradient(ellipse at 0% 50%, oklch(0.95 0.03 150 / 0.35) 0%, transparent 65%)` |
| coral | `radial-gradient(ellipse at 0% 50%, oklch(0.95 0.04 25 / 0.30) 0%, transparent 65%)` |
| amber | `radial-gradient(ellipse at 0% 50%, oklch(0.95 0.04 70 / 0.30) 0%, transparent 65%)` |
| terracotta | `radial-gradient(ellipse at 0% 50%, oklch(0.95 0.03 45 / 0.30) 0%, transparent 65%)` |
| iris | `radial-gradient(ellipse at 0% 50%, oklch(0.95 0.04 265 / 0.25) 0%, transparent 65%)` |

---

## Normas

- **Zero inline oklch em `.tsx`** — usar tokens Tailwind ou classes utility
- **PT-PT** em todo o conteúdo
- **ADR-001:** zero runtime animation deps (apenas CSS keyframes)
- **Base UI ≠ Radix:** `multiple?: boolean`, `data-panel-open`
- **Tabelas:** raw HTML JSX dentro de SolutionBlock (não markdown table syntax)
