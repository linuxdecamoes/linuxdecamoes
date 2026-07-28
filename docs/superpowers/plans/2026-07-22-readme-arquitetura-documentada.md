# README e Arquitetura Documentada — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Limpar a raiz de `linuxdecamoes/`, criar um `README.md` público de portefólio (estilo `tradingiq`, honesto sobre o estado real), mover a documentação interna do vault para `readme/`, e registar o polimento premium MDX na memória do projeto.

**Architecture:** Tarefa de documentação + movimentos de ficheiros. Sem código, sem gates de build/lint (a raiz não é repositório git nem parte do build do `frontend/`). Verificação = revisão de markdown + checagens de existência de ficheiros + resolução de ligações Obsidian `[[ ]]`.

**Tech Stack:** Markdown (GitHub-flavored) + Obsidian vault.

**Contexto crítico (ler antes de começar):**
- A raiz `linuxdecamoes/` **NÃO é repositório git** (só `frontend/` tem `.git`). → **Não há commits** em nenhuma tarefa deste plano. Opera-se diretamente sobre ficheiros soltos.
- `agents.md` fica na raiz (não se move) — é o ponto de entrada de auto-leitura.
- Fonte de verdade para os factos do README: `agents.md` §3 (stack), §8.1 (fases), §9 (restrições), §10 (roadmap). **Lê esses ficheiros antes de redigir o README.**
- Fonte dos factos do polimento MDX: `frontend/docs/superpowers/specs|plans/2026-07-22-mdx-template-premium-polish*` + commits `41cb483`→`158d72e`.
- PT-PT em toda a documentação nova. Marca = **"Linux de Camões"** (codename "KubeAI" extinto).
- **NÃO mexer** nos ficheiros pré-existentes não commitados do working tree do `frontend/` (header/footer/auth/svg/api) — fora de âmbito.
- **NÃO alterar** o codename `kubeai` em `docker-compose.yml` (R4 — sinalizado no spec, fora de âmbito).

---

## Task 1: Mover os 3 ficheiros vault para `readme/` + verificar ligações `[[ ]]`

**Files:**
- Move: `00 - Índice.md` → `readme/00 - Índice.md`
- Move: `01 - Arquitetura.md` → `readme/01 - Arquitetura.md`
- Move: `02 - Design System.md` → `readme/02 - Design System.md`

- [ ] **Step 1: Confirmar que os 3 ficheiros existem na raiz e `readme/` está vazia**

Run (PowerShell):
```powershell
Get-ChildItem "00 - Índice.md","01 - Arquitetura.md","02 - Design System.md"
Get-ChildItem "readme"
```
Expected: os 3 ficheiros listados; `readme/` vazia (ou sem estes nomes).

- [ ] **Step 2: Mover os 3 ficheiros**

Run:
```powershell
Move-Item -LiteralPath "00 - Índice.md" -Destination "readme\"
Move-Item -LiteralPath "01 - Arquitetura.md" -Destination "readme\"
Move-Item -LiteralPath "02 - Design System.md" -Destination "readme\"
```

- [ ] **Step 3: Confirmar o movimento**

Run:
```powershell
Get-ChildItem "readme\00 - Índice.md","readme\01 - Arquitetura.md","readme\02 - Design System.md"
Get-ChildItem "00 - Índice.md","01 - Arquitetura.md","02 - Design System.md" -ErrorAction SilentlyContinue
```
Expected: os 3 existem em `readme/`; **não** existem mais na raiz.

- [ ] **Step 4: Verificar que não há referências de caminho relativo quebradas**

O Obsidian resolve `[[ ]]` por **nome de ficheiro**, por isso `[[01 - Arquitetura]]`, `[[02 - Design System]]`, `[[00 - Índice]]` continuam válidas. Procurar referências de **caminho relativo** explícito (raras, que partem com o move):

Run (ripgrep):
```powershell
rg -n "\]\(\.\.?/0[012] -|\]\(\.\.?/01%20|%200[012]%20" agents.md "readme" docs
```
Expected: **sem correspondências** (ou só correspondências dentro de `readme/` que apontam para o próprio ficheiro). Se aparecer alguma referência relativa `](./01 - ...)` em `agents.md`, ajustar para o caminho novo `](./readme/01 - ...)` ou converter para `[[01 - Arquitetura]]`.

