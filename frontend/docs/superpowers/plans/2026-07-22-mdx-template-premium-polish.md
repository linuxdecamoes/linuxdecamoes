# MDX Template — Polish Premium · Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corrigir a causa raiz no conversor Vault→MDX, unificar a prosa num só sítio token-izado, ligar os componentes premium (`Callout`, `ExerciseCard`, `DistributionCard`) globalmente e preencher a `TopicMeta` com frontmatter real — restaurando o visual premium do template de tópicos em `/manuals/[code]/[slug]`.

**Architecture:** Híbrida. O conversor mantém transformações estruturais (`TopicHero`, `SolutionBlock`, wikilinks, normalização de slug/admonitions) e emite **tabelas markdown** + **marcadores de admonition**. Na compilação MDX, `remark-gfm` (tabelas/GFM) + `remark-callout` (nosso, `[!type]`→`<Callout>`) + `rehype-slug` (ids de heading) fazem o resto. Os componentes premium ficam registados em `useMDXComponents` para autoria manual e para o nó emitido pelo plugin. A shell 3-zone / glass-card / premium-atmosphere **não se toca**.

**Tech Stack:** Next.js 16.2.10 (`@next/mdx`), React 19, Tailwind v4 (`@theme inline`), shadcn/base-ui, OKLCH tokens. Deps já instaladas (sem instalações de runtime): `remark-gfm@^4.0.1`, `rehype-slug@^6.0.0`, `github-slugger@^2.0.0`, `gray-matter@^4.0.3`. ADR-001 respeitado (tudo build-time ou CSS).

> **Adaptação de verificação (importante):** o projeto **não tem test runner** (`scripts`: dev/build/start/lint). O gate de integração de cada tarefa é `cmd /c "npm run lint"` + (quando a tarefa altera conteúdo/compilação MDX) `cmd /c "npm run build"`. O `build` pré-renderiza os 119 tópicos via `generateStaticParams`, pelo que qualquer erro de compilação MDX rebenta o build — é o nosso teste de integração. Comandos sempre via `cmd /c` (PowerShell bloqueia `.ps1`). Linguagem: PT-PT em commits e código.

> **Contexto do repo:** o git repo é `frontend/.git` (ramo `master`). Paths abaixo são relativos a `frontend/`. O Vault de manuais LPI é **externo**: `../Vault/` (= `C:\Users\ROG\Documents\manuais Linux\Vault\`). Os 119 `.mdx` em `src/content/manuals/` estão marcados "NÃO EDITAR À MÃO" e são regenerados pelo conversor.

> **Spec fonte:** `docs/superpowers/specs/2026-07-22-mdx-template-premium-polish-design.md` (lê se precisares de rationale).

---

## Ficheiros (mapa)

**Criar:**
- `src/lib/remark-callout.ts` — plugin mdast: blockquote `[!type]` → `<Callout>`.

**Modificar:**
- `src/app/globals.css` — tokens (callout, terminal, tabela, hero-watermark) + `@theme inline`.
- `src/mdx-components.tsx` — prose unificada + `TerminalPre`/`TerminalCode` tokenizados + entradas `table/*` + registo de premium comps.
- `src/components/mdx/callout.tsx` — reconciliar para 4 tipos (`note|tip|warning|danger`), `typeLabel`, tokens.
- `src/components/mdx/exercise-card.tsx` — ribbon inline `style` → classe estática via `accentClasses`.
- `src/components/mdx/distribution-card.tsx` — `accentBg` oklch + `style` inline → tokens.
- `src/components/mdx/topic-hero.tsx` — watermark inline oklch → token.
- `src/components/mdx/solution-block.tsx` — remover `!important` + oklch arbitário.
- `next.config.ts` — wire `remark-gfm` + `remark-callout` + `rehype-slug`.
- `scripts/convert-vault-to-mdx.ts` — 5 fixes + `mdxMetaRegistry` no barrel.
- `src/lib/mdx-auto-register.ts` — expor `meta` em `getMdxTopics()`.
- `src/app/manuals/[code]/[slug]/page.tsx` — ler meta real.
- `package.json` — remover `react-markdown`; adicionar `tsx` (dev).

**Regenerar (auto-gen, não editar à mão):**
- `src/content/manuals/**/*.mdx` (119) + `src/content/manuals/index.ts` (barrel).

**Apagar:**
- `src/components/markdown/{markdown-renderer, prose-elements, code-block, command-table, is-command-table}.tsx` (sobrevivem `copy-button.tsx` + `details-disclosure.tsx`).

---

## Task 1: Tokens premium (callout, terminal, tabela, hero-watermark)

Adicionar tokens a `:root` e expô-los em `@theme inline` para o Tailwind v4 gerar utilidades. **Sem tokens de accent novos** (`--sage`/`--coral`/`--amber`/`--terracotta`/`--iris` + `-soft` já existem em `globals.css:116-129`).

**Files:**
- Modify: `src/app/globals.css` (`:root` em linhas 81-172; `@theme inline` em linhas 5-79).

- [ ] **Step 1: Adicionar entradas em `@theme inline`**

Em `src/app/globals.css`, dentro do bloco `@theme inline { ... }` (fecha na linha 79), adicionar **antes da linha 65** (antes do comentário `--- Manuals Redesign ---`):

```css
  /* --- MDX premium: callout (4 tipos) --- */
  --color-callout-note: var(--callout-note);
  --color-callout-note-bg: var(--callout-note-bg);
  --color-callout-tip: var(--callout-tip);
  --color-callout-tip-bg: var(--callout-tip-bg);
  --color-callout-warning: var(--callout-warning);
  --color-callout-warning-bg: var(--callout-warning-bg);
  --color-callout-danger: var(--callout-danger);
  --color-callout-danger-bg: var(--callout-danger-bg);
  /* --- MDX premium: terminal --- */
  --color-terminal-bg: var(--terminal-bg);
  --color-terminal-bar: var(--terminal-bar);
  --color-terminal-dot-red: var(--terminal-dot-red);
  --color-terminal-dot-amber: var(--terminal-dot-amber);
  --color-terminal-dot-green: var(--terminal-dot-green);
  --color-terminal-text: var(--terminal-text);
  --color-terminal-prompt: var(--terminal-prompt);
  --color-terminal-comment: var(--terminal-comment);
  /* --- MDX premium: tabelas + hero --- */
  --color-table-header-bg: var(--table-header-bg);
  --color-table-border: var(--table-border);
  --color-hero-watermark: var(--hero-watermark);
```

- [ ] **Step 2: Adicionar valores em `:root`**

Em `src/app/globals.css`, dentro do bloco `:root { ... }`, adicionar **antes da linha 172** (antes do fecho `}` do `:root`, depois do bloco `--shadow-card-elevated`):

```css

  /* --- MDX premium: paleta callout (Norma 01 — valores em :root) ---
     Borders/icons reutilizam tokens de accent existentes; bg é oklch suave. */
  --callout-note: var(--iris);
  --callout-note-bg: oklch(0.96 0.02 260 / 0.35);
  --callout-tip: var(--coral);
  --callout-tip-bg: oklch(0.96 0.03 25 / 0.30);
  --callout-warning: var(--amber);
  --callout-warning-bg: oklch(0.96 0.04 70 / 0.38);
  --callout-danger: var(--destructive);
  --callout-danger-bg: oklch(0.95 0.05 25 / 0.38);

  /* --- MDX premium: terminal tokenizado (substitui hex hardcoded) --- */
  --terminal-bg: oklch(0.18 0.02 255);
  --terminal-bar: oklch(0.22 0.03 255);
  --terminal-dot-red: oklch(0.63 0.21 25);
  --terminal-dot-amber: oklch(0.80 0.17 85);
  --terminal-dot-green: oklch(0.72 0.19 145);
  --terminal-text: oklch(0.86 0.015 250);
  --terminal-prompt: oklch(0.72 0.19 145);
  --terminal-comment: oklch(0.58 0.02 250);

  /* --- MDX premium: tabelas + hero watermark --- */
  --table-header-bg: var(--cream);
  --table-border: var(--border);
  --hero-watermark: oklch(0.92 0.01 80 / 0.5);
