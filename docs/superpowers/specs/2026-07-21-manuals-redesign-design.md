# Design Spec: Manuais LPI Redesign (Premium Interactive)

**Date:** 2026-07-21
**Status:** Approved (pending user review)
**Scope:** Rotas públicas `/manuals`, `/manuals/[code]`, `/manuals/[code]/[slug]`
**Approach:** CSS puro + `tw-animate-css` + Base UI (ADR-001 honored — zero deps runtime animação)
**Estética:** Neutra — quiet luxury (creme/terracota, glassmorphism subtil, imenso whitespace)
**Visual companion:** `frontend/mockup-manuals.html` (a criar, convention idêntica a `mockup-dashboard.html`)

---

## 1. Contexto e Motivação

A página `/manuals` atual é um visualizador estático básico: cards simples com accent badge, lista de tópicos plana, e um renderer markdown (`react-markdown` + `remark-gfm`) sem interatividade. O conteúdo técnico (tabelas de comandos como `lspci`, `lsusb`, `lsmod`) é renderizado como HTML cru, sem copiar para clipboard, sem hierarquia visual, sem micro-interações.

O objetivo é elevar a experiência visual e interativa ao nível de um produto SaaS moderno focado em programadores (referências: neutra.framer.website, evolt.dev), mantendo:
- A paleta existente (creme + terracota + 5 accents)
- O design system OKLCH (zero cores inline em `.tsx`)
- O ADR-001 (zero deps runtime de animação)
- A acessibilidade (WAI-ARIA via Base UI)
- A ordem progressiva atual (010 → 020 → 030 → 050 → 101 → 102)

### Decisões trancadas em brainstorming (2026-07-21)

| Questão | Decisão |
|---|---|
| Framer Motion vs ADR-001 | **Manter ADR-001** (CSS puro + keyframes + View Transitions API nativa) |
| Radix UI vs `@base-ui/react` | **Manter `@base-ui/react`** (Base UI, já configurado com shadcn `base-nova`) |
| Visual companion | **Mockup HTML primeiro**, depois port para React (convention `mockup-dashboard.html`) |
| Registo estético | **Neutra — quiet luxury** (fundos creme, tipografia protagonista, sombras subtis) |
| Layout do tópico | **3 zonas** (TOC esq + leitura central + meta dir) |
| Detecção de CommandTable | **Auto-detect por padrão** (header ou primeira coluna com inline code) |
| Scope | **Só `/manuals` público** (`/dashboard/study/*` fora de scope) |
| Abordagem execução | **A — Component layer primeiro** (componentes isolados com mockup próprio, depois vertical slice por rota) |
| Testes | **Sem testes formais** (verificação por `npm run build` + `npm run lint` + smoke visual) |

---

## 2. Arquitetura

### 2.1 Estrutura de ficheiros

```
frontend/src/
├── app/
│   ├── manuals/
│   │   ├── layout.tsx                    # NOVO: header próprio + bg decorativo
│   │   ├── page.tsx                      # ALTERAR: listagem com staggered + glass
│   │   └── [code]/
│   │       ├── page.tsx                  # ALTERAR: accordion + agrupamento por nível
│   │       └── [slug]/
│   │           └── page.tsx              # ALTERAR: 3-zone layout
├── components/
│   ├── manuals/                          # NOVO agrupamento
│   │   ├── manual-card.tsx
│   │   ├── manual-level-group.tsx
│   │   ├── topic-accordion.tsx
│   │   ├── topic-row.tsx
│   │   ├── topic-toc.tsx
│   │   ├── topic-meta.tsx
│   │   ├── prev-next-nav.tsx
│   │   └── reading-progress.tsx
│   ├── markdown/                         # NOVO — substitui markdown-content.tsx
│   │   ├── markdown-renderer.tsx
│   │   ├── command-table.tsx
│   │   ├── comparison-table.tsx
│   │   ├── copy-button.tsx
│   │   ├── code-block.tsx
│   │   ├── details-disclosure.tsx
│   │   ├── prose-elements.tsx
│   │   └── is-command-table.ts           # heurística pura (testável)
│   └── ui/                               # INTACTO (shadcn primitives)
├── lib/
│   ├── manuals.ts                        # ALTERAR: adicionar `level` em cada manual
│   └── topic-loader.ts                   # NOVO: ler + cache do markdown do Vault
└── app/globals.css                       # ALTERAR: novos tokens + keyframes + utilities
```

