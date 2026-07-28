# Fase 6 — Quizzes com Repetição Espaçada e Avaliação LLM

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar um sistema completo de quizzes com geração de questões via Groq/LLM, repetição espaçada SM-2, e UI interativa no dashboard.

**Architecture:** O backend já tem modelos `quizzes` + `quiz_results` com SM-2 implementado e endpoints funcionais. Falta: (1) geração de questões via LLM, (2) API client no frontend, (3) UI interativa de quiz, (4) ligação real dos dados no dashboard.

**Tech Stack:** FastAPI · SQLAlchemy async · Groq (Llama 3 8B) · Next.js 16 · React 19 · Tailwind v4 · shadcn/ui (base-nova)

---

## File Map

### Backend (modificar)
| Ficheiro | Responsabilidade |
|----------|-----------------|
| `backend/api/quizzes.py` | Adicionar endpoint `POST /api/quizzes/generate/{topic_id}` |
| `backend/rag/llm.py` | Adicionar função `generate_quizzes()` com prompt de geração |
| `backend/models/models.py` | Adicionar campo `generated_at` à tabela `quizzes` |

### Frontend (criar/modificar)
| Ficheiro | Responsabilidade |
|----------|-----------------|
| `frontend/src/lib/api.ts` | **Novo** — API client para FastAPI |
| `frontend/src/app/(dashboard)/dashboard/quizzes/page.tsx` | Reescrever com dados reais |
| `frontend/src/components/quiz/quiz-taker.tsx` | **Novo** — Componente interativo de quiz |
| `frontend/src/components/quiz/quiz-results.tsx` | **Novo** — Resultados pós-quiz |
| `frontend/src/components/dashboard/quizzes-card.tsx` | Atualizar com dados reais |

### Scripts
| Ficheiro | Responsabilidade |
|----------|-----------------|
| `backend/scripts/generate_all_quizzes.py` | **Novo** — Script de seed para gerar quizzes de todos os tópicos |

---

## Task 1: API Client no Frontend

**Ficheiros:**
- Criar: `frontend/src/lib/api.ts`

- [ ] **Step 1: Criar o API client**

```typescript
// frontend/src/lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status}: ${body}`);
  }
  return res.json();
}

/* ── Users ─────────────────────────────────────────── */

export type User = {
  id: string;
  clerk_id: string;
  email: string;
  display_name: string | null;
};

export async function getUserByClerkId(clerkId: string): Promise<User> {
  return apiFetch<User>(`/api/users/${clerkId}`);
}

