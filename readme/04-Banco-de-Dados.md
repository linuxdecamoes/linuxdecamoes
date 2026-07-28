# Banco de Dados — Projeto Linux de Camões

## Visão Geral

O backend do **Linux de Camões** utiliza **PostgreSQL 16** (via Docker Compose, imagem `postgres:16-alpine`) como sistema relacional principal. A escolha recai sobre PostgreSQL por três razões concretas:

1. **Maturidade e fiabilidade** — engine ACID completo, suporte nativo a UUIDs, arrays, JSONB e extensões como `pgvector` (planeado para futuro).
2. **Ecossistema async em Python** — o driver `asyncpg` (via SQLAlchemy) permite I/O não-bloqueante, essencial para o FastAPI que opera com centenas de conexões concorrentes.
3. **Custo zero** — licença PostgreSQL License (similar a MIT), sem restrições comerciais, sem custos de cloud.

O driver utilizado é **`asyncpg`** — um driver PostgreSQL de alta performance escrito em Cython, que implementa o protocolo binário v3 do PostgreSQL. Não é um wrapper sobre `psycopg2`; é uma implementação nativa que suporta:
- Prepared statements automáticos (cache de queries)
- Execução de queries via protocolo binário (mais rápido que texto)
- Sessions PostgreSQL (não apenas transações)

As migrações são geridas por **Alembic** (a ferramenta de migrações do SQLAlchemy). O diretório `alembic/` **não está presente no repositório atual** — as tabelas são criadas diretamente via `Base.metadata.create_all()` ou por migrações manuais. ⏳ A configuração formal de Alembic está pendente.

## Configuração

### Variáveis de Ambiente

A configuração da BD é centralizada em `backend/core/config.py`, na classe `Settings` (Pydantic `BaseSettings`):

| Variável | Valor por defeito | Descrição |
|----------|-------------------|-----------|
| `DATABASE_URL` | `postgresql+asyncpg://kubeai:kubeai@db:5432/kubeai` | URL de conexão async — user/pass/db `kubeai` |
| `DEBUG` | `False` | Quando `True`, o SQLAlchemy loga todas as queries (verbose) |
| `APP_NAME` | `Linux de Camões API` | Nome público da API (não afeta a BD) |
| `APP_VERSION` | `0.1.0` | Versão da API |

> **Nota sobre `kubeai`:** o nome de utilizador/basededados `kubeai` é um vestígio do codename extinto "KubeAI". Alterá-lo exige migração da BD (renomear user + database). Não é branding — não é visível ao utilizador.

### Connection Pooling

O engine é criado com `create_async_engine` do SQLAlchemy:

```python
engine = create_async_engine(settings.DATABASE_URL, echo=settings.DEBUG)
```

Por defeito, o SQLAlchemy configura um **connection pool** com:
- **`pool_size=5`** — conexões mantidas no pool (pronto a usar)
- **`max_overflow=10`** — conexões extras permitidas além do `pool_size`
- **`pool_timeout=30`** — timeout para obter uma conexão do pool
- **`pool_recycle=1800`** — recicla conexões após 30 minutos (evita timeouts do PostgreSQL)

Estes valores são adequados para o MVP. Em produção com múltiplos workers (uvicorn `--workers N`), recomenda-se aumentar `pool_size` proporcionalmente.

### Async Session Setup

```python
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
```

- **`class_=AsyncSession`** — cada sessão é assíncrona (permite `await session.execute(...)`)
- **`expire_on_commit=False`** — os objetos não expiram após commit (evita `DetachedInstanceError` em lazy loads)

A dependency injection é feita em `backend/db/base.py`:

```python
async def get_db() -> AsyncSession:
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()
```

O FastAPI usa isto como `Depends(get_db)` nos endpoints — cada request recebe a sua sessão, que é automaticamente fechada no fim.

### docker-compose — Service `db`

```yaml
db:
  image: postgres:16-alpine
  environment:
    POSTGRES_USER: kubeai
    POSTGRES_PASSWORD: kubeai
    POSTGRES_DB: kubeai
  ports:
    - "5432:5432"
  volumes:
    - pgdata:/var/lib/postgresql/data
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U kubeai"]
    interval: 5s
    timeout: 5s
    retries: 5
```

