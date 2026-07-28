---
tipo: arquitetura
titulo: "Arquitetura dos Manuais"
projeto: Linux de Camões
data_criacao: 2026-07-17
ultima_revisao: 2026-07-21
versao: "2.0"
idioma: PT-PT
status: Redesign premium com layout 3-zone, CommandTable interativa e SSG via generateStaticParams
rotas: /manuals, /manuals/[code], /manuals/[code]/[slug]
fonte_canonica: frontend/src/lib/manuals.ts
conteudo: ../Vault/ (114 ficheiros .md com YAML frontmatter)
---

# 📚 Arquitetura dos Manuais — Linux de Camões

Este documento descreve a arquitetura de conteúdo da área **Manuais** da
plataforma: o modelo de dados, as 3 rotas, o mapeamento acento→token (Norma 01),
o pipeline de parse do Vault LPI para markdown renderizado e o **contrato futuro**
com o backend FastAPI.

> **Estado atual:** Redesign premium (2026-07-21). Estética "quiet luxury"
> (glassmorphism discreto, tipografia protagonista, sombras subtis), layout
> 3-zone no tópico (TOC sticky + Conteúdo + Meta sticky), CommandTable
> interativa com CopyButton, Accordion Base UI agrupado por objective, TOC
> scroll-spy via IntersectionObserver. Única dependência runtime nova:
> `gray-matter` (build-time, parse YAML). Ver
> [`docs/superpowers/specs/2026-07-21-manuals-redesign-design.md`](./superpowers/specs/2026-07-21-manuals-redesign-design.md)
> e [`docs/superpowers/plans/2026-07-21-manuals-redesign.md`](./superpowers/plans/2026-07-21-manuals-redesign.md).

---

## 1. Objetivo

Oferecer um índice navegável dos manuais de certificação LPI (Linux
Professional Institute), em português europeu, com:

- uma **página de listagem** dos 6 manuais agrupados por nível (Essentials + LPIC-1);
- uma **página de detalhe** por manual, com tópicos num Accordion Base UI agrupado por objective;
- uma **página de tópico** 3-zone com conteúdo markdown rico (CommandTable, CodeBlock, DetailsDisclosure) + TOC scroll-spy + ReadingProgress;
- **zero cores inline** — todo o acento cromático vem de tokens OKLCH (Norma 01);
- **zero deps runtime de animação** — só `tw-animate-css` + keyframes CSS (ADR-001).

---

## 2. Modelo de dados

Definido em `src/lib/manuals.ts` (fonte única de verdade para as 3 rotas).

```ts
export type Accent = "sage" | "coral" | "amber" | "terracotta" | "iris";

export type ManualLevel = "essentials" | "lpic1";

export type ManualTopic = { slug: string; title: string };

export type Manual = {
  code: string;          // ex.: "101"
  title: string;         // ex.: "LPIC-1 Parte 1"
  description: string;   // 1 frase PT-PT
  accent: Accent;        // acento cromático do manual
  level: ManualLevel;    // agrupamento na listagem
  topics: ManualTopic[]; // lista ordenada de tópicos (slug canônico)
};
```

**Helpers exportados:**
| Função | Assinatura | Devolução |
|--------|-----------|-----------|
| `getManual(code)` | `(code: string) => Manual \| undefined` | Manual pelo código |
| `getTopic(code, slug)` | `(code, slug) => { manual, topic, index } \| undefined` | Tópico + contexto (para navegação prev/next) |
| `accentClasses` | `Record<Accent, { badge, soft, strong, dot }>` | Classes utilitárias por acento |

### 2.1 Pipeline de carregamento do conteúdo (`lib/topic-loader.ts`)

O conteúdo de cada tópico **não** vive no manifesto — vive em ficheiros `.md`
no Vault externo ([`../Vault/`](../../Vault/)), com YAML frontmatter canónico.

```
Manifesto (slug) ──▶ loadTopicBySlug(slug) ──▶ LoadedTopic | null
                         │
                         ├─ findTopicFile: readdir + filenameToSlug + normalize
                         ├─ gray-matter: parse YAML frontmatter
                         ├─ resolveWikilinks: [[X|Y]] → [Y](#slug)
                         └─ extractHeadings: ## / ### → TocItem[]
```

