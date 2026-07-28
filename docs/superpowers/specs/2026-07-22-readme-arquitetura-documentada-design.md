# Spec — README e Arquitetura Documentada do "Linux de Camões"

**Data:** 2026-07-22
Âmbito: raiz do repositório `linuxdecamoes/` (NÃO é o `frontend/`).
Idioma: PT-PT em toda a documentação nova.

---

## 1. Contexto e Problema

O repositório `linuxdecamoes/` é, simultaneamente, a app (frontend Next.js 16 +
backend FastAPI) e um Vault Obsidian (memória estratégica do projeto). Hoje a
**raiz está misturada**: ficheiros vault soltos (`00 - Índice.md`,
`01 - Arquitetura.md`, `02 - Design System.md`, `agents.md`) convivem com as
pastas de código (`frontend/`, `backend/`, `scripts/`) e com `docs/` (ADRs,
Normas, specs).

O utilizador quer uma **raiz limpa, ao estilo do README do projeto `tradingiq`**
(`C:\Users\ROG\Documents\DOCKER\tradingiq\README.md`): um `README.md` público de
portefólio forte na raiz + estrutura organizada, com a documentação interna do
vault recolhida numa pasta dedicada (`readme/`, já criada e vazia).

Adicionalmente, o polimento premium do template MDX (concluído em
`frontend/docs/superpowers/plans/2026-07-22-mdx-template-premium-polish.md`,
commits `41cb483`→`158d72e`) ainda **não está registado** na memória do projeto
(`agents.md` §8.2 e `docs/Arquitetura dos Manuais.md`).

## 2. Goals

1. Criar `linuxdecamoes/README.md` — README público, completo e **honesto** sobre
   o estado real do projeto, inspirado na estrutura do `tradingiq/README.md`.
2. Mover os 3 `.md` estratégicos do vault da raiz para `readme/` (limpar a raiz).
3. Documentar o polimento MDX premium em `agents.md` §8.2 e em
   `docs/Arquitetura dos Manuais.md`.

## 3. Decisões (aprovadas)

- **Estrutura = Opção A** — `README.md` na raiz (público) + `readme/` abriga os
  docs internos do vault. `docs/` (ADRs/Normas/specs/plans) **intocada** no local.
- **`agents.md` fica na raiz** — é o "system prompt supremo", ponto de entrada
  canónico lido antes de qualquer tarefa; mover partiria automação. Só os 3
  ficheiros `00/01/02` se mudam.
- **Profundidade do README = "completo e honesto"** — ao estilo tradingiq mas
  adaptado ao estado real (Fase 5 terminal K8s pendente, Fase 6 quizzes parcial),
  **sem inventar** deploy de produção nem screenshots (não existem).
- **Licença = MIT** (open-source, alinhado com `agents.md` §9; não existe
  `LICENSE` no repo — será criado).

## 4. Arquitetura / Entregáveis

### 4.1 Novo `linuxdecamoes/README.md` (raiz)

Estrutura (PT-PT; cabeçalho com o SVG do logo `linuxdecamoes.svg`):

1. **Título + banner de estado** — "Linux de Camões"; status: MVP, Fase 5
   (terminal K8s) pendente.
2. **Contexto do Projeto** — problema (falta de prática segura e material em PT
   para admin Linux / cert LPI) / solução (plataforma open-source: manuais LPI
   MDX, simulação, RAG, terminal real efémero, quizzes de repetição espaçada).
3. **Destaques** — manuais MDX premium (119 tópicos, callouts, terminais
   tokenizados OKLCH); RAG (1831 chunks, Groq `gpt-oss-20b`); terminal K8s
   (planeado, Fase 5); quizzes SM-2; design system OKLCH + Bento Grid.
4. **Stack Tecnológica** — tabela (Frontend / Backend / BD / RAG / Orquestração /
   Auth / IA), com estado real (⏳ onde aplicável).
5. **Arquitetura de Sistemas** — diagrama ASCII: Browser → Next.js 16 (SSR/SSG);
   Next ↔ FastAPI; FastAPI ↔ PostgreSQL + FAISS; pipeline Vault→MDX em build-time;
   pods K8s efémeros (planeados) para `/lab`.
6. **Estrutura do Projeto** — árvore ASCII comentada: `readme/` (docs vault),
   `docs/` (ADRs/Normas/specs), `frontend/`, `backend/`, `scripts/`,
   `docker-compose.yml`, `agents.md`; recursos externos `../Vault/` (114 tópicos
   LPI) e `../rag/`.
7. **Como executar local** — honesto:
   - `docker compose up` → `db` (postgres:16, :5432) + `backend` (:8000) +
     `frontend` (:3001). Requer `../Vault` montado (SSG) + `frontend/.env.local`
     (Clerk + Groq keys).
   - Só frontend: `cmd /c "npm run dev"` (Windows/PowerShell; `.ps1` bloqueado).
   - Pré-requisitos: Docker, Node, chaves Clerk/Groq.
