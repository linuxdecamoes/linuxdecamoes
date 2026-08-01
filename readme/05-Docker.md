# Docker — Projeto Linux de Camões

## Visão Geral

O Docker é a camada de orquestração local que permite arrancar o projeto completo com um único comando. A filosofia é simples: **um contentor por camada da stack**, cada um com a sua imagem otimizada, ligados por rede interna e com dependências declarativas. Não há mágica — `docker compose up` garante que backend, base de dados e frontend arrancam na ordem correta e com as variáveis certas.

A stack compõe-se por três serviços: **db** (PostgreSQL), **backend** (FastAPI) e **frontend** (Next.js). Cada um tem um `Dockerfile` próprio com multi-stage build — o frontend, em particular, é construído em três fases para manter a imagem final enxuta (~80 MB vs ~1 GB sem otimização). O conteúdo dos manuais (146 ficheiros `.mdx`) está commitado em `frontend/src/content/manuals/`, pelo que o build docker não depende de volumes externos.

A arquitetura reflete o princípio de **separação de responsabilidades**: o backend fala com a base de dados via `asyncpg`, o frontend consome a API internamente, e a base de dados mantém os dados persistentes num volume nomeado (`pgdata`). Nenhum estado crítico vive dentro de um contentor — tudo o que precisa de persistir está em volumes ou variáveis de ambiente.

## Serviços

| Serviço | Imagem / Build | Porta | Variáveis | Volumes | Notas |
|---------|---------------|-------|-----------|---------|-------|
| **db** | `postgres:16-alpine` | `:5432` | `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | `pgdata:/var/lib/postgresql/data` | Healthcheck via `pg_isready`; user/pass/db = `kubeai` |
| **backend** | `./backend/Dockerfile` | `:8000` | `DATABASE_URL`, `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, `GROQ_API_KEY` | — | Depende do `db` (condition: `service_healthy`); `restart: unless-stopped` |
| **frontend** | `./frontend/Dockerfile` | `:3001 → :3000` | `env_file: .env.local` | — | `npm run build` gera as páginas SSG a partir dos `.mdx` commitados |

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

> **Nota:** As chaves Clerk e Groq são fornecidas via `env_file` (frontend) e `${VAR}` (backend). Nenhuma chave deve ser hardcoded no `docker-compose.yml`.

## Volume Mounts

O único volume persistente é o `pgdata`, que guarda os dados do PostgreSQL:

```
pgdata:/var/lib/postgresql/data
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
RUN npm run build
```

Aqui é onde a mágica acontece. O `generateStaticParams` (SSG do Next.js) gera as 132 páginas estáticas a partir dos 146 ficheiros `.mdx` já commitados em `frontend/src/content/manuals/`. O build não depende de nenhum volume externo — tudo o que precisa está dentro do contexto do Docker.

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
| `docker compose up` | Stack completo | 3 contentores, healthcheck ativo |
| `cmd /c "npm run dev"` | Só frontend | A partir de `frontend/`, com hot reload nativo do Turbopack |

O `docker compose up` é o fluxo padrão para verificar que tudo funciona em conjunto. O `npm run dev` é mais rápido para iteração no frontend porque usa Turbopack e não reconstrói o container.

### Produção — o que falta

O `docker compose up` é um **ambiente de desenvolvimento**, não de produção. Para deploy real (já configurado, ver [[08-Deploy]]):

- **CI/CD:** o workflow `.github/workflows/deploy.yml` faz deploy automático na VPS em cada push a `master` (lint + build primeiro).
- **TLS/SSL:** nenhum certificado está configurado. Em produção, colocar um reverse proxy (Caddy, Traefik) à frente.
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
| `CLERK_SECRET_KEY: unbound variable` | Variável não definida no shell | Criar `frontend/.env.local` ou exportar a variável |
| `Port 5432 already in use` | Outro PostgreSQL a correr na máquina | Mudar a porta no `docker-compose.yml` (`"5433:5432"`) ou parar o serviço local |
| `pg_isready` healthcheck a falhar | PostgreSQL a demorar a arrancar | Esperar — o healthcheck tem 5 retries com 5s de intervalo |
| `404 nos tópicos MDX` | `.mdx` em falta em `frontend/src/content/manuals/` | Confirmar que os ficheiros estão commitados no repo |
| `Module not found` no builder | `node_modules` desatualizado | `docker compose up --build` para reconstruir a fase `deps` |

## Limitações

- **`kubeai` como user/db** é vestígio do codename extinto (não alterar sem aprovação — ver [[Norma 03 - Identidade de Marca e Comentários]]).
- **Sem hot reload no Docker** — o `frontend` usa `restart: unless-stopped`, não Turbopack watch. Para dev com hot reload, usar `npm run dev` nativamente.
- **Sem TLS/SSL** — o frontend expõe HTTP na porta 3001. Em produção, colocar um reverse proxy (Caddy, Traefik) à frente.
- **Volume `pgdata` não tem backup** — `docker compose down -v` apaga todos os dados da base de dados. Em produção, usar volumes persistentes com backup automatizado (ver [[08-Deploy]], secção Backups).