- [ ] **Step 5: Confirmar ligações `[[ ]]` canónicas a partir de `agents.md`**

Run:
```powershell
rg -n "\[\[01 - Arquitetura\]\]|\[\[02 - Design System\]\]|\[\[00 - Índice\]\]" agents.md
```
Expected: as 3 ligações presentes (continuam a resolver por nome de ficheiro, mesmo vault).

- [ ] **Step 6: Não há commit** (raiz não é repo git). Tarefa concluída por movimento de ficheiro.

---

## Task 2: Criar `LICENSE` (MIT)

**Files:**
- Create: `LICENSE`

- [ ] **Step 1: Criar o ficheiro LICENSE com texto MIT**

Conteúdo exato (placeholder do ano/autor preenchido: ano `2026`, titular `Linux de Camões`):

```
MIT License

Copyright (c) 2026 Linux de Camões

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

- [ ] **Step 2: Confirmar existência**

Run:
```powershell
Get-Content LICENSE | Select-Object -First 3
```
Expected: linhas `MIT License`, em branco, `Copyright (c) 2026 Linux de Camões`.

---

## Task 3: Criar `README.md` na raiz (estilo tradingiq, completo e honesto)

**Files:**
- Create: `README.md`

**Pré-requisito:** Ler `agents.md` (§3 stack, §8.1 fases, §9 restrições, §10 roadmap) antes de redigir — é a fonte de verdade.

- [ ] **Step 1: Criar `README.md` com as 10 secções**

Cabeçalho com o logo (`public/linuxdecamoes.svg`). Estrutura e conteúdo **exato** abaixo. (As tabelas e diagramas ASCII são determinísticos — usar literal. A prosa de ligação é redigida em PT-PT, cobrindo os pontos listados em cada secção.)

Topo do ficheiro:
```markdown
<p align="center">
  <img src="public/linuxdecamoes.svg" alt="Linux de Camões" width="220" />
</p>

<h1 align="center">Linux de Camões</h1>

<p align="center">
  <em>Plataforma open-source de aprendizagem e simulação de administração Linux, baseada nos manuais de certificação LPI.</em>
</p>

<p align="center">
  <strong>Estado:</strong> MVP &nbsp;·&nbsp; Frontend + Backend + RAG &nbsp;✅&nbsp; · &nbsp;Terminal Kubernetes (Fase 5) &nbsp;⏳&nbsp; pendente
</p>

---
```

**§1–2 — Título/banner (acima) + §2 Contexto do Projeto:**
- Heading `## 📖 Contexto`.
- Parágrafo do **problema**: falta de prática segura e material em PT-PT para administração Linux e certificação LPI.
- Parágrafo da **solução**: plataforma open-source que combina manuais LPI em MDX, simulação, RAG, terminal real efémero e quizzes de repetição espaçada (SM-2). Identidade de marca = "Linux de Camões".

**§3 — Destaques** (`## ✨ Destaques`), lista:
- 📘 **Manuais MDX premium** — 119 tópicos com callouts (`Nota`/`Dica`/`Aviso`/`Perigo`), blocos de terminal tokenizados e design system OKLCH.
- 🔍 **RAG** — 1831 chunks LPI + FAISS + Groq (`gpt-oss-20b`) para chat fundamentado nos manuais.
- 🖥️ **Terminal real** — pods efémeros de Kubernetes com xterm.js (planeado, Fase 5).
- 🧠 **Quizzes SM-2** — repetição espaçada gerada por IA (parcial, 62/92 tópicos).
- 🎨 **Design System** — OKLCH + Bento Grid 12 colunas, glassmorphism discreta, zero dependências de runtime para animação.

