---
tipo: spec
titulo: "Theory Workflow Design — Linux de Camões"
projeto: Linux de Camões
data_criacao: 2026-07-17
ultima_revisao: 2026-07-17
versao: "1.0"
idioma: PT-PT
---

# Workflow de Teoria — Design Spec

## Visão Geral

Sistema de aprendizagem teórica para os 5 manuais LPI, com fluxo linear por
tópico, quiz gating (≥60% para desbloquear próximo), roadmap visual por manual,
e dashboard global com progresso persistente.

**Sem terminal/K8s** — apenas teoria. Consola fica para fase seguinte.

## Objetivos

1. Utilizador segue um percurso **linear** dentro de cada manual (T1→T2→T3)
2. Cada tópico tem um **quiz de gating** — precisa de ≥60% para desbloquear o próximo
3. **Roadmap visual** mostra o percurso completo com status (✅/🔒)
4. **Conteúdo via RAG** — sumário automático + seções expansíveis
5. **Dashboard global** mostra progresso de todos os manuais/módulos
6. **Progresso persistente** guardado em base de dados

## Estrutura de Dados

### Módulos LPI (manifesto `manuals.ts`)

Cada `ManualTopic` ganha dois campos:

```typescript
type ManualTopic = {
  slug: string;
  title: string;
  summary: string;
  objective: string;      // ex: "1.1", "1.2", "2.1"
  objectiveTitle: string;  // ex: "Estrutura do sistema de ficheiros Linux"
};
```

Os tópicos são agrupados por `objective` — cada objetivo LPI é um **módulo**.

### Tabela `user_progress` (existente, ampliada)

Campos novos a adicionar:

| Campo | Tipo | Default | Descrição |
|-------|------|---------|-----------|
| `completed_at` | DateTime | nullable | Timestamp de conclusão do tópico |
| `quiz_score` | Float | nullable | Última nota do quiz (0-100) |
| `quiz_passed` | Boolean | False | Se passou no gating (≥60%) |

Campos existentes mantidos: `user_id`, `topic_id`, `status`, `score`, `commands_executed`, `last_studied`.

## Backend API

### Novos endpoints

#### `GET /api/manuals/{code}/progress`

Retorna o progresso do utilizador autenticado num manual específico.

```json
{
  "manual_code": "101",
  "total_topics": 26,
  "completed_topics": 5,
  "modules": [
    {
      "objective": "1.1",
      "title": "Estrutura do sistema de ficheiros Linux",
      "topics": [
        {
          "topic_id": "...",
          "topic_number": 1,
          "title": "Noções gerais de Linux",
          "status": "completed",
          "quiz_score": 80,
          "quiz_passed": true,
          "completed_at": "2026-07-17T10:00:00Z"
        },
        {
          "topic_id": "...",
          "topic_number": 2,
          "title": "Partições e sistemas de ficheiros",
          "status": "in_progress",
          "quiz_score": null,
          "quiz_passed": false,
          "completed_at": null
        }
      ]
    }
  ]
}
```

#### `GET /api/topics/{id}/content`

Retorna o conteúdo RAG de um tópico (sem LLM — apenas busca vetorial).

```json
{
  "topic_id": "...",
  "title": "Noções gerais de Linux",
  "objective": "1.1",
  "summary": "Resumo automático dos chunks RAG...",
  "sections": [
    {
      "secao": "Origem do Linux",
      "tipo": "resumo",
      "texto": "Conteúdo da secção...",
      "manual": "101 - LPIC-1 Parte 1",
      "topico": "01"
    }
  ]
}
```

#### `POST /api/topics/{id}/complete`

Marca um tópico como completo (após quiz ≥60%).

**Request:**
```json
{
  "quiz_score": 80
}
```

**Response:**
```json
{
  "topic_id": "...",
  "quiz_score": 80,
  "quiz_passed": true,
  "completed_at": "2026-07-17T10:00:00Z",
  "next_topic_unlocked": true,
  "next_topic_id": "..."
}
```

**Lógica:** Se `quiz_score >= 60`, `quiz_passed = True`. Caso contrário, `quiz_passed = False`.

#### `GET /api/users/{clerk_id}/progress`

Retorna progresso global (todos os manuais) para o dashboard.