O volume `pgdata` persiste os dados entre restarts do container. O healthcheck garante que o backend só arranca depois da BD estar pronta (`condition: service_healthy`).

## Tabelas

6 tabelas SQLAlchemy, definidas em `backend/models/models.py`. Todas as PKs são **UUIDs** gerados automaticamente via `uuid.uuid4()`.

### `users`

Utilizadores autenticados via Clerk.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | `String(64)` | PK | UUID gerado automaticamente |
| `clerk_id` | `String(64)` | UNIQUE, INDEX | Identificador Clerk (JWT claim `sub`) |
| `email` | `String(255)` | UNIQUE | Email do utilizador |
| `display_name` | `String(128)` | NULLABLE | Nome de exibição (opcional) |
| `created_at` | `DateTime` | DEFAULT `utcnow` | Data de criação |
| `updated_at` | `DateTime` | DEFAULT `utcnow`, ON UPDATE | Data da última atualização |

**Relacionamentos:**
- `progress` → `UserProgress[]` (1→N, cascade `delete-orphan`)
- `quiz_results` → `QuizResult[]` (1→N, cascade `delete-orphan`)

### `manuals`

Manuais oficiais LPI (ex: "Essentials", "LPIC-1").

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | `String(64)` | PK | UUID gerado automaticamente |
| `code` | `String(16)` | UNIQUE | Código do manual (ex: `"101"`, `"102"`) |
| `title` | `String(255)` | — | Título completo do manual |
| `total_topics` | `Integer` | DEFAULT 0 | Número total de tópicos |

**Relacionamentos:**
- `topics` → `Topic[]` (1→N, cascade `delete-orphan`)

### `topics`

Tópicos dentro de cada manual (ex: "101.1", "101.2").

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | `String(64)` | PK | UUID gerado automaticamente |
| `manual_id` | `String(64)` | FK → `manuals.id` | Referência ao manual |
| `topic_number` | `Integer` | — | Número sequencial do tópico |
| `title` | `String(255)` | — | Título do tópico |
| `content_path` | `String(512)` | NULLABLE | Caminho para o conteúdo MDX no Vault |

**Relacionamentos:**
- `manual` → `Manual` (N→1, sem cascade — protege o manual)
- `user_progress` → `UserProgress[]` (1→N, cascade `delete-orphan`)

### `user_progress`

Progresso de estudo por tópico, por utilizador.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | `String(64)` | PK | UUID gerado automaticamente |
| `user_id` | `String(64)` | FK → `users.id` | Referência ao utilizador |
| `topic_id` | `String(64)` | FK → `topics.id` | Referência ao tópico |
| `status` | `String(20)` | DEFAULT `"not_started"` | Estado: `not_started`, `in_progress`, `completed` |
| `score` | `Float` | NULLABLE | Nota de compreensão (0–100) |
| `commands_executed` | `Integer` | DEFAULT 0 | Contador de comandos executados no lab |
| `last_studied` | `DateTime` | NULLABLE | Última vez que o utilizador estudou este tópico |
| `completed_at` | `DateTime` | NULLABLE | Data de conclusão |
| `quiz_score` | `Float` | NULLABLE | Média de quizzes neste tópico |
| `quiz_passed` | `Boolean` | DEFAULT False | Se o utilizador passou no quiz (threshold ≥ 70%) |

**Relacionamentos:**
- `user` → `User` (N→1, sem cascade — protege o utilizador)
- `topic` → `Topic` (N→1, sem cascade — protege o tópico)

### `quizzes`

Perguntas geradas por LLM (Groq / open-source).

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | `String(64)` | PK | UUID gerado automaticamente |
| `topic_id` | `String(64)` | FK → `topics.id` | Referência ao tópico |
| `question` | `Text` | — | Enunciado da pergunta |
| `options` | `Text` | — | Opções de resposta (JSON serializado) |
| `correct_answer` | `String(255)` | — | Resposta correta (texto) |
| `explanation` | `Text` | NULLABLE | Explicação da resposta |
| `generated_at` | `DateTime` | DEFAULT `utcnow` | Data de geração |