**§4 — Stack Tecnológica** (`## 🧰 Stack Tecnológica`), tabela **literal** (valores reais de `agents.md` §3):
```markdown
| Camada | Tecnologia | Estado |
| --- | --- | :-: |
| **Frontend** | Next.js 16.2.10 (App Router, Turbopack) · React 19 · Tailwind v4 · shadcn/ui (`@base-ui/react`) · Clerk · IBM Plex Sans/Mono · lucide-react | ✅ |
| **Terminal UI** | xterm.js no `/lab` | ⏳ Fase 5 |
| **Backend** | FastAPI (Python 3.12) · SQLAlchemy/SQLModel · Alembic | ✅ |
| **Base de Dados** | PostgreSQL (+ `pgvector` planeado) | ✅ |
| **RAG** | FAISS + `sentence-transformers` (`paraphrase-multilingual-MiniLM-L12-v2`) · Groq (`gpt-oss-20b`) · 114 tópicos → 1831 chunks | ✅ |
| **Orquestração** | Kubernetes (pods efémeros por utilizador) | ⏳ Fase 5 |
| **Auth** | Clerk (JWT, proteção de rotas) | ✅ |
| **IA** | LLM Groq — chat RAG, geração de quizzes, avaliação de comandos | ✅/⏳ |
```

**§5 — Arquitetura de Sistemas** (`## 🏗️ Arquitetura de Sistemas`), diagrama ASCII **literal**:
````markdown
```text
                  ┌───────────────────────────────────────────────┐
                  │              Browser (xterm.js)                │
                  └────────────────────────┬───────────────────────┘
                                           │ HTTP / WebSocket
                  ┌────────────────────────▼───────────────────────┐
                  │   Frontend — Next.js 16 (SSR / SSG)            │
                  │   Manuais MDX • Auth Clerk • UI OKLCH / Bento  │
                  └─────────┬──────────────────────────┬───────────┘
                            │ REST                     │ (build-time)
                  ┌─────────▼──────────┐   ┌───────────▼────────────────┐
                  │  Backend FastAPI   │   │  Vault → MDX pipeline      │
                  │  :8000             │   │  (119 tópicos LPI)         │
                  └──────┬──────────┬──┘   └────────────────────────────┘
                         │          │
            ┌────────────▼───┐  ┌───▼──────────────────┐
            │  PostgreSQL    │  │  FAISS + Groq        │
            │  :5432         │  │  RAG (1831 chunks)   │
            └────────────────┘  └──────────────────────┘

  (Planeado · Fase 5)  Pods efémeros K8s  ◄──►  túnel WebSocket  →  /lab
```
````

**§6 — Estrutura do Projeto** (`## 📂 Estrutura do Projeto`), árvore ASCII **literal**:
````markdown
```text
linuxdecamoes/
├── README.md                  # Este ficheiro (público)
├── LICENSE                    # MIT
├── agents.md                  # System prompt supremo (auto-leitura de agentes)
├── docker-compose.yml         # db + backend + frontend
├── readme/                    # Documentação interna do vault Obsidian
│   ├── 00 - Índice.md
│   ├── 01 - Arquitetura.md
│   └── 02 - Design System.md
├── docs/                      # ADRs · Normas · Design System · specs · plans
│   └── superpowers/{specs,plans}/
├── frontend/                  # Next.js 16 (repositório git isolado)
├── backend/                   # FastAPI
├── scripts/                   # Utilitários e conversores
├── public/                    # Assets (logo SVG)
└── (recursos externos ao repo)
    ├── ../Vault/              # 114 tópicos LPI (fonte do MDX + RAG)
    └── ../rag/                # pipeline RAG (FAISS + embeddings)
```
````

**§7 — Como executar local** (`## 🚀 Como executar local`), **honesto** (cobre os 2 caminhos reais):
```markdown
### Opção A — Stack completo (Docker)

```bash
docker compose up
```

Sobe três serviços:

| Serviço | Porta | Notas |
| --- | --- | --- |
| `db` (PostgreSQL 16) | `:5432` | user/db `kubeai` |
| `backend` (FastAPI) | `:8000` | `DATABASE_URL`, chaves Clerk/Groq |
| `frontend` (Next.js) | `:3001 → 3000` | monta `../Vault` (SSG), `frontend/.env.local` |

**Pré-requisitos:** Docker; `../Vault/` acessível; `frontend/.env.local` com chaves Clerk + Groq.

### Opção B — Só frontend (desenvolvimento)

Windows / PowerShell (os scripts `.ps1` estão bloqueados pela execution policy):

```bash
cmd /c "npm run dev"
```

A partir de `frontend/`. Pré-requisitos: Node + `frontend/.env.local`.
```

> Nota: **não claimar** deploy de produção — não existe. O `docker compose up` é o caminho local real.

