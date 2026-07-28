# Roadmap — Projeto Linux de Camões

> Última atualização: 2026-07-23 (quizzes concluídos) · Estado real do projeto, sem embellishment.

---

## Estado Atual

| Fase | Estado | Descrição | Notas |
|------|--------|-----------|-------|
| 0 — Cofre de Contexto | ✅ | Vault Obsidian criado como memória central do projeto | Definição de `agents.md` como system-prompt supremo; normas 01–03 estabelecidas; convenções bidirecionais `[[ ]]` ativas |
| 1 — Init Repo | ✅ | Setup do repositório `linuxdecamoes/` | Next.js 16.2.10 (App Router, Turbopack) + Clerk + shadcn/ui (estilo `base-nova`); `AGENTS.md` do frontend com aviso "NOT the Next.js you know" |
| 2 — Frontend Base | ✅ | Layout, auth e dashboard operacionais | Tokens OKLCH em `@theme inline` (Norma 01); Bento Grid 12 colunas (Norma 02); cartões Manuais/Streak/Quizzes/Chat; rota `/lab` esboçada; landing page com glassmorphism sticky header + footer Bento |
| 3 — Backend API | ✅ | API REST + pipeline de dados | FastAPI (Python 3.12) + SQLAlchemy/SQLModel + Alembic; PostgreSQL operacional; endpoints `/api/search`, `/api/chat`; CORS configurado |
| 4 — RAG | ✅ | IA generativa integrada | FAISS + `paraphrase-multilingual-MiniLM-L12-v2` (384 dims) + Groq (`openai/gpt-oss-20b`); 114 tópicos LPI → 1831 chunks; pipeline em `../rag/pipeline.py` |
| 5 — Quizzes | ✅ | Sistema de quizzes completo, dados a 100% | Código: API client (`lib/api.ts`), endpoint geração LLM, quiz-taker interativo, QuizzesCard, spaced repetition SM-2. **Dados:** 92/92 tópicos gerados (460 quizzes). Concluído 2026-07-23. |

---

## Pendentes (priorizados)

### 🔴 Alta prioridade

| # | Item | Descrição | Complexidade | Dependências |
|---|------|-----------|:------------:|--------------|
| 1 | ~~**Fase 6 — Quizzes (dados)**~~ | ~~Gerar quizzes para 30 tópicos restantes~~ — **Concluído 2026-07-23** (92/92, 460 quizzes) | ~~🟡 Média~~ | ✅ |
| 2 | **Bugs do dashboard** | Corrigir cartão Streak: dias `Q` duplicados, `activeDays` hardcoded em vez de calculado a partir dos dados reais | 🟢 Baixa | Nenhuma |

### 🟠 Média prioridade

| # | Item | Descrição | Complexidade | Dependências |
|---|------|-----------|:------------:|--------------|
| 4 | **Acessibilidade** | `focus-visible:` ring nos cartões-click do dashboard | 🟢 Baixa | Nenhuma |
| 5 | **ADR-002** | Documentar estratégia de dados do dashboard — Server Components (Next.js) vs FastAPI como fonte de truth | 🟡 Média | Análise de performance e manutenibilidade |
| 6 | **Breakpoints** | Decidir teto 1920px vs breakpoints explícitos para 2K/4K; impacto no design system e nos componentes shadcn | 🟢 Baixa | Discussão de produto; sem dependências técnicas |

### 🟢 Baixa prioridade

| # | Item | Descrição | Complexidade | Dependências |
|---|------|-----------|:------------:|--------------|
| 8 | **Design system `/lab`** | Substituir cor hardcoded `#0E1525` por tokens OKLCH (exceção documentada a eliminar — Norma 01) | 🟢 Baixa | Nenhuma |
| 9 | **pgvector** | Migrar FAISS → PostgreSQL + pgvector para persistência de embeddings; manter pipeline atual funcional durante transição | 🟠 Alta | pgvector instalado no PostgreSQL; reindexação dos 1831 chunks |

---

## Decisões Recentes

Resumo das últimas entradas do histórico (`agents.md` §8.2):

### Polimento premium do template MDX (2026-07-22)

Pipeline reescrito para MDX puro com remark-gfm (tabelas), remark-callout (`[!note/tip/warning/danger]` → `<Callout>`) e rehype-slug (anchors TOC). 19 tokens OKLCH adicionados (callout, terminal, tabela, hero). 119 ficheiros `.mdx` regerados. Stack `react-markdown` removida. Commits `41cb483`→`158d72e`.