**Relacionamentos:**
- `results` → `QuizResult[]` (1→N, cascade `delete-orphan`)

### `quiz_results`

Respostas dos utilizadores e calendário de repetição espaçada (SM-2).

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | `String(64)` | PK | UUID gerado automaticamente |
| `user_id` | `String(64)` | FK → `users.id` | Referência ao utilizador |
| `quiz_id` | `String(64)` | FK → `quizzes.id` | Referência à pergunta |
| `is_correct` | `Boolean` | — | Se a resposta foi correta |
| `next_review` | `DateTime` | — | Próxima data de revisão (algoritmo SM-2) |
| `ease_factor` | `Float` | DEFAULT 2.5 | Fator de facilidade (SM-2, início = 2.5) |
| `interval_days` | `Integer` | DEFAULT 1 | Intervalo em dias até à próxima revisão |
| `created_at` | `DateTime` | DEFAULT `utcnow` | Data da resposta |

**Relacionamentos:**
- `user` → `User` (N→1, sem cascade — protege o utilizador)
- `quiz` → `Quiz` (N→1, sem cascade — protege a pergunta)

### Diagrama de Relacionamentos

```
users ──< user_progress >── topics ──< manuals
  │                          │
  │                          └──< quizzes
  │                               │
  └──< quiz_results >─────────────┘
```

**Regra de cascade:** todos os relacionamentos 1→N utilizam `cascade="all, delete-orphan"`. Isto significa que ao eliminar um utilizador, todos os seus `user_progress` e `quiz_results` são eliminados em cascata. O inverso **não** acontece — eliminar um tópico não elimina o utilizador (apenas remove a referência FK).

> **Atenção:** o cascade `delete-orphan` está configurado apenas nos relacionamentos 1→N (User→Progress, Manual→Topic, etc.). Os related objects "pai" (Manual, Topic) não têm cascade — ao eliminar um Manual, os Topics ficam órfãos (FK para `manuals.id` sem registro). Em produção, seria necessário adicionar `ON DELETE CASCADE` nas constraints FK ou usar `cascade="all, delete-orphan"` bidirecional. ⏳ Pendente.

## Migrações

### Estado Atual

O diretório `alembic/` **não existe no repositório**. As tabelas são criadas diretamente via:

```python
# Em backend/db/base.py
Base.metadata.create_all(...)  # (não chamado explicitamente — as tabelas são criadas manualmente ou via docker init)
```

> ⏳ **Pendente:** configurar Alembic formalmente para gerir migrações. O `agents.md` §3 referencia Alembic como ferramenta de migrações, mas a configuração ainda não foi implementada.

### Workflow Planeado (quando Alembic estiver configurado)

1. **Inicializar** (já feito uma vez):
   ```bash
   alembic init alembic
   ```

2. **Criar migração** após alterar um modelo:
   ```bash
   alembic revision --autogenerate -m "descrição da alteração"
   ```

3. **Aplicar migrações** pendentes:
   ```bash
   alembic upgrade head
   ```

4. **Reverter** última migração:
   ```bash
   alembic downgrade -1
   ```

5. **Verificar estado** atual:
   ```bash
   alembic current
   alembic history
   ```

> **Nota:** o Alembic deve ser configurado para usar a mesma `DATABASE_URL` async do `Settings`. Para async, usar `alembic` com `sqlalchemy.url` apontando para `postgresql+asyncpg://...`.

## Conexão com o RAG

### Separation of Concerns

A base de dados relacional (PostgreSQL) e o sistema RAG (FAISS) operam em **domínios completamente separados**:

```
┌─────────────────────────────────────────────┐
│                FastAPI Backend               │
│                                              │
│  ┌──────────────┐     ┌──────────────────┐  │
│  │  PostgreSQL   │     │     FAISS        │  │
│  │  (relacional) │     │  (em memória)    │  │
│  │               │     │                  │  │
│  │ • users       │     │ • 1831 chunks    │  │
│  │ • manuals     │     │ • 384 dims       │  │
│  │ • topics      │     │ • MiniLM-L12     │  │
│  │ • progress    │     │                  │  │
│  │ • quizzes     │     │ • Ficheiro em    │  │
│  │ • results     │     │   disco (idx)    │  │
│  └──────────────┘     └──────────────────┘  │
│         │                       │            │
│         └───────────┬───────────┘            │
│                     │                        │
│            ┌────────▼────────┐               │
│            │   Endpoints     │               │
│            │ /api/search     │               │
│            │ /api/chat       │               │
│            └─────────────────┘               │
└─────────────────────────────────────────────┘
```

