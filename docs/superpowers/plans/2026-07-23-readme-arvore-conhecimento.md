# Árvore de Conhecimento readme/ — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir os 3 ficheiros `readme/` obsoletos por 7 ficheiros narrativos estilo tradingiq, adicionar Protocolo de Trabalho ao `agents.md`, e limpar redundâncias.

**Architecture:** Tarefa de documentação pura. Sem código, sem build, sem git (raiz não é repo). Verificação = existência de ficheiros + revisão markdown + grep links.

**Tech Stack:** Markdown (GFM) + Obsidian vault.

**Contexto crítico:**
- Raiz `linuxdecamoes/` **NÃO é repo git** → **zero commits**.
- Fonte de verdade dos factos: `agents.md` (§0 identidade, §3 stack, §4 dirs, §5 Bento/OKLCH, §6 RAG/LLM, §7 WebSocket/SM-2, §8.1 fases, §10 pendentes).
- Fonte adicional para 06-Features e 07-Roadmap: `Vault/agentes.md` (fora do repo, **não editar** — ler só para factos).
- **Estilo tradingiq:** sem front-matter YAML; `# Título — Projeto Linux de Camões`; secções `##`; tabelas/ASCII/code-fences. PT-PT. ~120–250 linhas/ficheiro.
- **Honestidade:** sem fabricar endpoints/schema/prod-deploy; marcar lacunas (⏳/🟡/"não implementado").
- **Não duplicar** governança (`docs/Norma 01/02/03`, `docs/ADR-001`, `docs/Design System - OKLCH...`) — **referenciar** por `[[ ]]` ou caminho.
- Fonte ativa: **Inter** (sans/heading) + **JetBrains Mono** (mono) — não IBM Plex.
- Docker compose: db (postgres:16-alpine, user/db `kubeai`, :5432), backend (:8000), frontend (:3001→3000, VAULT_PATH, monta ../Vault:ro, env_file frontend/.env.local). Dockerfile node:20-alpine multi-stage.

---

## Task 1: Apagar ficheiros obsoletos/redundantes

**Files:**
- Delete: `readme/00 - Índice.md`
- Delete: `readme/01 - Arquitetura.md`
- Delete: `readme/02 - Design System.md`
- Delete: `docs/Roadmap - Pendentes.md` (conteúdo migra para 07-Roadmap)
- Delete: `docs/README.md` (verificar primeiro se tem só índice; se tem conteúdo útil, NÃO apagar)

- [ ] **Step 1: Verificar docs/README.md**

Ler `docs/README.md`. Se for só um índice de navegação, apagar. Se tiver conteúdo substantivo, manter e informar.

```powershell
Get-Content "docs\README.md" | Measure-Object -Line
```

- [ ] **Step 2: Apagar os ficheiros confirmados**

```powershell
Remove-Item "readme\00 - Índice.md","readme\01 - Arquitetura.md","readme\02 - Design System.md"
Remove-Item "docs\Roadmap - Pendentes.md"
# docs/README.md — apagar só se Step 1 confirmou
```

- [ ] **Step 3: Confirmar que readme/ está vazia**

```powershell
Get-ChildItem readme
```
Expected: sem ficheiros (ou só temporários).

---

## Task 2: Criar `01-Visao-Geral.md`

**Files:**
- Create: `readme/01-Visao-Geral.md`

**Fontes:** `agents.md` §0 (identidade), §3 (stack tabela), §4 (árvore dirs), §5 (Bento/OKLCH resumo), §7.1 (fluxo dados).

- [ ] **Step 1: Criar o ficheiro**

Estrutura (cada `##` = secção; o implementador redige prosa PT-PT a partir dos factos das fontes):