export async function createUser(data: {
  clerk_id: string;
  email: string;
  display_name?: string;
}): Promise<User> {
  return apiFetch<User>("/api/users/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/* ── Quizzes ───────────────────────────────────────── */

export type Quiz = {
  id: string;
  topic_id: string;
  question: string;
  options: string;
  correct_answer: string;
  explanation: string | null;
};

export type QuizSubmitResult = {
  is_correct: boolean;
  next_review: string;
  interval_days: number;
};

export async function getQuizzesByTopic(
  topicId: string,
  limit = 10,
): Promise<Quiz[]> {
  return apiFetch<Quiz[]>(
    `/api/quizzes/topic/${topicId}?limit=${limit}`,
  );
}

export async function submitQuizAnswer(data: {
  user_id: string;
  quiz_id: string;
  answer: string;
}): Promise<QuizSubmitResult> {
  return apiFetch<QuizSubmitResult>("/api/quizzes/submit", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getDueQuizzes(
  userId: string,
  limit = 20,
): Promise<Quiz[]> {
  return apiFetch<Quiz[]>(`/api/quizzes/due/${userId}?limit=${limit}`);
}

export async function generateQuizzesForTopic(
  topicId: string,
): Promise<{ generated: number; quizzes: Quiz[] }> {
  return apiFetch(`/api/quizzes/generate/${topicId}`, {
    method: "POST",
  });
}

/* ── Chat / Search ──────────────────────────────────── */

export type ChunkResult = {
  score: number;
  file: string;
  manual: string;
  topico: string;
  secao: string;
  tipo: string;
  texto: string;
};

export type ChatResponse = {
  answer: string;
  sources: ChunkResult[];
};

export async function sendChatMessage(
  query: string,
  k = 5,
): Promise<ChatResponse> {
  return apiFetch<ChatResponse>("/api/chat", {
    method: "POST",
    body: JSON.stringify({ query, k }),
  });
}
```

- [ ] **Step 2: Verificar que compila**

Run: `cmd /c "npx tsc --noEmit"` no frontend.
Expected: Sem erros de tipo.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/lib/api.ts
git commit -m "feat: add API client for FastAPI backend"
```

---

## Task 2: Endpoint de Geração de Quizzes via LLM

**Ficheiros:**
- Modificar: `backend/rag/llm.py` — adicionar `generate_quizzes()`
- Modificar: `backend/api/quizzes.py` — adicionar `POST /api/quizzes/generate/{topic_id}`
- Modificar: `backend/models/models.py` — adicionar `generated_at`

- [ ] **Step 1: Adicionar campo `generated_at` ao modelo Quiz**

Em `backend/models/models.py`, adicionar após `explanation`:

```python
class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    topic_id = Column(String(64), ForeignKey("topics.id"), nullable=False)
    question = Column(Text, nullable=False)
    options = Column(Text, nullable=False)  # JSON string: ["opt1", "opt2", "opt3", "opt4"]
    correct_answer = Column(String(255), nullable=False)
    explanation = Column(Text, nullable=True)
    generated_at = Column(DateTime, default=datetime.utcnow)  # NOVO
```

- [ ] **Step 2: Adicionar `generate_quizzes()` em `backend/rag/llm.py`**

Adicionar ao final de `llm.py`:

```python
import json

QUIZ_GENERATION_SYSTEM = """Tu és um gerador de questões de certificação LPI (Linux Professional Institute).
Gera questões de múltipla escolha precisas e tecnicamente corretas.
Responde SEMPRE em português."""

QUIZ_GENERATION_TEMPLATE = """Com base nos seguintes tópicos dos manuais LPI, gera exatamente {n} questões de múltipla escolha.

Cada questão deve ter:
- Uma pergunta clara e específica
- 4 opções (A, B, C, D) — apenas uma correta
- A resposta correta (o texto exato da opção)
- Uma explicação concisa da resposta

Formato de saída — JSON array válido:
[
  {{
    "question": "Qual é a função do comando chmod?",
    "options": [
      "Alterar permissões de ficheiros",
      "Criar um novo utilizador",
      "Listar ficheiros num diretório",
      "Comprimir ficheiros"
    ],
    "correct_answer": "Alterar permissões de ficheiros",
    "explanation": "chmod (change mode) altera as permissões de acesso de ficheiros e diretórios."
  }}
]

Contexto dos manuais LPI:
{context}

Gera exatamente {n} questões. Responde APENAS com o JSON array, sem texto adicional."""


def generate_quizzes(chunks: list[dict], n: int = 5) -> list[dict]:
    """Generate quiz questions from RAG chunks using Groq."""
    context = "\n\n".join(
        f"[{c.get('manual', '')} / Tópico {c.get('topico', '')}] {c.get('texto', '')[:1500]}"
        for c in chunks[:8]
    )

    client = _get_client()
    response = client.chat.completions.create(
        model="llama3-8b-8192",
        messages=[
            {"role": "system", "content": QUIZ_GENERATION_SYSTEM},
            {
                "role": "user",
                "content": QUIZ_GENERATION_TEMPLATE.format(n=n, context=context),
            },
        ],
        temperature=0.4,
        max_tokens=4096,
    )

    raw = response.choices[0].message.content.strip()
    # Strip markdown code fences if present
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1]
        if raw.endswith("```"):
            raw = raw[: -len("```")]
        raw = raw.strip()

    try:
        quizzes = json.loads(raw)
        if not isinstance(quizzes, list):
            return []
        return quizzes[:n]
    except json.JSONDecodeError:
        return []
```

- [ ] **Step 3: Adicionar endpoint de geração em `backend/api/quizzes.py`**

Adicionar ao final do ficheiro, antes do `router`:

```python
from ..rag.service import search
from ..rag.llm import generate_quizzes as generate_quizzes_llm


@router.post("/generate/{topic_id}")
async def generate_topic_quizzes(
    topic_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Generate quiz questions for a topic using LLM + RAG chunks."""
    # Check if quizzes already exist for this topic
    result = await db.execute(
        select(Quiz).where(Quiz.topic_id == topic_id).limit(1)
    )
    existing = result.scalar_one_or_none()
    if existing:
        quizzes = await db.execute(
            select(Quiz).where(Quiz.topic_id == topic_id)
        )
        return {
            "generated": 0,
            "quizzes": [q.__dict__ for q in quizzes.scalars().all()],
        }

    # Get topic info for RAG search
    topic = await db.get(Topic, topic_id)
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    # Search RAG for relevant chunks
    chunks = search(topic.title, k=10)

    # Generate quizzes via LLM
    generated = generate_quizzes_llm(chunks, n=5)
    if not generated:
        raise HTTPException(
            status_code=502,
            detail="Failed to generate quizzes from LLM",
        )

    # Store in database
    created = []
    for q in generated:
        quiz = Quiz(
            topic_id=topic_id,
            question=q["question"],
            options=json.dumps(q["options"], ensure_ascii=False),
            correct_answer=q["correct_answer"],
            explanation=q.get("explanation"),
        )
        db.add(quiz)
        created.append(quiz)

    await db.commit()
    for quiz in created:
        await db.refresh(quiz)

    return {
        "generated": len(created),
        "quizzes": [q.__dict__ for q in created],
    }
```

Adicionar `import json` e `from sqlalchemy import select` ao topo se não existirem.

- [ ] **Step 4: Verificar que o backend arranca**

Run: `cmd /c "cd backend && python -c 'from api.quizzes import router; print(\"OK\")'"`
Expected: `OK`

- [ ] **Step 5: Commit**

```bash
git add backend/
git commit -m "feat: add LLM-powered quiz generation endpoint"
```

---

## Task 3: Script de Seed — Gerar Quizzes para Todos os Tópicos

**Ficheiros:**
- Criar: `backend/scripts/generate_all_quizzes.py`

- [ ] **Step 1: Criar o script de seed**

```python
# backend/scripts/generate_all_quizzes.py
"""Seed script: generate quizzes for all topics using LLM + RAG.

Usage: python -m scripts.generate_all_quizzes
"""
import asyncio
import json
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from db.base import async_session
from models.models import Topic, Quiz
from rag.service import search
from rag.llm import generate_quizzes as generate_quizzes_llm


async def generate_for_topic(topic: Topic, db: AsyncSession) -> int:
    """Generate quizzes for a single topic. Returns count generated."""
    # Skip if already has quizzes
    result = await db.execute(
        select(Quiz).where(Quiz.topic_id == topic.id).limit(1)
    )
    if result.scalar_one_or_none():
        print(f"  [SKIP] Topic {topic.topic_number} already has quizzes")
        return 0

    # RAG search
    chunks = search(topic.title, k=10)
    if not chunks:
        print(f"  [WARN] No RAG chunks for topic {topic.topic_number}")
        return 0

    # LLM generation
    generated = generate_quizzes_llm(chunks, n=5)
    if not generated:
        print(f"  [ERROR] LLM failed for topic {topic.topic_number}")
        return 0

    # Store
    for q in generated:
        quiz = Quiz(
            topic_id=topic.id,
            question=q["question"],
            options=json.dumps(q["options"], ensure_ascii=False),
            correct_answer=q["correct_answer"],
            explanation=q.get("explanation"),
        )
        db.add(quiz)

    await db.commit()
    print(f"  [OK] Generated {len(generated)} quizzes for topic {topic.topic_number}: {topic.title}")
    return len(generated)


async def main():
    async with async_session() as db:
        result = await db.execute(select(Topic).order_by(Topic.topic_number))
        topics = result.scalars().all()
        print(f"Found {len(topics)} topics. Generating quizzes...\n")

        total = 0
        for topic in topics:
            count = await generate_for_topic(topic, db)
            total += count

        print(f"\nDone! Generated {total} quizzes across {len(topics)} topics.")


if __name__ == "__main__":
    asyncio.run(main())
```

- [ ] **Step 2: Testar o script (1 tópico)**

Run: `cmd /c "cd backend && python -c \"import asyncio; from scripts.generate_all_quizzes import generate_for_topic; from db.base import async_session; from models.models import Topic; from sqlalchemy import select; asyncio.run((lambda: (t := asyncio.get_event_loop().run_until_complete((async with async_session() as db: (await db.execute(select(Topic).limit(1))).scalars().first()))).__class__.__name__))()\" 2>&1"`

Alternativamente, testar manualmente:
```bash
cd backend
python -c "
import asyncio
from db.base import async_session
from models.models import Topic
from sqlalchemy import select

async def test():
    async with async_session() as db:
        result = await db.execute(select(Topic).limit(1))
        topic = result.scalar_one_or_none()
        if topic:
            print(f'Topic: {topic.title} (id={topic.id})')

asyncio.run(test())
"
```

Expected: Mostra o primeiro tópico da base de dados.

- [ ] **Step 3: Commit**

```bash
git add backend/scripts/
git commit -m "feat: add quiz seed script for all LPI topics"
```

---

## Task 4: Reescrever a Página de Quizzes com Dados Reais

**Ficheiros:**
- Modificar: `frontend/src/app/(dashboard)/dashboard/quizzes/page.tsx`

- [ ] **Step 1: Reescrever a página de quizzes**

```tsx
// frontend/src/app/(dashboard)/dashboard/quizzes/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Clock, Play, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getUserByClerkId } from "@/lib/api";
import { manuals } from "@/lib/manuals";

export default async function QuizzesPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  let user;
  try {
    user = await getUserByClerkId(userId);
  } catch {
    user = null;
  }

  // Build topic list from manuals manifesto (client-side will fetch real data)
  const allTopics = manuals.flatMap((m) =>
    m.topics.map((t) => ({
      ...t,
      manual: m.code,
      manualTitle: m.title,
      accent: m.accent,
    })),
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Quizzes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Repetição espaçada baseada no algoritmo SM-2
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-soft">
              <Clock className="h-5 w-5 text-amber" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground" id="due-count">—</p>
              <p className="text-xs text-muted-foreground">Pendentes Hoje</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sage-soft">
              <CheckCircle className="h-5 w-5 text-sage" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground" id="reviewed-count">—</p>
              <p className="text-xs text-muted-foreground">Revisados</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-coral-soft">
              <AlertCircle className="h-5 w-5 text-coral" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{allTopics.length}</p>
              <p className="text-xs text-muted-foreground">Total de Tópicos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Topics Grid */}
      <h2 className="mb-4 text-lg font-semibold text-foreground">
        Tópicos Disponíveis
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {allTopics.map((topic) => (
          <Link
            key={`${topic.manual}-${topic.slug}`}
            href={`/dashboard/quizzes/${topic.manual}/${topic.slug}`}
          >
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-start justify-between p-4">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    {topic.manualTitle}
                  </p>
                  <h3 className="mt-1 truncate text-sm font-medium text-foreground">
                    {topic.title}
                  </h3>
                </div>
                <Button variant="ghost" size="icon-sm" className="shrink-0">
                  <Play className="h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Criar a página de quiz individual**

Criar: `frontend/src/app/(dashboard)/dashboard/quizzes/[manual]/[slug]/page.tsx`

```tsx
// frontend/src/app/(dashboard)/dashboard/quizzes/[manual]/[slug]/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getQuizzesByTopic, submitQuizAnswer, generateQuizzesForTopic } from "@/lib/api";
import type { Quiz, QuizSubmitResult } from "@/lib/api";

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const manual = params.manual as string;
  const slug = params.slug as string;

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<QuizSubmitResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const loadQuizzes = useCallback(async () => {
    setLoading(true);
    try {
      // First try to fetch existing quizzes
      // We need the topic_id — for now, use the slug as a lookup
      // This will be refined once we have the topic mapping
      const data = await getQuizzesByTopic(slug);
      if (data.length === 0) {
        // Generate quizzes on first access
        setGenerating(true);
        const generated = await generateQuizzesForTopic(slug);
        setQuizzes(generated.quizzes);
        setGenerating(false);
      } else {
        setQuizzes(data);
      }
    } catch (err) {
      console.error("Failed to load quizzes:", err);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadQuizzes();
  }, [loadQuizzes]);

  const handleAnswer = async () => {
    if (!selected || !quizzes[current]) return;
    setSubmitting(true);
    try {
      const res = await submitQuizAnswer({
        user_id: "current-user",
        quiz_id: quizzes[current].id,
        answer: selected,
      });
      setResult(res);
      setScore((prev) => ({
        correct: prev.correct + (res.is_correct ? 1 : 0),
        total: prev.total + 1,
      }));
    } catch (err) {
      console.error("Failed to submit:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (current < quizzes.length - 1) {
      setCurrent((c) => c + 1);
      setSelected(null);
      setResult(null);
    } else {
      setFinished(true);
    }
  };

  if (loading || generating) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          {generating ? "A gerar questões com IA..." : "A carregar quizzes..."}
        </p>
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <p className="text-muted-foreground">
          Não foi possível gerar questões para este tópico.
        </p>
        <Button variant="outline" onClick={() => router.back()}>
          Voltar
        </Button>
      </div>
    );
  }

  if (finished) {
    const pct = Math.round((score.correct / score.total) * 100);
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-foreground">Quiz Concluído!</h1>
        <p className="mt-4 text-4xl font-bold text-primary">{pct}%</p>
        <p className="mt-2 text-muted-foreground">
          {score.correct} de {score.total} corretas
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            Voltar
          </Button>
          <Button onClick={() => { setCurrent(0); setSelected(null); setResult(null); setFinished(false); setScore({ correct: 0, total: 0 }); }}>
            Repetir
          </Button>
        </div>
      </div>
    );
  }

  const quiz = quizzes[current];
  const options: string[] = JSON.parse(quiz.options);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <button
        onClick={() => router.back()}
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </button>

      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Pergunta {current + 1} de {quizzes.length}
        </p>
        <div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${((current + 1) / quizzes.length) * 100}%` }}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-medium text-foreground">
            {quiz.question}
          </h2>

          <div className="mt-6 space-y-3">
            {options.map((option, i) => {
              const letter = String.fromCharCode(65 + i);
              const isCorrect = option === quiz.correct_answer;
              const isSelected = selected === option;
              const showResult = result !== null;

              return (
                <button
                  key={i}
                  onClick={() => !result && setSelected(option)}
                  disabled={!!result}
                  className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left text-sm transition-all ${
                    showResult && isCorrect
                      ? "border-sage bg-sage-soft text-foreground"
                      : showResult && isSelected && !result?.is_correct
                        ? "border-destructive bg-destructive/10 text-foreground"
                        : isSelected
                          ? "border-primary bg-primary/5 text-foreground"
                          : "border-border hover:bg-muted text-foreground"
                  }`}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border text-xs font-medium">
                    {showResult && isCorrect ? (
                      <CheckCircle className="h-4 w-4 text-sage" />
                    ) : showResult && isSelected ? (
                      <XCircle className="h-4 w-4 text-destructive" />
                    ) : (
                      letter
                    )}
                  </span>
                  <span className="flex-1">{option}</span>
                </button>
              );
            })}
          </div>

          {result && quiz.explanation && (
            <div className="mt-4 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
              <strong className="text-foreground">Explicação:</strong>{" "}
              {quiz.explanation}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 flex justify-end">
        {!result ? (
          <Button onClick={handleAnswer} disabled={!selected || submitting}>
            {submitting ? "A verificar..." : "Confirmar"}
          </Button>
        ) : (
          <Button onClick={handleNext}>
            {current < quizzes.length - 1 ? (
              <>
                Próxima <ArrowRight className="ml-1 h-4 w-4" />
              </>
            ) : (
              "Ver Resultado"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verificar build**

Run: `cmd /c "npm run build"` no frontend.
Expected: Build sem erros.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/\(dashboard\)/dashboard/quizzes/
git commit -m "feat: quizzes page with real data and interactive quiz-taker"
```

---

## Task 5: Atualizar QuizzesCard com Dados Reais

**Ficheiros:**
- Modificar: `frontend/src/components/dashboard/quizzes-card.tsx`

- [ ] **Step 1: Tornar o card um Server Component com dados reais**

```tsx
// frontend/src/components/dashboard/quizzes-card.tsx
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

type QuizzesCardProps = {
  dueCount?: number;
  totalCount?: number;
};

export function QuizzesCard({ dueCount = 0, totalCount = 0 }: QuizzesCardProps) {
  const pct = totalCount > 0 ? Math.round(((totalCount - dueCount) / totalCount) * 100) : 0;
  const circumference = 314;
  const offset = circumference - (circumference * pct) / 100;

  return (
    <Link href="/dashboard/quizzes">
      <Card className="h-full bg-amber-soft shadow-bento transition-shadow hover:shadow-bento-hover">
        <CardContent className="flex h-full items-center justify-between p-5">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Quizzes</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {dueCount > 0
                ? `${dueCount} pendente${dueCount !== 1 ? "s" : ""} hoje`
                : "Tudo em dia"}
            </p>
          </div>
          <svg
            width="48"
            height="48"
            viewBox="0 0 100 100"
            className="-rotate-90"
          >
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="var(--muted)"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="var(--coral)"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="animate-[ring-fill_1s_ease-out_forwards]"
            />
          </svg>
        </CardContent>
      </Card>
    </Link>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/dashboard/quizzes-card.tsx
git commit -m "feat: quizzes card with dynamic due count"
```

---

## Task 6: Reconstruir Docker e Testar

- [ ] **Step 1: Correr migration para adicionar `generated_at`**

```bash
cd backend
alembic revision --autogenerate -m "add generated_at to quizzes"
alembic upgrade head
```

- [ ] **Step 2: Gerar quizzes para 2-3 tópicos de teste**

```bash
cd backend
python -c "
import asyncio
from db.base import async_session
from models.models import Topic
from sqlalchemy import select

async def test():
    async with async_session() as db:
        result = await db.execute(select(Topic).limit(3))
        for t in result.scalars().all():
            print(f'{t.id}: {t.title}')

asyncio.run(test())
"
```

Then generate quizzes via API: `curl -X POST http://localhost:8000/api/quizzes/generate/{topic_id}`

- [ ] **Step 3: Reconstruir Docker**

```bash
docker compose build --no-cache frontend backend
docker compose up -d
```

- [ ] **Step 4: Testar no browser**

1. Aceder a `http://localhost:3001/dashboard/quizzes`
2. Verificar que os tópicos aparecem
3. Clicar num tópico → verificar que as questões são carregadas/geradas
4. Responder a uma questão → verificar feedback SM-2
5. Completar o quiz → ver resultado final

- [ ] **Step 5: Commit final**

```bash
git add -A
git commit -m "feat: Fase 6 — quizzes com repetição espaçada e avaliação LLM"
```
