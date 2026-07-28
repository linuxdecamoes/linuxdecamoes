# Features — Projeto Linux de Camões

## 1. Manuais MDX Premium

O pipeline de manuais é o coração editorial do projeto. O ponto de partida é o Vault Obsidian com 114 tópicos LPI em Markdown cru, que são transformados em 119 páginas MDX por um conversor build-time (`scripts/convert-vault-to-mdx.ts`). Este script lê cada ficheiro `.md` do Vault, extrai frontmatter com `gray-matter`, converte estruturas de admonitions (`> **Tipo:**`) para a sintaxe `> [!note]` do `remark-callout`, e transforma wikilinks do Obsidian em referências internas MDX. O output são 119 ficheiros `.mdx` organizados por manual em `src/content/manuals/`.

Cada ficheiro MDX passa por três plugins `remark`/`rehype` em sequência: `remark-gfm` para tabelas GitHub-flavored, `remark-callout` que converte blocos `[!note/tip/warning/danger]` em componentes React `<Callout>` com cores OKLCH, e `rehype-slug` que gera IDs de heading coerentes para âncoras de TOC. O resultado é registado num barrel `src/content/manuals/index.ts` com três registo: `mdxRegistry` (conteúdo React), `mdxTocRegistry` (estrutura TOC) e `mdxMetaRegistry` (frontmatter real — objective, weight, tags).

**Cinco manuais** cobrem as certificações LPI: LPIC-1 101 (1001–1005), LPIC-1 102 (101–105), LPIC-2 201 (200–204), LPIC-2 202 (210–215) e LPIC-1 Essentials (compendio). Cada manual é acessível via `/manuals/[code]` e cada tópico via `/manuals/[code]/[slug]`.

### Layout 3-Zone Premium

Acima de 1280px, cada página de tópico renderiza um layout de três zonas: **TOC sticky à esquerda** com scroll-spy via `IntersectionObserver` + `ReadingProgress` (barra de progresso CSS com variável `--progress`), **conteúdo central** com o MDX renderizado, e **Meta sticky à direita** com `TopicMeta` (objective, weight, tags reais extraídas do frontmatter). Em ecrãs mais estreitos, o TOC colapsa e o layout reverte para uma coluna única.

### Componentes Premium

Oito componentes React estão registados globalmente em `useMDXComponents` (`src/mdx-components.tsx`), todos tokenizados em OKLCH (19 tokens, Norma 01):

| Componente | Função |
|---|---|
| `Callout` | Notas, dicas, warnings e dangers — gerado automaticamente pelo `remark-callout` |
| `ExerciseCard` | Exercícios guiados e exploratórios, com bloco de terminal tokenizado |
| `DistributionCard` | Fichas de distribuições Linux (Debian, Ubuntu, Fedora, etc.) |
| `SolutionBlock` | Soluções colapsáveis de exercícios (`<details>`) |
| `TopicHero` | Hero de tópico com watermark SVG e badges de certificação |
| `CommandTable` | Tabelas de comandos auto-detectadas por heurística (headers + `inlineCode`) com `CopyButton` por linha |
| `ReadingProgress` | Barra de progresso de leitura via `IntersectionObserver` |
| `Accordion` | Base UI para secções de objetivos em `/manuals/[code]` |

O build SSG gera 131 páginas estáticas (119 tópicos + 6 manuais + 6 páginas de lista). Stack de build: Next.js 16.2.10 App Router, `@next/mdx`, zero dependências de runtime para animação (ADR-001 — apenas `tw-animate-css` + keyframes CSS próprios). Detalhes completos em [[docs/Arquitetura dos Manuais]].

---

## 2. RAG Chat

O sistema RAG (Retrieval-Augmented Generation) permite aos utilizadores conversar com um assistente fundamentado nos manuais LPI. O fluxo completo é: query do utilizador → embedding via `paraphrase-multilingual-MiniLM-L12-v2` (384 dims, normalizados) → pesquisa vetorial no índice FAISS com 1831 chunks → seleção top-k → formatação do contexto com fontes + scores → envio ao LLM Groq (`openai/gpt-oss-20b`, temperature 0.3, max 1024 tokens).