```

- [ ] **Step 3: Verificar lint + build**

Run: `cmd /c "npm run lint"`
Expected: sem erros novos (CSS não é lintado por ESLint, mas confirma que não partiste sintaxe TS).

Run: `cmd /c "npm run build"`
Expected: BUILD PASS. O Tailwind v4 valida os tokens em `@theme inline`.

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(tokens): paleta callout/terminal/tabela + hero-watermark

Tokens OKLCH em :root + exposição @theme inline para o Tailwind v4.
Substituirá hex/oklch inline dos componentes MDX (Norma 01)."
```

---

## Task 2: Token-izar TerminalPre + unificar prose (h3, inline-code, tabelas) + limpar SolutionBlock

**Files:**
- Modify: `src/mdx-components.tsx` (todo o ficheiro, 153 linhas).
- Modify: `src/components/mdx/solution-block.tsx` (29 linhas).

- [ ] **Step 1: Reescrever `TerminalPre`/`TerminalCode` com tokens**

Em `src/mdx-components.tsx`, substituir as funções `TerminalPre` (linhas 4-58) e `TerminalCode` (linhas 60-67) por:

```tsx
function TerminalPre({ children }: { children?: React.ReactNode }) {
  const codeText =
    typeof children === "object" &&
    children !== null &&
    "props" in children &&
    typeof (children as { props?: { children?: string } }).props?.children ===
      "string"
      ? ((children as { props: { children: string } }).props.children as string)
      : "";

  return (
    <div className="group relative my-6 overflow-hidden rounded-xl border border-white/10 bg-terminal-bg shadow-lg">
      <div className="flex items-center gap-2 border-b border-white/10 bg-terminal-bar px-4 py-2.5">
        <span className="h-3 w-3 rounded-full bg-terminal-dot-red opacity-80" />
        <span className="h-3 w-3 rounded-full bg-terminal-dot-amber opacity-80" />
        <span className="h-3 w-3 rounded-full bg-terminal-dot-green opacity-80" />
        <span className="ml-2 flex-1 text-center font-mono text-xs text-white/40">
          bash
        </span>
        <CopyButton
          value={codeText}
          label="Copiar"
          copiedLabel="Copiado!"
          className="text-white/40 hover:bg-white/10 hover:text-white"
        />
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
        <code className="font-mono text-[13px] text-terminal-text">
          {codeText.split("\n").map((line, i) => {
            const trimmed = line.trimStart();
            const isComment = trimmed.startsWith("# ");
            const isCommand = trimmed.startsWith("$ ") || trimmed === "$";
            return (
              <span key={i} className="block">
                {isComment ? (
                  <span className="text-terminal-comment">{line}</span>
                ) : isCommand ? (
                  <>
                    <span className="text-terminal-prompt">$ </span>
                    <span className="text-terminal-text">{line.slice(2)}</span>
                  </>
                ) : (
                  <span className="text-terminal-text">{line}</span>
                )}
              </span>
            );
          })}
        </code>
      </pre>
    </div>
  );
}

function TerminalCode({ children }: { children?: React.ReactNode }) {
  return (
    <code className="rounded-md border border-border bg-muted/70 px-1.5 py-0.5 font-mono text-[0.85em] text-foreground">
      {children}
    </code>
  );
}
```

Notas: `bg-terminal-bg`/`bg-terminal-bar`/`bg-terminal-dot-*`/`text-terminal-*` são utilidades geradas pelo Tailwind v4 a partir dos `--color-terminal-*` adicionados em Task 1. O inline `code` passou de `bg-muted/60` para `bg-muted/70` (base melhorada; permite remover o `!important` do SolutionBlock).

- [ ] **Step 2: h3 — remover inline `style`, usar classe**

No mesmo ficheiro, na entrada `h3` do `mdxProse` (linhas 87-98), substituir por:

```tsx
  h3: ({ children, id }: { children?: React.ReactNode; id?: string }) => (
    <h3
      id={id}
      className="mt-10 mb-4 border-l-2 border-primary/40 pl-4 text-xl font-bold text-foreground lg:text-2xl"
    >
      {children}
    </h3>
  ),
```

- [ ] **Step 3: Adicionar entradas de tabela ao `mdxProse`**

No mesmo ficheiro, no objeto `mdxProse`, adicionar **depois da entrada `hr`** (antes de `code: TerminalCode,`):