```markdown
# Visão Geral — Projeto Linux de Camões

## O que é
Plataforma open-source de aprendizagem e simulação de administração Linux, baseada nos manuais de certificação LPI. Identidade de marca = "Linux de Camões".

## Objetivos
- Manuais LPI em PT-PT com design premium
- RAG fundamentado nos manuais
- Terminal real em pods K8s (planeado)
- Quizzes de repetição espaçada

## Stack Tecnológica
[TABELA literal — copiar de agents.md §3]
| Camada | Tecnologia | Estado |
| Frontend | Next.js 16.2.10 (App Router, Turbopack) · React 19 · Tailwind v4 · shadcn/ui (@base-ui/react) · Clerk · Inter · JetBrains Mono · lucide-react | ✅ |
| Backend | FastAPI (Python 3.12) · SQLAlchemy/SQLModel · Alembic | ✅ |
| Base de Dados | PostgreSQL 16 (+ pgvector planeado) | ✅ |
| RAG | FAISS + sentence-transformers (MiniLM-L12-v2) · Groq (gpt-oss-20b) · 114 tópicos → 1831 chunks | ✅ |
| Orquestração | Kubernetes (pods efémeros) | ⏳ |
| Auth | Clerk (JWT) | ✅ |
| IA | LLM Groq — chat RAG, quizzes, avaliação | ✅/⏳ |

## Arquitetura de Sistemas
[DIAGRAMA ASCII — adaptar do README.md raiz existente]
```text
                ┌───────────────────────────────────────────┐
                │            Browser (xterm.js)            │
                └──────────────────┬───────────────────────┘
                                   │ HTTP / WebSocket
                ┌──────────────────▼───────────────────────┐
                │  Frontend — Next.js 16 (SSR / SSG)        │
                └─────┬──────────────────────┬──────────────┘
                      │ REST                  │ (build-time)
              ┌─────▼──────────┐  ┌──────▼─────────────────┐
              │ Backend FastAPI │  │ Vault → MDX (119 tópicos) │
              └────┬───────┬───┘  └────────────────────────┘
                   │       │
         ┌─────────▼─┐  ┌─▼──────────────┐
         │ PostgreSQL │  │ FAISS + Groq    │
         └───────────┘  └────────────────┘
```

## Estrutura de Diretórios
[ÁRVORE ASCII — copiar de agents.md §4, adaptar à realidade atual]

## Documentação Relacionada
- [[02-Backend]] · [[03-Frontend]] · [[04-Banco-de-Dados]] · [[05-Docker]] · [[06-Features]] · [[07-Roadmap]]
- `docs/Norma 01 - Sistema de Tokens e Cores.md` (governança de cores)
- `docs/Norma 02 - Layout Bento e Grelha.md` (governança de layout)
```

- [ ] **Step 2: Verificar**

```powershell
Select-String -Path "readme\01-Visao-Geral.md" -Pattern "^## "
Test-Path "readme\01-Visao-Geral.md"
```
Expected: 6+ headings `## `; ficheiro existe.

---

## Task 3: Criar `02-Backend.md`

**Files:**
- Create: `readme/02-Backend.md`

**Fontes:** `agents.md` §6 (RAG/K8s/LLM), §7 (WebSocket/SM-2), código `backend/` (ler models, routes, main.py para factos reais).

- [ ] **Step 1: Criar o ficheiro**

Estrutura:
```markdown
# Backend — Projeto Linux de Camões

## Visão Geral
FastAPI (Python 3.12), SQLAlchemy async, Alembic. Três papéis: servir manuais via API, pipeline RAG, orquestração de quizzes.

## Estrutura do Projeto
[ÁRVORE ASCII de backend/ — ler `backend/` e gerar]

## Configuração
- `.env` / variáveis: DATABASE_URL, CLERK_SECRET_KEY, CLERK_PUBLISHABLE_KEY, GROQ_API_KEY
- Conexão PostgreSQL via SQLAlchemy async

## Endpoints Principais
[TABELA — ler `backend/app/main.py` e routers para listar rotas REAIS]
| Método | Caminho | Descrição | Estado |
| (preencher com rotas reais do código) |

## RAG Pipeline
- FAISS: 114 tópicos LPI → 1831 chunks (sentence-transformers paraphrase-multilingual-MiniLM-L12-v2)
- LLM: Groq gpt-oss-20b (chat, geração quizzes, avaliação comandos)
- Fluxo: query → embedding → FAISS top-k → contexto + prompt → LLM

## Limitações Conhecidas
- Rate limit Groq (quizzes: 58/114 tópicos gerados)
- pgvector não implementado (FAISS em memória)
```

