# Spec — Árvore de Conhecimento `readme/` + Protocolo `agents.md`

**Data:** 2026-07-23 · **Projeto:** Linux de Camões · **Idioma:** PT-PT

## 1. Contexto / Problema

A raiz de `linuxdecamoes/` tem documentação `.md` dispersa e desatualizada:
- `readme/` atual tem só 3 ficheiros, dos quais `01 - Arquitetura.md` está **obsoleto** (diz Next.js 15 + LLM "OpenAI/Anthropic"; o real é Next 16.2.10 + Groq) e `02 - Design System.md` é **conflituante** (descreve split-panes 25/45/30 e "Replit Bege/Laranja", anteriores ao redesign Bento) e **duplica** as cores do `docs/Design System` canónico. `00 - Índice.md` aponta para ficheiros que não existem.
- Há sobreposições (Design System em 3 sítios; roadmap em `docs/Roadmap - Pendentes.md`).
- Falta uma árvore de conhecimento navegável, ao estilo da referência `tradingiq/readme/` (6 ficheiros narrativos densos).
- O trabalho tem sido reativo (TOC, fontes, MDX ad-hoc), gerando loops e consumo de tokens. Falta um plano rigoroso.

## 2. Goals

1. Reestruturar `readme/` numa árvore de conhecimento **narrativa** (estilo tradingiq) com **7 ficheiros**, conteúdo **honesto** sobre o estado real do projeto.
2. Limpar ficheiros redundantes/stale (migrando o útil).
3. Consolidar o roadmap numa única fonte: `readme/07-Roadmap.md`.
4. Estabelecer um **protocolo de trabalho anti-loop** no `linuxdecamoes/agents.md` (governança de engenharia).

## 3. Decisions (locked)

- **D1 — Separação narrativa vs governança:** `readme/` = narrativa (estilo tradingiq); `docs/` **mantém-se** como governança (Normas 01/02/03, ADR-001, Design System OKLCH, Arquitetura dos Manuais, `plans/`, `superpowers/`). Só se move/apaga o redundante.
- **D2 — Protocolo em `linuxdecamoes/agents.md`:** o "plano rigoroso" mora no system-prompt de engenharia (não no `Vault/agentes.md`, que é controlo de conteúdo LPI e não se mexe).
- **D3 — Profundidade "narrativa honesta":** ~120–250 linhas/ficheiro, fundamentado em factos reais; **sem fabricar** endpoints/schema/prod-deploy que não existem. Onde não há documentação, marcar como lacuna.
- **D4 — Estilo tradingiq:** sem front-matter YAML; `# Título` + secções `##`; tabelas, árvores ASCII, code-fences. PT-PT europeu.
- **D5 — Fonte de verdade:** `linuxdecamoes/agents.md` (stack/fases/restrições), `docker-compose.yml`+`frontend/Dockerfile` (Docker), `Vault/agentes.md` (páginas/bugs/quizzes), README raiz (porto publico).

## 4. Arquitetura / Entregas

### 4.1 Estrutura final `readme/` (7 ficheiros)

```
readme/
├── .obsidian/                  (mantém-se)
├── 01-Visao-Geral.md
├── 02-Backend.md
├── 03-Frontend.md
├── 04-Banco-de-Dados.md
├── 05-Docker.md
├── 06-Features.md
└── 07-Roadmap.md
```

Conteúdo por ficheiro (secções `##` + fonte):

**`01-Visao-Geral.md`** — `# Linux de Camões — Visão Geral` · `## O que é` · `## Problema e solução` · `## Stack Tecnológica` (tabela real: Next 16.2.10/React 19/Tailwind v4/shadcn @base-ui/Clerk · FastAPI/PostgreSQL 16 · FAISS+Groq · K8s ⏳) · `## Arquitetura do Sistema` (diagrama ASCII: Browser→Next↔FastAPI↔PG+FAISS; Vault→MDX build-time) · `## Estrutura de Diretórios` (árvore ASCII). Fonte: `agents.md` §0/§3/§4/§7.1, README raiz.