**§8 — Estado das Fases** (`## 📑 Estado das Fases`), tabela **literal** (retida de `agents.md` §8.1):
```markdown
| Fase | Estado |
| --- | :-: |
| 0 — Cofre de Contexto | ✅ |
| 1 — Init Repo | ✅ |
| 2 — Frontend Base | ✅ |
| 3 — Backend API | ✅ |
| 4 — RAG | ✅ |
| 5 — Terminal K8s (xterm.js + pods efémeros) | ⏳ |
| 6 — Quizzes (repetição espaçada SM-2) | 🟡 parcial (62/92 tópicos) |
```

**§9 — Roadmap** (`## 🗺️ Roadmap`), lista (de `agents.md` §10):
- Fase 5 — Terminal Kubernetes: manifestos `k8s/`, túnel WebSocket, integração xterm.js no `/lab`.
- Fase 6 — Quizzes: gerar para os tópicos restantes (rate limit Groq).
- Acessibilidade — `focus-visible`, `aria-live` no provisionamento do terminal.
- Eliminar a exceção `/lab` fora do design system (substituir hex por tokens).
- ADR-002 — estratégia de dados do dashboard; ADR-003 — WebSocket vs SSE.

**§10 — Licença** (`## 📄 Licença`):
```markdown
Distribuído sob a licença **MIT**. Ver [`LICENSE`](./LICENSE).
```

Rodapé:
```markdown
---

<sub>Feito em Português europeu. Open source. Zero custos.</sub>
```

- [ ] **Step 2: Confirmar que o README renderiza (revisão de conteúdo)**

Run:
```powershell
(Get-Content README.md | Measure-Object -Line).Lines
Select-String -Path README.md -Pattern "^## "
```
Expected: ficheiro com ~120–160 linhas; 10 headings `## ` (Contexto, Destaques, Stack, Arquitetura, Estrutura, Como executar, Estado das Fases, Roadmap, Licença — o banner superior não tem `##`). Confirmar que **não há** `TBD`/`TODO`/`lorem`.

- [ ] **Step 3: Confirmar honestidade (sem funcionalidades pendentes claimadas como prontas)**

Revisar que a secção §8 marca Fase 5 como ⏳ e Fase 6 como 🟡, e §7 não menciona deploy de produção. Confirmar que o logo referenciado (`public/linuxdecamoes.svg`) existe:
```powershell
Test-Path "public\linuxdecamoes.svg"
```
Expected: `True`.

---

## Task 4: Registral o polimento MDX premium em `agents.md` §8.2

**Files:**
- Modify: `agents.md` (secção §8.2 Histórico)

**Pré-requisito:** Ler o bloco §8.2 atual para localizar a última linha (entrada `2026-07-21` do redesign `/manuals`).

- [ ] **Step 1: Adicionar nova linha à tabela de §8.2**

Na tabela `### 8.2 Histórico (condensado)` (formato `| Data | Ação | Resultado |`), adicionar **depois** da última linha (`2026-07-21 | Redesign /manuals ...`) esta linha **literal**:

```markdown
| 2026-07-22 | **Polimento premium do template MDX:** pipeline agora MDX puro + `remark-gfm` (tabelas) + `remark-callout` (`[!note/tip/warning/danger]` → `<Callout>`) + `rehype-slug` (anchors TOC); 19 tokens OKLCH (callout/terminal/tabela/hero); conversor reescrito + 119 `.mdx` regerados; `Callout`/`ExerciseCard`/`DistributionCard` registados globalmente; `mdxMetaRegistry` com frontmatter real no `TopicMeta`; stack `react-markdown` morta removida. Spec `frontend/docs/superpowers/specs/2026-07-22-mdx-template-premium-polish-design.md`, plano `.../plans/2026-07-22-mdx-template-premium-polish.md`, commits `41cb483`→`158d72e`. | ✅ [[Arquitetura dos Manuais]] |
```

- [ ] **Step 2: Confirmar a inserção**

Run:
```powershell
Select-String -Path agents.md -Pattern "2026-07-22 \| \*\*Polimento premium"
```
Expected: 1 correspondência.

- [ ] **Step 3: Verificar que as ligações `[[ ]]` para os ficheiros movidos continuam presentes e válidas**

