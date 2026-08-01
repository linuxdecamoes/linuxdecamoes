# Deploy Automático — Linux de Camões

## Visão Geral

Este guia descreve, passo a passo, como a aplicação **Linux de Camões** é
publicada na VPS (`danieldias@54.37.15.115`, porta SSH `2294`) e como fica
configurada para que **cada push ao GitHub atualize automaticamente o ambiente
de produção**. Não há passos mágicos nem comandos obscuros: o fluxo é um
pipeline CI/CD que corre lint e build primeiro, e só depois toca na VPS.

> ⚠️ **Segurança (importante):** o repositório `linuxdecamoes` é **público**.
> Chaves de API, tokens e chaves SSH **nunca** são commitados — os ficheiros
> `.env` estão no `.gitignore` e só existem na VPS. O que é partilhado no GitHub
> são apenas placeholders (`gsk_your_groq_api_key_here`, etc.).

## Arquitetura do Pipeline

```
          push para master
                │
                ▼
   ┌─────────────────────────────┐
   │  GitHub Actions             │
   │  (.github/workflows/deploy.yml)
   │                             │
   │  job "verify"               │
   │   • npm ci                  │
   │   • npm run lint            │
   │   • npm run build           │
   │        │ (passou)           │
   │        ▼                    │
   │  job "deploy"               │
   │   • SSH → VPS               │
   └─────────────────────────────┘
                │
                ▼
   VPS (danieldias@54.37.15.115:2294)
   • git fetch + git reset --hard
   • docker compose up --build -d
```

O job `deploy` só é executado depois de `verify` passar. Se os secrets do
GitHub ainda não estiverem configurados, o job é **ignorado** (não falha) — o
primeiro push funciona logo à partida.

## 1. Provisionamento Inicial (uma vez)

Na VPS (Ubuntu/Debian), corre **numa só linha** (se partires o comando em duas,
o terminal devolve `curl: (2) no URL specified`):

```bash
curl -fsSL https://raw.githubusercontent.com/linuxdecamoes/linuxdecamoes/master/scripts/setup-vps.sh | bash
```

Alternativa mais segura (evita problemas de colagem no terminal):

```bash
curl -fsSL -o setup-vps.sh https://raw.githubusercontent.com/linuxdecamoes/linuxdecamoes/master/scripts/setup-vps.sh
bash setup-vps.sh
```

O script `scripts/setup-vps.sh`:

1. Instala Docker + plugin Docker Compose;
2. Clona o repositório para `/opt/linuxdecamoes` (branch `master`);
3. Cria os `.env` a partir dos `.env.example` (raiz, `backend/`, `frontend/`);
4. Garante que o teu utilizador pertence ao grupo `docker`.

## 2. Preencher os `.env` (chaves reais)

Edita os três ficheiros na VPS e coloca as chaves reais:

```bash
vim /opt/linuxdecamoes/.env                    # GROQ_API_KEY, CLERK_*, POSTGRES_*
vim /opt/linuxdecamoes/backend/.env            # DATABASE_URL local
vim /opt/linuxdecamoes/frontend/.env.local     # NEXT_PUBLIC_CLERK_*, NEXT_PUBLIC_API_URL
```

**Aviso:** estes ficheiros contêm credenciais reais e **nunca** se commitam —
o repositório é público. Estão cobertos pelo `.gitignore` e o `setup-vps.sh`
copia-os apenas de `.env.example` (que só tem placeholders).

## 3. Subir os Serviços Manualmente (verificação)

Ainda na VPS, sobe os serviços para confirmar que está tudo a funcionar antes
de configurar o deploy automático:

```bash
cd /opt/linuxdecamoes
docker compose up --build -d
docker compose ps        # db/backend/frontend Up (healthy)
```

Portas expostas: `3001` (frontend), `8000` (backend), `5432` (PostgreSQL).

### PostgreSQL — user e password

O user e a password da base de dados são definidos no `docker-compose.yml` e no
`.env` da raiz. **Default:** user `kubeai`, password `kubeai`, db `kubeai` — o
compose lê de `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB`, com fallback
para `kubeai` se não forem definidos.

> ⚠️ **A password só é aplicada quando o volume `pgdata` é criado.** Se o
> contentor já arrancou antes, mudar o `.env` **não muda** a password real do
> PostgreSQL (fica gravada no volume). Duas opções:
>
> - **Instalação nova / sem dados importantes:** `docker compose down -v` e
>   `docker compose up --build -d` (apaga o volume e recria com a nova password).
> - **Com dados existentes:** mudar por SQL (não apaga nada):
>
> ```bash
> docker exec -it linuxdecamoes-db-1 psql -U kubeai -d kubeai -c "ALTER USER kubeai WITH PASSWORD 'A_NOVA_PASSWORD';"
> ```
>
> E **alinhar a `DATABASE_URL`** no `backend/.env` com a nova password, senão o
> backend falha a ligação (dentro da rede Docker o host da BD é `db`, não
> `localhost`):
>
> ```
> DATABASE_URL=postgresql+asyncpg://kubeai:A_NOVA_PASSWORD@db:5432/kubeai
> ```