### 2.2 Fluxo de dados

```
Vault/*.md (Obsidian)
   │ YAML frontmatter + body markdown + [[wikilinks]] + <details>
   ▼
lib/topic-loader.ts (Node fs, cached por Next.js)
   │ gray-matter para parsear frontmatter
   │ regex para converter [[wikilinks]] → markdown links
   ▼
/manuals/[code]/[slug]/page.tsx (Server Component)
   │ passa {frontmatter, content, prev, next, manual} para o cliente
   ▼
<MarkdownRenderer> (Client Component)
   │ react-markdown + remark-gfm + custom components map
   ▼
   ├─ <CommandTable>  (auto-detectado via is-command-table.ts)
   ├─ <ComparisonTable> (fallback polido)
   ├─ <CodeBlock> + <CopyButton>
   └─ <DetailsDisclosure> (Base UI Accordion single-item)
```

**Decisões chave:**
- **Server Component na página**: lê ficheiro em runtime de build (Next.js SSG/ISR), parseia frontmatter, passa markdown cru para `<MarkdownRenderer>` client. Zero parse em cliente.
- **gray-matter** (~30KB) como única nova dependência — não viola ADR-001 (é parse build-time, não runtime animação).
- **Wikilinks `[[X|Y]]`** convertidos para `[Y](/manuals/[code]/[slug-de-X])` no `topic-loader.ts`. Regex canónica:
  - `/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g` → captura grupo 1 = alvo, grupo 2 = texto (fallback para alvo)
  - Slug derive: lowercase, strip acentos, substituir espaços por `-`
  - Wikilinks não resolvidos (sem match em manifest) ficam como texto plano + log de aviso em build
- **`<details>` nativo do MD** mapeado para `<DetailsDisclosure>` Base UI (mantém acessibilidade).

### 2.3 Dependências

| Pacote | Tamanho | Tipo | Justificação | Viola ADR-001? |
|---|---|---|---|---|
| `gray-matter` | ~30KB | prod (build-time) | Parse YAML frontmatter | ❌ Não |
| `@base-ui/react` (Accordion, Disclosure) | já instalado | prod | Primitives acessíveis | ❌ Não |

**Sem Framer Motion. Sem Lottie. Sem GSAP. Sem novas deps de animação.**

---

## 3. Extensões ao Design System

### 3.1 Tokens OKLCH novos (em `:root` de `globals.css`)

```css
/* --- Glassmorphism --- */
--glass-bg: oklch(0.99 0.003 80 / 0.65);
--glass-bg-strong: oklch(0.99 0.003 80 / 0.85);
--glass-border: oklch(0.88 0.01 80 / 0.5);
--glass-blur: 12px;

/* --- Sombras adicionais (escala refinada) --- */
--shadow-soft: 0 1px 2px oklch(0 0 0 / 0.04),
               0 1px 3px oklch(0 0 0 / 0.02);
--shadow-float: 0 8px 24px oklch(0 0 0 / 0.06),
                0 2px 6px oklch(0 0 0 / 0.04);
--shadow-glass: 0 4px 30px oklch(0 0 0 / 0.04),
                inset 0 1px 0 oklch(1 0 0 / 0.4);

/* --- Gradientes subtis --- */
--gradient-warm: linear-gradient(135deg,
  oklch(0.96 0.02 75) 0%,
  oklch(0.94 0.04 60) 60%,
  oklch(0.92 0.05 45) 100%);
--gradient-accent: linear-gradient(135deg,
  oklch(0.70 0.18 45) 0%,
  oklch(0.55 0.14 30) 100%);

/* --- Background decorativo /manuals --- */
--bg-radial-warm: radial-gradient(circle at 20% 0%,
  oklch(0.94 0.05 60 / 0.6) 0%,
  transparent 50%);
```