```tsx
  table: ({ children }: { children?: React.ReactNode }) => (
    <table className="my-6 w-full border-collapse overflow-hidden rounded-lg border border-border text-sm">
      {children}
    </table>
  ),
  thead: ({ children }: { children?: React.ReactNode }) => (
    <thead className="bg-table-header-bg">{children}</thead>
  ),
  tbody: ({ children }: { children?: React.ReactNode }) => (
    <tbody>{children}</tbody>
  ),
  tr: ({ children }: { children?: React.ReactNode }) => (
    <tr className="border-b border-border/60 transition-colors hover:bg-muted/40">
      {children}
    </tr>
  ),
  th: ({ children }: { children?: React.ReactNode }) => (
    <th className="border-b border-border px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wider text-foreground">
      {children}
    </th>
  ),
  td: ({ children }: { children?: React.ReactNode }) => (
    <td className="border-b border-border/50 px-3 py-2.5 text-muted-foreground">
      {children}
    </td>
  ),
```

- [ ] **Step 4: Limpar `SolutionBlock` — remover `!important` e oklch arbitrário**

Em `src/components/mdx/solution-block.tsx`, substituir **todo o conteúdo do `className` do `<div>` interno** (linhas 8-23) por:

```tsx
        className={
          // Texto
          "[&>p]:mb-2 [&>p]:text-sm [&>p]:leading-relaxed [&>p]:text-foreground/90 [&>p:last-child]:mb-0 " +
          // Strong
          "[&_strong]:font-semibold [&_strong]:text-foreground"
        }
```

Racional: as tabelas e o inline-code dentro do SolutionBlock passam agora a herdar o styling base do `mdxProse` (aplicado globalmente pelo `useMDXComponents`), por isso desaparecem os overrides `!important` e os `bg-[oklch(...)]`. O ficheiro final fica:

```tsx
import type { ReactNode } from "react";
import { DetailsDisclosure } from "@/components/markdown/details-disclosure";

export function SolutionBlock({ children }: { children: ReactNode }) {
  return (
    <DetailsDisclosure summary={<span className="font-medium">Solução</span>} defaultOpen={true}>
      <div
        className={
          "[&>p]:mb-2 [&>p]:text-sm [&>p]:leading-relaxed [&>p]:text-foreground/90 [&>p:last-child]:mb-0 " +
          "[&_strong]:font-semibold [&_strong]:text-foreground"
        }
      >
        {children}
      </div>
    </DetailsDisclosure>
  );
}
```

- [ ] **Step 5: Verificar lint + build**

Run: `cmd /c "npm run lint"`
Expected: PASS.

Run: `cmd /c "npm run build"`
Expected: BUILD PASS.

- [ ] **Step 6: Commit**

```bash
git add src/mdx-components.tsx src/components/mdx/solution-block.tsx
git commit -m "refactor(mdx): TerminalPre tokenizado + prose unificada

- TerminalPre/TerminalCode usam tokens --terminal-* (sem hex inline)
- h3: inline style -> classe border-l-2 border-primary/40
- inline code: base melhorada bg-muted/70
- mdxProse: novas entradas table/thead/tbody/tr/th/td com tokens
- SolutionBlock: removido !important e oklch arbitrario (prose base basta)"
```

---

## Task 3: Refactor componentes premium → tokens + accentClasses canónico

Os componentes `ExerciseCard`, `DistributionCard`, `TopicHero` **já importam `accentClasses` de `@/lib/manuals`** — o refactor é cirúrgico: remover o que ainda usa `var(--${accent})` dinâmico ou oklch arbitrário. `Callout` é reconciliado para os 4 tipos canónicos (`note|tip|warning|danger`) que o `remark-callout` emite.

**Files:**
- Modify: `src/components/mdx/callout.tsx`.
- Modify: `src/components/mdx/exercise-card.tsx`.
- Modify: `src/components/mdx/distribution-card.tsx`.
- Modify: `src/components/mdx/topic-hero.tsx`.

- [ ] **Step 1: Reescrever `Callout` (4 tipos + typeLabel + tokens)**

Substituir **todo** `src/components/mdx/callout.tsx` por:

```tsx
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertOctagon,
  AlertTriangle,
  Info,
  Lightbulb,
} from "lucide-react";

export type CalloutType = "note" | "tip" | "warning" | "danger";

type CalloutProps = {
  type?: CalloutType;
  title?: string;
  icon?: LucideIcon;
  children: ReactNode;
};

// Label PT-PT preenchido por defeito a partir do tipo (preserva o
// marcador original do Vault: Nota/Dica/Aviso/Perigo).
const typeLabel: Record<CalloutType, string> = {
  note: "Nota",
  tip: "Dica",
  warning: "Aviso",
  danger: "Perigo",
};

// classNames estáticas por tipo (Norma 01 — zero oklch inline).
const typeClasses: Record<CalloutType, string> = {
  note: "bg-callout-note-bg border-l-callout-note",
  tip: "bg-callout-tip-bg border-l-callout-tip",
  warning: "bg-callout-warning-bg border-l-callout-warning",
  danger: "bg-callout-danger-bg border-l-callout-danger",
};

const typeIcon: Record<CalloutType, LucideIcon> = {
  note: Info,
  tip: Lightbulb,
  warning: AlertTriangle,
  danger: AlertOctagon,
};

const typeIconClass: Record<CalloutType, string> = {
  note: "bg-background/70 text-callout-note",
  tip: "bg-background/70 text-callout-tip",
  warning: "bg-background/70 text-callout-warning",
  danger: "bg-background/70 text-callout-danger",
};

export function Callout({
  type = "note",
  title,
  icon,
  children,
}: CalloutProps) {
  const Icon = icon ?? typeIcon[type];

  return (
    <aside
      className={
        "relative my-8 flex gap-4 overflow-hidden rounded-xl border-l-4 p-5 shadow-sm backdrop-blur-sm " +
        typeClasses[type]
      }
    >
      <span
        className={
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-sm " +
          typeIconClass[type]
        }
      >
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1 [&>p]:mb-2 [&>p]:text-sm [&>p]:leading-relaxed [&>p]:text-foreground [&>p:last-child]:mb-0 [&>ul]:mb-2 [&>ul]:list-disc [&>ul]:space-y-1 [&>ul]:pl-5 [&>ul]:text-sm [&>ul]:text-foreground [&>ul:last-child]:mb-0 [&_strong]:font-semibold [&_strong]:text-foreground [&_code]:rounded [&_code]:border [&_code]:border-border [&_code]:bg-background/60 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_code]:text-foreground">
        <p className="mb-1 text-base font-bold text-foreground">
          {title ?? typeLabel[type]}
        </p>
        {children}
      </div>
    </aside>
  );
}
```