- [ ] **Step 2: Verificar** — ficheiro existe, ≥4 headings `## `.

---

## Task 4: Criar `03-Frontend.md`

**Files:**
- Create: `readme/03-Frontend.md`

**Fontes:** `agents.md` §3 (stack frontend), §5 (Bento/OKLCH), `docs/Arquitetura dos Manuais.md` (pipeline MDX), código `frontend/src/app/` (rotas).

- [ ] **Step 1: Criar o ficheiro**

Estrutura:
```markdown
# Frontend — Projeto Linux de Camões

## Visão Geral
Next.js 16.2.10 (App Router, Turbopack), React 19, Tailwind v4, shadcn/ui (@base-ui/react), Clerk auth.

## Stack Frontend
| Tecnologia | Uso |
| Next.js 16.2.10 | App Router, Turbopack, SSG 131 páginas |
| React 19 | Server + Client Components |
| Tailwind v4 | @tailwindcss/postcss, @theme inline |
| shadcn/ui | @base-ui/react, base-nova style |
| Clerk | Auth, proteção de rotas |
| Inter + JetBrains Mono | Fontes (next/font/google) |

## Rotas e Páginas
[TABELA — listar rotas REAIS de `frontend/src/app/`]
| Rota | Tipo | Descrição | Estado |
| / | Página pública | Landing | ✅ |
| /manuals/[code]/[slug] | SSG (131 pág.) | Manuais MDX premium | ✅ |
| /dashboard | Protegida | Bento 8 cards | ✅ |
| /dashboard/study/[code]/[topic] | Client | Estudo RAG + quiz | ✅ |
| /dashboard/chat | Client | Chat RAG | ✅ |
| /dashboard/quizzes/[manual]/[slug] | Client | Quizzes SM-2 | 🟡 parcial |
| /dashboard/lab | Client | Terminal K8s | ⏳ placeholder |

## Design System
**Referência:** [[docs/Norma 01 - Sistema de Tokens e Cores]] · [[docs/Norma 02 - Layout Bento e Grelha]] · [[docs/Design System - OKLCH, Bento Grid e Glassmorphism]]

Não duplicar a paleta/corez aqui — a fonte de verdade canónica são os docs acima.

Princípios: OKLCH exclusivo (Norma 01), Bento Grid 12 colunas (Norma 02), glassmorphism, zero deps runtime de animação (ADR-001).

## Pipeline MDX
[Resumo do pipeline: Vault → convert-vault-to-mdx.ts → .mdx → @next/mdx (remark-gfm + remark-callout + rehype-slug) → React]
Detalhes completos em [[docs/Arquitetura dos Manuais]].

## Componentes Premium
Callout, ExerciseCard, DistributionCard, SolutionBlock, TopicHero — registados globalmente em useMDXComponents, tokenizados.
```

- [ ] **Step 2: Verificar** — ficheiro existe, ≥5 headings `## `.

---

## Task 5: Criar `04-Banco-de-Dados.md`

**Files:**
- Create: `readme/04-Banco-de-Dados.md`

**Fontes:** `agents.md` §6.2 (RAG→pgvector planeado), código `backend/db/` (models, migrations).

- [ ] **Step 1: Criar o ficheiro**

Estrutura:
```markdown
# Banco de Dados — Projeto Linux de Camões

## Visão Geral
PostgreSQL 16 (via docker-compose, user/db `kubeai`). pgvector planeado mas não implementado — RAG usa FAISS em memória.

## Configuração
- Host: `db:5432` (docker-compose)
- Credenciais: user/db `kubeai` (NOTA: vestígio do codename extinto — não alterar)
- Migrações: Alembic

## Tabelas
[Ler `backend/db/models/` e listar tabelas REAIS com colunas]
| Tabela | Descrição | Estado |

## FAISS vs pgvector
- Atual: FAISS (vetores em memória, rebuild manual)
- Planeado: pgvector (vetores em PostgreSQL, persistidos)
- Motivo da espera: complexidade adicional não justificada enquanto o dataset é estático (1831 chunks)
```