Run:
```powershell
Select-String -Path agents.md -Pattern "\[\[01 - Arquitetura\]\]|\[\[02 - Design System\]\]|\[\[00 - Índice\]\]|\[\[Arquitetura dos Manuais\]\]"
```
Expected: correspondências presentes (resolvem por nome de ficheiro, mesmo vault — Task 1 já garantiu o move).

---

## Task 5: Documentar o pipeline MDX premium em `docs/Arquitetura dos Manuais.md`

**Files:**
- Modify: `docs/Arquitetura dos Manuais.md`

**Pré-requisito:** Ler o ficheiro para encontrar o local adequado (secção sobre o pipeline de conteúdo / conversão MDX). Se não existir secção de pipeline, adicionar no fim.

- [ ] **Step 1: Adicionar subsecção sobre o pipeline MDX premium**

Adicionar (ou fundir com secção existente sobre conteúdo MDX) o bloco **literal**:

```markdown
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
```

- [ ] **Step 2: Confirmar a inserção**

Verificar:
```powershell
Select-String -Path "docs\Arquitetura dos Manuais.md" -Pattern "Pipeline de conteúdo MDX|remark-callout|mdxMetaRegistry"
```
Expected: 3 correspondências (heading, remark-callout, mdxMetaRegistry).

- [ ] **Step 3: Confirmar que ligações `[[ ]]` internas (Normas/ADRs) não foram afetadas**

O bloco adicionado usa caminhos de ficheiro do frontend, não `[[ ]]`, por isso não introduz ligações Obsidian novas. Confirmar que não se apagou nenhuma linha existente (diff visual).

---

## Task 6: Verificação final

**Files:** (nenhuma — verificação apenas)

- [ ] **Step 1: Confirmar entregáveis criados/movidos**

Run:
```powershell
Test-Path README.md, LICENSE, "readme\00 - Índice.md", "readme\01 - Arquitetura.md", "readme\02 - Design System.md"
```
Expected: `True` para todos os 5.

- [ ] **Step 2: Confirmar que os 3 ficheiros NÃO estão mais na raiz**

Run:
```powershell
Test-Path "00 - Índice.md", "01 - Arquitetura.md", "02 - Design System.md"
```
Expected: `False` para todos os 3.

- [ ] **Step 3: Confirmar atualizações de documentação**

Run:
```powershell
Select-String -Path agents.md -Pattern "2026-07-22 \| \*\*Polimento premium"
Select-String -Path "docs\Arquitetura dos Manuais.md" -Pattern "Pipeline de conteúdo MDX"
```
Expected: 1 correspondência em cada.

- [ ] **Step 4: Verificação final de ligações Obsidian `[[ ]]`**

Confirmar que `agents.md` ainda referencia os ficheiros movidos por nome (continuam a resolver no mesmo vault):
```powershell
Select-String -Path agents.md -Pattern "\[\[01 - Arquitetura\]\]|\[\[02 - Design System\]\]|\[\[00 - Índice\]\]"
```
Expected: correspondências presentes.

- [ ] **Step 5: Revisão de honestidade do README**

Ler o `README.md` gerado e confirmar:
- Fase 5 marcada ⏳ (não ✅).
- Fase 6 marcada 🟡 parcial (não ✅).
- Nenhuma menção a deploy de produção / screenshots.
- Logo `public/linuxdecamoes.svg` referenciado e existente.

- [ ] **Step 6: Sem commit** (raiz não é repo git). Tarefa concluída.

---

## Auto-revisão (notas para o executor)

- **Cobertura do spec:** todas as entregas do spec §4/§8 estão cobertas — README (T3), LICENSE (T2), moves (T1), agents.md §8.2 (T4), Arquitetura dos Manuais (T5), verificação (T6 = spec §7).
- **Sem placeholders:** tabelas/diagramas/entradas são literais; a prosa de ligação do README é redigida a partir de pontos concretos + fonte `agents.md`.
- **Consistência:** a sigla `158d72e` (último commit MDX) aparece em T4 e T5 — usar sempre `158d72e`. O codename `kubeai` em `docker-compose.yml` **não se altera** (R4).
- **Verificação sem build:** este plano não tem gates de lint/build — a raiz não entra no build do frontend. Verificação = existência de ficheiros + grep + revisão markdown + resolução `[[ ]]`.