**`02-Backend.md`** — `# Backend (FastAPI)` · `## Estrutura` (árvore `backend/`) · `## Setup local` · `## Configuração` (env: DATABASE_URL, CLERK, GROQ) · `## RAG Pipeline` (FAISS + sentence-transformers `paraphrase-multilingual-MiniLM-L12-v2`, 114 tópicos→1831 chunks, `rag/pipeline.py --rebuild`) · `## LLM (Groq)` (3 papéis: chat RAG, geração de quizzes, avaliação de comandos; modelo `openai/gpt-oss-20b`, alternativo `llama-3.1-8b-instant`). Fonte: `agents.md` §6/§7, `Vault/agentes.md` §2/§4. **Lacuna honesta:** não inventar catálogo de endpoints exaustivo; listar só os rotas conhecidas (ver 06-Features).

**`03-Frontend.md`** — `# Frontend (Next.js 16)` · `## Estrutura` · `## Stack` (Next 16.2.10 App Router/Turbopack, React 19, Tailwind v4, shadcn/ui @base-ui/react, Clerk, **Inter + JetBrains Mono**) · `## Páginas e rotas` (tabela) · `## Design System` (OKLCH + Bento Grid 12 colunas; **REFERENCIA** `docs/Norma 01/02` + `docs/Design System - OKLCH...`, não duplica) · `## Pipeline MDX` (remark-gfm tabelas + remark-callout `[!note/tip/warning/danger]` + rehype-slug anchors; conversor Vault→MDX). Fonte: `agents.md` §5, `readme/02 - Design System.md` (filtrar stale).

**`04-Banco-de-Dados.md`** — `# Base de Dados` · `## Visão geral` (PostgreSQL 16 + pgvector planeado) · `## RAG` (FAISS 1831 chunks) · `## Tabelas principais` (manuais, tópicos, quizzes, progresso — **honesto**: descrever o que está modelado, marcar incerteza). Fonte: `agents.md` §6.2, `Vault/agentes.md` §3. **Lacuna honesta:** schema detalhado só se confirmado no código `backend/db`; senão, marcar.

**`05-Docker.md`** — `# Docker` · `## Serviços` (tabela: `db` postgres:16-alpine user/db `kubeai` :5432; `backend` :8000; `frontend` :3001→3000) · `## Variáveis de ambiente` (VAULT_PATH, DATABASE_URL, CLERK, GROQ; env_file `frontend/.env.local`) · `## Como executar` (`docker compose up`; monta `../Vault` :ro; **não há prod-deploy**) · `## Dockerfile` (multi-stage `node:20-alpine`: builder `npm run build` com bind Vault → runner `standalone`). Fonte: `docker-compose.yml`, `frontend/Dockerfile`.

**`06-Features.md`** — `# Features` · `## Páginas funcionais` (landing `/`; auth `/sign-in`/`/sign-up`; dashboard `/dashboard` Bento 8 cards; study `/dashboard/study/[code]/[topic]`; manuais `/manuals/[code]/[slug]`; chat `/dashboard/chat`; quizzes `/dashboard/quizzes/[manual]/[slug]`; lab `/dashboard/lab` placeholder) · `## Destaques` (119 tópicos MDX premium; RAG 1831 chunks; quizzes SM-2 62/114) · `## Estado dos quizzes` (tabela 010/020/030/050/101/102). Fonte: `Vault/agentes.md` §2/§3, `agents.md` §1.2/§7.2.

**`07-Roadmap.md`** — `# Roadmap` (priorizado, ver §4.3).

### 4.2 Limpeza (apagar)

- `readme/00 - Índice.md`, `readme/01 - Arquitetura.md`, `readme/02 - Design System.md` — **depois de migrar** o útil (fluxo Consola/Quiz de `01`; cores de `02` já estão em docs/).
- `docs/Roadmap - Pendentes.md` — migrado para `readme/07-Roadmap.md`.
- `docs/README.md` — **verificar** no execute; apagar se for só índice redundante.
- **Manter:** toda a governança `docs/` (Normas, ADR, Design System OKLCH, Arquitetura dos Manuais, `plans/`, `superpowers/`).
- Fora de âmbito: `frontend/README.md` (boilerplate do repo frontend), `frontend/AGENTS.md`/`CLAUDE.md`.

### 4.3 `07-Roadmap.md` (features que faltam, priorizado)