Notas: o `title` aparece **sempre** (usa o label do tipo por defeito), honrando "título preservado" da spec. Se um autor passar `title`, sobrepõe-se. Os tipos antigos `info`/`success` foram removidos (0 usos no conteúdo); `danger` substitui a necessidade do `remark-callout` para `Perigo`.

- [ ] **Step 2: `ExerciseCard` — ribbon inline `style` → classe estática**

Em `src/components/mdx/exercise-card.tsx`, substituir o `<div>` do ribbon (linhas 32-38) por um `<div>` com classe estática. Primeiro adicionar o mapa de ribbon **antes** da função `ExerciseCard` (depois de `difficultyLabel`, ~linha 18):

```tsx
// Ribbon gradient por accent — classes estáticas (Norma 01). O Tailwind v4
// gera from-*/to-* a partir dos --color-{accent} expostos em @theme inline.
const ribbonClass: Record<Accent, string> = {
  sage: "bg-gradient-to-r from-sage to-sage-soft",
  coral: "bg-gradient-to-r from-coral to-coral-soft",
  amber: "bg-gradient-to-r from-amber to-amber-soft",
  terracotta: "bg-gradient-to-r from-terracotta to-peach",
  iris: "bg-gradient-to-r from-iris to-iris-soft",
};
```

Depois substituir o `<div>` do ribbon por:

```tsx
      <div className={`h-1 w-full ${ribbonClass[accent]}`} aria-hidden />
```

(O `accent` já é prop com default `"sage"`; `ribbonClass[accent]` é type-safe porque `accent: Accent`.)

- [ ] **Step 3: `DistributionCard` — `accentBg` oklch + `style` inline → tokens**

Em `src/components/mdx/distribution-card.tsx`:

1. Substituir o mapa `accentBg` (linhas 10-16) por:

```tsx
// Background suave + border-left por accent — classes estáticas (Norma 01).
const accentSurface: Record<Accent, string> = {
  sage: "bg-sage-soft/40 border-l-sage",
  coral: "bg-coral-soft/40 border-l-coral",
  amber: "bg-amber-soft/40 border-l-amber",
  terracotta: "bg-peach/50 border-l-terracotta",
  iris: "bg-iris-soft/40 border-l-iris",
};
```

2. Na função, substituir as linhas `const bg = accentBg[accent] ?? accentBg.sage;` (35) e o `<article ... + bg` + `style={{ borderLeftColor }}` (38-44) por:

```tsx
  const surface = accentSurface[accent];

  return (
    <article
      className={
        "group relative my-5 overflow-hidden rounded-2xl border-l-4 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-float " +
        surface
      }
    >
```

(Removido o `style={{ borderLeftColor: ... }}` — a cor fica no `border-l-{accent}` da classe `surface`.)

- [ ] **Step 4: `TopicHero` — watermark inline oklch → token**

Em `src/components/mdx/topic-hero.tsx`, substituir o `<span>` do watermark (linhas 48-57) por:

```tsx
      <span
        aria-hidden
        className="pointer-events-none absolute -right-4 -top-6 select-none text-[12rem] font-bold leading-none tracking-tighter text-hero-watermark opacity-70 md:text-[18rem]"
      >
        {watermarkDigits}
      </span>
```

(`text-hero-watermark` é utilidade gerada do `--color-hero-watermark` de Task 1; removido o `style={{ color, opacity }}`.)

- [ ] **Step 5: Verificar lint + build**

Run: `cmd /c "npm run lint"`
Expected: PASS.

Run: `cmd /c "npm run build"`
Expected: BUILD PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/mdx/callout.tsx src/components/mdx/exercise-card.tsx src/components/mdx/distribution-card.tsx src/components/mdx/topic-hero.tsx
git commit -m "refactor(mdx): componentes premium token-izados

- Callout: 4 tipos canonicos (note/tip/warning/danger) + typeLabel + tokens
- ExerciseCard: ribbon via classe estatica (sem var(--\${accent}) inline)
- DistributionCard: accentSurface token + border-l-{accent} (sem style inline)
- TopicHero: watermark text-hero-watermark (sem oklch inline)"
```

---

## Task 4: Plugin `remark-callout` + wire `next.config.ts`

**Files:**
- Create: `src/lib/remark-callout.ts`.
- Modify: `next.config.ts`.

- [ ] **Step 1: Criar `src/lib/remark-callout.ts`**

O plugin percorre o mdast; quando um `blockquote` tem o primeiro parágrafo a começar por `[!type]` (type ∈ note|tip|warning|danger), transforma-o num nó `mdxJsxFlowElement` `<Callout type="...">` cujos children são o resto do blockquote. Caso-limite (`[!` inválido, tipo desconhecido, callout vazio) → deixa estar blockquote simples (o `mdxProse.blockquote` trata).

Escrever o ficheiro com tipos locais (sem assumir `@types/mdast`/`unist-util-visit`):

```tsx
/**
 * remark-callout — transforma blockquotes GFM-alert (`> [!type]`) em
 * `<Callout type="type">` no MDX. Tipos validos: note|tip|warning|danger.
 *
 * Build-time only (remark plugin) — nao viola ADR-001.
 * Caso-limite: blockquote sem marcador valido -> passa adiante (blockquote normal).
 */

type MdNode = {
  type: string;
  name?: string;
  attributes?: Array<{
    type: string;
    name: string;
    value?: string | number | boolean;
  }>;
  children?: MdNode[];
  value?: string;
};

const CALLOUT_RE = /^\[!(note|tip|warning|danger)\][ \t]*/i;

function paragraphText(p: MdNode): string {
  if (!p.children) return "";
  return p.children
    .map((c) => (c.type === "text" ? (c.value ?? "") : ""))
    .join("");
}

/** Remove o marcador `[!type]` do primeiro text node do paragrafo. */
function stripMarker(p: MdNode): void {
  const first = p.children?.find((c) => c.type === "text");
  if (!first || typeof first.value !== "string") return;
  first.value = first.value.replace(CALLOUT_RE, "");
  if (first.value === "") {
    // Remove o text node vazio para nao gerar espaco extra.
    if (p.children) {
      p.children = p.children.filter((c) => c !== first);
    }
  }
}

function transform(node: MdNode): void {
  if (!node.children) return;
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    if (child.type === "blockquote" && child.children && child.children[0]) {
      const firstPara = child.children[0];
      if (firstPara.type === "paragraph") {
        const match = paragraphText(firstPara).match(CALLOUT_RE);
        if (match) {
          const type = match[1].toLowerCase();
          stripMarker(firstPara);
          node.children[i] = {
            type: "mdxJsxFlowElement",
            name: "Callout",
            attributes: [
              { type: "mdxJsxAttribute", name: "type", value: type },
            ],
            children: child.children,
          };
        }
      }
    }
    transform(child);
  }
}

