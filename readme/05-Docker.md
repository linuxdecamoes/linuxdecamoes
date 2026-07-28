# Docker — Projeto Linux de Camões

## Visão Geral

O Docker é a camada de orquestração local que permite arrancar o projeto completo com um único comando. A filosofia é simples: **um contentor por camada da stack**, cada um com a sua imagem otimizada, ligados por rede interna e com dependências declarativas. Não há mágica — `docker compose up` garante que backend, base de dados e frontend arrancam na ordem correta e com as variáveis certas.

A stack compõe-se por três serviços: **db** (PostgreSQL), **backend** (FastAPI) e **frontend** (Next.js). Cada um tem um `Dockerfile` próprio com multi-stage build — o frontend, em particular, é construído em três fases para manter a imagem final enxuta (~80 MB vs ~1 GB sem otimização). O Vault Obsidian (`../Vault/`) é montado como volume read-only: fornece o conteúdo MDX para geração de páginas estáticas durante o build, mas **nunca** entra na imagem final.

A arquitetura reflete o princípio de **separação de responsabilidades**: o backend fala com a base de dados via `asyncpg`, o frontend consome a API internamente, e a base de dados mantém os dados persistentes num volume nomeado (`pgdata`). Nenhum estado crítico vive dentro de um contentor — tudo o que precisa de persistir está em volumes ou variáveis de ambiente.

## Serviços

| Serviço | Imagem / Build | Porta | Variáveis | Volumes | Notas |
|---------|---------------|-------|-----------|---------|-------|
| **db** | `postgres:16-alpine` | `:5432` | `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | `pgdata:/var/lib/postgresql/data` | Healthcheck via `pg_isready`; user/pass/db = `kubeai` |
| **backend** | `./backend/Dockerfile` | `:8000` | `DATABASE_URL`, `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, `GROQ_API_KEY` | — | Depende do `db` (condition: `service_healthy`); `restart: unless-stopped` |
| **frontend** | `./frontend/Dockerfile` | `:3001 → :3000` | `VAULT_PATH`, + `env_file: .env.local` | `../Vault:/app/Vault:ro` | `additional_contexts` expõe Vault ao build-time via BuildKit |

## Variáveis de Ambiente

| Variável | Serviço(s) | Descrição | Obrigatória |
|----------|-----------|-----------|:-----------:|
| `POSTGRES_USER` | db | Utilizador PostgreSQL (valor: `kubeai`) | ✅ |
| `POSTGRES_PASSWORD` | db | Password PostgreSQL (valor: `kubeai`) | ✅ |
| `POSTGRES_DB` | db | Nome da base de dados (valor: `kubeai`) | ✅ |
| `DATABASE_URL` | backend | URL de ligação: `postgresql+asyncpg://kubeai:kubeai@db:5432/kubeai` | ✅ |
| `CLERK_SECRET_KEY` | backend + frontend | Chave secreta do Clerk (autenticação) | ✅ |
| `CLERK_PUBLISHABLE_KEY` | backend + frontend | Chave pública do Clerk | ✅ |
| `GROQ_API_KEY` | backend | Chave API Groq (LLM: RAG + quizzes) | ✅ |
| `VAULT_PATH` | frontend | Caminho do Vault no container: `/app/Vault` | ✅ |

> **Nota:** As chaves Clerk e Groq são fornecidas via `env_file` (frontend) e `${VAR}` (backend). Nenhuma chave deve ser hardcoded no `docker-compose.yml`.

## Volume Mounts

O único volume externo é o **Vault Obsidian**:

```
../Vault:/app/Vault:ro
```

**Porquê `:ro`?** O Vault contém os 114 tópicos LPI em Markdown/MDX — são fonte de dados, não código executivo. Montá-lo como read-only impede que o contentor (ou qualquer app dentro dele) altere acidentalmente o conteúdo dos manuais de estudo. É uma barreira de segurança: o pipeline de build lê o Vault, gera os `.mdx` e nunca mais precisa de escrever nele.

**Fluxo do Vault:**

```
../Vault (host) ──mount──▶ /app/Vault (container, read-only)
                                │
                    ┌───────────┴───────────┐
                    │  Build time:           │
                    │  generateStaticParams  │
                    │  → 113 páginas SSG     │
                    └───────────────────────┘
```

O volume nomeado `pgdata` persiste os dados da base de dados entre arranques. Sem ele, `docker compose down` apaga todos os dados.

## Dockerfile (Frontend)

O Dockerfile do frontend usa **multi-stage build** com três fases — cada uma com um propósito específico:

### Fase 1: `deps` (dependências)

```dockerfile
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci
```

Instala **apenas** as dependências de `package.json`. A imagem `node:20-alpine` é escolhida por:
- **Alpine**: ~5 MB vs ~900 MB de Debian-based — reduz drasticamente o tamanho final.
- **Node 20 LTS**: versão estável de suporte longo, compatível com Next.js 16.
- `libc6-compat` resolve problemas de compatibilidade em Alpine com binários nativos.

### Fase 2: `builder` (construção)

```dockerfile
RUN --mount=type=bind,from=vault,source=.,target=/app/Vault,readonly \
    npm run build
```

