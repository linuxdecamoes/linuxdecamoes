# MDX Template — Polish Premium · Spec de Design

- **Data:** 2026-07-22
- **Projeto:** Linux de Camões (`linuxdecamoes/frontend`)
- **Estado:** Aprovado (brainstorming concluído)
- **Âmbito:** Template de rendering MDX dos tópicos em `/manuals/[code]/[slug]`

---

## 1. Contexto & problema (causa raiz)

A perceção de "o merge estragou o visual" **não foi um merge do git** — `master` é linear. O estrago veio da migração `react-markdown` → MDX em dois commits:

- `8c817f0` — conversão em massa de 119 ficheiros Vault→MDX + barrel.
- `9db6783` (HEAD) — remoção do `MarkdownRenderer` (fallback react-markdown).

Resultado: todo o conteúdo passa pelo `@next/mdx` + `mdx-components.tsx`, mas (a) o conteúdo gerado tem bugs, (b) os componentes premium já desenhados (`Callout`, `ExerciseCard`, `DistributionCard`) ficaram órfãos (0 usos, não registados), (c) coexistem estilos prose divergentes e (d) há violações de Norma 01 (hex/oklch inline).

**A shell 3-zone está excelente e não é o problema** (`glass-card`, `premium-atmosphere` grain SVG, tokens OKLCH, `ReadingProgress`, TOC scroll-spy). A avaria concentra-se no conteúdo gerado + no component map meio-aplicado.

---

## 2. Objetivos & não-objectivos

### Objetivos
1. Corrigir a causa raiz no conversor e **regenerar os 119 `.mdx`** limpos.
2. Ligar os componentes premium (`Callout`, `ExerciseCard`, `DistributionCard`) globalmente.
3. Unificar os estilos prose num só sítio (`mdxProse`) e token-izar tudo (Norma 01).
4. Garantir anchors de TOC corretos (slug drift zero).
5. Preencher a `TopicMeta` com frontmatter real.

### Não-objectivos (fora de âmbito)
- Dark mode (hoje só existe light; seria feature nova invasiva).
- Rota `/dashboard/study/[code]/[topic]` (layout RAG diferente, outra feature).
- `/lab` (terminal, Phase 5 pendente).
- Auto-emissão de `ExerciseCard`/`DistributionCard` pelo conversor (ficam para autoria manual).
- Novo conteúdo / reescrita de tópicos.

---

## 3. Decisões locked (do brainstorming)

| Eixo | Decisão | Racional |
|---|---|---|
| **Âmbito** | **B** — fix + unify + wire premium; sem dark mode | Ponto doce para "visual premium" sem ser feature nova |
| **Estratégia** | **A** — fix conversor + regenerar 119 | Causa raiz, repetível; ficheiros marcados "NÃO EDITAR À MÃO" |
| **Arquitetura** | **C** — Híbrida | Conversor mantém transformações estruturais + emite markdown tables & admonition markers; `remark-gfm` + `rehype-slug` + um pequeno `remark-callout` fazem o resto na compilação |

Premissas verificadas: `../Vault/` existe (125 `.md`); os 119 `.mdx` estão intactos desde `8c817f0` (só o barrel `index.ts` mexido, também auto-gen) → **regenerar é seguro**. O Vault usa **0 callouts Obsidian** e **8 callouts custom** (`> **Nota:**` / `> **Dica:**` / `> **Aviso:**`...) → o conversor **normaliza**, não faz passthrough.

---

## 4. Arquitetura (pipeline após polish)

```
Vault/*.md ─► convert-vault-to-mdx.ts (EMAGRECIDO) ─► *.mdx ─► @next/mdx + plugins ─► React premium ─► page.tsx (meta real)
```

1. **Conversor (slimmed):** só transformações estruturais — frontmatter, `TopicHero`, `SolutionBlock` (para `<details>`), wikilinks, normalização de slug, **tabelas markdown**, **admonitions normalizados**, **threading de meta completa** + emissão de `mdxMetaRegistry`.
2. **Compilação MDX** (`next.config.ts` `createMDX`): `remark-gfm` + `remark-callout` (nosso) + `rehype-slug`.
3. **Registo global** (`mdx-components.tsx` `useMDXComponents`): `Callout`, `ExerciseCard`, `DistributionCard` em scope.
4. **Página** (`page.tsx`): lê `mdxMetaRegistry` → `TopicMeta` com dados reais.