**Tipos exportados:**

```ts
type TopicFrontmatter = {
  title: string;
  objective?: string;
  topic?: string;
  weight?: number | string;
  tags?: string[];
  prev?: string;
  next?: string;
};

type LoadedTopic = {
  frontmatter: TopicFrontmatter;
  content: string;        // markdown com wikilinks resolvidos
  headings: TocItem[];    // para TOC scroll-spy
};

type TocItem = { id: string; level: 2 | 3; text: string };
```

**Normalização de slugs (crítico):** O slug do manifesto (`a-evolucao-do-linux-...`)
é ASCII lowercase com hífens. Os ficheiros do Vault têm títulos PT com acentos e
prefixo `T## - ` (`T01 - A evolução do Linux....md`). `filenameToSlug()` faz:
1. Strip `.md`
2. Strip prefixo `^t?\d+(?:[.\-]\d+)*\s*[-—–]\s*` (lida com hífen, em-dash, en-dash)
3. `normalize("NFD").replace(/[\u0300-\u036f]/g, "")` — strip diacritics
4. lowercase + `[^a-z0-9]+ → -`

IDs de heading são gerados via `github-slugger` (preserva diacritics), alinhados
com `rehype-slug` no renderer. **Não usar** slugify que strip diacritics para IDs
de heading — quebraria a correspondência TOC↔DOM.

---

## 3. Os 6 manuais

| Código | Título | Nível | Acento | # Tópicos |
|--------|--------|-------|--------|----------|
| `010` | Linux Essentials | `essentials` | `sage` | 19 |
| `020` | Security Essentials | `essentials` | `coral` | 17 |
| `030` | Web Development Essentials | `essentials` | `amber` | 18 |
| `050` | Open Source Essentials | `essentials` | `terracotta` | 17 |
| `101` | LPIC-1 Parte 1 | `lpic1` | `terracotta` | 23 |
| `102` | LPIC-1 Parte 2 | `lpic1` | `iris` | 19 |
| | | | **Total manifesto** | **113** |

**Cobertura real no Vault:** ~110/113 tópicos têm `.md` correspondente (96.5%).
4 tópicos têm títulos divergentes manifesto↔Vault (dessincronização documental,
não bug de código) — ver §8.

> ℹ️ **Vault total vs manifesto.** O Vault LPI tem **114 ficheiros `.md`** (fonte
> dos 1831 chunks RAG). O manifesto cobre **113** tópicos (1 ficheiro extra no
> Vault é auxiliar). A diferença fecha-se quando o conteúdo for servido pelo
> backend — ver §6.

---

## 4. Mapeamento acento → token (Norma 01)

Cada acento centraliza-se no objeto `accentClasses`:

```ts
accentClasses: Record<Accent, { badge: string; soft: string; strong: string; dot: string }>
```

| Acento | Fundo (`soft`) | Texto (`strong`) | Dot/Badge | Par OKLCH |
|--------|---------------|------------------|-----------|-----------|
| `sage` | `bg-sage-soft` | `text-sage` | `bg-sage` | sage / sage-soft |
| `coral` | `bg-coral-soft` | `text-coral` | `bg-coral` | coral / coral-soft |
| `amber` | `bg-amber-soft` | `text-amber` | `bg-amber` | amber / amber-soft |
| `terracotta` | `bg-peach` | `text-terracotta` | `bg-terracotta` | terracotta (escuro) + **peach** (claro) |
| `iris` | `bg-iris-soft` | `text-iris` | `bg-iris` | iris / iris-soft |

### 4.1 Tokens novos do redesign (globals.css `:root` + `@theme inline`)