Aqui é onde a mágica acontece. O Vault é montado como bind mount **read-only** apenas durante o `npm run build`. O `generateStaticParams` (SSG do Next.js) invoca `loadTopicBySlug` 113 vezes — cada chamada lê um ficheiro `.mdx` do Vault. Sem este mount, todos os tópicos dariam 404 e ficariam "colados" como páginas estáticas de erro.

**Porquê bind mount e não `COPY`?** Porque o Vault pode ter ~50 MB. Copiá-lo para a imagem de build infla o cache do Docker e torna cada rebuild lento. O bind mount é efêmero — existe apenas durante o `RUN` e não persiste na imagem.

### Fase 3: `runner` (produção)

```dockerfile
FROM base AS runner
USER nextjs
CMD ["node", "server.js"]
```

Cópia apenas o necessário: `.next/standalone` (Next.js standalone output), `.next/static` (assets estáticos) e `public/`. O container corre como utilizador `nextjs` (UID 1001) — **nunca como root** — e expõe a porta 3000. O `NODE_ENV=production` garante que o Next.js não inclui tooling de desenvolvimento.

**Resultado:** imagem final enxuta com apenas os ficheiros necessários para servir a app.

## Desenvolvimento vs Produção

### Desenvolvimento (local)

| Comando | Ambito | Notas |
|---------|--------|-------|
| `docker compose up` | Stack completo | 3 contentores, Vault montado, healthcheck ativo |
| `cmd /c "npm run dev"` | Só frontend | A partir de `frontend/`, com hot reload nativo do Turbopack |

O `docker compose up` é o fluxo padrão para verificar que tudo funciona em conjunto. O `npm run dev` é mais rápido para iteração no frontend porque usa Turbopack e não reconstrói o container.

### Produção — o que falta

O `docker compose up` é um **ambiente de desenvolvimento**, não de produção. Para deploy real faltam:

- **TLS/SSL:** nenhum certificado está configurado. Em produção, colocar um reverse proxy (Caddy, Traefik) à frente.
- **CI/CD:** não há pipeline automatizado (GitHub Actions, etc.) para build + push + deploy.
- **Health checks:** apenas o `db` tem healthcheck. Backend e frontend não — importante para disponibilidade.
- **Secrets management:** as chaves estão em `.env.local` ou variáveis de ambiente. Em produção, usar um gestor de secrets (Vault, AWS SSM, etc.).
- **Logs centralizados:** os contentores logam para stdout/stderr. Em produção, integrar com um driver de logging (Loki, CloudWatch, etc.).
- **Escalabilidade:** `docker compose` não escala horizontalmente. Para deploy com múltiplas instâncias, usar orquestração dedicada (ex.: Docker Swarm, Nomad).

## Como Executar

### Stack completo

```bash
docker compose up
```

**Pré-requisitos:**
- Docker Engine + Docker Compose v2
- `../Vault/` acessível a partir da raiz do repositório (o mount falha silenciosamente se não existir)
- `frontend/.env.local` com as chaves Clerk e Groq (o backend usa `${VAR}` do shell; o frontend usa `env_file`)

### Só frontend (dev)

```bash
cmd /c "npm run dev"
```

A partir de `frontend/`. Não precisa de Docker — corre nativamente com Node.js.

### Reconstruir após alterações

```bash
docker compose up --build
```

Força reconstrução dos Dockerfiles. Usar sempre que houver alterações em `package.json` ou no código fonte.

### Parar e limpar

```bash
docker compose down          # para contentores
docker compose down -v       # para + apaga volumes (CUIDADO: apaga pgdata)
```

### Troubleshooting

| Erro | Causa | Solução |
|------|-------|---------|
| `Bind for ../Vault failed` | Diretório `../Vault` não existe ou não é acessível | Verificar que `../Vault/` existe a partir da raiz do repo |
| `CLERK_SECRET_KEY: unbound variable` | Variável não definida no shell | Criar `frontend/.env.local` ou exportar a variável |
| `Port 5432 already in use` | Outro PostgreSQL a correr na máquina | Mudar a porta no `docker-compose.yml` (`"5433:5432"`) ou parar o serviço local |
| `pg_isready` healthcheck a falhar | PostgreSQL a demorar a arrancar | Esperar — o healthcheck tem 5 retries com 5s de intervalo |
| `404 nos tópicos MDX` | Vault não montado no build | Verificar `additional_contexts` no `docker-compose.yml` e que `../Vault` existe |
| `Module not found` no builder | `node_modules` desatualizado | `docker compose up --build` para reconstruir a fase `deps` |

## Limitações

- **Sem deploy de produção configurado** — `docker compose up` é dev/local. Não há TLS, CI/CD, secrets management nem health checks para backend/frontend.
- **`kubeai` como user/db** é vestígio do codename extinto (não alterar sem aprovação — ver [[Norma 03 - Identidade de Marca e Comentários]]).
- **Sem hot reload no Docker** — o `frontend` usa `restart: unless-stopped`, não Turbopack watch. Para dev com hot reload, usar `npm run dev` nativamente.
- **Sem TLS/SSL** — o frontend expõe HTTP na porta 3001. Em produção, colocar um reverse proxy (Caddy, Traefik) à frente.
- **Volume `pgdata` não tem backup** — `docker compose down -v` apaga todos os dados da base de dados. Em produção, usar volumes persistentes com backup automatizado.
