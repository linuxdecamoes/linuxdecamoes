# Frontend — Projeto Linux de Camões

## Visão Geral

Next.js 16.2.10 (App Router, Turbopack), React 19, Tailwind v4, shadcn/ui (`@base-ui/react`), Clerk auth. O frontend é um SPA com Server + Client Components, SSG para manuais e autenticação protegida para o dashboard.

## Stack Frontend

| Tecnologia | Uso |
| Next.js 16.2.10 | App Router, Turbopack, SSG 131 páginas |
| React 19 | Server + Client Components |
| Tailwind v4 | `@tailwindcss/postcss`, `@theme inline` |
| shadcn/ui | `@base-ui/react`, estilo `base-nova` |
| Clerk | Auth, proteção de rotas, tier grátis 10k MAU |
| Inter + JetBrains Mono | Fontes (`next/font/google`) |
| lucide-react | Ícones |
| tw-animate-css | Animações CSS (zero deps runtime) |

> **Nota:** agents.md §3 menciona "IBM Plex Sans/Mono" mas o código real (`layout.tsx:3-14`) usa **Inter** + **JetBrains Mono**. Esta é a fonte de verdade.

## Rotas e Páginas

| Rota | Tipo | Descrição | Estado |
| / | Página pública | Landing page (hero, features, footer) | ✅ |
| /manuals | Estática (SSG) | Lista de manuais LPI (6 manuais) | ✅ |
| /manuals/[code] | Estática (SSG) | Tópicos de um manual (Accordion) | ✅ |
| /manuals/[code]/[slug] | Estática (SSG) | Conteúdo MDX premium (131 páginas) | ✅ |
| /sign-in/[[...sign-in]] | Auth | Clerk sign-in (middleware) | ✅ |
| /sign-up/[[...sign-up]] | Auth | Clerk sign-up (middleware) | ✅ |
| /dashboard | Protegida | Bento Grid 8 cards (estatísticas) | ✅ |
| /dashboard/study | Protegida | Lista de manuais para estudo | ✅ |
| /dashboard/study/[code] | Client | Tópicos de um manual para estudo | ✅ |
| /dashboard/study/[code]/[topic] | Client | Estudo RAG + quiz interativo | ✅ |
| /dashboard/chat | Client | Chat RAG (respostas fundamentadas) | ✅ |
| /dashboard/quizzes | Protegida | Lista de quizzes disponíveis | ✅ |
| /dashboard/quizzes/[manual]/[slug] | Client | Quiz interativo SM-2 (repetição espaçada) | 🟡 parcial |
| /dashboard/lab | Client | Terminal interativo (em desenvolvimento) | ⏳ |
| /api/mdx-topics | API | Metadados de tópicos MDX | ✅ |

**Notas:**
- `/dashboard/quizzes`: 62/92 tópicos com quizzes gerados (30 pendentes por rate limit Groq).
- `/dashboard/lab`: Terminal interativo (em desenvolvimento).

## Design System

**Referência:** [[docs/Norma 01 - Sistema de Tokens e Cores]] · [[docs/Norma 02 - Layout Bento e Grelha]] · [[docs/Design System - OKLCH, Bento Grid e Glassmorphism]]

Não duplicar a paleta/corez aqui — a fonte de verdade canónica são os docs acima.

Princípios: OKLCH exclusivo (Norma 01), Bento Grid 12 colunas (Norma 02), glassmorphism, zero deps runtime de animação (ADR-001).

## Pipeline MDX

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

**Conversor** (`scripts/convert-vault-to-mdx.ts`): transforma estrutural (`TopicHero`, `SolutionBlock`, wikilinks, `<details>`, normalização de admonitions `> **Tipo:**` → `> [!type]`); tabelas ficam em markdown (renderizadas pelo `remark-gfm`). Gera o barrel `src/content/manuals/index.ts` com `mdxRegistry`, `mdxTocRegistry` e `mdxMetaRegistry` (frontmatter real por tópico).

Detalhes completos em [[docs/Arquitetura dos Manuais]].

## Componentes Premium

Registados globalmente em `useMDXComponents` (`src/mdx-components.tsx`), tokenizados em OKLCH (Norma 01):

- **Callout** — Notas, dicas, warnings, dangers (via `remark-callout`)
- **ExerciseCard** — Exercícios guiados e exploratórios
- **DistributionCard** — Distribuições Linux
- **SolutionBlock** — Soluções de exercícios
- **TopicHero** — Hero de tópico com watermark e badges
- **CommandTable** — Tabelas de comandos auto-detectadas com CopyButton
- **ReadingProgress** — Barra de progresso via IntersectionObserver
- **Accordion** — Base UI para objetivos em `/manuals/[code]`

**Resultados verificados (build 131/131 páginas):** tabelas `<table>` reais com `bg-table-header-bg`; callouts `border-l-callout-{note,tip,warning,danger}`; anchors `id="..."` coerentes com o TOC; `TopicMeta` com objective/weight/tags reais; blocos de terminal tokenizados (zero hex inline).

---

**Referências rápidas:**
- [[docs/Norma 01 - Sistema de Tokens e Cores]] — Paleta OKLCH
- [[docs/Norma 02 - Layout Bento e Grelha]] — Grid 12 colunas
- [[docs/Arquitetura dos Manuais]] — Pipeline MDX completo
- [[docs/ADR-001 - Abordagem A - CSS puro e SVG inline]] — Zero deps runtime
- `frontend/AGENTS.md` — Aviso Next.js 16 ("NOT the Next.js you know")