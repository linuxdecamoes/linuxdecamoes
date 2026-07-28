# Backend — Linux de Camões

## Visão Geral

FastAPI (Python 3.12), SQLAlchemy async, Alembic. Três papéis: servir manuais via API, pipeline RAG, orquestração de quizzes.

## Estrutura do Projeto

```
backend/
├── main.py                # Entrypoint FastAPI + lifespan + CORS + routers
├── requirements.txt       # Dependências Python (14 pacotes)
├── Dockerfile
├── .env                   # Variáveis de ambiente (DATABASE_URL, CLERK, GROQ)
├── api/                   # Routers REST
│   ├── users.py           # CRUD utilizadores (Clerk ID)
│   ├── manuals.py         # Listagem e detalhe de manuais/tópicos
│   ├── quizzes.py         # Quizzes: submissão, SM-2, geração LLM
│   ├── study.py           # Progresso de estudo, gating por módulo
│   └── chat.py            # Chat IA RAG + pesquisa vetorial
├── core/
│   └── config.py          # Settings via pydantic-settings (.env)
├── db/
│   └── base.py            # Engine async SQLAlchemy + session factory
├── models/
│   └── models.py          # 6 tabelas: User, Manual, Topic, UserProgress, Quiz, QuizResult
├── rag/
│   ├── service.py         # FAISS search + SentenceTransformer (384 dims)
│   └── llm.py             # Groq API: chat RAG + geração de quizzes
├── data/
│   ├── lpi.index          # Índice FAISS (114 tópicos → 1831 chunks)
│   └── chunks.jsonl       # Chunks LPI serializados
└── scripts/
    ├── seed_manuals.py    # Seed de manuais/tópicos na BD
    ├── generate_all_quizzes.py  # Batch de geração de quizzes via LLM
    ├── count_quizzes.py   # Diagnóstico de quizzes gerados
    ├── add_generated_at.py
    ├── add_study_columns.py
    └── check_migration.py
```

## Configuração

| Variável | Descrição | Default |
|----------|-----------|---------|
| `DATABASE_URL` | PostgreSQL async (asyncpg) | `postgresql+asyncpg://kubeai:kubeai@db:5432/kubeai` |
| `CLERK_SECRET_KEY` | Chave secreta Clerk (auth) | _(obrigatória)_ |
| `CLERK_PUBLISHABLE_KEY` | Chave pública Clerk | _(obrigatória)_ |
| `GROQ_API_KEY` | API key Groq (LLM) | _(obrigatória)_ |
| `CORS_ORIGINS` | Origens permitidas | `localhost:3000`, `localhost:3001` |

Conexão PostgreSQL via SQLAlchemy async (`asyncpg`). Alembic disponível para migrações (pendente de configuração inicial).

## Endpoints Principais

| Método | Caminho | Descrição | Router |
|--------|---------|-----------|--------|
| `GET` | `/api/health` | Health check (status + versão) | `main.py` |
| `POST` | `/api/users/` | Criar utilizador (clerk_id, email) | `users` |
| `GET` | `/api/users/{clerk_id}` | Obter utilizador por Clerk ID | `users` |
| `GET` | `/api/manuals/` | Listar todos os manuais | `manuals` |
| `GET` | `/api/manuals/{code}` | Detalhe de um manual | `manuals` |
| `GET` | `/api/manuals/{code}/topics` | Tópicos de um manual (ordenados) | `manuals` |
| `GET` | `/api/quizzes/topic/{topic_id}` | Quizzes de um tópico | `quizzes` |
| `GET` | `/api/quizzes/by-slug/{manual_code}/{slug}` | Quizzes por slug de tópico | `quizzes` |
| `POST` | `/api/quizzes/submit` | Submeter resposta (avaliação SM-2) | `quizzes` |
| `GET` | `/api/quizzes/due/{user_id}` | Quizzes pendentes de revisão | `quizzes` |
| `POST` | `/api/quizzes/generate/{topic_id}` | Gerar quizzes via LLM (RAG) | `quizzes` |
| `GET` | `/api/study/manuals/{code}/progress` | Progresso por manual + módulos | `study` |
| `GET` | `/api/study/topics/{topic_id}/content` | Conteúdo do tópico via RAG | `study` |
| `POST` | `/api/study/topics/{topic_id}/complete` | Marcar tópico como completo | `study` |
| `GET` | `/api/study/users/{clerk_id}/progress` | Progresso global do utilizador | `study` |
| `POST` | `/api/search` | Pesquisa vetorial (FAISS) | `chat` |
| `POST` | `/api/chat` | Chat IA com contexto RAG | `chat` |

## Modelos de Dados (6 tabelas)

| Tabela | Colunas-chave | Relações |
|--------|---------------|----------|
| `users` | clerk_id, email, display_name | → UserProgress, QuizResult |
| `manuals` | code, title, total_topics | → Topics |
| `topics` | manual_id, topic_number, title, content_path | ← Manual, → UserProgress |
| `user_progress` | user_id, topic_id, status, quiz_score, quiz_passed | ← User, ← Topic |
| `quizzes` | topic_id, question, options (JSON), correct_answer | → QuizResult |
| `quiz_results` | user_id, quiz_id, is_correct, next_review, ease_factor | ← User, ← Quiz |

## RAG Pipeline

- **Embeddings:** FAISS + `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` (384 dims, normalizados)
- **Índice:** 114 tópicos LPI → 1831 chunks (ficheiros `lpi.index` + `chunks.jsonl` em `data/`)
- **LLM:** Groq `openai/gpt-oss-20b` (chat: temp 0.3, max 1024 tokens; quizzes: temp 0.4, max 4096 tokens)
- **Fluxo query → embedding → FAISS top-k → contexto formatado → LLM**
- **Futuro:** migração para PostgreSQL + `pgvector` (pipeline atual mantém-se funcional)

## Spaced Repetition (SM-2)

Implementado em `api/quizzes.py`:
- `ease_factor` inicial = 2.5; aumenta +0.1 (acerto) ou diminui -0.2 (erro, mín. 1.3)
- `interval_days` = `interval × ease_factor` (acerto) ou reset para 1 (erro)
- `next_review` calculado em UTC; endpoint `GET /quizzes/due/{user_id}` retorna quizzes pendentes

## Limitações Conhecidas

- **Rate limit Groq:** geração de quizzes limitada a ~58/114 tópicos (200k TPD esgotado com `openai/gpt-oss-20b`)
- **pgvector não implementado:** FAISS em memória (sem persistência partilhada entre instâncias)
- **Alembic não configurado:** `Base.metadata.create_all()` no lifespan (sem migrações incrementais)