Estes tokens também são expostos via `@theme inline` para Tailwind:
```css
--color-glass-bg: var(--glass-bg);
--color-glass-border: var(--glass-border);
--shadow-soft: ...;
--shadow-float: ...;
--shadow-glass: ...;
```

### 3.2 Keyframes novos (CSS puro)

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
```

`prefers-reduced-motion: reduce` (já em `globals.css:172`) cancela todas automaticamente.

### 3.3 Utility classes (em `@layer components` de `globals.css`)

```css
@layer components {
  .glass-card {
    background: var(--glass-bg);
    backdrop-filter: blur(var(--glass-blur));
    -webkit-backdrop-filter: blur(var(--glass-blur));
    border: 1px solid var(--glass-border);
    box-shadow: var(--shadow-glass);
  }
  .glass-card:hover {
    background: var(--glass-bg-strong);
    box-shadow: var(--shadow-float), var(--shadow-glass);
  }
  .stagger-child {
    animation: stagger-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) backwards;
  }
  .stagger-list > *:nth-child(1)  { animation-delay: 0ms; }
  .stagger-list > *:nth-child(2)  { animation-delay: 60ms; }
  .stagger-list > *:nth-child(3)  { animation-delay: 120ms; }
  .stagger-list > *:nth-child(4)  { animation-delay: 180ms; }
  .stagger-list > *:nth-child(5)  { animation-delay: 240ms; }
  .stagger-list > *:nth-child(6)  { animation-delay: 300ms; }
  .stagger-list > *:nth-child(7)  { animation-delay: 360ms; }
  .stagger-list > *:nth-child(8)  { animation-delay: 420ms; }
  .stagger-list > *:nth-child(n+9) { animation-delay: 480ms; }
}
```

### 3.4 Alinhamento com Norma 01

Todos os tokens novos seguem o modelo OKLCH único (Norma 01). Zero cores hex/rgb/hsl. Zero cores inline em `.tsx`. Cada token novo é registado em `@theme inline` para ser consumível por classes Tailwind (`bg-glass-bg`, `shadow-soft`, etc.).

---

## 4. Inventário de Componentes

### 4.1 `components/manuals/`

#### `ManualCard`
```ts
type ManualCardProps = {
  manual: Manual & { level: "essentials" | "lpic1" };
  index: number;  // para stagger delay = index * 60ms
};
```
- **Visual:** `.glass-card` com `rounded-3xl p-6`, accent badge no topo (canto sup-esq), seta no canto sup-dir que aparece em hover
- **Animação:** `.stagger-child` com delay = `index * 60ms`
- **Hover:** `bg-glass-bg-strong` + sombra `--shadow-float` + seta com `translate-x-1`
- **Layout interno:** código do manual (ex: "010"), título (h3), descrição (muted-foreground), nº tópicos no rodapé

#### `ManualLevelGroup`
```ts
type ManualLevelGroupProps = {
  level: "essentials" | "lpic1";
  manuals: Manual[];
};
```
- Wrapper com heading: "Essentials" ou "LPIC-1 · Certificação"
- Aplica `.stagger-list` para os filhos (`ManualCard`)
- Layout: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` para essentials, `lg:grid-cols-2` para lpic1

#### `TopicAccordion`
```ts
type TopicAccordionProps = {
  manual: Manual;
  defaultOpenTopic?: string;  // ex: "101" abre o grupo 101 por defeito
};
```
- Base UI `<Accordion.Root>` com `type="multiple"` (vários grupos abertos)
- Agrupar tópicos por `frontmatter.topic` (101, 102, 103, etc.)
- Cada `<Accordion.Item>` é um grupo; header mostra "101 · Tópico 1" + ícone lucide `ChevronDown` que roda 180° no open
- Animação de height + opacity via CSS:
  ```css
  [data-state="open"] > [data-component="content"] {
    animation: accordion-down 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  }
  ```