O modelo de embeddings MiniLM-L12-v2 é multilingue e suporta PT-PT nativamente, o que é essencial dado que todo o conteúdo está em português europeu. Os 1831 chunks foram gerados a partir dos 114 tópicos LPI do Vault, com chunking semântico que preserva a estrutura de secções.

**Endpoints expostos pelo backend FastAPI:**

- `POST /api/search` — pesquisa vetorial pura, retorna top-k chunks com scores de similaridade
- `POST /api/chat` — chat completo, combina chunks relevantes com prompt de sistema e devolve resposta fundamentada com citações

A interface do chat está em `/dashboard/chat`, uma Client Component que faz streaming da resposta e apresenta as fontes consultadas (tópicos LPI + scores). A base vetorial atual vive em FAISS em memória (`../rag/pipeline.py`), com migração planeada para PostgreSQL + `pgvector` para persistência partilhada entre instâncias.

---

## 3. Quizzes (Repetição Espaçada SM-2)

O sistema de quizzes combina geração automática por IA com o algoritmo de repetição espaçada SM-2 (SuperMemo 2). Cada quiz é gerado pelo LLM: o endpoint `POST /quizzes/generate/{topic_id}` envia o conteúdo do tópico via RAG ao Groq, que produz 5 questões de múltipla escolha por tópico (temperature 0.4, max 4096 tokens). O script `generate_all_quizzes.py` orquestra a geração em lote.

**Algoritmo SM-2:** cada vez que o utilizador responde a uma questão, o sistema calcula o `next_review` com base na qualidade da resposta (0–5), no `ease_factor` atual e no número de repetições. Questões erradas ou difíceis são reapresentadas mais cedo; questões fáceis são espaçadas mais. O histórico de revisões é guardado na tabela `quiz_results` do PostgreSQL com `next_review` e `ease_factor` por questão.

**Estado atual: 58/114 tópicos com quizzes** (~290 questões geradas). 56 tópicos restantes pendentes por rate limit do Groq (`openai/gpt-oss-20b`, 200k TPD esgotado). O script está pronto a executar — a solução é mudar para `llama-3.1-8b-instant` (sem rate limit) ou esperar reset diário.

**O que falta:** completar geração para os tópicos restantes, integrar o histórico de sessão terminal no cálculo de repetição (rubrica LLM → nota → afinação do SM-2), e corrigir o bug de utilizador hardcoded no endpoint de quizzes.

**Interface do quiz-taker:** `/dashboard/quizzes/[manual]/[slug]` é uma Client Component interativa que apresenta as questões uma a uma, valida respostas, mostra feedback imediato e regista o resultado no backend para o SM-2 calcular a próxima revisão.

---

## 4. Auth

A autenticação é gerida pela Clerk com tier grátis até 10k MAU (Monthly Active Users), suficiente para MVP. O integration flow é: `<ClerkProvider>` no layout raiz + middleware Next.js que protege rotas `/dashboard/*` e `/lab`. As páginas públicas (`/`, `/manuals/*`, `/sign-in`, `/sign-up`) são acessíveis sem autenticação.

O Clerk emite JWTs que o frontend valida automaticamente. No backend FastAPI, o middleware Clerk verifica o token em cada request API, extraindo o `clerk_id` para associar dados ao utilizador (progresso, quizzes, sessões de chat). As rotas de sign-in e sign-up são Server Components com o componente `<SignIn/>` / `<SignUp/>` do Clerk.

O fluxo de utilizador é: landing page pública → sign-up/sign-in → redirecionamento para `/dashboard` → Bento Grid com dados pessoais. Utilizadores não autenticados que acedem a `/dashboard` são redirecionados para `/sign-in` pelo middleware.

---

## 5. Dashboard

O dashboard (`/dashboard`) é uma Bento Grid assimétrica de 12 colunas (Norma 02), mobile-first (1 col → 6 col `md` → 12 col `lg`), com 8 cartões que apresentam dados do utilizador. A regra de soma garante que cada linha soma exatamente 12 colunas em `lg` — zero buracos.