| Token | Valor | Uso |
|-------|-------|-----|
| `--glass-bg` | `oklch(1 0 0 / 0.55)` | Fundo translúcido de `.glass-card` |
| `--glass-bg-strong` | `oklch(1 0 0 / 0.75)` | Variante mais opaca |
| `--glass-border` | `oklch(1 0 0 / 0.18)` | Borda sutil de glass cards |
| `--glass-blur` | `12px` | `backdrop-filter` em glass cards |
| `--shadow-soft` | `0 2px 8px oklch(0 0 0 / 0.04)` | Elevação padrão |
| `--shadow-float` | `0 12px 32px oklch(0 0 0 / 0.08)` | Elevação hover/modal |
| `--shadow-glass` | `0 8px 24px oklch(0 0 0 / 0.06)` | Sombra específica glass |
| `--gradient-warm` | `linear-gradient(...)` | Decorativo no header de níveis |
| `--gradient-accent` | `linear-gradient(...)` | ReadingProgress bar |
| `--bg-radial-warm` | `radial-gradient(...)` | Glow decorativo topo de `/manuals` |

**Keyframes novos:** `stagger-in`, `pulse-soft`, `reading-progress`, `copy-feedback`,
`accordion-down`, `accordion-up`. Todas cancelam em `@media (prefers-reduced-motion: reduce)`.

**Utilities em `@layer components`:** `.glass-card`, `.stagger-child`, `.stagger-list > *:nth-child(1..8)` + `:nth-child(n+9)`. Fallback `@supports not (backdrop-filter)` para navegadores antigos.

Ver [[Norma 01 - Sistema de Tokens e Cores]] para a regra completa (zero cores inline; toda a cor é token registado).

---

## 5. Rotas e componentes

### 5.1 `/manuals` (○ Static)

Listagem dos 6 manuais agrupados por nível (Essentials 4 cols + LPIC-1 2 cols em `lg`).

**Componentes:**
- `components/manuals/ManualCard.tsx` — `<Link>` com `glass-card stagger-child`, badge código com accent, `ArrowRight` com `group-hover`, contagem de tópicos, `focus-visible:ring-2`.
- `components/manuals/ManualLevelGroup.tsx` — `<section>` por nível com heading `text-terracotta` uppercase, grid responsivo.
- `app/manuals/layout.tsx` — wrapper com `<div>` decorativo `bg-radial-warm` (400px topo, `-z-10`, `aria-hidden`).

### 5.2 `/manuals/[code]` (○ Static via `generateStaticParams`)

Detalhe do manual: header com badge, label de nível, `BookOpen`, contagem.
Tópicos agrupados num Accordion Base UI por objective (primeiros 3 dígitos do slug).

**Componentes:**
- `components/manuals/TopicAccordion.tsx` (Client) — `Accordion.Root multiple` sobre `@base-ui/react/accordion`. `defaultValue` = primeiro grupo. Chevron roda via `group-data-[panel-open]:rotate-180`.
- `components/manuals/TopicRow.tsx` — linha com badge numerado padded + `ChevronRight` `group-hover:translate-x-1`.

### 5.3 `/manuals/[code]/[slug]` (○ Static via `generateStaticParams`)

**Layout 3-zone** (desktop ≥1280px): TOC sticky esq (`w-56`, `hidden lg:block`) + Conteúdo central (`max-w-3xl`) + Meta sticky dir (`w-64`, `hidden xl:block`). Mobile: TOC e Meta escondidos, `PrevNextNav` inline no fundo.

```html
<a href="#main-content" class="sr-only focus:not-sr-only ...">Saltar para o conteúdo</a>
<article id="main-content" tabIndex={-1}>
  <div class="grid xl:grid-cols-[14rem_minmax(0,1fr)_16rem]">
    <TopicToc />     <!-- sticky, IntersectionObserver scroll-spy -->
    <main>           <!-- <MarkdownRenderer content={...} frontmatter={...} /> -->
    <TopicMeta />    <!-- sticky, weight/tags/CTA + PrevNextNav -->
  </div>
</article>
```

**Componentes:**
- `components/manuals/ReadingProgress.tsx` (Client) — barra fixed top com CSS var `--progress`, scroll listener `{ passive: true }`, `role="progressbar"` + `aria-valuenow`.
- `components/manuals/PrevNextNav.tsx` — grid 2-col com `glass-card`, ícones lucide.
- `components/manuals/TopicToc.tsx` (Client) — `IntersectionObserver` com `rootMargin: "-80px 0px -70% 0px"`, scroll-spy com `aria-current`.
- `components/manuals/TopicMeta.tsx` (Client) — sticky `w-64` com weight/tags/CTA IA + PrevNextNav embutido.