#### `TopicRow`
```ts
type TopicRowProps = {
  topic: ManualTopic;
  index: number;
  manualCode: string;
  accent: Accent;
};
```
- Linha dentro do Accordion.Content
- Layout: nº sequencial (01, 02…) em `accent.soft` + `accent.strong`, título do tópico, seta à direita
- Hover: `translate-x-1` + mudança de cor de accent
- Link para `/manuals/{code}/{slug}`

#### `TopicToc` (Table of Contents)
```ts
type TocItem = { id: string; level: number; text: string };
type TopicTocProps = {
  headings: TocItem[];
  activeId: string;  // definido por scroll-spy
};
```
- Sidebar sticky esquerda em desktop (≥1280px), `w-56`
- Em mobile (<1024px): escondido, acessível via botão "Neste tópico" que abre um Sheet/BottomSheet
- Items indentados por `level` (h2 → 0, h3 → 1)
- Active item: `accent.strong` + barra vertical 2px à esquerda

#### `TopicMeta`
```ts
type TopicMetaProps = {
  topic: TopicFrontmatter;  // {title, objective, weight, tags}
  prev?: ManualTopic;
  next?: ManualTopic;
  manualCode: string;
};
```
- Sidebar sticky direita em desktop (≥1280px), `w-64`
- Mostra: peso (`weight`), objective, tags
- CTA "Praticar com quiz" → link para `/dashboard/quizzes/{code}/{slug}` (rota fora de scope, mas o CTA aponta)
- `<PrevNextNav>` no fundo da sidebar

#### `PrevNextNav`
```ts
type PrevNextNavProps = {
  prev?: ManualTopic;
  next?: ManualTopic;
  manualCode: string;
};
```
- Dois botões grandes, um à esquerda (← Anterior) outro à direita (Seguinte →)
- Em mobile vira secção inline no fundo do conteúdo

#### `ReadingProgress`
```ts
// sem props
```
- Barra 2px no topo da viewport (`position: fixed; top: 0`)
- Largura animada via CSS var `--progress`
- Atualiza `--progress` com `scroll` listener que calcula `%` do artigo lido
- Cor: `var(--gradient-accent)` ou `var(--terracotta)`

### 4.2 `components/markdown/`

#### `MarkdownRenderer`
```ts
type MarkdownRendererProps = {
  content: string;
  frontmatter: TopicFrontmatter;
};
```
- Substitui `markdown-content.tsx` atual
- Passa `components` map ao `ReactMarkdown`:
  - `h1/h2/h3/p/ul/ol/li/blockquote/a/strong/em/hr` → `<ProseElements>`
  - `code` (inline vs block) → `<CodeBlock>` ou inline estilizado
  - `pre` → `<CodeBlock>`
  - `table` → deteta via `isCommandTable` e escolhe `<CommandTable>` ou `<ComparisonTable>`
  - `details` → `<DetailsDisclosure>`

#### `CommandTable`
```ts
type CommandRow = {
  command: string;       // ex: "lspci"
  description: string;
  flags?: string;        // ex: "-v, -k, -s <addr>"
};
type CommandTableProps = { rows: CommandRow[] };
```
- Cada linha é um sub-componente:
  - Coluna 1: `<code>` com comando + `<CopyButton>` discreto (surge em hover)
  - Coluna 2: descrição
  - Coluna 3: `flags` com botão "expandir" que mostra detalhes adicionais
- Hover na linha: `translate-x-1` + sombra subtil
- Layout responsive: em mobile, vira lista de cartões empilhados (cada comando = card)

#### `ComparisonTable`
```ts
type ComparisonTableProps = { headers: string[]; rows: string[][] };
```
- Tabela polida sem copy-button
- Header: `.glass-card` com `rounded-t-xl`
- Zebra striping subtis: linhas pares com `bg-cream/30`
- Borders `border border-border` muito finas

#### `CopyButton`
```ts
type CopyButtonProps = {
  value: string;
  label?: string;       // default: "Copiar"
  copiedLabel?: string; // default: "Copiado!"
};
```
- Base UI `<Button variant="ghost" size="sm">`
- Ícone lucide `Copy` → muda para `Check` quando copiado
- `navigator.clipboard.writeText(value)` + estado `copied` por 2s
- `aria-live="polite"` no feedback
- Animação `copy-feedback` no check