**Inalterado:** shell 3-zone, `glass-card`, `premium-atmosphere`, `ReadingProgress`, TOC, `PrevNextNav`, rota `/dashboard/study`, `/lab`.

---

## 5. Design detalhado

### 5.1 Correções do conversor (`scripts/convert-vault-to-mdx.ts`)

| # | Alteração | Mata problema |
|---|---|---|
| 1 | **Tabelas → markdown.** Deixar de emitir `<table className=... bg-[oklch(0.96_0.02_75)]>`; emitir sintaxe markdown (`\| col \| ... \|`). | 1 (bold), 2 (backticks), 3 (oklch inline) |
| 2 | **`escapeForJsx` (linhas 123-131):** remover pré-conversão `**x**`→`<strong>` dentro de células (não é mais preciso). Escaping só para texto JSX genuíno. | 1 |
| 3 | **Admonitions normalizados:** `> **Nota:**`→`[!note]`, `> **Dica:**`→`[!tip]`, `> **Aviso/Atenção/Importante:**`→`[!warning]`, `> **Perigo:**`→`[!danger]`. Título preservado. | 19 |
| 4 | **Frontmatter threading (linhas 252-259, 268-281):** passar meta completa (`objective/topic/weight/tags[]`) ao `TopicHero` + emitir **`mdxMetaRegistry`** novo no barrel (`slug → {objective, topic, weight, tags[]}`). | 16 |
| 5 | **Slug TOC consistente:** usar `github-slugger` (já instalado) para cozer o `mdxTocRegistry` com o **mesmo texto de heading** que `rehype-slug` vê no render. | 18 |
| 6 | `ExerciseCard`/`DistributionCard` **não** são emitidos pelo conversor. | — |

**Regeneração:** re-correr o conversor sobre os 125 `.md` → 119 `.mdx` + barrel (com `mdxMetaRegistry`) regenerados.

### 5.2 Compilação MDX (`next.config.ts`)

```ts
// dentro de createMDX options:
remarkPlugins: [remarkGfm, remarkCallout],
rehypePlugins: [rehypeSlug],
```

**Sem deps novas** — `remark-gfm@4`, `rehype-slug@6`, `github-slugger@2` já instalados (confirmado em `package.json`). Tudo build-time → ADR-001 ok.

### 5.3 `remark-callout` (novo, `src/lib/remark-callout.ts`, ~50 linhas)

Percorre o mdast; quando um blockquote tem o 1º parágrafo a começar por `[!type]`, transforma-o num nó `mdxJsxFlowElement`:

```jsx
<Callout type="warning" title="...">{children}</Callout>
```

`remark-gfm` não suporta alerts nativamente (são extensão GitHub), daí o plugin. Tipos válidos: `note`, `tip`, `warning`, `danger`. Caso-limite: blockquote com `[!` inválido ou callout vazio → cai para blockquote simples.

### 5.4 Registo global (`src/mdx-components.tsx`)

Adicionar ao objeto retornado por `useMDXComponents` (junto a `mdxProse`):

```ts
return { ...mdxProse, Callout, ExerciseCard, DistributionCard };
```

Ficam em scope para autoria manual em qualquer `.mdx` e para o nó emitido pelo `remark-callout`.

### 5.5 Unificação de prose (`mdxProse`)

| Elemento | Hoje | Depois |
|---|---|---|
| **h3** | inline `style={{ borderLeft: "3px solid var(--primary)", opacity: 1 }}` (linhas 87-98) | classe `border-l-2 border-primary/40 pl-4` (sem inline style) |
| **inline `code`** | `bg-muted/60 text-[0.85em]` (linha 63); `SolutionBlock` combate com `!important` | base melhorada `bg-muted/70 px-1.5 py-0.5 rounded font-mono` → remover `!important` do `SolutionBlock` |
| **`table`/`thead`/`tbody`/`tr`/`th`/`td`** | não mapeados (tabelas vinham HTML cru do conversor) | novas entradas com tokens (`--table-header-bg`, `--table-border`) |