```json
{
  "manuals": [
    {
      "code": "010",
      "title": "Linux Essentials",
      "total_topics": 14,
      "completed_topics": 10,
      "modules_completed": 3,
      "modules_total": 4
    }
  ],
  "total_topics_completed": 50,
  "total_topics": 92
}
```

### Lógica de gating

- Primeiro tópico de cada manual está **sempre desbloqueado**
- Cada tópico subsequente só está desbloqueado se o anterior tiver `quiz_passed = True`
- `GET /manuals/{code}/progress` calcula o status de cada tópico com base nessa regra

## Frontend

### Novas rotas

| Rota | Tipo | Descrição |
|------|------|-----------|
| `/dashboard/study` | Server Component | Vista global — grid de 5 manuais com barras de progresso |
| `/dashboard/study/[code]` | Server Component | Roadmap visual do manual — sidebar + área de conteúdo |
| `/dashboard/study/[code]/[topic]` | Client Component | Estudo do tópico — conteúdo RAG + quiz gating |

### Componentes novos

| Componente | Tipo | Responsabilidade |
|-----------|------|-----------------|
| `study-card.tsx` | Server | Card no dashboard global — nome manual, barras progresso por módulo |
| `study-roadmap.tsx` | Server | Sidebar do manual — stepper visual ✅/🔒 por tópico |
| `topic-content.tsx` | Client | Conteúdo RAG — sumário + seções expansíveis |
| `topic-quiz.tsx` | Client | Quiz de gating — 5 perguntas, precisa 60%+ |

### Fluxo do utilizador

```
/dashboard (Bento Grid)
  └── StudyCard mostra 5 manuais com progresso
        └── Click → /dashboard/study/101
              ├── Sidebar: roadmap T1✅ → T2✅ → T3🔒 → ...
              └── Área: conteúdo do tópico selecionado
                    ├── RAG summary + seções expansíveis
                    └── Botão "Quiz" → quiz de gating
                          ├── ≥60% → desbloqueia próximo tópico
                          └── <60% → pode repetir
```

### API Client (`lib/api.ts`)

Adicionar funções:

```typescript
// Progress
export async function getManualProgress(code: string): Promise<ManualProgress>
export async function getUserGlobalProgress(clerkId: string): Promise<GlobalProgress>

// Topic content
export async function getTopicContent(topicId: string): Promise<TopicContent>

// Complete topic
export async function completeTopic(topicId: string, quizScore: number): Promise<CompletionResult>
```

### Tipos TypeScript

```typescript
type ModuleProgress = {
  objective: string;
  title: string;
  topics: TopicProgress[];
};

type TopicProgress = {
  topic_id: string;
  topic_number: number;
  title: string;
  status: "not_started" | "in_progress" | "completed";
  quiz_score: number | null;
  quiz_passed: boolean;
  completed_at: string | null;
};

type ManualProgress = {
  manual_code: string;
  total_topics: number;
  completed_topics: number;
  modules: ModuleProgress[];
};

type GlobalProgress = {
  manuals: {
    code: string;
    title: string;
    total_topics: number;
    completed_topics: number;
    modules_completed: number;
    modules_total: number;
  }[];
  total_topics_completed: number;
  total_topics: number;
};

type TopicContent = {
  topic_id: string;
  title: string;
  objective: string;
  summary: string;
  sections: {
    secao: string;
    tipo: string;
    texto: string;
    manual: string;
    topico: string;
  }[];
};

type CompletionResult = {
  topic_id: string;
  quiz_score: number;
  quiz_passed: boolean;
  completed_at: string;
  next_topic_unlocked: boolean;
  next_topic_id: string | null;
};
```

## Dashboard Integration

O `StudyCard` substitui ou complementa o `TopicsCard` existente no Bento Grid.
Mostra:

- Nome do manual
- Barra de progresso geral (tópicos completos / total)
- Indicadores por módulo (ex: "Módulo 1.1: 3/5 ✅")
- Link para `/dashboard/study/{code}`

## Segurança e Acesso

- Todos os endpoints requerem autenticação Clerk
- `user_id` extraído do JWT (não confiado no request body)
- Progresso é por-utilizador (isolamento por `clerk_id`)

## Fora do Escopo (desta spec)

- Terminal K8s / xterm.js (Fase 5)
- Validação de comandos / grading
- Streaming RAG (conteúdo é estático via busca vetricular)
- Spaced repetition dos quizzes de teoria (mantém-se SM-2 existente)