---

## 6. Renderização de Markdown (`components/markdown/`)

`MarkdownRenderer` (Client) orquestra `<ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]} components={...}>`.

**Detição automática de tabelas de comandos:** `is-command-table.ts` (função pura) inspeciona o nó mdast:
- Condição A: header tem keyword `/^(comando|command|flag|op[cç][a-z]o|opt|syntax|sintaxe)$/i`, **OU**
- Condição B: todas as linhas de corpo têm `inlineCode` na primeira coluna.

Em match → `<CommandTable>`; caso contrário → `<table>` nativa com classes via `proseComponents`.

**Componentes markdown:**
| Componente | Tipo | Responsabilidade |
|-----------|------|-----------------|
| `MarkdownRenderer` | Client | Orquestra react-markdown + rehype-slug + remark-gfm |
| `CommandTable` | Client | Grid `md:grid-cols-[10rem_1fr_14rem]` + CopyButton por linha + `hover:translate-x-1` |
| `CopyButton` | Client | Botão copy com `aria-live="polite"`, animação keyframe `copy-feedback` |
| `CodeBlock` | Server-safe | Header + CopyButton embutido, fundo `bg-card-dark` (sem syntax highlight rico v1) |
| `DetailsDisclosure` | Client | Sobre `@base-ui/react/collapsible`; para exercícios `<details>` |
| `proseComponents` | Map | h1/h2/h3/p/ul/ol/li/blockquote/a/strong/em/hr + thead/tbody/tr/th/td |

**Atenção:** react-markdown 10 só gera `<details>` a partir de **HTML literal** no markdown (`<details><summary>X</summary>...</details>`). Não há syntax sugar GFM para isto. Autores de tópicos do Vault precisam de saber.

---

## 7. Decisões de design (resumo)

- **`gray-matter` (build-time)** — única nova dep runtime. Justificação: parse YAML frontmatter canónico do Vault. Não viola ADR-001.
- **`rehype-slug` + `github-slugger`** — para IDs de heading canónicos (preservam diacritics) + slugify consistente no loader.
- **`generateStaticParams`** nas 2 rotas dinâmicas — pré-gera 113 tópicos no build (quando Vault existe). Build demora ~3s vs ~2s antes.
- **Server Component boundary** — páginas são RSC; `"use client"` apenas em componentes com hooks/estado.
- **Acento por manual** (não por tópico) — identidade visual consistente.
- **`terracotta` + `peach`** como par fixo (escuro/claro) — documentado em §4.
- **`notFound()`** quando `loadTopicBySlug` retorna null — sem artigos vazios silenciosos.
- **`prefers-reduced-motion`** global guard em `globals.css:172` cancela todas as animações.

---

## 8. Verificação

- ✅ **Build local**: `cmd /c "npm run build"` → 130/130 páginas estáticas geradas em ~2s.
- ✅ **Lint**: `cmd /c "npm run lint"` → 0 erros, 0 warnings.
- ✅ **Docker**: `docker compose up -d --build frontend` → container `linuxdecamoes-frontend-1` em `localhost:3001`, servindo redesign completo.
- ✅ **Cobertura de conteúdo**: 110/113 tópicos (96.5%) renderizam markdown do Vault com HTTP 200.
- ⚠️ **4 tópicos 404** por dessincronização manifesto↔Vault:
  - `030/035-1-nocoes-basicas-de-nodejs` (Vault: `Node.js` → normaliza `node-js`)
  - `102/107-1-administrar-contas-de-utilizadores-grupos-e-ficheiros-de-sistema` (Vault singular vs manifesto plural)
  - `102/110-2-configurar-e-verificar-o-ssh` (Vault: `110.2 Configurar a segurança do host.md`)
  - `102/110-3-mantendo-o-sistema-seguro` (Vault: `110.3 Proteção de dados com criptografia.md`)
- ✅ Norma 01 + Norma 03 cumpridas (zero cores inline; PT-PT em toda comunicação visível).
- ✅ ADR-001 honrado (zero deps runtime animação).

---

## 9. Contrato futuro com o backend (FastAPI)