### 5.6 `TerminalPre`/`TerminalCode` tokenizados

Substituir hex hardcoded (`#0c1018`, `#ff5f57`, `#ffbd2e`, `#28c840`, `#e2e8f0`) por tokens. Parser melhorado: distingue linha-prompt (`$ `/`# ` shell) de linha de saída e de comentário (em vez de pintar só o prompt).

Tokens novos: `--terminal-bg`, `--terminal-dot-{red,amber,green}`, `--terminal-text`, `--terminal-prompt`, `--terminal-output`.

### 5.7 Sistema de accent — REUTILIZAR o canónico

Já existe um sistema de accent **canónico e tipado** em `src/lib/manuals.ts` (linhas 1, 19-53), usado em várias páginas:

```ts
export type Accent = "sage" | "coral" | "amber" | "terracotta" | "iris"
export const accentClasses: Record<Accent, { badge: string; soft: string; strong: string; dot: string }> = { ... }
```

Cada manual tem um accent (010=sage, 020=coral, 030=amber, 050/101=terracotta, 102=iris). Os tokens (`--sage`, `--coral`, `--amber`, `--terracotta`, `--iris` + variantes `-soft`) **já vivem em `globals.css`** e são expostos via `@theme inline` (daí utilidades como `bg-sage-soft`, `text-iris`).

**Ação:** substituir a construção frágil `var(--${accent})` (e oklch arbitrário) nos componentes premium por consumo de `accentClasses[accent]` (className estática). **Não se cria mapa novo, nem tokens de accent novos.** `ExerciseCard`, `DistributionCard` e `TopicHero` passam a receber `accent?: Accent` e a usar `accentClasses`. Type-safe e Norma 01-safe.

### 5.8 Componentes premium refactor

| Componente | Hoje | Depois |
|---|---|---|
| **`Callout`** (`callout.tsx:36-61`) | `bg-[oklch(...)]` arbitrário | mapa estático `Record<CalloutType, string>` de classNames → CSS per-type em `globals.css` |
| **`ExerciseCard`** (`exercise-card.tsx:34-36`) | `var(--${accent})` dinâmico | `accent?: Accent` + `accentClasses[accent]` (reutiliza `@/lib/manuals`) |
| **`DistributionCard`** (`distribution-card.tsx:11-16,43`) | `bg-[oklch(...)]` + var dinâmica | `accent?: Accent` + `accentClasses`; **registado mas não forçado** (sem auto-emissão) |
| **`TopicHero`** (`topic-hero.tsx:51-55`) | inline `style={{ color: "oklch(...)" }}` watermark | token `--hero-watermark`; accent via `accentClasses` |

### 5.9 Tokens novos (todos em `:root` + `@theme inline` em `globals.css`)

- Paleta callout (4 tipos × {bg, border, icon}).
- Paleta terminal (7: bg, 3 dots, text, prompt, output).
- `--table-header-bg`, `--table-border`.
- `--hero-watermark`.

**Sem tokens de accent novos** — `--sage`/`--coral`/`--amber`/`--terracotta`/`--iris` (+ `-soft`) já existem (§5.7).

### 5.10 `page.tsx` meta real (`src/app/manuals/[code]/[slug]/page.tsx`)

Substituir frontmatter falsa (linhas 55-61: `objective:""`, `weight:0`, `tags:[]`) por leitura de `mdxMetaRegistry[slug]` → `TopicMeta` preenchida. O `mdxMetaRegistry` produz dados com a forma do tipo **`TopicFrontmatter`** (já re-exportado de `src/lib/topic-loader` via `manuals.ts:230`) — reutilizar este tipo em vez de criar um novo. Defaults seguros se campos em falta.

### 5.11 Limpeza de código morto

Remover:
- Dep `react-markdown` do `package.json`.
- `src/components/markdown/markdown-renderer.tsx`
- `src/components/markdown/prose-elements.tsx`
- `src/components/markdown/code-block.tsx`
- `src/components/markdown/command-table.tsx`
- `src/components/markdown/is-command-table.ts`

**Sobrevivem:** `copy-button.tsx` (usado por `TerminalPre`) e `details-disclosure.tsx` (usado por `SolutionBlock`).