| Cartão | Conteúdo | Span |
|---|---|---|
| Manuais | Progresso de leitura por manual LPI | 6 col |
| Streak | Dias consecutivos de atividade | 6 col |
| Quizzes | Quizzes completados / pendentes | 4 col |
| Chat IA | Últimas interações RAG | 4 col |
| Tópicos | Tópicos estudados / total | 4 col |
| Certificação | Progresso para certificação LPI | 6 col |
| Atividade | Gráfico de atividade recente | 6 col |
| Achievements | Conquistas e badges | 12 col |

Os cartões usam tokens OKLCH exclusivos (zero cores inline em `.tsx` — Norma 01), glassmorphism discreta via tokens `--glass-*`, e sombras Bento via `shadow-bento` / `hover:shadow-bento-hover`. O layout é totalmente responsivo: em mobile os cartões empilham em coluna única.

**Bug conhecido:** os dados dos cartões estão hardcoded (mockados) em vez de serem buscados do backend FastAPI. O ADR-002 (estratégia de dados — Server Components vs FastAPI) ainda não foi decidido.

---

## Bugs Conhecidos

| Bug | Descrição | Impacto |
|---|---|---|
| **Dashboard cards hardcoded** | Os 8 cartões do dashboard apresentam dados mockados em vez de dados reais do utilizador do backend | Os utilizadores não veem o seu progresso real — experiência enganosa |
| **Streak bugado** | Cartão Streak mostra dias `Q` duplicados e `activeDays` hardcoded (não reflete atividade real) | Métrica de consistência inventada — não motiva o utilizador |
| **Quiz user hardcoded** | Endpoint de quizzes usa ID de utilizador hardcoded em vez do utilizador autenticado via Clerk | Todos os utilizadores partilham o mesmo histórico de quizzes — dados corrompidos |
| **Mismatch `completeTask`** | Lógica de conclusão de tarefas inconsistente entre frontend (Client) e backend (FastAPI) | Tarefas podem ser marcadas como concluídas sem serem registadas no backend ou vice-versa |
| **Manuais sem auth redirect** | Páginas de manual não redirecionam para login quando necessário (ex.: `/manuals/[code]/[slug]` em conteúdo restrito) | Utilizador vê conteúdo vazio ou erro em vez de ser convidado a autenticar |
| **`/lab` fora do design system** | Rota `/lab` usa cor hardcoded `#0E1525` em vez de tokens OKLCH | Exceção visual que quebra a coerência do design system (ADR-001) |

---

## Métricas

| Métrica | Valor | Notas |
|---|---|---|
| Tópicos LPI no Vault | 114 | Fonte original dos manuais |
| Páginas MDX geradas | 119 | Alguns tópicos divididos em múltiplas páginas |
| Páginas SSG no build | 131 | 119 tópicos + 6 manuais + 6 listas |
| Manuais LPI | 5 | LPIC-1 101, LPIC-1 102, LPIC-2 201, LPIC-2 202, Essentials |
| Chunks RAG | 1831 | FAISS, embeddings 384 dims |
| Tokens OKLCH | 19 | callout/terminal/tabela/hero |
| Componentes MDX | 8 | Callout, ExerciseCard, DistributionCard, SolutionBlock, TopicHero, CommandTable, ReadingProgress, Accordion |
| Quizzes gerados | ~290 | 58/114 tópicos com quizzes |
| Tópicos pendentes (quizzes) | 56 | Rate limit Groq (200k TPD esgotado) |
| Questões por quiz | 5 | Geradas por LLM via RAG |
| Colunas da Bento Grid | 12 | Regra de soma: 0 buracos em `lg` |
| Endpoints FastAPI | 14 | CRUD + RAG + quizzes + chat |
| Tabelas PostgreSQL | 6 | User, Manual, Topic, UserProgress, Quiz, QuizResult |
| MAU tier Clerk | 10k | Suficiente para MVP |
