# Visão Geral — Projeto Linux de Camões

## O que é

Plataforma open-source de aprendizagem e simulação de administração Linux, baseada nos manuais de certificação LPI. Identidade de marca = "Linux de Camões".

O projeto combina manuais LPI em MDX (119 tópicos), um assistente conversacional com RAG fundamentado nos manuais, prática de comandos Linux (em desenvolvimento) e quizzes de repetição espaçada (algoritmo SM-2) gerados por IA — tudo em português europeu.

## Objetivos

- Manuais LPI em PT-PT com design premium (OKLCH + Bento Grid + glassmorphism)
- RAG fundamentado nos manuais (FAISS + Groq, 1831 chunks)
- Quizzes de repetição espaçada (SM-2, parcial: 62/92 tópicos)
- Zero custos, open source, zero dependências de runtime para animação

## Stack Tecnológica

| Camada            | Tecnologia                                                                                                                                    | Estado |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | :----: |
| **Frontend**      | Next.js 16.2.10 (App Router, Turbopack) · React 19 · Tailwind v4 · shadcn/ui (@base-ui/react) · Clerk · Inter · JetBrains Mono · lucide-react |   ✅    |
| **Backend**       | FastAPI (Python 3.12) · SQLAlchemy/SQLModel · Alembic                                                                                         |   ✅    |
| **Base de Dados** | PostgreSQL 16 (+ pgvector planeado)                                                                                                           |   ✅    |
| **RAG**           | FAISS + sentence-transformers (MiniLM-L12-v2) · Groq (gpt-oss-20b) · 114 tópicos → 1831 chunks                                                |   ✅    |
| **Auth**          | Clerk (JWT)                                                                                                                                   |   ✅    |
| **IA**            | LLM Groq — chat RAG, quizzes, avaliação                                                                                                       |  ✅/⏳   |

## Arquitetura de Sistemas

```text
                ┌───────────────────────────────────────────┐
                │                 Browser                   │
                └──────────────────┬───────────────────────┘
                                   │ HTTP
                ┌──────────────────▼───────────────────────┐
                │  Frontend — Next.js 16 (SSR / SSG)        │
                └─────┬──────────────────────┬──────────────┘
                      │ REST                  │ (build-time)
              ┌─────▼──────────┐  ┌──────▼─────────────────┐
              │ Backend FastAPI │  │ Vault → MDX (119 tópicos) │
              └────┬───────┬───┘  └────────────────────────┘
                   │       │
         ┌─────────▼─┐  ┌─▼──────────────┐
         │ PostgreSQL │  │ FAISS + Groq    │
         └───────────┘  └────────────────┘
```

## Estrutura de Diretórios

```text
linuxdecamoes/
├── agents.md                # System prompt supremo (auto-leitura de agentes)
├── readme/                  # Documentação interna do vault
│   ├── 00-Índice.md
│   ├── 01-Visao-Geral.md    # ← este ficheiro
│   └── ...
├── frontend/                # Next.js 16 App Router
│   ├── src/
│   │   ├── app/             # (public) · (dashboard) · (lab) · (auth)
│   │   ├── components/      # ui/ (shadcn base-nova) · dashboard/ (Bento)
│   │   └── app/globals.css  # tokens OKLCH (:root) + @theme inline
│   └── mockup-dashboard.html# fonte de verdade visual
├── backend/                 # FastAPI
│   ├── api/                 # Routers REST
│   ├── core/                # config (CORS, env, APP_NAME)
│   └── db/                  # SQLAlchemy models + Alembic migrations
├── docs/                    # ADRs · Normas · Design System · specs
└── scripts/                 # Utilitários e conversores
```

## Documentação Relacionada

- [[02-Backend]] · [[03-Frontend]] · [[04-Banco-de-Dados]] · [[05-Docker]] · [[06-Features]] · [[07-Roadmap]]
- `docs/Norma 01 - Sistema de Tokens e Cores.md` (governança de cores)
- `docs/Norma 02 - Layout Bento e Grelha.md` (governança de layout)