#### `CodeBlock`
```ts
type CodeBlockProps = {
  code: string;
  lang?: string;
};
```
- Header com label da linguagem (topo-esq) + `<CopyButton>` (topo-dir)
- Body: `<pre>` com fundo `bg-card-dark` (token existente) e texto em `--font-ibm-plex-mono`
- Syntax highlighting: **nenhum** (v1). Apenas fundo + tipografia mono. Tokenização rica (Prism/Shiki) explicitamente out-of-scope (ver secção 9)

#### `DetailsDisclosure`
```ts
type DetailsDisclosureProps = {
  summary: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
};
```
- Base UI `<Disclosure.Root>` (se disponível no pacote instalado) ou `<Accordion.Root type="single" collapsible>` com 1 item — verificar API em `node_modules/@base-ui/react/...` antes de implementar (a Base UI às vezes expõe Disclosure separadamente do Accordion)
- Chevron rotativo no header
- Animação `height` + `opacity` no conteúdo

#### `ProseElements`
- Map de elementos tipográficos para componentes estilizados
- h1: `text-3xl lg:text-4xl font-bold tracking-tight mb-6` (com optional underline accent)
- h2: `text-2xl font-semibold mt-12 mb-4 pb-2 border-b border-border`
- h3: `text-xl font-semibold mt-8 mb-3`
- p: `text-base leading-relaxed text-foreground mb-4` (não muted — conteúdo técnico deve ler-se bem)
- ul: `list-disc pl-6 space-y-2 mb-4`
- blockquote: `border-l-4 border-primary pl-4 italic text-muted-foreground my-6`

### 4.3 Heurística `is-command-table.ts`

```ts
import type { Table } from "mdast";

type TableCell = { type: "tableCell"; children: Array<{ type: string }> };

function cellToText(cell: unknown): string {
  // walk children, concatenate text/inlineCode values
  // (implementação simplificada; ver detalhes em plan)
}

export function isCommandTable(node: Table): boolean {
  if (!node.children || node.children.length < 2) return false;

  const headerRow = node.children[0];
  const headers = headerRow.children.map(cellToText).map(s => s.toLowerCase());

  const headerIndicatesCommand = headers.some(h =>
    /(comando|command|flag|opç|opt|syntax|sintaxe)/i.test(h)
  );

  const firstColIsCode = node.children.slice(1).every(row => {
    const first = row.children[0];
    return first?.children?.some(
      (c: { type: string }) => c.type === "inlineCode"
    );
  });

  return headerIndicatesCommand || firstColIsCode;
}
```

Exportada como função pura para fácil inspeção/debug.

---

## 5. Integração por Rota

### 5.1 `/manuals` (listagem)

```
┌─────────────────────────────────────────────────────────────┐
│ bg-radial-warm no topo (decorativo, behind content)         │
├─────────────────────────────────────────────────────────────┤
│ Hero compacto                                                │
│   "Manuais LPI" (h1 text-4xl)                               │
│   "{N} tópicos dos manuais oficiais LPI..." (muted)         │
├─────────────────────────────────────────────────────────────┤
│ ── Essentials ──                                             │
│                                                              │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                         │
│ │ 010  │ │ 020  │ │ 030  │ │ 050  │  ← staggered 60ms×i     │
│ │ sage │ │ coral│ │ amber│ │ terra│     glass-card          │
│ │      │ │      │ │      │ │      │                         │
│ └──────┘ └──────┘ └──────┘ └──────┘                         │
│                                                              │
│ ── LPIC-1 · Certificação ──                                 │
│                                                              │
│ ┌──────────────┐ ┌──────────────┐                           │
│ │ 101 Parte 1  │ │ 102 Parte 2  │  ← glass-card maior       │
│ │ terracotta   │ │ iris         │                           │
│ └──────────────┘ └──────────────┘                           │
└─────────────────────────────────────────────────────────────┘
```