export function remarkCallout() {
  return (tree: MdNode) => {
    transform(tree);
  };
}
```

- [ ] **Step 2: Wire plugins em `next.config.ts`**

Substituir **todo** `next.config.ts` por:

```ts
import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { remarkCallout } from "./src/lib/remark-callout";

const nextConfig: NextConfig = {
  output: "standalone",
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
};

const withMDX = createMDX({
  extension: /\.(md|mdx)$/,
  mdxOptions: {
    remarkPlugins: [remarkGfm, remarkCallout],
    rehypePlugins: [rehypeSlug],
  },
});

export default withMDX(nextConfig);
```

Notas: `remark-gfm` habilita tabelas markdown + autolinks + strikethrough + task-lists. `rehype-slug` adiciona `id`s aos headings (h2/h3) — **crítico para os anchors do TOC**. As três deps já estão em `package.json` (confirmado: `remark-gfm@^4.0.1`, `rehype-slug@^6.0.0`).

- [ ] **Step 3: Smoke-test do plugin num tópico**

Antes de regenerar tudo, confirmar que o plugin compila. Criar um ficheiro de teste temporário **não rastreado** para validar a forma do nó `mdxJsxFlowElement` com `@next/mdx` 16 (R1 do spec):

Run (cria conteúdo de prova num tópico existente — escolher um sem importância, ex. um que tenha um blockquote):
```
cmd /c "npm run build"
```

Se o build PASSAR, o shape do nó está correto. Se falhar com erro de `mdxJsxFlowElement`/attributes, voltar ao Step 1 e confirmar que `attributes[0]` tem exatamente `{ type: "mdxJsxAttribute", name: "type", value: type }` e que `children` é o array de nós do blockquote.

(Nota: ainda não há `[!type]` no conteúdo — o conversor só os emite na Task 6. Este step valida apenas que o plugin + imports não partem o build. O teste real de rendering acontece após a Task 6.)

- [ ] **Step 4: Commit**

```bash
git add src/lib/remark-callout.ts next.config.ts
git commit -m "feat(mdx): remark-callout + remark-gfm + rehype-slug

- novo src/lib/remark-callout.ts: blockquote [!type] -> <Callout>
- next.config.ts: remarkPlugins [remarkGfm, remarkCallout] + rehypeSlug
- tabelas markdown + ids de heading (anchors TOC) agora compilados"
```

---

## Task 5: Registar premium comps em `useMDXComponents`

**Files:**
- Modify: `src/mdx-components.tsx` (função `useMDXComponents`, linhas 151-153).

- [ ] **Step 1: Importar e registar os três componentes**

No topo de `src/mdx-components.tsx`, adicionar import (depois do import de `CopyButton`, linha 2):

```tsx
import { Callout, ExerciseCard, DistributionCard } from "@/components/mdx";
```

Substituir a função `useMDXComponents` (linhas 151-153) por:

```tsx
export function useMDXComponents(): MDXComponents {
  return { ...mdxProse, Callout, ExerciseCard, DistributionCard };
}
```

Isto põe os três componentes em scope para qualquer `.mdx` (autoria manual) **e** resolve o `<Callout>` emitido pelo `remark-callout`.

- [ ] **Step 2: Verificar lint + build**

Run: `cmd /c "npm run lint"`
Expected: PASS.

Run: `cmd /c "npm run build"`
Expected: BUILD PASS.

- [ ] **Step 3: Commit**

```bash
git add src/mdx-components.tsx
git commit -m "feat(mdx): registar Callout/ExerciseCard/DistributionCard