- [ ] **Step 2: Verificar** — ficheiro existe, ≥3 headings `## `.

---

## Task 6: Criar `05-Docker.md`

**Files:**
- Create: `readme/05-Docker.md`

**Fontes:** `docker-compose.yml`, `frontend/Dockerfile`, `agents.md` §9.

- [ ] **Step 1: Criar o ficheiro**

Estrutura:
```markdown
# Docker — Projeto Linux de Camões

## Visão Geral
Stack completo via `docker compose up`. Três serviços: db, backend, frontend.

## Serviços
[TABELA literal]
| Serviço | Imagem | Porta | Notas |
| db | postgres:16-alpine | :5432 | user/db `kubeai` |
| backend | (build) | :8000 | DATABASE_URL, Clerk, Groq |
| frontend | (build) | :3001→3000 | VAULT_PATH, monta ../Vault:ro |

## Variáveis de Ambiente
| Variável | Serviço | Descrição |
| DATABASE_URL | backend | postgresql+asyncpg://kubeai:***@db:5432/kubeai |
| CLERK_SECRET_KEY | backend+frontend | Chave Clerk |
| CLERK_PUBLISHABLE_KEY | frontend | Chave pública Clerk |
| GROQ_API_KEY | backend | Groq API |

## Dockerfile (Frontend)
Multi-stage: builder (node:20-alpine, COPY . ., RUN npm run build c/ --mount=type=bind Vault) → runner (.next/standalone, node server.js). Output: standalone.

## Como Executar

### Stack completo
```bash
docker compose up
```
Pré-requisitos: Docker, `../Vault/` acessível, `frontend/.env.local` com chaves.

### Só frontend (dev)
```bash
cmd /c "npm run dev"
```
A partir de `frontend/`.

## Limitações
- Não há deploy de produção configurado.
- `kubeai` como user/db é vestígio do codename extinto (não alterar sem aprovação).
```

- [ ] **Step 2: Verificar** — ficheiro existe, ≥4 headings `## `.

---

## Task 7: Criar `06-Features.md`

**Files:**
- Create: `readme/06-Features.md`

**Fontes:** `Vault/agentes.md` §2 (páginas+bugs), §3 (quizzes: 58/114, 290 total), `agents.md` §6.3 (3 papéis LLM), §7.2 (SM-2).

- [ ] **Step 1: Criar o ficheiro**

Estrutura:
```markdown
# Features — Projeto Linux de Camões

## 1. Manuais MDX Premium
119 tópicos LPI, 5 manuais (010/020/030/050/101/102). Pipeline MDX com remark-gfm, remark-callout, rehype-slug. Design system OKLCH + Bento. → [[03-Frontend]]

## 2. RAG Chat
1831 chunks LPI, FAISS, Groq gpt-oss-20b. Chat fundamentado nos manuais. → [[02-Backend]]

## 3. Quizzes (Repetição Espaçada SM-2)
58/114 tópicos com quizzes (290 total). Faltam 56 (rate limit Groq). Algoritmo SM-2 para scheduling. Estado: 🟡 parcial.

## 4. Terminal Kubernetes
Planeado (Fase 5). Pods efémeros K8s, xterm.js, túnel WebSocket. Estado: ⏳.

## 5. Auth
Clerk (JWT). Rotas protegidas: /dashboard/*. Páginas públicas: /, /manuals/*, /sign-in, /sign-up.

## Bugs Conhecidos
[Listar bugs de Vault/agentes.md §2 — dashboard cards hardcoded, streak bugado, quiz user hardcoded, mismatch completeTask, manuais sem auth redirect]

## Métricas
- 114 tópicos LPI nos manuais
- 119 páginas MDX (alguns tópicos divididos)
- 1831 chunks RAG
- 290 quizzes gerados
- 58/114 tópicos com quizzes
```

- [ ] **Step 2: Verificar** — ficheiro existe, ≥5 headings `## `.

---