8. **Estado das Fases** — tabela real (Fases 0–4 ✅, 5 ⏳, 6 🟡), retida de
   `agents.md` §8.1.
9. **Roadmap** — pendentes (Fase 5 K8s/xterm; Fase 6 quizzes restantes; a11y;
   ADR-002/003; exceção `/lab` fora do design system).
10. **Licença** — MIT + `LICENSE` file.

### 4.2 Movimentos de ficheiros

- `00 - Índice.md` → `readme/00 - Índice.md`
- `01 - Arquitetura.md` → `readme/01 - Arquitetura.md`
- `02 - Design System.md` → `readme/02 - Design System.md`

### 4.3 Atualizações de documentação

- **`agents.md` §8.2** — nova entrada datada "2026-07-22 | Polimento premium do
  template MDX": pipeline agora MDX puro + `remark-gfm` + `remark-callout` +
  `rehype-slug`; 19 tokens OKLCH; conversor reescrito + 119 `.mdx` regerados;
  `Callout`/`ExerciseCard`/`DistributionCard` registados; stack `react-markdown`
  removida. Referenciar spec/plano do frontend.
- **`docs/Arquitetura dos Manuais.md`** — secção/subsecção sobre o pipeline MDX
  premium atualizado (conversor slimmed, tabelas markdown via remark-gfm,
  admonitions via remark-callout `[!note/tip/warning/danger]`, anchors via
  rehype-slug, `mdxMetaRegistry` com frontmatter real).

## 5. Segurança de ligações Obsidian `[[ ]]`

Os 3 ficheiros movem **dentro do mesmo vault**. O Obsidian resolve ligações por
**nome de ficheiro** (não por caminho), por isso `[[01 - Arquitetura]]`,
`[[02 - Design System]]`, `[[00 - Índice]]` continuam válidos a partir de
`agents.md` e entre os próprios ficheiros. Ligações para `docs/` (Normas, ADRs)
não são afetadas (não se movem). **Verificar** se há referências de caminho
relativo (raras) e ajustar.

## 6. Casos-limite e riscos

- **R1 — auto-leitura de `agents.md`:** mitigado (fica na raiz).
- **R2 — links `[[ ]]`:** mitigado (mesmo vault; ver §5).
- **R3 — honestidade do README:** não claimar funcionalidades pendentes como
  prontas (Fase 5/6). O `docker compose up` é real (existe `docker-compose.yml`
  com db+backend+frontend).
- **R4 — codename extinto "KubeAI":** o `docker-compose.yml` ainda usa
  `POSTGRES_USER/DB=kubeai`. **Fora do âmbito** deste spec (apenas sinalizado);
  não alterar sem aprovação.
- **R5 — sem git na raiz:** `linuxdecamoes/` não é repo git (só `frontend/` tem
  `.git`). Os entregáveis da raiz **não ficam versionados** por git; o spec
  também não. Aceitável (opera-se sobre ficheiros soltos).

## 7. Verificação

- `README.md` renderiza em markdown (revisão visual do conteúdo; sem gates de
  build — é documentação).
- Confirmar que os 3 ficheiros existem em `readme/` e **não** na raiz.
- Abrir `agents.md` no Obsidian e confirmar que `[[01 - Arquitetura]]`,
  `[[02 - Design System]]`, `[[00 - Índice]]` **continuam a resolver** (sem
  "unresolved mentions").
- `grep` a `[[01 - Arquitetura]]` / `[[02 - Design System]]` em `agents.md` para
  confirmar que as ligações permanecem.
- Confirmar `LICENSE` criado na raiz.

## 8. Inventário de ficheiros

**Criar:**
- `linuxdecamoes/README.md`
- `linuxdecamoes/LICENSE` (MIT)

**Mover (raiz → readme/):**
- `00 - Índice.md`, `01 - Arquitetura.md`, `02 - Design System.md`

**Modificar:**
- `linuxdecamoes/agents.md` (§8.2 + verificação de links)
- `linuxdecamoes/docs/Arquitetura dos Manuais.md` (pipeline MDX premium)

**Reutilizar (ler, não alterar):**
- `agents.md` §3 (stack), §8.1 (fases), §9 (restrições) — fonte de verdade para
  o conteúdo do README.
- `C:\Users\ROG\Documents\DOCKER\tradingiq\README.md` — referência de estrutura.
- `frontend/docs/superpowers/specs/2026-07-22-mdx-template-premium-polish-design.md`
  + `.../plans/2026-07-22-mdx-template-premium-polish.md` — fonte dos factos do
  polimento MDX a documentar.