**Layout responsive:**
- Mobile (`<640px`): 1 coluna, cards full-width
- `sm` (`≥640px`): 2 colunas
- `lg` (`≥1024px`): 4 colunas (Essentials), 2 colunas (LPIC-1)
- Max-width: `max-w-7xl` (alinhado com padrões existentes)

**Ordem dos manuais** (já está correta em `lib/manuals.ts:52`, só adicionar `level`):
- Essentials: 010 (sage), 020 (coral), 030 (amber), 050 (terracotta)
- LPIC-1: 101 (terracotta), 102 (iris)

### 5.2 `/manuals/[code]` (tópicos do manual)

```
┌──────────────────────────────────────────────────────────┐
│ ← Manuais                                                 │
│                                                           │
│ [accent badge] 101 — LPIC-1 Parte 1                       │
│                 Arquitetura do Linux, gestão de pacotes…  │
│                                                           │
├──────────────────────────────────────────────────────────┤
│ ▼ 101 Topic 1 — Determinar e definir hardware             │
│   ┌──────────────────────────────────────────────────┐    │
│   │ 01  101.1 Determinar e definir hardware       →  │    │
│   │ 02  101.2 Inicialização do sistema            →  │    │
│   │ 03  101.3 Alterar níveis de execução          →  │    │
│   └──────────────────────────────────────────────────┘    │
│ ▼ 102 Topic 2 — Boot & Filesystems                        │
│   ┌──────────────────────────────────────────────────┐    │
│   │ 04  102.1 Definir esquema de partições        →  │    │
│   │ ...                                               │    │
│   ▼ 103 Topic 3 — ...                                     │
└──────────────────────────────────────────────────────────┘
```

**Agrupamento:**
- Tópicos agrupados por `frontmatter.topic` (primeiros 3 dígitos do slug): 101, 102, 103, etc.
- Cada grupo = 1 `<Accordion.Item>`
- Default open: grupo do primeiro tópico (`defaultOpenTopic`)
- Múltiplos grupos podem estar abertos simultaneamente (`type="multiple"`)

### 5.3 `/manuals/[code]/[slug]` (leitura do tópico) — 3 zonas

```
┌──────────────────────────────────────────────────────────────────────┐
│ ReadingProgress (barra 2px terracota, fixed top, width=scroll%)      │
├───────────┬───────────────────────────────────────┬──────────────────┤
│ TOC       │  Conteúdo (max-w-3xl, centralizado)   │ Meta             │
│ (sticky)  │                                       │ (sticky)         │
│           │  # T01 — Hardware (h1)                │                  │
│ Resumo    │                                       │ Peso: 2          │
│ • BIOS    │  ## Resumo Conciso (h2)               │ Tópico: 101      │
│ • Hotplug │  Conteúdo do resumo...                │ Tags: LPIC-1 5.0 │
│ Módulos   │                                       │                  │
│ • lspci ◀ │  ### Comandos para inspeção           │ ────────────     │
│ • lsusb   │  ┌───────────────────────────────┐    │ [Praticar com    │
│ • lsmod   │  │ lspci  [copy]  Lista PCI...   │    │  quiz deste      │
│           │  │        expand flags ▼         │    │  tópico] (CTA)   │
│ Exercícios│  └───────────────────────────────┘    │                  │
│ • Guiados │                                       │ ────────────     │
│ • Explor. │  ## Exercícios Guiados                │ ← Anterior       │
│           │  <DetailsDisclosure summary="Ex 1">   │   Seguinte →     │
└───────────┴───────────────────────────────────────┴──────────────────┘
   w-56          flex-1 / max-w-3xl                     w-64
   (≥1280px)                                           (≥1280px)
```

**Breakpoints:**
- **Mobile (`<1024px`):** só Conteúdo. TOC num Sheet (botão "Neste tópico" no header sticky). Meta vira secção inline no fim.
- **Tablet (`1024-1279px`):** Conteúdo + TOC, sem Meta.
- **Desktop (`≥1280px`):** 3 zonas completas.
- **Wide (`≥1536px`):** centraliza o conjunto em `max-w-7xl`.