> Spec: `frontend/docs/superpowers/specs/2026-07-22-mdx-template-premium-polish-design.md`

### Redesign `/manuals` (2026-07-21)

Layout 3-zone (TOC sticky esquerda + Conteúdo central + Meta sticky direita, ≥1280px). CommandTable interativa auto-detectada com heurística header/inlineCode (`is-command-table.ts`). TOC scroll-spy via IntersectionObserver + ReadingProgress. Única nova dep runtime: `gray-matter` (build-time, não viola ADR-001). 11 commits no ramo `master`.

> Spec: `docs/superpowers/specs/2026-07-21-manuals-redesign-design.md`

### Landing page redesign (2026-07-17)

Header sticky glassmorphism (Navigation Menu desktop + Sheet mobile + GitHub icon + CTA). Hero polido (responsive 320px→4K). Footer Bento/Grid 4 colunas. Shadcn MCP configurado em `opencode.json`.

### Críticos do design system (2026-07-17)

Três correções fundamentais no mesmo dia: (1) tokens OKLCH migrados para `@theme inline`, eliminado `oklch()` inline dos 7 cartões Bento; (2) buraco de 4 colunas da Bento corrigido (Manuais+Streak → 6+6); (3) naming unificado "Linux de Camões" (KubeAI extinto), norma PT-PT estabelecida.

---

## Critérios de Sucesso

### Prioridade Alta — MVP funcional

- [x] **Quizzes completos**: 92/92 tópicos com quizzes gerados; quiz-taker funcional com spaced repetition SM-2
- [ ] **Dashboard sem bugs**: cartão Streak reflete dados reais; zero hardcoded values

### Prioridade Média — Qualidade e documentação

- [ ] **ADR-002 publicado**: estratégia de dados do dashboard documentada e justificada
- [ ] **Acessibilidade básica**: todos os elementos interativos com `focus-visible` adequado
- [ ] **Breakpoints definidos**: política de responsive para ecrãs ≥1920px documentada no design system

### Prioridade Baixa — Refinamento

- [ ] **Zero hardcoded colors**: `/lab` migrado para tokens OKLCH; exceção da Norma 01 eliminada
- [ ] **pgvector operacional**: embeddings persistidos em PostgreSQL; FAISS descontinuado
- [ ] **Design system consistente**: todos os componentes seguem normas 01–03 sem exceções

---

## Referências

| Documento | Localização | Relevância |
|-----------|-------------|------------|
| agents.md §8.1 | `agents.md` (raiz) | Fases do projeto e estado atual |
| agents.md §8.2 | `agents.md` (raiz) | Histórico de ações e decisões |
| agents.md §10 | `agents.md` (raiz) | Próximos passos (pendentes) |
| ADR-001 | `docs/ADR-001 - Abordagem A - CSS puro e SVG inline.md` | Decisão: zero deps de runtime para animação |
| Norma 01 | `docs/Norma 01 - Sistema de Tokens e Cores.md` | Tokens OKLCH, `@theme inline`, zero inline |
| Norma 02 | `docs/Norma 02 - Layout Bento e Grelha.md` | Bento Grid 12 colunas, regra de soma |
| Norma 03 | `docs/Norma 03 - Identidade de Marca e Comentários.md` | "Linux de Camões", PT-PT, KubeAI extinto |
| Design System | `docs/Design System - OKLCH, Grid e Responsividade.md` | Referência visual e tokens |
| Arq. Manuais | `docs/Arquitetura dos Manuais.md` | Pipeline de manuais, MDX, redesign |
| Plan Fase 6 | `docs/plans/2026-07-17-fase6-quizzes.md` | Plano de implementação dos quizzes |
| Spec MDX Premium | `docs/superpowers/specs/2026-07-22-mdx-template-premium-polish-design.md` | Polimento do pipeline MDX |
| Spec Manuals Redesign | `docs/superpowers/specs/2026-07-21-manuals-redesign-design.md` | Layout 3-zone, TOC scroll-spy |

---

> **Nota:** este roadmap é um documento vivo. Atualizar sempre que uma fase
> mudar de estado ou uma decisão for tomada. O Vault Obsidian é a fonte de
> verdade — este ficheiro é um espelho para navegação rápida.