Hoje os dados estão em `manuals.ts` + Vault em filesystem. A migração para o
backend **mantém o mesmo shape** — basta substituir o `loadTopicBySlug` por um
*fetch* a `/api/manuals`.

**Endpoints planeados:**
| Método | Rota | Resposta |
|--------|------|----------|
| `GET` | `/api/manuals` | `Manual[]` (mesmo shape do manifesto) |
| `GET` | `/api/manuals/{code}` | `Manual` + tópicos enriquecidos |
| `GET` | `/api/manuals/{code}/{slug}` | `ManualTopic` + `LoadedTopic` (frontmatter + content + headings) |

### 9.1 Plano de integração RAG
1. Indexar os **114 tópicos** do Vault (1831 chunks) no pipeline RAG (FAISS hoje → `pgvector` futuro).
2. `/api/manuals/{code}/{slug}` lê diretamente do Vault (ou cache Redis).
3. CTA "Perguntar à IA" no `TopicMeta` aponta para `/dashboard/chat?q=...`.
4. `manuals.ts` degrada-se a *fallback* estático (SSG) para resiliência.

---

## 10. Docker e deployment

**`docker-compose.yml` serviço `frontend`:**
- `build.args.VAULT_PATH=/app/Vault` + `build.additional_contexts: vault=../Vault` (BuildKit bind mount durante `npm run build` para SSG ter acesso ao Vault).
- `environment.VAULT_PATH=/app/Vault` (runtime fallback).
- `volumes: ../Vault:/app/Vault:ro` (runtime mount).

**`frontend/Dockerfile`:**
- Builder stage: `ARG VAULT_PATH=/app/Vault` + `ENV VAULT_PATH=$VAULT_PATH`.
- `# syntax=docker/dockerfile:1` no topo (BuildKit).
- `RUN --mount=type=bind,from=vault,source=.,target=/app/Vault,readonly npm run build`.

Em Vercel/Netlify (sem acesso ao Vault no build), as rotas `[slug]` ficam todas
404 — recomenda-se pré-build local com Vault access + push do `.next/standalone`
para o deploy.

---

## Pipeline de conteúdo MDX (estado após polimento premium · 2026-07-22)

Os manuais públicos (`/manuals/[code]/[slug]`) são renderizados por **MDX puro**
via `@next/mdx`. O fluxo:

```text
../Vault/*.md  →  scripts/convert-vault-to-mdx.ts  →  src/content/manuals/**/*.mdx
                                                            │
                              @next/mdx  ◄─────────────────┘
                                │ remark-gfm   (tabelas markdown, autolinks)
                                │ remark-callout ([!note/tip/warning/danger] → <Callout>)
                                │ rehype-slug  (ids de heading → anchors TOC)
                                ▼
                          React (shell 3-zone premium)
```

**Conversor** (`scripts/convert-vault-to-mdx.ts`): transforma estrutural
(`TopicHero`, `SolutionBlock`, wikilinks, `<details>`, normalização de
admonitions `> **Tipo:**` → `> [!type]`); tabelas ficam em markdown (renderizadas
pelo `remark-gfm`). Gera o barrel `src/content/manuals/index.ts` com
`mdxRegistry`, `mdxTocRegistry` e `mdxMetaRegistry` (frontmatter real por tópico).

**Componentes premium** (`src/components/mdx/`): `Callout`, `ExerciseCard`,
`DistributionCard`, `SolutionBlock`, `TopicHero` — registados globalmente em
`useMDXComponents` (`src/mdx-components.tsx`), tokenizados em OKLCH (Norma 01).

**Resultados verificados (build 131/131 páginas):** tabelas `<table>` reais com
`bg-table-header-bg`; callouts `border-l-callout-{note,tip,warning,danger}`;
anchors `id="..."` coerentes com o TOC; `TopicMeta` com objective/weight/tags
reais; blocos de terminal tokenizados (zero hex inline).

Referência: `frontend/docs/superpowers/specs/2026-07-22-mdx-template-premium-polish-design.md`
e `.../plans/2026-07-22-mdx-template-premium-polish.md` (commits `41cb483`→`158d72e`).