**Scroll-spy** (para TOC ativo):
- `IntersectionObserver` em todos os `h2/h3` com `id`
- Define `activeId` no `<TopicToc>`
- Throttle de 100ms para performance

**ReadingProgress:**
- `scroll` listener em `window`
- Calcula `% = scrollY / (docHeight - viewportHeight)`
- Atualiza CSS var `--progress` na barra

---

## 6. Acessibilidade

- **Base UI** traz nativamente: focus management, focus trap em modals/sheets, keyboard navigation (Tab/Space/Enter/Arrow), ARIA roles corretos
- `aria-live="polite"` no feedback do `<CopyButton>`
- `role="progress"` + `aria-valuenow` no `<ReadingProgress>`
- Skip-link no topo de cada tópico → salta para `#main-content`
- Heading hierarchy estrita: 1× h1 por página, h2 para secções, h3 para subsecções
- `prefers-reduced-motion: reduce` (já em `globals.css:172`) — desativa todas as animações
- Contraste AA verificado: `--muted-foreground` (oklch 0.50 0.02 60) sobre `--background` (oklch 0.97 0.005 80) ≈ 5.8:1 ✓
- Touch targets ≥44px em mobile

---

## 7. Estratégia de Execução (Abordagem A — Component Layer Primeiro)

### Fases

| Fase | Conteúdo | Verificação |
|---|---|---|
| **0 — Design tokens** | Adicionar a `globals.css`: tokens glass, sombras, gradientes, keyframes, utilities | `npm run build` passa; `mockup-manuals.html` mostra tokens em uso |
| **1 — Mockup HTML** | Criar `frontend/mockup-manuals.html` com 3 secções (listagem, accordion, tópico 3-zone) usando Tailwind via CDN e os tokens novos | Abrir no browser; iterar estética até fechar |
| **2 — Component layer** | Implementar em React: `CommandTable`, `CopyButton`, `ComparisonTable`, `CodeBlock`, `DetailsDisclosure`, `ProseElements`, `MarkdownRenderer`, `isCommand-table.ts` | `npm run build` + `npm run lint` |
| **3 — Lib updates** | `lib/manuals.ts` (adicionar `level`), `lib/topic-loader.ts` (gray-matter + wikilinks regex) | `npm run build` |
| **4 — Vertical /manuals** | Refactor `page.tsx` com `ManualCard` + `ManualLevelGroup` + staggered | Smoke visual |
| **5 — Vertical /[code]** | Refactor `page.tsx` com `TopicAccordion` + `TopicRow` | Smoke visual |
| **6 — Vertical /[slug]** | Refactor `page.tsx` 3-zone com `TopicToc`, `TopicMeta`, `ReadingProgress`, `PrevNextNav`, `MarkdownRenderer` | Smoke visual |

### Commits esperados

- `feat(design-system): expandir tokens OKLCH com glassmorphism e gradientes`
- `chore(mockup): criar mockup-manuals.html como visual companion`
- `feat(markdown): CommandTable com auto-detect e copy-to-clipboard`
- `feat(markdown): CopyButton + CodeBlock + DetailsDisclosure`
- `feat(markdown): MarkdownRenderer com prose-elements premium`
- `feat(lib): topic-loader com gray-matter + wikilinks regex`
- `refactor(manuals): listagem com ManualCard glassmorphism + staggered`
- `refactor(manuals): TopicAccordion Base UI com agrupamento por nível`
- `refactor(manuals): tópico 3-zone layout (TOC + leitura + meta)`

Cada commit: pequeno, reversível, verificado por `cmd /c "npm run build"` + `cmd /c "npm run lint"` (Windows PowerShell constraint).

---

## 8. Critérios de Aceitação

### Técnicos
- [ ] `cmd /c "npm run build"` passa sem erros nem warnings novos
- [ ] `cmd /c "npm run lint"` passa sem erros
- [ ] Zero novas dependências de runtime animação (ADR-001 respeitado)
- [ ] Zero cores inline em `.tsx` (Norma 01 respeitada)
- [ ] Todas as cores novas são tokens OKLCH em `:root` + `@theme inline`
- [ ] Lighthouse Accessibility ≥ 95 nas 3 rotas
- [ ] Lighthouse Performance ≥ 90 em `/manuals/[code]/[slug]`