**O que vive na BD:**
- Dados estruturados de utilizadores, progresso, quizzes, resultados
- Metadados de manuais e tópicos (código, título, caminho do conteúdo)
- Dados de spaced repetition (SM-2): `next_review`, `ease_factor`, `interval_days`

**O que vive no FAISS (em memória):**
- Embeddings vetoriais dos 1831 chunks LPI (384 dimensões, `paraphrase-multilingual-MiniLM-L12-v2`)
- Índice invertido para busca por similaridade semântica
- Ficheiro persistido em disco (`../rag/pipeline.py`), rebuild manual

**Não há ligação direta entre eles.** O FAISS não consulta a BD; a BD não consulta o FAISS. Ambos são alimentados pelo FastAPI — o backend orquestra as queries à BD (progresso, quizzes) e as queries ao FAISS (busca semântica) de forma independente.

### Quando pgvector chegar

A migração para pgvector **unificará** estes dois domínios numa única base de dados — os embeddings ficarão numa coluna `vector(384)` na tabela `topics` (ou numa tabela dedicada `topic_embeddings`), eliminando a necessidade do FAISS separado.

## FAISS vs pgvector

| Aspecto | Atual (FAISS) | Planeado (pgvector) |
|---------|---------------|---------------------|
| **Solução** | FAISS (`../rag/pipeline.py`) | PostgreSQL + extensão `pgvector` |
| **Embeddings** | 384 dims, `paraphrase-multilingual-MiniLM-L12-v2` | Mesmos embeddings |
| **Persistência** | Ficheiro em disco, rebuild manual | Persistidos na BD (coluna `vector(384)`) |
| **Query** | `index.search(query_vec, k)` (busca por similaridade coseno) | `SELECT ... ORDER BY embedding <=> query_vec LIMIT k` |
| **Dataset** | 1831 chunks LPI (114 tópicos) | Mesmos chunks |
| **Índices** | FAISS `IndexFlatIP` (inner product, exato) | `ivfflat` ou `hnsw` (aproximado, mais rápido) |
| **Filtros** | Pós-filtragem em Python | Filtros SQL nativos (WHERE + ORDER BY) |
| **Manutenção** | Rebuild manual do índice | `CREATE INDEX` automático |
| **Complexidade** | Mínima (ficheiro + script Python) | Extensão PG + migração de dados |
| **Justificação da espera** | — | Complexidade adicional não justificada enquanto dataset é estático |

### O que pgvector mudaria na prática

1. **Eliminação do ficheiro FAISS** — os embeddings vivem na BD, sem rebuild manual.
2. **Queries híbridas** — combinar busca semântica (`<=>` operator) com filtros SQL (`WHERE manual_id = ...`) numa única query.
3. **Atualização incremental** — novos chunks são inseridos com `INSERT ... RETURNING`, sem rebuild do índice inteiro.
4. **Consistência transacional** — embeddings e metadados na mesma transação ACID.

> **Decisão:** a migração para pgvector está documentada mas adiada. O dataset LPI é estático (1831 chunks, não muda frequentemente), por isso o overhead de manter um ficheiro FAISS separado é mínimo. Quando o dataset crescer ou quando surgirem necessidades de filtros semânticos complexos, a migração será retomada.

**Endpoints RAG:** `/api/search`, `/api/chat` (via FastAPI).

## Infraestrutura

- **docker-compose:** service `db` (PostgreSQL 16-alpine) + volume `pgdata`
- **Alembic:** referido como ferramenta de migrações, diretório não presente no repositório atual
- **Async:** SQLAlchemy com `create_async_engine` + `asyncpg` (driver nativo Cython)
- **Dependency injection:** `get_db()` em `backend/db/base.py` (yield session)
- **Healthcheck:** `pg_isready -U kubeai` a cada 5s, backend espera BD healthy antes de arrancar
