# Deploy Automático GitHub → VPS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Commitar a versão atual (manuais + quizzes, sem pods) com infraestrutura de deploy corrigida e documentação completa, para que cada push ao GitHub atualize automaticamente a VPS (`danieldias@54.37.15.115`, porta 2294) — sem expor nenhum dado sensível (repo público).

**Architecture:** CI/CD GitHub Actions (workflow `deploy.yml`) → push → `verify` (lint+build no frontend) → `deploy` (SSH à VPS → `git reset --hard` + `docker compose up --build -d`). O job `deploy` é resiliente a secrets ainda não configurados (primeiro push não falha). Remove-se a dependência do build docker ao Vault externo (`../Vault`), que não existe na VPS; os 146 `.mdx` já estão commitados em `frontend/src/content/manuals/`.

**Tech Stack:** GitHub Actions (`appleboy/ssh-action@v1.2.2`), Docker Compose (db/backend/frontend), Bash scripts (setup/backup/restore), Next.js 16, FastAPI.

---

## Task 1: Remover dependência do Vault no build e run docker

**Files:**
- Modify: `docker-compose.yml:34-57`
- Modify: `frontend/Dockerfile:1-61`
- Modify: `frontend/.env.example` (confirmar sem alterações)

**Contexto verificado:** `src/app/manuals/[code]/[slug]/page.tsx` usa `getMdxTopics()` de `src/lib/mdx-auto-register.ts`, que lê `@/content/manuals` (barrel compilado com os 146 `.mdx` commitados). `src/lib/topic-loader.ts` só é importado como `import type` (erased em compile-time); `src/lib/vault.ts` não é importado por ninguém. Logo, o Vault NÃO é necessário no build nem em runtime.

- [ ] **Step 1: Editar `docker-compose.yml`** — substituir o bloco `frontend.build` e o serviço `frontend` (linhas 34-57) para:

```yaml
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3001:3000"
    env_file:
      - ./frontend/.env.local
    restart: unless-stopped
```

Nota: `env_file` passa de `./frontend/.env` para `./frontend/.env.local` (o `.env.local` é o que o `setup-vps.sh` cria e o que o Next.js lê; o `.env` não é usado). Ambos são gitignored (`.gitignore` linhas 18-20).

- [ ] **Step 2: Editar `frontend/Dockerfile`** — remover `ARG VAULT_PATH`, `ENV VAULT_PATH` do builder, o `RUN --mount=type=bind,from=vault,...`, o `ENV VAULT_PATH` do runner e a diretiva `# syntax=docker/dockerfile:1` (já não é necessária sem o mount). Resultado:

```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

- [ ] **Step 3: Verificar que não restam referências ao Vault** em compose e Dockerfile.

Run: `git diff docker-compose.yml frontend/Dockerfile`
Expected: sem `../Vault`, sem `VAULT_PATH`, sem `from=vault`.

- [ ] **Step 4: Verificar lint + build de produção do frontend** (a fonte de verdade de que o build não precisa do Vault).

Run (em `frontend/`): `cmd /c "npm run lint"` e depois `cmd /c "npm run build"`
Expected: lint sem erros; build SSG completo (131 páginas), sem erros.

- [ ] **Step 5: Validar compose (se Docker disponível)**

Run: `docker compose config --quiet`
Expected: exit 0 sem saída.

- [ ] **Step 6: Commit**

```bash
git add docker-compose.yml frontend/Dockerfile
git commit -m "fix(docker): remover dependencia do Vault no build e run do frontend"
```

---

## Task 2: Padronizar branch master no setup-vps e README

**Files:**
- Modify: `scripts/setup-vps.sh:13`
- Modify: `README.md:194`

- [ ] **Step 1: Editar `scripts/setup-vps.sh`** — linha 13:

```bash
BRANCH="${BRANCH:-master}"
```

- [ ] **Step 2: Editar `README.md`** — linha 194: `/main/scripts/setup-vps.sh` → `/master/scripts/setup-vps.sh`:

```bash
curl -fsSL https://raw.githubusercontent.com/linuxdecamoes/linuxdecamoes/master/scripts/setup-vps.sh | bash
```

- [ ] **Step 3: Grep de `main` restantes** nos ficheiros de deploy.

Run: `Select-String -Path README.md,scripts/*.sh,.github/workflows/deploy.yml -Pattern '/main/|BRANCH.*main'`
Expected: nenhum match (deploy.yml já cobre `[main, master]` — manter).

- [ ] **Step 4: Commit**

```bash
git add scripts/setup-vps.sh README.md
git commit -m "fix(deploy): padronizar branch master no setup-vps e README"
```

---

## Task 3: Tornar o deploy resiliente a secrets não configurados

**Files:**
- Modify: `.github/workflows/deploy.yml`

- [ ] **Step 1: Editar `.github/workflows/deploy.yml`** — adicionar guarda no job `deploy` (após linha 46):

```yaml
  deploy:
    name: Deploy na VPS
    needs: verify
    if: ${{ secrets.VPS_HOST != '' }}
    runs-on: ubuntu-latest
    environment: production
```

- [ ] **Step 2: Validar sintaxe YAML** (leitura visual; o ficheiro é pequeno).

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: tornar deploy resiliente a secrets nao configurados"
```

---

## Task 4: Criar guia de deploy e backup na VPS (`readme/08-Deploy.md`)

**Files:**
- Create: `readme/08-Deploy.md`
- Modify: `readme/07-Roadmap.md`
- Modify: `README.md`

- [ ] **Step 1: Criar `readme/08-Deploy.md`** — guia narrativo em PT-PT com:

1. **Arquitetura do pipeline** — diagrama ASCII: `push → GitHub Actions (verify: lint+build) → deploy (SSH) → VPS: git reset --hard + docker compose up --build -d`.
2. **Provisionamento inicial da VPS** — `curl -fsSL .../master/scripts/setup-vps.sh | bash`; instala Docker, clona para `/opt/linuxdecamoes`, cria `.env` a partir dos `.env.example`.
3. **Preencher `.env`** na VPS (`/opt/linuxdecamoes/.env`, `backend/.env`, `frontend/.env.local`) com chaves reais (Clerk + Groq). **Aviso:** estes ficheiros NUNCA se commitam (gitignored) — o repo é público.
4. **Chave SSH para o GitHub Actions** — na VPS:

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys
cat ~/.ssh/github_actions   # ← copiar para o segredo VPS_SSH_KEY
```

5. **Secrets do GitHub** (Settings → Secrets and variables → Actions):

| Segredo | Valor real (VPS) |
|---------|------------------|
| `VPS_HOST` | `54.37.15.115` |
| `VPS_USER` | `danieldias` |
| `VPS_SSH_KEY` | conteúdo privado de `~/.ssh/github_actions` |
| `VPS_PORT` | `2294` |
| `VPS_APP_PATH` | `/opt/linuxdecamoes` |

**Aviso de segurança:** os valores acima são apenas os da tua VPS (host/user/porta); **NUNCA** colocar chaves API, tokens ou chaves SSH no README/docs/repo — o repositório é público e qualquer secret publicado fica comprometido.
6. **Primeiro deploy** — push para `master`; o job `deploy` só corre depois de os secrets existirem (antes disso, é ignorado). Deploys seguintes: automáticos por push.
7. **Deploy manual** — `ssh -p 2294 danieldias@54.37.15.115` → `cd /opt/linuxdecamoes && git pull && docker compose up --build -d`.
8. **Backups** — cron `0 3 * * *` com `scripts/backup.sh` (pg_dump + tar pgdata, retenção 7 dias); `scripts/backup_s3.py` (upload S3/R2/MinIO, variáveis por env: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET`); `scripts/restore.sh` (restauro `.dump`).
9. **Troubleshooting** — build falha? Confirmar que `frontend/src/content/manuals/` existe (Vault não é necessário); portas `3001` (frontend), `8000` (backend), `5432` (db); firewall da VPS; rate limit Groq; `docker compose ps` para ver estado.

- [ ] **Step 2: Modificar `readme/07-Roadmap.md`** — adicionar entrada "Deploy automatizado (CI/CD GitHub→VPS)" como ✅ (seguindo o formato existente das outras entradas).

- [ ] **Step 3: Modificar `README.md`** — na secção `## Deploy na VPS + CI/CD` (linha 186), substituir todo o conteúdo das subsecções 1-3 por um resumo + ligação:

```markdown
## Deploy na VPS + CI/CD

Guia completo, passo a passo (provisionamento, chave SSH, secrets, primeiro
deploy, backups e troubleshooting): **[`readme/08-Deploy.md`](readme/08-Deploy.md)**

Resumo:

1. **Provisionamento** (uma vez): `curl -fsSL https://raw.githubusercontent.com/linuxdecamoes/linuxdecamoes/master/scripts/setup-vps.sh | bash`
2. **Chave SSH**: gerar `~/.ssh/github_actions` na VPS e copiar a pública para `~/.ssh/authorized_keys`.
3. **Secrets**: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `VPS_PORT`, `VPS_APP_PATH` (ver guia para valores).
4. **Push para `master`** → CI faz lint+build e faz deploy automático na VPS.
```

- [ ] **Step 4: Verificar zero dados sensíveis** antes do commit.

Run: `Select-String -Path readme/08-Deploy.md,README.md -Pattern 'sk-|gsk_|AKIA|BEGIN .*PRIVATE|CLERK_SECRET_KEY='`
Expected: apenas placeholders (`gsk_your_groq_api_key_here`), nenhum valor real.

- [ ] **Step 5: Commit**

```bash
git add readme/08-Deploy.md readme/07-Roadmap.md README.md
git commit -m "docs(deploy): criar guia de deploy e backup na VPS"
```

---

## Task 5: Registo no Vault (agents.md §8.2) e push

**Files:**
- Modify: `agents.md` (§8.2 — Histórico)
- (nenhum outro)

- [ ] **Step 1: Adicionar entrada ao Histórico §8.2 de `agents.md`** — data `2026-08-01`, ação "Deploy automático GitHub→VPS (CI/CD)": remoção da dependência do Vault no build docker (frontend passa a buildar só com os `.mdx` commitados), branch canónica `master`, workflow `deploy.yml` resiliente a secrets, guia `readme/08-Deploy.md` (VPS 54.37.15.115, porta 2294), backups (cron + S3 + restore). Estado: ✅ (infra pronta; secrets + chave SSH pendentes da ação do utilizador).

- [ ] **Step 2: Commit**

```bash
git add agents.md
git commit -m "docs(vault): registar deploy automatico GitHub para VPS no historico"
```

- [ ] **Step 3: Re-verificação final de segurança**

Run: `git status --short` e `git log --oneline -6`
Expected: só os 5 commits do plano; nenhum ficheiro `.env`/`.env.local` rastreado.

- [ ] **Step 4: Push**

```bash
git push origin master
```

Run: `git status` — Expected: working tree limpo.