### Visuais
- [ ] `/manuals` mostra 6 manuais agrupados em 2 níveis (Essentials + LPIC-1) com staggered entrance
- [ ] `/manuals/[code]` mostra Accordion com grupos por objective (101, 102, …) e animação suave
- [ ] `/manuals/[code]/[slug]` mostra layout 3-zone em desktop (≥1280px), single-column em mobile
- [ ] Command tables são interativas (hover + copy + expand)
- [ ] Glass cards com backdrop-blur visíveis em fundos decorativos
- [ ] Reading progress bar acompanha o scroll
- [ ] TOC scroll-spy funciona e salta para secções ao clicar

### Acessibilidade
- [ ] Tudo navegável por teclado (Tab, Enter, Esc, Arrow)
- [ ] `prefers-reduced-motion` desativa todas as animações
- [ ] Copy feedback anunciado por screen reader (`aria-live`)
- [ ] Skip-link funcional no topo de cada tópico

---

## 9. Out of Scope (explícito)

- **`/dashboard/study/*`**: mantém-se como está. Componentes criados aqui serão reutilizáveis lá mais tarde, sem refactor agora.
- **Syntax highlighting rico**: code blocks terão fundo + tipografia mono, mas sem tokenização completa (Prism/Shiki seriam deps grandes; fica para fase futura se houver demanda).
- **Search funcional dentro de manuais**: o componente visual pode existir mas não há endpoint de busca novo (o RAG já existe em `/api/search`).
- **Dark mode**: fora de scope (paleta é creme/claro).
- **Quizzes inline no tópico**: o CTA em `<TopicMeta>` aponta para `/dashboard/quizzes/...`, não embeda o quiz.

---

## 10. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| `backdrop-filter` não suportado em browsers antigos | Baixa (Chrome 76+, Firefox 103+, Safari 9+) | Visual degrada graciosamente | Fallback `background: var(--glass-bg-strong)` (opaco) via `@supports` |
| Heurística `isCommandTable` gera falsos positivos | Média | Tabela comparativa vira command table | Refinar regex; testar manualmente nos 6 manuais; fallback fácil (basta adicionar header sem "comando/command") |
| Wikilinks `[[X|Y]]` com edge cases (espaços, nested pipes) | Média | Link quebrado | Regex conservadora; logs em build para wikilinks não-resolvidos |
| `IntersectionObserver` em headings dinâmicos (após expand details) | Baixa | Scroll-spy desatualizado | Re-observar quando details abre/fecha |
| Base UI Accordion API difere do Radix | Média | Código escrito para Radix não funciona | Verificar `node_modules/@base-ui/react/.../accordion` antes de implementar |

---

## 11. Referências

- **Mockup visual companion:** `frontend/mockup-manuals.html` (a criar na Fase 1)
- **Mockup dashboard existente:** `frontend/mockup-dashboard.html` (convention de "fonte de verdade visual")
- **Normas aplicáveis:**
  - [Norma 01 — Sistema de Tokens e Cores](../../Norma%2001%20-%20Sistema%20de%20Tokens%20e%20Cores.md)
  - [Norma 02 — Layout Bento e Grelha](../../Norma%2002%20-%20Layout%20Bento%20e%20Grelha.md)
  - [Norma 03 — Identidade de Marca e Comentários](../../Norma%2003%20-%20Identidade%20de%20Marca%20e%20Comentários.md)
  - [ADR-001 — Abordagem A — CSS puro e SVG inline](../../ADR-001%20-%20Abordagem%20A%20-%20CSS%20puro%20e%20SVG%20inline.md)
- **Inspiração visual:** neutra.framer.website (quiet luxury), evolt.dev (developer drama — só para tábuas de comandos)
- **Stack:** Next.js 16.2.10, React 19, Tailwind v4, `@base-ui/react`, shadcn `base-nova`, react-markdown + remark-gfm