## Task 8: Criar `07-Roadmap.md`

**Files:**
- Create: `readme/07-Roadmap.md`

**Fontes:** `docs/Roadmap - Pendentes.md` (81 linhas, migrar conteúdo), `agents.md` §8.1 (fases), §10 (pendentes).

- [ ] **Step 1: Ler docs/Roadmap - Pendentes.md ANTES de apagar (Task 1)**

Se Task 1 já apagou, o conteúdo está no spec §4.1 ponto 7 e em agents.md §10. Ler `agents.md` §10 para os pendentes.

- [ ] **Step 2: Criar o ficheiro**

Estrutura:
```markdown
# Roadmap — Projeto Linux de Camões

## Estado Atual
[TABELA das fases — de agents.md §8.1]
| Fase | Estado |
| 0 — Cofre de Contexto | ✅ |
| 1 — Init Repo | ✅ |
| 2 — Frontend Base | ✅ |
| 3 — Backend API | ✅ |
| 4 — RAG | ✅ |
| 5 — Terminal K8s | ⏳ |
| 6 — Quizzes | 🟡 parcial (58/114) |

## Pendentes (priorizados)

### Alta prioridade
1. **Fase 5 — Terminal K8s:** manifestos k8s/, túnel WebSocket, xterm.js no /lab
2. **Fase 6 — Quizzes:** gerar para os 56 tópicos restantes (mitigar rate limit Groq)
3. **Bugs do dashboard:** cards hardcoded, streak, quiz user, mismatch completeTask

### Média prioridade
4. **Acessibilidade:** focus-visible, aria-live no provisionamento terminal
5. **ADR-002:** estratégia de dados do dashboard
6. **ADR-003:** WebSocket vs SSE para terminal

### Baixa prioridade
7. **Design system /lab:** substituir hex por tokens na página terminal (exceção Norma 01)
8. **pgvector:** migrar FAISS → pgvector para persistência de embeddings
```

- [ ] **Step 3: Verificar** — ficheiro existe, ≥3 headings `## `.

---

## Task 9: Atualizar `agents.md`

**Files:**
- Modify: `agents.md`

**Pré-requisito:** Ler `agents.md` para localizar: (a) §8.2 última linha, (b) todas as ocorrências de `[[00 - Índice]]`, `[[01 - Arquitetura]]`, `[[02 - Design System]]`.

- [ ] **Step 1: Adicionar secção "Protocolo de Trabalho"**

Adicionar **antes da secção `---` final** (ou antes de §9 Restrições, se existir `---` separador). Conteúdo:

```markdown
## Protocolo de Trabalho

### Backlog canónico
O roadmap priorizado vive em [[07-Roadmap]]. Qualquer tarefa nova deve ser aí registada antes de execução.

### Fluxo de trabalho
1. **Spec → Plan → Execute:** toda tarefa não-trivial passa por spec (design) → plan (implementação) → execução. Ferramentas: `docs/superpowers/{specs,plans}/`.
2. **Commit por tarefa:** cada tarefa gera um commit atómico com mensagem convencional (feat/fix/refactor/chore) e descrição PT-PT.
3. **Verificação:** antes de cada commit, executar `cmd /c "npm run lint"` e `cmd /c "npm run build"` (131/131 páginas SSG = integration gate).
4. **Sem tweaks reativos:** se o user pede uma mudança, avaliar se precisa de spec ou se é ajuste direto. Mudanças estruturais = spec. Ajustes cosméticos = edit direto.
5. **Token discipline:** comprimir contexto (compress) regularmente; delegar a subagentes quando possível; não re-leituras de ficheiros já resumidos.

### Regras
- PT-PT em todo o conteúdo novo (UI, commits, docs).
- Norma 01 (zero cores inline em .tsx; tudo em tokens :root + @theme inline).
- ADR-001 (zero deps runtime de animação).
- NÃO mexer `Vault/agentes.md` (controlo de conteúdo LPI, fora do repo).
```

- [ ] **Step 2: Adicionar linha §8.2 Histórico**

Após a última linha da tabela §8.2 (a entrada `2026-07-22 | **Polimento premium...`), adicionar:

```markdown
| 2026-07-23 | **Reestruturação da documentação:** readme/ reescrito com 7 ficheiros narrativos (estilo tradingiq); ficheiros obsoletos apagados; Protocolo de Trabalho adicionado a agents.md; docs/ mantém governança. Spec `docs/superpowers/specs/2026-07-23-readme-arvore-conhecimento-design.md`. | ✅ [[07-Roadmap]] |
```

- [ ] **Step 3: Corrigir ligações `[[ ]]` quebradas**

Os ficheiros `00 - Índice.md`, `01 - Arquitetura.md`, `02 - Design System.md` foram apagados. Procurar e corrigir todas as ocorrências em `agents.md`:

```powershell
Select-String -Path agents.md -Pattern "\[\[00 - Índice\]\]|\[\[01 - Arquitetura\]\]|\[\[02 - Design System\]\]"
```

Substituir cada ocorrência pela referência mais próxima:
- `[[00 - Índice]]` → `[[01-Visao-Geral]]` (se for link de navegação) ou remover (se for referência genérica)
- `[[01 - Arquitetura]]` → `[[01-Visao-Geral]]`
- `[[02 - Design System]]` → `[[03-Frontend]]` (que referencia o Design System) ou `[[docs/Design System - OKLCH, Bento Grid e Glassmorphism]]`

- [ ] **Step 4: Verificar**

```powershell
Select-String -Path agents.md -Pattern "Protocolo de Trabalho|2026-07-23 \|"
Select-String -Path agents.md -Pattern "\[\[00 -|\[\[01 - Arquitetura\]\]|\[\[02 - Design System\]\]"
```
Expected: Protocolo presente; linha §8.2 presente; **zero** ligações quebradas para ficheiros apagados.

---

## Task 10: Verificação Final

**Files:** (nenhuma — verificação)

- [ ] **Step 1: Confirmar entregas criadas**

```powershell
@("readme\01-Visao-Geral.md","readme\02-Backend.md","readme\03-Frontend.md","readme\04-Banco-de-Dados.md","readme\05-Docker.md","readme\06-Features.md","readme\07-Roadmap.md") | ForEach-Object { Test-Path $_ }
```
Expected: `True` para todos os 7.

- [ ] **Step 2: Confirmar que os velhos não existem**

```powershell
Test-Path "readme\00 - Índice.md","readme\01 - Arquitetura.md","readme\02 - Design System.md"
```
Expected: `False` para todos os 3.

- [ ] **Step 3: Verificar links `[[ ]]` no agents.md**

```powershell
Select-String -Path agents.md -Pattern "\[\[0[012] -|\[\[00 -|\[\[01 - Arquitetura\]\]|\[\[02 - Design System\]\]"
```
Expected: **zero** ocorrências de ficheiros apagados.

- [ ] **Step 4: Verificar que cada ficheiro tem conteúdo real (não stubs)**

```powershell
Get-ChildItem readme\*.md | ForEach-Object { "{0}: {1} linhas" -f $_.Name, (Get-Content $_.FullName | Measure-Object -Line).Lines }
```
Expected: cada ficheiro ≥50 linhas (mínimo razoável para "narrativa honesta").

- [ ] **Step 5: Honestidade** — grep por `TODO|TBD|FIXME` nos 7 ficheiros:

```powershell
Select-String -Path readme\*.md -Pattern "TODO|TBD|FIXME"
```
Expected: zero.

---

## Auto-revisão

- Cobertura do spec: todas as entregas do spec §4/§7 cobertas — 7 ficheiros (T2-T8), apagamentos (T1), agents.md (T9), verificação (T10).
- Sem placeholders: tabelas/diagramas com valores reais ou instruções claras de fonte; prosa = redigida pelo implementer a partir de factos.
- Consistência: stack = Inter+JetBrains Mono (não IBM Plex); docker user/db = `kubeai` (marcado como vestígio);
- Verificação sem build: este plano opera sobre ficheiros soltos na raiz (não é repo git). Verificação = existência + grep + contagem de linhas.