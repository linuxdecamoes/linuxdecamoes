# Spec — Deploy Automático GitHub → VPS + Documentação

**Data:** 2026-08-01
Âmbito: raiz do repositório `linuxdecamoes/` + `frontend/` + `scripts/` + `.github/`.
Idioma: PT-PT em toda a documentação nova.

---

## 1. Contexto e Problema

O utilizador quer **subir para o GitHub a versão atual** da plataforma (manuais
MDX + quizzes; o terminal K8s / "pods" **não está implementado** — apenas
placeholders "em breve", que se mantêm como tal). Antes do push, é preciso:

1. **Documentar o deploy** para que cada push ao GitHub atualize automaticamente
   a VPS (`danieldias@54.37.15.115`, porta SSH **2294**).
2. **Corrigir bloqueios** que fariam o deploy falhar na VPS.
3. **Fazer o push** da versão atual (só manuais + quizzes, sem pods reais).

O repositório tem 1 único commit (`991292a` "feat: alpha release — Linux de
Camoes") no branch `master` (default do GitHub). Já existe infraestrutura de
deploy **criada mas NÃO commitada**: `.github/workflows/deploy.yml` e
`scripts/` (`setup-vps.sh`, `backup.sh`, `backup_s3.py`, `restore.sh`).

## 2. Goals

1. Corrigir os bloqueios que impedem o deploy docker na VPS.
2. Documentar o fluxo completo (provisioning → secrets → deploy → backups) em
   PT-PT.
3. Commitar tudo em commits atómicos e fazer push para `origin master`.
4. Garantir que o **primeiro push não falha** antes de o utilizador configurar
   os secrets e a chave SSH na VPS.

## 3. Decisões (aprovadas)

- **Abordagem = A (GitHub Actions → SSH direto à VPS)** — push → CI roda
  `lint` + `build` no frontend → job de deploy faz SSH à VPS (`git reset --hard`
  + `docker compose up --build -d`). Zero custo, sem peças extra.
- **Branch canónica = `master`** — alinhar `setup-vps.sh` e README (que usam
  `main`) com o default real do GitHub.
- **O frontend NÃO depende do Vault** em runtime/build: os 146 `.mdx` estão
  commitados em `frontend/src/content/manuals/`. A referência `../Vault`
  (contexto BuildKit `vault`) **é removida** — não existe na VPS e partiria o
  build.
- **Placeholders de terminal/pods mantidos** como "em breve" (não são feature
  real; não se removem).
- **Job `deploy` resiliente**: salta quando `VPS_HOST` não está configurado
  (primeiro push antes dos secrets).

## 4. Arquitetura / Entregáveis

### 4.1 Fix #1 — Remover dependência do Vault no build/run docker

`docker-compose.yml` (serviço `frontend`):

- Remover `additional_contexts: vault: ../Vault`.
- Remover `args:` (VAULT_PATH).
- Remover `volumes: ../Vault:/app/Vault:ro`.

`frontend/Dockerfile`:

- Remover `ARG VAULT_PATH=/app/Vault` e `ENV VAULT_PATH=/app/Vault` do builder.
- Remover o `RUN --mount=type=bind,from=vault,source=.,target=/app/Vault,readonly`
  (voltar a `RUN npm run build`).
- Remover `ENV VAULT_PATH=/app/Vault` do runner (mantém-se o resto: standalone,
  static, USER nextjs, EXPOSE 3000, CMD node server.js).

### 4.2 Fix #2 — Padronizar branch `master`

- `scripts/setup-vps.sh`: `BRANCH` default `main` → `master`.
- `README.md`: URLs de curl `/main/...` → `/master/...`.

### 4.3 Fix #3 — Dados reais da VPS na documentação

- VPS host `54.37.15.115`, user `danieldias`, porta SSH **2294**.
- Secrets: `VPS_HOST=54.37.15.115`, `VPS_USER=danieldias`, `VPS_SSH_KEY` (ed25519),
  `VPS_PORT=2294`, `VPS_APP_PATH=/opt/linuxdecamoes`.
- Comandos SSH com `-p 2294` e `ssh-keyscan -p 2294`.

### 4.4 Resiliência do workflow

`.github/workflows/deploy.yml`:

- Job `deploy`: `if: ${{ secrets.VPS_HOST != '' }}` para saltar quando os
  secrets ainda não existem (o push continua verde; o job `verify` corre sempre).
- `ssh-keygen`/`ssh-keyscan` documentados com `-p 2294`.

### 4.5 Documentação nova (PT-PT)

- **`readme/08-Deploy.md`** — guia narrativo completo:
  - Arquitetura do pipeline (diagrama ASCII push → CI verify → SSH → VPS).
  - Provisionamento da VPS (`setup-vps.sh` via curl, Docker, clonagem).
  - Chave SSH (gerar no servidor, `authorized_keys`).
  - Secrets do GitHub (tabela com valores reais da VPS).
  - Primeiro deploy + deploys seguintes (automáticos por push).
  - Deploy manual (SSH + `git pull` + `docker compose up --build -d`).
  - Backups (`backup.sh` cron 0 3, `backup_s3.py`, `restore.sh`).
  - Troubleshooting (build falha por Vault ausente → já corrigido; rate limit
    Groq; portas 3001/8000/5432; firewall).
- **`readme/07-Roadmap.md`** — entrada "Deploy automatizado (CI/CD)" ✅.
- **`README.md` raiz** — secção Deploy existente alinhada + ligação a
  `readme/08-Deploy.md`.

## 5. Commits (mensagens convencionais, PT-PT)

1. `fix(docker): remover dependencia do Vault no build e run do frontend`
   (Dockerfile + docker-compose.yml)
2. `fix(deploy): padronizar branch master no setup-vps e README`
   (scripts/setup-vps.sh + README.md)
3. `ci: tornar deploy resiliente a secrets nao configurados`
   (.github/workflows/deploy.yml)
4. `docs(deploy): criar guia de deploy e backup na VPS`
   (readme/08-Deploy.md + readme/07-Roadmap.md + README.md)

## 6. Riscos e casos-limite

- **R1 — primeiro push antes de secrets:** mitigado (§4.4).
- **R2 — Vault ausente na VPS:** corrigido (§4.1); `../Vault` é externo ao repo e
  fica fora do deploy.
- **R3 — `docker compose down backend frontend` pode não existir no 1º deploy:**
  aceitável (o script tolera), documentar troubleshooting.
- **R4 — variáveis de ambiente (Clerk/Groq/BD):** criadas manualmente na VPS a
  partir dos `.env.example` (documentado em `08-Deploy.md`); nunca commitadas.
- **R5 — backend usa `--reload` no Dockerfile:** mantém-se (não é bloqueio).

## 7. Verificação

- `cmd /c "npm run lint"` e `cmd /c "npm run build"` em `frontend/` (131 páginas
  SSG) antes de cada commit.
- `docker-compose.yml` valida (`docker compose config` se Docker disponível).
- Grep para confirmar ausência de `../Vault` em `docker-compose.yml`,
  `frontend/Dockerfile` e de `/main/` em `scripts/` + `README.md`.
- `git status`/`git log` conferem antes do push; push para `origin master`.

## 8. Inventário de ficheiros

**Criar:**
- `readme/08-Deploy.md`
- `docs/superpowers/specs/2026-08-01-deploy-automatico-vps-design.md`

**Modificar:**
- `docker-compose.yml` (§4.1)
- `frontend/Dockerfile` (§4.1)
- `scripts/setup-vps.sh` (§4.2)
- `.github/workflows/deploy.yml` (§4.4)
- `README.md` (§4.2, §4.3, §4.5)
- `readme/07-Roadmap.md` (§4.5)
- `agents.md` §8.2 (registo do histórico, conforme protocolo)

**Não tocar:**
- `frontend/src/content/manuals/` (fonte dos MDX, já commitada)
- `scripts/backup.sh`, `scripts/backup_s3.py`, `scripts/restore.sh` (já corretos)