## 4. Chave SSH para o GitHub Actions

O GitHub Actions entra na VPS por SSH com uma chave dedicada. Na VPS:

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys
```

A chave privada vai para o segredo `VPS_SSH_KEY` (passo seguinte). A porta SSH
é `2294` (configurada no `sshd` da VPS).

## 5. Secrets do GitHub

No GitHub, vai a **Settings → Secrets and variables → Actions → New
repository secret** e cria:

| Segredo | Valor |
|---------|-------|
| `VPS_HOST` | `54.37.15.115` |
| `VPS_USER` | `danieldias` |
| `VPS_SSH_KEY` | conteúdo privado de `~/.ssh/github_actions` (copiado na VPS) |
| `VPS_PORT` | `2294` |
| `VPS_APP_PATH` | `/opt/linuxdecamoes` |

> **Aviso de segurança:** os valores de host/user/porta acima são públicos por
> natureza (identificam a VPS). O que **nunca** se partilha em docs ou no repo
> é o conteúdo de `VPS_SSH_KEY` ou qualquer chave de API.

## 6. Primeiro Deploy (automático)

Com os secrets configurados, basta fazer push para `master`:

```bash
git push origin master
```

O GitHub Actions corre `verify` (lint + build do frontend, 132 páginas SSG) e,
se passar, corre `deploy`, que na VPS faz `git fetch` + `git reset --hard` e
`docker compose up --build -d`. A partir daqui, **todo o push a `master`
atualiza a VPS automaticamente**.

> Nota: os `paths-ignore` do workflow ignoram alterações apenas de
> documentação (`readme/`, `docs/`, `**.md`) — um push só de docs não
> dispara build/deploy desnecessários.

## 7. Deploy Manual (fallback)

Se precisares de atualizar a VPS sem passar pelo CI:

```bash
ssh -p 2294 danieldias@54.37.15.115
cd /opt/linuxdecamoes
git pull
docker compose up --build -d
```

## 8. Backups

### Backup local (bash, via cron)

Corre diariamente às 03:00 — `pg_dump` do PostgreSQL + tar do volume `pgdata`,
guardado em `/opt/linuxdecamoes/backups/` com retenção de 7 dias:

```bash
(crontab -l 2>/dev/null; echo "0 3 * * * /opt/linuxdecamoes/scripts/backup.sh >> /var/log/linuxdecamoes-backup.log 2>&1") | crontab -
```

### Backup para S3/AWS (Python)

Envia o dump para um bucket S3 (AWS, Cloudflare R2 ou MinIO):

```bash
pip install boto3
export S3_BUCKET=linuxdecamoes-backups
export AWS_ACCESS_KEY_ID=AKIA...            # ← placeholder, chave real via env
export AWS_SECRET_ACCESS_KEY=...
python3 scripts/backup_s3.py
```

### Restauro

```bash
./scripts/restore.sh backups/pg_2026-08-01_030000.dump
```

## Troubleshooting

| Problema | Causa provável | Solução |
|----------|----------------|---------|
| Job `deploy` skipped | Secrets não configurados | Criar os secrets (§5); o job passa a correr no próximo push |
| `docker compose up` falha no build do frontend | Vault `../Vault` não existe na VPS | Confirmar que `frontend/src/content/manuals/` está commitado (os 146 `.mdx` — o build não precisa do Vault) |
| Portas inacessíveis de fora | Firewall da VPS | Abrir `3001`, `8000`, `5432` (ou usar reverse proxy com TLS) |
| Rate limit da Groq | Quizzes pendentes de geração | Esperar reset diário ou trocar para `llama-3.1-8b-instant` |
| `docker compose ps` mostra serviço Down | .env sem chaves ou erro de arranque | Ver `docker compose logs <serviço>` |
| Backend não liga à BD (password inválida) | Password só muda com o volume criado | `ALTER USER ... WITH PASSWORD` ou `docker compose down -v`; alinhar `DATABASE_URL` no `backend/.env` |
| SSH `Permission denied` no deploy | `VPS_SSH_KEY` errado ou `authorized_keys` sem a chave pública | Regenerar e reconfigurar (§4–§5) |

## Referências

- Workflow CI/CD: `.github/workflows/deploy.yml`
- Provisionamento: `scripts/setup-vps.sh` · Backups: `scripts/backup.sh`, `scripts/backup_s3.py`, `scripts/restore.sh`
- Compose e Dockerfiles: `docker-compose.yml`, `frontend/Dockerfile`, `backend/Dockerfile`
- Visão geral do projeto: [[01-Visao-Geral]] · Docker: [[05-Docker]] · Roadmap: [[07-Roadmap]]