1. **Fase 5 — Terminal Kubernetes** ⏳: xterm.js no `/lab`; pods efémeros por utilizador; túnel WebSocket; provisionamento.
2. **Fase 6 — Quizzes** 🟡: 56/114 tópicos sem quizzes (rate limit Groq); modelo alternativo `llama-3.1-8b-instant`.
3. **Bugs de dashboard**: cards hardcoded (progresso/streak/tópicos); streak bugado (dias duplicados, sempre zero); quiz usa user hardcoded "current-user" em vez de Clerk; mismatch `completeTopic` (clerk_id query vs path); manuais estáticos sem auth redirect; duas rotas de manuais (slug vs ID).
4. **Acessibilidade**: `focus-visible`; `aria-live` no provisionamento do terminal.
5. **Design system / ADRs**: eliminar exceção `/lab` (hex→tokens); ADR-002 (dados do dashboard); ADR-003 (WebSocket vs SSE).

### 4.4 Editar `linuxdecamoes/agents.md`

- **Nova secção "Protocolo de Trabalho"** (sugerido §11, após §10):
  - **Backlog canónico:** `readme/07-Roadmap.md` é a lista priorizada — trabalhar por prioridade, não ad-hoc.
  - **Disciplina anti-loop:** toda a feature segue **brainstorming → writing-plans → execução** (spec→plan→execute); commit por tarefa; **sem tweaks reativos sem spec**; uma tarefa de cada vez; verificar `cmd /c "npm run lint"` + `cmd /c "npm run build"` antes de declarar pronto.
  - **Disciplina de tokens:** explorar antes de perguntar; delegar leituras a subagentes; comprimir contexto; não re-ler ficheiros já sintetizados.
- **Atualizar §8.2 Histórico:** nova linha `2026-07-23 | Reestruturação da árvore de documentação readme/ (7 ficheiros tradingiq) + protocolo anti-loop em agents.md | ✅`.

## 5. Casos-limite / Riscos

- **R1 — Profundidade do backend/DB:** não há doc exaustiva do schema/API. **Mitigação:** descrever só o confirmado; marcar lacunas. Não fabricar.
- **R2 — Conteúdo stale migrado:** o fluxo Consola/Quiz de `readme/01` pode estar desatualizado. **Mitigação:** cruzar com `agents.md` antes de migrar.
- **R3 — Links Obsidian `[[ ]]`:** `agents.md` referencia `[[00 - Índice]]`/`[[01 - Arquitetura]]`/`[[02 - Design System]]` que vão desaparecer. **Mitigação:** atualizar essas ligações em `agents.md` para os novos nomes (`[[01-Visao-Geral]]` etc.) ou removê-las.
- **R4 — Raiz não é repo git:** sem commits para `readme/`/`agents.md` (opera-se sobre ficheiros soltos). Verificação = existência + revisão markdown + grep de links.
- **R5 — `.obsidian/`:** mantém-se intocada.

## 6. Verificação (sem build — docs)

- Os 7 ficheiros existem em `readme/`; os 3 antigos desapareceram.
- `docs/Roadmap - Pendentes.md` removido; `docs/` governança intacta (Normas/ADR/Design System/Arquitetura/plans/superpowers).
- `agents.md`: nova secção "Protocolo de Trabalho" presente + linha §8.2 2026-07-23 + sem `[[ ]]` quebrados para ficheiros apagados.
- `rg "\[\[00 - Índice\]\]|\[\[01 - Arquitetura\]\]|\[\[02 - Design System\]\]" agents.md` → 0 (ou atualizados).
- Cada `readme/*.md`: sem `TBD`/`TODO`/`lorem`; PT-PT; honesto (Fase 5 ⏳, Fase 6 🟡, sem prod-deploy).

## 7. Inventário de Ficheiros

- **Criar:** `readme/{01-Visao-Geral,02-Backend,03-Frontend,04-Banco-de-Dados,05-Docker,06-Features,07-Roadmap}.md`
- **Apagar:** `readme/{00 - Índice,01 - Arquitetura,02 - Design System}.md`, `docs/Roadmap - Pendentes.md`, (talvez) `docs/README.md`
- **Modificar:** `linuxdecamoes/agents.md` (nova secção + §8.2 + links)
- **Reutilizar (ler):** `linuxdecamoes/agents.md`, `docker-compose.yml`, `frontend/Dockerfile`, `Vault/agentes.md`, `docs/Design System - OKLCH...md`, `docs/Norma 01/02`, `docs/Arquitetura dos Manuais.md`, README raiz