useMDXComponents passa a expor os 3 componentes premium globalmente,
disponibilizando-os para autoria manual em qualquer .mdx e resolvendo
o no <Callout> emitido pelo remark-callout."
```

---

## Task 6: Fixes do conversor + regenerar 119 `.mdx`

A tarefa mais densa. O conversor deixa de emitir HTML para tabelas (killing os problemas de bold/backticks/oklch de uma só vez), normaliza admonitions do Vault para marcadores `[!type]`, faz threading completo do frontmatter e emite `mdxMetaRegistry` no barrel, e usa `github-slugger` para o TOC (matando slug drift vs `rehype-slug`). **Não emite** `DistributionCard` (era import morto).

**Files:**
- Modify: `scripts/convert-vault-to-mdx.ts`.
- Modify: `package.json` (adicionar `tsx` devDep).
- Regenerar: `src/content/manuals/**/*.mdx` + `src/content/manuals/index.ts`.

- [ ] **Step 1: Adicionar `tsx` como devDep (determinismo)**

O conversor corre via `npx tsx`. Para evitar fetch de rede não-determinístico em cada run, instalar como devDep.

Run: `cmd /c "npm install -D tsx"`
Expected: `added 1 package` (ou similar); `tsx` aparece em `devDependencies` do `package.json`.

- [ ] **Step 2: Importar `github-slugger` no conversor**

Em `scripts/convert-vault-to-mdx.ts`, adicionar no topo (depois do import de `matter`, linha 20):

```ts
import GithubSlugger from "github-slugger"
```

- [ ] **Step 3: Migrar `extractHeadings` para `github-slugger`**

Em `scripts/convert-vault-to-mdx.ts`, substituir a função `extractHeadings` (linhas 86-103) por uma que usa `github-slugger` (preserva diacritics, igual ao `rehype-slug`):

```ts
function extractHeadings(content: string) {
  const slugger = new GithubSlugger()
  const headings: Array<{ level: number; text: string; id: string }> = []
  for (const line of content.split("\n")) {
    const m = line.match(/^(#{1,3})\s+(.+)/)
    if (!m) continue
    const text = m[2].replace(/[*_`~\[\]]/g, "").trim()
    const id = slugger.slug(text)
    headings.push({ level: m[1].length, text, id })
  }
  return headings
}
```

- [ ] **Step 4: Remover conversão de tabelas HTML + `escapeForJsx` + `preserveCodeBlocks`**

Em `scripts/convert-vault-to-mdx.ts`, **apagar** as três funções:
- `markdownTableToHtml` (linhas 105-171) — inclui `escapeForJsx` (a causa do `&lt;strong&gt;` literal).
- `convertMarkdownTables` (linhas 173-203).
- `preserveCodeBlocks` (linhas 205-210, no-op).

A partir de agora as tabelas markdown passam **intactas** para o `.mdx` e o `remark-gfm` renderiza-as com o styling de `mdxProse.table/*`.

- [ ] **Step 5: Adicionar `normalizeAdmonitions`**

Adicionar a função (junto das outras transforms, ex. antes de `convertDetailsBlocks`):

```ts
/** Normaliza callouts custom do Vault para marcadores GFM-alert.
 *  Vault usa:  > **Nota:** ...   > **Dica:** ...   > **Aviso:** ...
 *             > **Atenção:** ... > **Importante:** ... > **Perigo:** ...
 *  O remark-callout transforma [!type] em <Callout>. O Conteúdo depois do
 *  marcador fica no primeiro paragrafo (children do Callout). */
function normalizeAdmonitions(content: string): string {
  const typeMap: Record<string, string> = {
    nota: "note",
    dica: "tip",
    aviso: "warning",
    atencao: "warning",
    "atenção": "warning",
    importante: "warning",
    perigo: "danger",
  }
  // Linha de blockquote: "> **Tipo:** resto..."  (Tipo com/s sem acento, case-insensitive)
  return content.replace(
    /^>\s*\*\*([a-zA-ZÀ-ÿ]+)\s*:\s*\*\*\s*/gim,
    (_match, wordRaw: string) => {
      const word = wordRaw.trim().toLowerCase()
      const mapped = typeMap[word]
      return mapped ? `> [!${mapped}] ` : `> **${wordRaw}:** `
    },
  )
}
```

Notas: se a palavra não mapear (não é um tipo conhecido), devolve o blockquote original intacto (pass-through gracioso). O `remark-callout` só transforma `[!note|tip|warning|danger]`; os outros ficam blockquotes normais.

- [ ] **Step 6: Atualizar a pipeline de `convertVaultFile`**

Em `convertVaultFile` (linhas ~283-316), o bloco que aplica transforms precisa de: (a) chamar `normalizeAdmonitions`, (b) **não** chamar `convertMarkdownTables`/`preserveCodeBlocks`. Substituir as linhas correspondentes (a chamada `body = convertMarkdownTables(body)`, a chamada `body = convertDetailsBlocks(body)` e a chamada `body = preserveCodeBlocks(body)`) por:

```ts
  // Normalizar callouts custom do Vault -> marcadores [!type]
  body = normalizeAdmonitions(body)

  // Converter <details>/<summary> para <SolutionBlock>
  body = convertDetailsBlocks(body)
```

(Manter `stripWikilinks(body)` onde está — antes das transforms, para o `|` dos wikilinks não quebrar tabelas markdown.)

- [ ] **Step 7: Remover emissão morta de `DistributionCard`**

Em `convertVaultFile`, **apagar** o bloco que deteta DistributionCard (linhas 270-276):
```ts
  if (
    content.includes("Distribuiç") ||
    content.includes("distribuiç") ||
    content.includes("Distro")
  ) {
    usedComponents.add("DistributionCard")
  }
```

E no bloco de imports (linhas 335-341), apagar:
```ts
  if (usedComponents.has("DistributionCard")) {
    mdxImportNames.push("DistributionCard")
    iconImports.add("Boxes")
    iconImports.add("Server")
    iconImports.add("Layers")
    iconImports.add("Cpu")
  }
```

Isto remove imports não-usados (`DistributionCard`, `Boxes`, etc.) que eram escritos no `.mdx` mas nunca instanciados (lint morto). `DistributionCard` fica disponível via `useMDXComponents` para autoria manual.

- [ ] **Step 8: Threading completo de frontmatter + `meta` no `ConvertResult`**

Em `convertVaultFile`, substituir a extração de meta (linhas 254-259) por uma que captura tudo:

```ts
  const title = frontmatter.title ?? frontmatter.topic ?? topicNumber
  const meta = {
    title: String(title),
    objective: String(frontmatter.objective ?? ""),
    topic: String(frontmatter.topic ?? code),
    weight: typeof frontmatter.weight === "number" ? frontmatter.weight : 2,
    tags: Array.isArray(frontmatter.tags) ? frontmatter.tags.map(String) : [],
  }
  // Campos derivados para o TopicHero
  const objective = meta.objective
  const weight = meta.weight
  const pages = meta.tags[0] ?? ""
```

Atualizar a interface `ConvertResult` (linhas 239-243) para incluir `meta`:

```ts
interface ConvertResult {
  mdxContent: string
  toc: Array<{ id: string; level: number; text: string }>
  components: string[]
  meta: { title: string; objective: string; topic: string; weight: number; tags: string[] }
}
```

No `return` final de `convertVaultFile` (linhas 364-368), adicionar `meta`:

```ts
  return {
    mdxContent,
    toc,
    components: Array.from(usedComponents),
    meta,
  }
```

- [ ] **Step 9: `processVaultDir` devolve metas**

Em `processVaultDir`, recolher o `meta` de cada ficheiro e devolvê-lo. Alterar a assinatura para devolver `{ count, skipped, metas }`. No sítio onde se chama `convertVaultFile` (linhas 423-429), capturar `meta`:

```ts
      const { mdxContent, meta } = convertVaultFile(
        vaultPath,
        config.code,
        config.accent,
        topicNumber,
      )
      metas[`${config.code}/${slug}`] = meta
```

No início de `processVaultDir` declarar `const metas: Record<string, ConvertResult["meta"]> = {}`. No fim (antes do `console.log` final), `return { count, skipped, metas }`. Substituir o `console.log` final da função para não depender de retorno antigo.

- [ ] **Step 10: Barrel — usar `github-slugger` + emitir `mdxMetaRegistry`**

Na secção do barrel (linhas 457-535), três mudanças:

1. **Acumular metas** das chamadas a `processVaultDir`. No `for` do `main` (linhas 451-454), recolher:
```ts
  const allMetas: Record<string, ConvertResult["meta"]> = {}
  for (const dirName of Object.keys(VAULT_DIR_MAP)) {
    if (ONLY_CODE && !VAULT_DIR_MAP[dirName].code.startsWith(ONLY_CODE)) continue
    const result = processVaultDir(dirName)
    Object.assign(allMetas, result.metas)
  }
```
(Adaptar `processVaultDir` para o novo retorno — ver Step 9.)

2. **Migrar `slugifyHeading` + `extractToc` para `github-slugger`**. Substituir a função local `slugifyHeading` (linhas 467-474) por uso de instância partilhada:
```ts
  const tocSlugger = new GithubSlugger()
  function slugifyHeading(text: string): string {
    return tocSlugger.slug(text)
  }
```
Manter `extractToc` como está (já chama `slugifyHeading`).

3. **Escrever `mdxMetaRegistry` no barrel**. No array `barrelContent` (linhas 516-530), adicionar antes do fecho:
```ts
    "",
    "import type { TopicFrontmatter } from \"@/lib/topic-loader\"",
    "",
    "export const mdxMetaRegistry: Record<string, TopicFrontmatter> = {",
    metaEntries.join(",\n"),
    "}",
    "",
```

E construir `metaEntries` no loop de ficheiros (linhas 496-514). Como o meta vem de `allMetas` (preenchido por `processVaultDir`, que corre **antes** do bloco do barrel), dentro do loop adicionar:
```ts
      const key = `${code}/${slug}`
      if (allMetas[key]) {
        metaEntries.push(`  ${JSON.stringify(key)}: ${JSON.stringify(allMetas[key])}`)
      }
```
(Declarar `const metaEntries: string[] = []` junto de `entries`/`tocEntries`.)

- [ ] **Step 11: Regenerar os 119 `.mdx` + barrel**

Run (a partir de `frontend/`):
```
cmd /c "npx tsx scripts/convert-vault-to-mdx.ts --force"
```
Expected: logs `✅ {code}/{slug} ← {file}.md` por tópico (~119), depois `📊 {label}: N tópicos convertidos` por manual, e no fim `📦 Barrel file gerado: .../src/content/manuals/index.ts (119 entries, 119 TOCs)`.

Verificar que o barrel tem o novo export:
```
cmd /c "findstr /n mdxMetaRegistry src\content\manuals\index.ts"
```
Expected: pelo menos uma linha com `export const mdxMetaRegistry: Record<string, TopicFrontmatter>` e uma com o `import type { TopicFrontmatter }`.

Verificar que um `.mdx` com tabela já não tem `&lt;strong&gt;` nem `<table`:
```
cmd /c "findstr /c:\"<table\" src\content\manuals\010\o-basico-sobre-a-linha-de-comando.mdx"
```
Expected: (nenhuma linha) — as tabelas são agora markdown (`|`).

- [ ] **Step 12: Verificar lint + build (gate de integração)**

Run: `cmd /c "npm run lint"`
Expected: PASS (sem warnings de imports não-usados).

Run: `cmd /c "npm run build"`
Expected: BUILD PASS. Se falhar, os erros mais prováveis são: (a) algum `.mdx` com markdown inválido após as transforms — ler o ficheiro indicado; (b) forma do `mdxJsxFlowElement` — voltar a Task 4 Step 1.

- [ ] **Step 13: Commit**

```bash
git add scripts/convert-vault-to-mdx.ts package.json package-lock.json src/content/manuals
git commit -m "fix(converter): tabelas markdown + admonitions + meta + slug

- tabelas: deixar de emitir <table> HTML (remark-gfm trata); mata
  bugs de bold (&lt;strong&gt;), backticks literais e oklch inline
- escapeForJsx removido (so existia para tabelas HTML)
- normalizeAdmonitions: > **Nota:** -> [!note] (remark-callout -> Callout)
- frontmatter threading completo + novo mdxMetaRegistry no barrel
- TOC via github-slugger (consistente com rehype-slug -> anchors corretos)
- sem emissao de DistributionCard (import morto)
- regenerados 119 .mdx + barrel"
```

---

## Task 7: `page.tsx` lê meta real + `mdx-auto-register` expõe `meta`

**Files:**
- Modify: `src/lib/mdx-auto-register.ts`.
- Modify: `src/app/manuals/[code]/[slug]/page.tsx`.

- [ ] **Step 1: Expor `meta` em `getMdxTopics()`**

Em `src/lib/mdx-auto-register.ts`:

1. Atualizar o import do barrel (linha 11) para incluir `mdxMetaRegistry`:
```ts
import { mdxRegistry, mdxTocRegistry, mdxMetaRegistry } from "@/content/manuals"
```

2. Importar `TopicFrontmatter`:
```ts
import type { TocItem, TopicFrontmatter } from "./topic-loader"
```

3. Adicionar `meta` ao tipo `MdxEntry`:
```ts
type MdxEntry = {
  Component: React.ComponentType
  toc: TocItem[]
  meta: TopicFrontmatter
}
```

4. Em `getMdxTopics()`, popular `meta` (com defaults seguros se o slug não existir no registry):
```ts
    const meta: TopicFrontmatter = mdxMetaRegistry[slug] ?? {
      title: slug,
    }
    topics[slug] = { Component, toc, meta }
```

- [ ] **Step 2: `page.tsx` usa `mdxEntry.meta` em vez da frontmatter falsa**

Em `src/app/manuals/[code]/[slug]/page.tsx`, substituir o bloco de frontmatter falsa (linhas 55-61):
```tsx
  const frontmatter = {
    title: topic.title,
    objective: "",
    topic: code,
    weight: 0,
    tags: [],
  }
```
por:
```tsx
  const frontmatter = {
    title: topic.title,
    ...mdxEntry.meta,
  }
```

(`topic.title` continua a ser a fonte canónica do título na navegação; o spread de `mdxEntry.meta` preenche `objective`/`topic`/`weight`/`tags` reais. Se `meta` não tiver um campo, o `TopicFrontmatter` tem defaults opcionais — o `TopicMeta` já tolera campos em falta.)

- [ ] **Step 3: Verificar lint + build**

Run: `cmd /c "npm run lint"`
Expected: PASS.

Run: `cmd /c "npm run build"`
Expected: BUILD PASS.

- [ ] **Step 4: Commit**

```bash
git add src/lib/mdx-auto-register.ts src/app/manuals/[code]/[slug]/page.tsx
git commit -m "feat(manuals): TopicMeta com frontmatter real

- getMdxTopics popula meta a partir de mdxMetaRegistry (defaults seguros)
- page.tsx substitui frontmatter falsa por mdxEntry.meta
- TopicMeta passa a mostrar objective/weight/tags reais do Vault"
```

---

## Task 8: Remover código morto (stack react-markdown)

**Files:**
- Modify: `package.json` (remover dep `react-markdown`).
- Delete: `src/components/markdown/markdown-renderer.tsx`, `prose-elements.tsx`, `code-block.tsx`, `command-table.tsx`, `is-command-table.ts`.

- [ ] **Step 1: Confirmar que os ficheiros não têm importadores vivos**

Run: `cmd /c "npx eslint src"` antes de apagar (sanidade).

Correr uma pesquisa para confirmar 0 imports dos ficheiros a apagar (exceto entre si próprios):
```
cmd /c "findstr /s /m /i \"markdown-renderer prose-elements code-block command-table is-command-table\" src"
```
Expected: referências apenas dentro de `src/components/markdown/` (os próprios ficheiros) — nenhum import de fora. **`copy-button.tsx` e `details-disclosure.tsx` NÃO se apagam** (usados por `TerminalPre` e `SolutionBlock` respetivamente).

- [ ] **Step 2: Apagar os 5 ficheiros**

```
cmd /c "del src\components\markdown\markdown-renderer.tsx src\components\markdown\prose-elements.tsx src\components\markdown\code-block.tsx src\components\markdown\command-table.tsx src\components\markdown\is-command-table.ts"
```

- [ ] **Step 3: Remover a dep `react-markdown`**

Run: `cmd /c "npm uninstall react-markdown"`
Expected: `removed N packages`; `react-markdown` desaparece de `dependencies` no `package.json`.

- [ ] **Step 4: Verificar lint + build**

Run: `cmd /c "npm run lint"`
Expected: PASS.

Run: `cmd /c "npm run build"`
Expected: BUILD PASS. (Se falhar com "cannot find module react-markdown", há um import esquecido — pesquisar e remover.)

- [ ] **Step 5: Commit**

```bash
git add -A src/components/markdown package.json package-lock.json
git commit -m "chore: remover stack react-markdown morta

- apagados markdown-renderer/prose-elements/code-block/command-table/is-command-table
- desinstalada dep react-markdown
- sobrevivem copy-button (TerminalPre) e details-disclosure (SolutionBlock)"
```

---

## Task 9: Verificação final + spot-check visual

- [ ] **Step 1: Lint + build limpos**

Run: `cmd /c "npm run lint"`
Expected: PASS (zero erros).

Run: `cmd /c "npm run build"`
Expected: BUILD PASS; `generateStaticParams` pré-renderiza os 119 tópicos sem erros.

- [ ] **Step 2: Spot-check visual (dev server)**

Run: `cmd /c "npm run dev"` e abrir no browser os seguintes tópicos:

1. **Tabela** — `http://localhost:3000/manuals/010/o-basico-sobre-a-linha-de-comando`
   - Sem `&lt;strong&gt;` literal no ecrã; sem backticks crus nas células; tabela estilizada (header `bg-cream`, bordas via tokens, hover suave nas linhas).
2. **Callout** — um tópico com `> **Nota:**` ou `> **Aviso:**` (ex. pesquisar nos manuais 010/020). Deve renderizar `<Callout>` com ícone, label PT-PT ("Nota"/"Aviso") e bg colorido por tipo.
3. **SolutionBlock** — `http://localhost:3000/manuals/102/105-1-personalizar-e-trabalhar-no-ambiente-shell`
   - Disclosure "Solução" aberta; inline code legível (sem `!important` a sobrepor mal); código de terminal com chrome tokenizado (sem hex hardcoded — inspeção visual: cores consistentes com o tema).
4. **TopicMeta preenchida** — em qualquer tópico, a sidebar direita mostra objective/weight/tags reais (não vazios).
5. **Anchor de TOC** — click num item do TOC esquerdo → scroll suave para a secção certa (slug match = `github-slugger` em ambos os lados).
6. **TerminalPre** — um bloco de código com `$ comando` e `# comentário`: prompt verde, comentário baço, output normal; tráfego de luzes no header.

- [ ] **Step 3: (Opcional) Documentar no Vault**

Registar a evolução no Histórico (§8.2 do `agents.md`) e atualizar `[[Arquitetura dos Manuais]]` com a nota de que o pipeline é agora MDX puro + remark-gfm + remark-callout + rehype-slug. (Conforme `agents.md` §1.3 — documentar é parte do trabalho.)

---

## Convenções e riscos (leitura rápida)

- **PT-PT** em todos os commits e textos de UI/código.
- **Norma 01:** zero cores/sombras inline em `.tsx`; toda cor = token em `:root` + `@theme inline`. Os `style={{}}` removidos neste plano são as últimas violações conhecidas nos componentes MDX.
- **ADR-001:** tudo build-time (remark/rehype/gray-matter/tsx) ou CSS — zero deps de runtime adicionadas.
- **Windows:** sempre `cmd /c "npm run ..."`. `npx tsx` para o conversor.
- **R1 (shape `mdxJsxFlowElement` no @next/mdx 16):** validado no Task 4 Step 3; o `build` é o gate.
- **R2 (tabelas markdown sem colspan/rowspan):** se o Vault as tiver, o `remark-gfm` ignora e o conteúdo fica legível (raro em notas LPI). Exceção controlada se surgir.
- **R3 (slug drift):** morto — conversor e `rehype-slug` usam ambos `github-slugger` sobre o mesmo texto de heading.
- **Rollback:** cada tarefa é um commit atómico; `git revert <sha>` por tarefa se algo correr mal. A regeneração (Task 6) é reentrante (`--force`).
