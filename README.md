<p align="center">
  <img src="linuxdecamoes.svg" alt="Linux de Camões" width="220" />
</p>

<h1 align="center">Linux de Camões</h1>

<p align="center">
  <em>Plataforma open-source de aprendizagem de Linux, baseada nos manuais oficiais de certificação LPI — em português europeu.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/status-alpha-yellow" alt="Alpha" />
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT" />
  <img src="https://img.shields.io/badge/Next.js-16-black" alt="Next.js 16" />
</p>

---

## Sobre o projeto

O **Linux de Camões** é uma plataforma interativa e open-source para estudar administração de sistemas Linux com base nos manuais oficiais de certificação **LPI** (Linux Professional Institute).

O problema que resolve: quem estuda para a certificação LPI encontra dois obstáculos — falta de material de qualidade em português europeu, e ausência de ferramentas interativas que acompanhem o programa oficial.

A plataforma combina:

- **119 tópicos LPI** em MDX premium, com callouts, blocos de terminal formatados e navegação por objetivos
- **Assistente conversacional com RAG** — faz perguntas sobre Linux e obtém respostas fundamentadas nos manuais, com citações
- **Quizzes de repetição espaçada (SM-2)** gerados por IA, com revisão programada
- **Dashboard de progresso** com métricas por manual, módulo e tópico

> **Estado:** Alpha. Funcionalidades principais implementadas. Terminal interativo em desenvolvimento.

## Stack tecnológica

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | Next.js 16.2.10 (App Router, Turbopack) · React 19 · Tailwind v4 · shadcn/ui (`@base-ui/react`) · Clerk (autenticação) · Inter + JetBrains Mono · lucide-react |
| **Backend** | FastAPI (Python 3.12) · SQLAlchemy/SQLModel · Alembic |
| **Base de Dados** | PostgreSQL 16 |
| **RAG** | FAISS + `sentence-transformers` (`paraphrase-multilingual-MiniLM-L12-v2`) · Groq (`gpt-oss-20b`) |
| **Auth** | Clerk (JWT, proteção de rotas, tier grátis 10k MAU) |
| **Conteúdo** | MDX + remark-gfm (tabelas GFM) + rehype-slug + gray-matter |
| **Quizzes** | Algoritmo SM-2 (repetição espaçada), geração via LLM |

## Funcionalidades

### 📘 Manuais LPI
119 tópicos dos manuais 010 (Linux Essentials), 020 (Security), 030 (Web Development), 101 e 102 (LPIC-1). Navegação por objetivos de certificação, tabelas GFM interativas com copy-to-clipboard, callouts (Nota/Dica/Aviso/Perigo), TOC com scroll-spy e barra de progresso de leitura.

### 🔍 Chat com RAG
Assistente conversacional que responde com base nos 1831 chunks extraídos dos manuais LPI. Cada resposta inclui fontes com pontuação de relevância. Backend: FAISS + Groq.

### 🧠 Quizzes SM-2
Geração automática de 5 questões por tópico via LLM. Algoritmo de repetição espaçada SM-2: respostas corretas aumentam o intervalo de revisão; erradas reduzem-no. Quizzes pendentes aparecem no dashboard.

### 📊 Dashboard de progresso
Visão geral do progresso por manual e módulo. Sequência de dias consecutivos de estudo. Estatísticas de quizzes realizados e pendentes.

## Arquitetura

```text
                   ┌───────────────────────────────┐
                   │          Browser               │
                   └───────────────┬───────────────┘
                                   │ HTTP
                   ┌───────────────▼───────────────┐
                   │   Frontend — Next.js 16       │
                   │   (SSR / SSG / App Router)    │
                   ├───────────────────────────────┤
                   │   Manuais MDX  ·  Auth Clerk  │
                   │   UI OKLCH / Bento Grid       │
                   └───────┬───────────────────┬───┘
                           │ REST              │ (build-time)
                   ┌───────▼──────┐   ┌───────▼──────────────┐
                   │  Backend     │   │  Vault → MDX pipeline │
                   │  FastAPI     │   │  (119 tópicos LPI)   │
                   │  :8000       │   └──────────────────────┘
                   └───┬──────┬──┘
                       │      │
               ┌───────▼──┐ ┌─▼────────────────┐
               │PostgreSQL│ │FAISS + Groq      │
               │:5432     │ │RAG (1831 chunks) │
               └──────────┘ └──────────────────┘
```

## Início rápido

### Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) + Docker Compose
- [Node.js](https://nodejs.org/) 20+ (para desenvolvimento sem Docker)
- Chaves de API:
  - [Clerk](https://dashboard.clerk.com) — autenticação (grátis até 10k MAU)
  - [Groq](https://console.groq.com/keys) — LLM para chat e quizzes (grátis, 200k tokens/dia)

### Docker (recomendado)

```bash
# 1. Clonar o repositório
git clone https://github.com/linuxdecamoes/linuxdecamoes.git
cd linuxdecamoes

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com as tuas chaves Groq

cp backend/.env.example backend/.env
# Editar backend/.env com chaves Clerk + Groq

cp frontend/.env.example frontend/.env.local
# Editar frontend/.env.local com chaves Clerk + Groq

# 3. Iniciar todos os serviços
docker compose up --build
```

A plataforma fica disponível em:
| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:3001 |
| Backend API | http://localhost:8000 |
| Documentação API | http://localhost:8000/docs |

### Desenvolvimento sem Docker

```bash
# Backend
cd backend
python -m venv venv && source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Frontend (noutro terminal)
cd frontend
cmd /c "npm install"
cmd /c "npm run dev"     # Windows
```

## Estrutura do projeto

```
linuxdecamoes/
├── README.md
├── LICENSE
├── .env.example             # Variáveis de ambiente (exemplo)
├── docker-compose.yml       # db + backend + frontend
├── agents.md                # System prompt para IA (configuração do projeto)
├── frontend/                # Next.js 16 (App Router)
│   ├── src/app/             # Rotas: /, /sobre, /manuals, /dashboard, /lab, /sign-in
│   ├── src/components/      # Componentes UI (shadcn) + dashboard + manuais
│   ├── src/lib/             # API client, manuais data, utilitários
│   └── src/content/manuals/ # 119 tópicos LPI em MDX
├── backend/                 # FastAPI
│   ├── api/                 # Routers: users, manuals, quizzes, study, chat
│   ├── models/              # SQLAlchemy models
│   ├── rag/                 # RAG pipeline (FAISS + embeddings + Groq)
│   └── db/                  # Configuração de base de dados
├── scripts/                 # Utilitários (conversão MD, seed quizzes)
├── readme/                  # Documentação do vault Obsidian
├── docs/                    # ADRs, Normas, Design System, specs/plans
└── linuxdecamoes.svg        # Logótipo
```

## Variáveis de ambiente

| Variável | Obrigatória | Descrição | Obter em |
|----------|-------------|-----------|----------|
| `GROQ_API_KEY` | Sim | Chave da API Groq para LLM | https://console.groq.com/keys |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Sim | Chave pública Clerk (frontend) | https://dashboard.clerk.com |
| `CLERK_SECRET_KEY` | Sim | Chave secreta Clerk (backend/frontend) | https://dashboard.clerk.com |
| `DATABASE_URL` | Sim | URL de conexão PostgreSQL | Configuração local |

## Estado do desenvolvimento

| Fase | Estado |
|------|--------|
| 0 — Contexto e planeamento | ✅ |
| 1 — Repositório e setup | ✅ |
| 2 — Frontend base | ✅ |
| 3 — Backend API | ✅ |
| 4 — RAG (chat com manuais) | ✅ |
| 5 — Quizzes SM-2 | 🟡 Parcial (62/92 tópicos com quizzes) |
| 6 — Terminal interativo | 🔄 Em desenvolvimento |

## Deploy na VPS + CI/CD

### 1. Provisionamento inicial (VPS)

Na VPS (Ubuntu/Debian), corre uma unica vez:

```bash
# Na VPS:
curl -fsSL https://raw.githubusercontent.com/linuxdecamoes/linuxdecamoes/master/scripts/setup-vps.sh | bash
```

Isto instala Docker, clona o repo em `/opt/linuxdecamoes` e cria os `.env`.

Depois edita os ficheiros `.env` com as tuas chaves:

```bash
vim /opt/linuxdecamoes/.env
vim /opt/linuxdecamoes/backend/.env
vim /opt/linuxdecamoes/frontend/.env.local
```

E sobe os servicos:

```bash
cd /opt/linuxdecamoes
docker compose up --build -d
```

### 2. Pipeline CI/CD (GitHub Actions)

O workflow `.github/workflows/deploy.yml` faz deploy automatico sempre que
fazes push para `main`. Corre lint + build primeiro, e so depois faz deploy na
VPS via SSH.

**Configura os segredos no GitHub** (Settings → Secrets and variables → Actions):

| Segredo | Descricao |
|---------|-----------|
| `VPS_HOST` | IP ou dominio da VPS |
| `VPS_USER` | Utilizador SSH (ex: ubuntu, root) |
| `VPS_SSH_KEY` | Chave privada SSH (conteudo completo de `~/.ssh/id_ed25519`) |
| `VPS_PORT` | Porta SSH (opcional, default 22) |
| `VPS_APP_PATH` | Caminho do repo na VPS (opcional, default `/opt/linuxdecamoes`) |

**Gerar chave SSH para o GitHub Actions:**

Na VPS:

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys
cat ~/.ssh/github_actions          # ← copia TUDO para o segredo VPS_SSH_KEY
```

### 3. Backups

**Backup local (bash, via cron):**

```bash
# Corre diariamente as 03:00
(crontab -l 2>/dev/null; echo "0 3 * * * /opt/linuxdecamoes/scripts/backup.sh >> /var/log/linuxdecamoes-backup.log 2>&1") | crontab -
```

**Backup para S3/AWS (Python):**

```bash
pip install boto3
export S3_BUCKET=linuxdecamoes-backups
export AWS_ACCESS_KEY_ID=AKIA...
export AWS_SECRET_ACCESS_KEY=...
python3 scripts/backup_s3.py
```

Isto faz pg_dump e envia para o bucket S3. Podes usar com AWS S3, Cloudflare R2
ou MinIO (self-hosted).

**Restauro:**

```bash
./scripts/restore.sh backups/pg_2026-07-31_120000.dump
```

## Licença

Distribuído sob licença **MIT**. Ver [`LICENSE`](LICENSE).

---

<sub>Feito em Portugal. Português europeu. Open source. Grátis.</sub>