---

## 6. Casos-limite & tolerância a erros

- **Conversor:** tabela sem header, admonition fora das keywords, fence dentro de tabela → pass-through gracioso (fica markdown cru, não parte conteúdo).
- **`remark-callout`:** `[!` inválido ou callout vazio → blockquote simples.
- **`page.tsx`:** tópico sem frontmatter → defaults seguros (sem crash).
- **Tabelas complexas (colspan/rowspan):** markdown não expressa; se o Vault as tiver, exceção controlada durante a implementação (raro em notas LPI).

---

## 7. Riscos

| ID | Risco | Mitigação |
|---|---|---|
| R1 | Shape do nó `mdxJsxFlowElement` do `remark-callout` para `@next/mdx` 16 | Plugin pequeno; testar num tópico primeiro; o `build` apanha erros globalmente |
| R2 | Tabelas markdown sem colspan/rowspan → perda de info | Escanear Vault durante implementação; exceção controlada se existir |
| R3 | Inconsistência de slug conversor↔render | Alimentar `github-slugger` com o mesmo texto de heading em ambos os lados |
| R4 | Custo de build (remark-gfm+rehype-slug em 119 ficheiros) | Negligenciável |

---

## 8. Verificação

Sem test runner no projeto (scripts: `dev`, `build`, `start`, `lint`). Gate de integração = **build pre-renderiza os 119 tópicos via `generateStaticParams`** (qualquer erro de compilação MDX rebenta o build).

Comandos (Windows, via `cmd /c`):
```
cmd /c "npm run lint"
cmd /c "npm run build"
```

Spot-check visual pós-build:
- Tópico com tabela (ex.: `010/o-basico-sobre-a-linha-de-comando`) — sem `&lt;strong&gt;` literal, sem backticks crus, tabela estilizada via tokens.
- Tópico com admonition (um dos 8 callouts custom) → renderiza `<Callout>`.
- Tópico com `SolutionBlock` (ex.: `102/105-1-...`) → sem `!important`, código legível.
- `TopicMeta` preenchida (objective/weight/tags).
- Click num anchor do TOC → scroll correto (slug match).

---

## 9. Ordem de implementação (rollout)

1. Tokens (`globals.css`: paleta callout + terminal + tabela + `--hero-watermark`, `@theme inline`).
2. Token-izar `TerminalPre` + unificar prose (h3/classe, inline-code base, entradas `table/*`) + remover `!important` do `SolutionBlock`.
3. Refactor componentes premium → tokens + `accentClasses` reutilizado de `@/lib/manuals`.
4. `remark-callout` + wire `next.config.ts`.
5. Registar premium comps no `useMDXComponents`.
6. Fixes do conversor (5.1) + **regenerar 119**.
7. `page.tsx` ler meta real.
8. Remover código morto (5.11).
9. Verificar: `lint` + `build` + spot-check visual.

---

## 10. Inventário de ficheiros tocados

**Criar:**
- `src/lib/remark-callout.ts`

**Modificar:**
- `src/app/globals.css` (tokens)
- `src/mdx-components.tsx` (prose unify + registo + TerminalPre tokens)
- `src/components/mdx/callout.tsx`, `exercise-card.tsx`, `distribution-card.tsx`, `topic-hero.tsx`, `solution-block.tsx` (tokens/accent via `accentClasses`)
- `next.config.ts` (plugins)
- `scripts/convert-vault-to-mdx.ts` (5 fixes)
- `src/lib/mdx-auto-register.ts` (expor `mdxMetaRegistry`)
- `src/app/manuals/[code]/[slug]/page.tsx` (meta real)
- `package.json` (remover `react-markdown`)

**Reutilizar (ler, sem modificar):**
- `src/lib/manuals.ts` — `Accent`, `accentClasses` (§5.7)
- `src/lib/topic-loader.ts` — tipo `TopicFrontmatter` (§5.10)

**Regenerar (auto-gen):**
- `src/content/manuals/**/*.mdx` (119)
- `src/content/manuals/index.ts` (barrel + `mdxMetaRegistry`)

**Apagar:**
- `src/components/markdown/{markdown-renderer, prose-elements, code-block, command-table, is-command-table}.tsx`
