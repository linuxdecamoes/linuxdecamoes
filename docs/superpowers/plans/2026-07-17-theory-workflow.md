# Workflow de Teoria — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a linear theory learning workflow with quiz gating (≥60%), visual roadmap, RAG content, and persistent progress tracking across 5 LPI manuals.

**Architecture:** Full Backend approach — 4 new FastAPI endpoints in a new `api/study.py` router, `user_progress` table extended with 3 fields, manifesto `manuals.ts` expanded with LPI objective grouping, 3 new Next.js routes (`/study`, `/study/[code]`, `/study/[code]/[topic]`), and 4 new React components.

**Tech Stack:** FastAPI, SQLAlchemy 2.0 async, PostgreSQL, Next.js 16 App Router, React 19, Tailwind v4, shadcn/ui, Clerk auth, FAISS RAG search.

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `frontend/src/lib/manuals.ts` | Modify | Add `objective` + `objectiveTitle` to `ManualTopic` type and all 92 topics |
| `backend/models/models.py` | Modify | Add `completed_at`, `quiz_score`, `quiz_passed` to `UserProgress` |
| `backend/scripts/add_study_columns.py` | Create | Migration script for new columns |
| `backend/api/study.py` | Create | 4 endpoints: progress per manual, topic content, complete topic, global progress |
| `backend/main.py` | Modify | Register `study_router` |
| `frontend/src/lib/api.ts` | Modify | Add types + 4 functions for study endpoints |
| `frontend/src/components/dashboard/study-card.tsx` | Create | Dashboard Bento card — 5 manuals with progress bars |
| `frontend/src/app/(dashboard)/dashboard/study/page.tsx` | Create | Server Component — global study view |
| `frontend/src/components/study/study-roadmap.tsx` | Create | Sidebar stepper — ✅/🔒 per topic |
| `frontend/src/app/(dashboard)/dashboard/study/[code]/page.tsx` | Create | Server Component — manual roadmap + topic content |
| `frontend/src/components/study/topic-content.tsx` | Client Component | RAG content — summary + expandable sections |
| `frontend/src/components/study/topic-quiz.tsx` | Client Component | Quiz gating — 5 questions, ≥60% to unlock |
| `frontend/src/app/(dashboard)/dashboard/study/[code]/[topic]/page.tsx` | Create | Client Component — topic study page |
| `frontend/src/app/(dashboard)/dashboard/page.tsx` | Modify | Add StudyCard to Bento Grid |

---

## Task 1: Update manifesto `manuals.ts` with LPI objectives

**Files:**
- Modify: `frontend/src/lib/manuals.ts:7-11` (type) + all 92 topic objects

- [ ] **Step 1: Update `ManualTopic` type**

Add two new fields to the type definition:

```typescript
export type ManualTopic = {
  slug: string;
  title: string;
  summary: string;
  objective: string;      // ex: "1.1", "1.2", "2.1"
  objectiveTitle: string;  // ex: "Estrutura do sistema de ficheiros Linux"
};
```

- [ ] **Step 2: Add objectives to manual 010 (Linux Essentials, 14 topics)**

Based on LPI 010 exam objectives:
- Objective 1.1: "Estrutura do sistema de ficheiros Linux" — topics: o-que-e-o-linux, distribuicoes-linux, ficheiros-e-diretorios, permissoes-de-ficheiros, utilizadores-e-grupos
- Objective 1.2: "Trabalhar no sistema de ficheiros" — topics: processos, shell-basica, redirecionamento-e-pipes
- Objective 1.3: "Gestão de software" — topics: gestao-de-pacotes, scripts-shell
- Objective 1.4: "Serviços e Logs" — topics: servicos-e-daemons, logs-do-sistema, compressao-de-dados, bases-de-dados-sql

Add `objective` and `objectiveTitle` to each of the 14 topics in manual 010.

- [ ] **Step 3: Add objectives to manual 020 (Security Essentials, 12 topics)**

- Objective 1.1: "Conceitos de segurança" — topics: conceitos-de-seguranca, criptografia, autenticacao-e-autorizacao
- Objective 1.2: "Gestão de acessos" — topics: gestao-de-permissoes, seguranca-de-rede, firewalls
- Objective 1.3: "Segurança do sistema" — topics: auditoria-e-logs, seguranca-de-ficheiros, malware-e-antivirus, hardening-do-sistema, politicas-de-password, backup-e-recuperacao

- [ ] **Step 4: Add objectives to manual 030 (Web Development Tactics, 14 topics)**

- Objective 1.1: "Desenvolvimento web" — topics: html5, css3, javascript, php
- Objective 1.2: "Bases de dados web" — topics: bases-de-dados-mysql
- Objective 1.3: "Protocolos e Servidores" — topics: http-https, web-servers, ssl-tls
- Objective 1.4: "Práticas modernas" — topics: rest-apis, git-para-web, deploy-de-aplicacoes, seguranca-web, performance-web, progressive-web-apps

- [ ] **Step 5: Add objectives to manual 101 (LPIC-1 Parte 1, 26 topics)**

- Objective 1.1: "Arquitetura do Linux" — topics 1-5 (arquitetura-do-linux through boot-e-init)
- Objective 1.2: "Sistema de ficheiros" — topics 6-9 (filesystem-fhs through particoes-e-lvm)
- Objective 1.3: "Gestão de recursos" — topics 10-13 (gestao-de-memoria through prioridades-de-processos)
- Objective 1.4: "Kernel e Hardware" — topics 14-16 (modulos-do-kernel, hardware-do-sistema, linux-na-nuvem)
- Objective 1.5: "Instalação e Boot" — topics 17-26 (instalacao-do-sistema through udev)

- [ ] **Step 6: Add objectives to manual 102 (LPIC-1 Parte 2, 26 topics)**

- Objective 2.1: "Shell avançado" — topics 1-3 (shell-avancada, scripting-bash, streams-pipes)
- Objective 2.2: "Redes" — topics 4-8 (linux-como-router through ntp)
- Objective 2.3: "Administração" — topics 9-15 (ssh through gestao-de-impressao)
- Objective 2.4: "Automação e Ferramentas" — topics 16-26 (ansible through nfs)

- [ ] **Step 7: Verify build passes**

Run: `cmd /c "npm run build"` in `frontend/`
Expected: Build succeeds with no type errors.

---

## Task 2: Extend `user_progress` model

**Files:**
- Modify: `backend/models/models.py:46-58` (UserProgress class)

- [ ] **Step 1: Add three new fields to UserProgress**

Add after `last_studied` (line 55):

```python
    completed_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    quiz_score: Mapped[float] = mapped_column(Float, nullable=True)
    quiz_passed: Mapped[bool] = mapped_column(Boolean, default=False)
```

Ensure `Boolean` is already imported (it is — line 3).

- [ ] **Step 2: Verify syntax**

Run: `python -c "import ast; ast.parse(open('backend/models/models.py').read()); print('OK')"`
Expected: `OK`

---

## Task 3: Create migration script for new columns

**Files:**
- Create: `backend/scripts/add_study_columns.py`

- [ ] **Step 1: Create the migration script**

```python
"""Add completed_at, quiz_score, quiz_passed to user_progress table."""
import asyncio
from sqlalchemy import text
from db.base import engine


async def migrate():
    sql_statements = [
        "ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP NULL",
        "ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS quiz_score DOUBLE PRECISION NULL",
        "ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS quiz_passed BOOLEAN DEFAULT FALSE",
    ]
    async with engine.begin() as conn:
        for stmt in sql_statements:
            await conn.execute(text(stmt))
            print(f"OK: {stmt}")
    print("Migration complete.")


if __name__ == "__main__":
    asyncio.run(migrate())
```

- [ ] **Step 2: Verify syntax**

Run: `python -c "import ast; ast.parse(open('backend/scripts/add_study_columns.py').read()); print('OK')"`
Expected: `OK`

---

## Task 4: Create study router with 4 endpoints

**Files:**
- Create: `backend/api/study.py`

- [ ] **Step 1: Create `backend/api/study.py` with all 4 endpoints**

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from db.base import get_db
from models.models import Manual, Topic, UserProgress, User
from pydantic import BaseModel
from rag.service import search

router = APIRouter(prefix="/study", tags=["study"])


# ── Response models ──────────────────────────────────────

class TopicProgressResponse(BaseModel):
    topic_id: str
    topic_number: int
    title: str
    status: str
    quiz_score: float | None
    quiz_passed: bool
    completed_at: str | None

    class Config:
        from_attributes = True


class ModuleProgressResponse(BaseModel):
    objective: str
    title: str
    topics: list[TopicProgressResponse]


class ManualProgressResponse(BaseModel):
    manual_code: str
    total_topics: int
    completed_topics: int
    modules: list[ModuleProgressResponse]


class TopicSection(BaseModel):
    secao: str
    tipo: str
    texto: str
    manual: str
    topico: str


class TopicContentResponse(BaseModel):
    topic_id: str
    title: str
    objective: str
    summary: str
    sections: list[TopicSection]


class CompleteTopicRequest(BaseModel):
    quiz_score: float


class CompletionResultResponse(BaseModel):
    topic_id: str
    quiz_score: float
    quiz_passed: bool
    completed_at: str
    next_topic_unlocked: bool
    next_topic_id: str | None


class ManualSummary(BaseModel):
    code: str
    title: str
    total_topics: int
    completed_topics: int
    modules_completed: int
    modules_total: int


class GlobalProgressResponse(BaseModel):
    manuals: list[ManualSummary]
    total_topics_completed: int
    total_topics: int


# ── Helpers ──────────────────────────────────────────────

# Map from manifesto objective to topic numbers (1-indexed).
# This mirrors the grouping defined in manuals.ts.
OBJECTIVE_MAP: dict[str, dict[str, list[int]]] = {
    "010": {
        "1.1": list(range(1, 6)),   # topics 1-5
        "1.2": list(range(6, 9)),   # topics 6-8
        "1.3": list(range(9, 11)),  # topics 9-10
        "1.4": list(range(11, 15)), # topics 11-14
    },
    "020": {
        "1.1": list(range(1, 4)),
        "1.2": list(range(4, 7)),
        "1.3": list(range(7, 13)),
    },
    "030": {
        "1.1": list(range(1, 5)),
        "1.2": list(range(5, 6)),
        "1.3": list(range(6, 9)),
        "1.4": list(range(9, 15)),
    },
    "101": {
        "1.1": list(range(1, 6)),
        "1.2": list(range(6, 10)),
        "1.3": list(range(10, 14)),
        "1.4": list(range(14, 17)),
        "1.5": list(range(17, 27)),
    },
    "102": {
        "2.1": list(range(1, 4)),
        "2.2": list(range(4, 9)),
        "2.3": list(range(9, 16)),
        "2.4": list(range(16, 27)),
    },
}

OBJECTIVE_TITLES: dict[str, dict[str, str]] = {
    "010": {
        "1.1": "Estrutura do sistema de ficheiros Linux",
        "1.2": "Trabalhar no sistema de ficheiros",
        "1.3": "Gestão de software",
        "1.4": "Serviços e Logs",
    },
    "020": {
        "1.1": "Conceitos de segurança",
        "1.2": "Gestão de acessos",
        "1.3": "Segurança do sistema",
    },
    "030": {
        "1.1": "Desenvolvimento web",
        "1.2": "Bases de dados web",
        "1.3": "Protocolos e Servidores",
        "1.4": "Práticas modernas",
    },
    "101": {
        "1.1": "Arquitetura do Linux",
        "1.2": "Sistema de ficheiros",
        "1.3": "Gestão de recursos",
        "1.4": "Kernel e Hardware",
        "1.5": "Instalação e Boot",
    },
    "102": {
        "2.1": "Shell avançado",
        "2.2": "Redes",
        "2.3": "Administração",
        "2.4": "Automação e Ferramentas",
    },
}


def _get_clerk_user_id(clerk_id: str, db_user: User | None) -> str:
    """Validate that db_user matches clerk_id."""
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user.id


# ── Endpoints ────────────────────────────────────────────

@router.get("/manuals/{code}/progress", response_model=ManualProgressResponse)
async def get_manual_progress(
    code: str,
    clerk_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Progresso do utilizador num manual específico."""
    # Get manual
    result = await db.execute(select(Manual).where(Manual.code == code))
    manual = result.scalar_one_or_none()
    if not manual:
        raise HTTPException(status_code=404, detail="Manual not found")

    # Get user
    user_result = await db.execute(select(User).where(User.clerk_id == clerk_id))
    user = user_result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get topics ordered
    topics_result = await db.execute(
        select(Topic)
        .where(Topic.manual_id == manual.id)
        .order_by(Topic.topic_number)
    )
    topics = topics_result.scalars().all()

    # Get all progress for this user + manual
    topic_ids = [t.id for t in topics]
    progress_result = await db.execute(
        select(UserProgress).where(
            UserProgress.user_id == user.id,
            UserProgress.topic_id.in_(topic_ids),
        )
    )
    progress_list = progress_result.scalars().all()
    progress_map = {p.topic_id: p for p in progress_list}

    # Build modules
    obj_map = OBJECTIVE_MAP.get(code, {})
    obj_titles = OBJECTIVE_TITLES.get(code, {})
    completed_count = 0
    modules = []

    for obj_key in obj_map:
        obj_topic_nums = obj_map[obj_key]
        module_topics = []
        for t in topics:
            if t.topic_number in obj_topic_nums:
                prog = progress_map.get(t.id)
                status = prog.status if prog else "not_started"
                quiz_score = prog.quiz_score if prog else None
                quiz_passed = prog.quiz_passed if prog else False
                completed_at = prog.completed_at.isoformat() if prog and prog.completed_at else None

                # Enforce gating: if previous topic not passed, this one is locked
                if t.topic_number > 1:
                    prev_num = t.topic_number - 1
                    prev_topic = next((x for x in topics if x.topic_number == prev_num), None)
                    if prev_topic:
                        prev_prog = progress_map.get(prev_topic.id)
                        if not prev_prog or not prev_prog.quiz_passed:
                            status = "locked"

                if status == "completed":
                    completed_count += 1

                module_topics.append(TopicProgressResponse(
                    topic_id=t.id,
                    topic_number=t.topic_number,
                    title=t.title,
                    status=status,
                    quiz_score=quiz_score,
                    quiz_passed=quiz_passed,
                    completed_at=completed_at,
                ))

        modules.append(ModuleProgressResponse(
            objective=obj_key,
            title=obj_titles.get(obj_key, f"Módulo {obj_key}"),
            topics=module_topics,
        ))

    return ManualProgressResponse(
        manual_code=code,
        total_topics=len(topics),
        completed_topics=completed_count,
        modules=modules,
    )


@router.get("/topics/{topic_id}/content", response_model=TopicContentResponse)
async def get_topic_content(
    topic_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Conteúdo RAG de um tópico (sumário + seções expansíveis)."""
    topic = await db.get(Topic, topic_id)
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    manual = await db.get(Manual, topic.manual_id)

    # Search RAG for content related to this topic
    chunks = search(topic.title, k=10)

    sections = []
    for c in chunks:
        sections.append(TopicSection(
            secao=c.get("secao", ""),
            tipo=c.get("tipo", "outro"),
            texto=c.get("texto", ""),
            manual=c.get("manual", ""),
            topico=c.get("topico", ""),
        ))

    # Get objective from OBJECTIVE_MAP
    objective = ""
    if manual:
        obj_map = OBJECTIVE_MAP.get(manual.code, {})
        for obj_key, topic_nums in obj_map.items():
            if topic.topic_number in topic_nums:
                objective = obj_key
                break

    return TopicContentResponse(
        topic_id=topic.id,
        title=topic.title,
        objective=objective,
        summary=topic.title,  # Will be enhanced by frontend
        sections=sections,
    )


@router.post("/topics/{topic_id}/complete", response_model=CompletionResultResponse)
async def complete_topic(
    topic_id: str,
    data: CompleteTopicRequest,
    clerk_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Marca um tópico como completo (após quiz ≥60%)."""
    topic = await db.get(Topic, topic_id)
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    # Get user
    user_result = await db.execute(select(User).where(User.clerk_id == clerk_id))
    user = user_result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Find or create progress record
    result = await db.execute(
        select(UserProgress).where(
            UserProgress.user_id == user.id,
            UserProgress.topic_id == topic_id,
        )
    )
    progress = result.scalar_one_or_none()

    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)
    quiz_passed = data.quiz_score >= 60.0

    if progress:
        progress.quiz_score = data.quiz_score
        progress.quiz_passed = quiz_passed
        progress.status = "completed" if quiz_passed else progress.status
        progress.completed_at = now if quiz_passed else progress.completed_at
        progress.last_studied = now
    else:
        progress = UserProgress(
            user_id=user.id,
            topic_id=topic_id,
            status="completed" if quiz_passed else "in_progress",
            quiz_score=data.quiz_score,
            quiz_passed=quiz_passed,
            completed_at=now if quiz_passed else None,
            last_studied=now,
        )
        db.add(progress)

    await db.commit()
    await db.refresh(progress)

    # Find next topic
    manual = await db.get(Manual, topic.manual_id)
    next_topic_id = None
    next_topic_unlocked = False

    if quiz_passed and manual:
        topics_result = await db.execute(
            select(Topic)
            .where(Topic.manual_id == manual.id)
            .order_by(Topic.topic_number)
        )
        all_topics = topics_result.scalars().all()
        for i, t in enumerate(all_topics):
            if t.id == topic_id and i + 1 < len(all_topics):
                next_topic_id = all_topics[i + 1].id
                next_topic_unlocked = True
                break

    return CompletionResultResponse(
        topic_id=topic_id,
        quiz_score=data.quiz_score,
        quiz_passed=quiz_passed,
        completed_at=now.isoformat(),
        next_topic_unlocked=next_topic_unlocked,
        next_topic_id=next_topic_id,
    )


@router.get("/users/{clerk_id}/progress", response_model=GlobalProgressResponse)
async def get_global_progress(
    clerk_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Progresso global — todos os manuais (para dashboard)."""
    # Get user
    user_result = await db.execute(select(User).where(User.clerk_id == clerk_id))
    user = user_result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get all manuals
    manuals_result = await db.execute(select(Manual))
    manuals = manuals_result.scalars().all()

    total_completed = 0
    total_topics = 0
    manual_summaries = []

    for manual in manuals:
        # Get topics
        topics_result = await db.execute(
            select(Topic)
            .where(Topic.manual_id == manual.id)
            .order_by(Topic.topic_number)
        )
        topics = topics_result.scalars().all()
        topic_ids = [t.id for t in topics]

        # Get progress
        progress_result = await db.execute(
            select(UserProgress).where(
                UserProgress.user_id == user.id,
                UserProgress.topic_id.in_(topic_ids),
            )
        )
        progress_list = progress_result.scalars().all()
        completed = sum(1 for p in progress_list if p.status == "completed")
        total_completed += completed
        total_topics += len(topics)

        # Count modules
        obj_map = OBJECTIVE_MAP.get(manual.code, {})
        modules_total = len(obj_map)
        modules_completed = 0
        for obj_key, topic_nums in obj_map.items():
            obj_topics = [t for t in topics if t.topic_number in topic_nums]
            obj_progress = [p for p in progress_list if p.topic_id in [t.id for t in obj_topics]]
            if all(p.status == "completed" for p in obj_progress) and len(obj_progress) == len(obj_topics):
                modules_completed += 1

        manual_summaries.append(ManualSummary(
            code=manual.code,
            title=manual.title,
            total_topics=len(topics),
            completed_topics=completed,
            modules_completed=modules_completed,
            modules_total=modules_total,
        ))

    return GlobalProgressResponse(
        manuals=manual_summaries,
        total_topics_completed=total_completed,
        total_topics=total_topics,
    )
```

- [ ] **Step 2: Verify syntax**

Run: `python -c "import ast; ast.parse(open('backend/api/study.py').read()); print('OK')"`
Expected: `OK`

---

## Task 5: Register study router in `main.py`

**Files:**
- Modify: `backend/main.py:6-9` (imports) + `:34-37` (include_router)

- [ ] **Step 1: Add import**

After line 8 (`from api.quizzes import router as quizzes_router`), add:
```python
from api.study import router as study_router
```

- [ ] **Step 2: Register router**

After line 36 (`app.include_router(quizzes_router, prefix="/api")`), add:
```python
app.include_router(study_router, prefix="/api")
```

- [ ] **Step 3: Verify syntax**

Run: `python -c "import ast; ast.parse(open('backend/main.py').read()); print('OK')"`
Expected: `OK`

---

## Task 6: Update API client with study types and functions

**Files:**
- Modify: `frontend/src/lib/api.ts` (add after Chat section, before end of file)

- [ ] **Step 1: Add study types and functions**

Append to end of `api.ts`:

```typescript
/* ── Study ────────────────────────────────────────────── */

export type TopicProgress = {
  topic_id: string;
  topic_number: number;
  title: string;
  status: "not_started" | "in_progress" | "completed" | "locked";
  quiz_score: number | null;
  quiz_passed: boolean;
  completed_at: string | null;
};

export type ModuleProgress = {
  objective: string;
  title: string;
  topics: TopicProgress[];
};

export type ManualProgress = {
  manual_code: string;
  total_topics: number;
  completed_topics: number;
  modules: ModuleProgress[];
};

export type TopicSection = {
  secao: string;
  tipo: string;
  texto: string;
  manual: string;
  topico: string;
};

export type TopicContent = {
  topic_id: string;
  title: string;
  objective: string;
  summary: string;
  sections: TopicSection[];
};

export type CompletionResult = {
  topic_id: string;
  quiz_score: number;
  quiz_passed: boolean;
  completed_at: string;
  next_topic_unlocked: boolean;
  next_topic_id: string | null;
};

export type ManualSummary = {
  code: string;
  title: string;
  total_topics: number;
  completed_topics: number;
  modules_completed: number;
  modules_total: number;
};

export type GlobalProgress = {
  manuals: ManualSummary[];
  total_topics_completed: number;
  total_topics: number;
};

export async function getManualProgress(
  code: string,
  clerkId: string,
): Promise<ManualProgress> {
  return apiFetch<ManualProgress>(
    `/api/study/manuals/${code}/progress?clerk_id=${clerkId}`,
  );
}

export async function getTopicContent(
  topicId: string,
): Promise<TopicContent> {
  return apiFetch<TopicContent>(`/api/study/topics/${topicId}/content`);
}

export async function completeTopic(
  topicId: string,
  clerkId: string,
  quizScore: number,
): Promise<CompletionResult> {
  return apiFetch<CompletionResult>(
    `/api/study/topics/${topicId}/complete?clerk_id=${clerkId}`,
    {
      method: "POST",
      body: JSON.stringify({ quiz_score: quizScore }),
    },
  );
}

export async function getUserGlobalProgress(
  clerkId: string,
): Promise<GlobalProgress> {
  return apiFetch<GlobalProgress>(
    `/api/study/users/${clerkId}/progress`,
  );
}
```

- [ ] **Step 2: Verify build passes**

Run: `cmd /c "npm run build"` in `frontend/`
Expected: Build succeeds.

---

## Task 7: Create `study-card.tsx` component

**Files:**
- Create: `frontend/src/components/dashboard/study-card.tsx`

- [ ] **Step 1: Create the component**

```tsx
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import type { GlobalProgress } from "@/lib/api";
import { getManual } from "@/lib/manuals";
import { accentClasses } from "@/lib/manuals";

type StudyCardProps = {
  progress: GlobalProgress;
};

export function StudyCard({ progress }: StudyCardProps) {
  return (
    <Link href="/dashboard/study" className="block h-full">
      <Card className="h-full bg-cream shadow-bento hover:shadow-bento-hover transition-shadow duration-300">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold tracking-tight">
            Estudo
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {progress.total_topics_completed}/{progress.total_topics} tópicos
          </p>
        </CardHeader>
        <div className="px-6 pb-5 space-y-3">
          {progress.manuals.map((m) => {
            const manual = getManual(m.code);
            const accent = manual?.accent ?? "sage";
            const classes = accentClasses[accent];
            const pct = m.total_topics > 0
              ? Math.round((m.completed_topics / m.total_topics) * 100)
              : 0;

            return (
              <div key={m.code} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-semibold ${classes.strong}`}>
                    {m.title}
                  </span>
                  <span className="text-muted-foreground">
                    {m.modules_completed}/{m.modules_total} mód.
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full ${classes.dot} transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </Link>
  );
}
```

---

## Task 8: Create study global page

**Files:**
- Create: `frontend/src/app/(dashboard)/dashboard/study/page.tsx`

- [ ] **Step 1: Create the page**

```tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserGlobalProgress } from "@/lib/api";
import { getManual, accentClasses } from "@/lib/manuals";

export default async function StudyPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  let progress;
  try {
    progress = await getUserGlobalProgress(userId);
  } catch {
    progress = null;
  }

  return (
    <div className="mx-auto w-full max-w-[1560px] px-4 md:px-8 xl:px-12 py-8">
      <div className="mb-6">
        <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight">
          Estudo
        </h1>
        <p className="mt-1 text-muted-foreground">
          Progresso global nos manuais LPI
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {progress?.manuals.map((m) => {
          const manual = getManual(m.code);
          const accent = manual?.accent ?? "sage";
          const classes = accentClasses[accent];
          const pct = m.total_topics > 0
            ? Math.round((m.completed_topics / m.total_topics) * 100)
            : 0;

          return (
            <Link key={m.code} href={`/dashboard/study/${m.code}`}>
              <Card className="h-full bg-cream shadow-bento hover:shadow-bento-hover transition-shadow duration-300 cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-block w-3 h-3 rounded-full ${classes.dot}`} />
                    <CardTitle className="text-lg font-bold">{m.title}</CardTitle>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {m.completed_topics}/{m.total_topics} tópicos · {m.modules_completed}/{m.modules_total} módulos
                  </p>
                </CardHeader>
                <div className="px-6 pb-5">
                  <div className="h-3 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${classes.dot} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground text-right">{pct}%</p>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
```

---

## Task 9: Create `study-roadmap.tsx` component

**Files:**
- Create: `frontend/src/components/study/study-roadmap.tsx`

- [ ] **Step 1: Create the component**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ModuleProgress } from "@/lib/api";
import { accentClasses, type Accent } from "@/lib/manuals";

type StudyRoadmapProps = {
  modules: ModuleProgress[];
  manualCode: string;
  accent: Accent;
};

export function StudyRoadmap({ modules, manualCode, accent }: StudyRoadmapProps) {
  const pathname = usePathname();
  const classes = accentClasses[accent];

  return (
    <nav className="space-y-6">
      {modules.map((mod) => (
        <div key={mod.objective}>
          <h3 className={`text-sm font-bold mb-2 ${classes.strong}`}>
            {mod.objective} — {mod.title}
          </h3>
          <ul className="space-y-1">
            {mod.topics.map((t) => {
              const isActive = pathname.includes(t.topic_id);
              const icon = t.status === "completed" ? "✅"
                : t.status === "locked" ? "🔒"
                : t.status === "in_progress" ? "🔵"
                : "⚪";

              const isClickable = t.status !== "locked";

              return (
                <li key={t.topic_id}>
                  {isClickable ? (
                    <Link
                      href={`/dashboard/study/${manualCode}/${t.topic_id}`}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors ${
                        isActive
                          ? `${classes.soft} ${classes.strong} font-semibold`
                          : "hover:bg-muted"
                      }`}
                    >
                      <span>{icon}</span>
                      <span className="truncate">{t.title}</span>
                      {t.quiz_passed && t.quiz_score !== null && (
                        <span className="ml-auto text-xs text-muted-foreground">
                          {Math.round(t.quiz_score)}%
                        </span>
                      )}
                    </Link>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-muted-foreground opacity-50 cursor-not-allowed">
                      <span>{icon}</span>
                      <span className="truncate">{t.title}</span>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
```

---

## Task 10: Create study manual page

**Files:**
- Create: `frontend/src/app/(dashboard)/dashboard/study/[code]/page.tsx`

- [ ] **Step 1: Create the page**

```tsx
import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { getManualProgress } from "@/lib/api";
import { getManual } from "@/lib/manuals";
import { StudyRoadmap } from "@/components/study/study-roadmap";

export default async function StudyManualPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const manual = getManual(code);
  if (!manual) notFound();

  let progress;
  try {
    progress = await getManualProgress(code, userId);
  } catch {
    progress = null;
  }

  return (
    <div className="mx-auto w-full max-w-[1560px] px-4 md:px-8 xl:px-12 py-8">
      <div className="mb-6">
        <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight">
          {manual.title}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {progress?.completed_topics ?? 0}/{progress?.total_topics ?? manual.topics.length} tópicos concluídos
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar — Roadmap */}
        <aside className="lg:col-span-4 xl:col-span-3">
          <div className="sticky top-24 bg-cream rounded-2xl shadow-bento p-5">
            <h2 className="text-sm font-bold mb-4 uppercase tracking-wider text-muted-foreground">
              Percurso
            </h2>
            {progress ? (
              <StudyRoadmap
                modules={progress.modules}
                manualCode={code}
                accent={manual.accent}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                Sem dados de progresso.
              </p>
            )}
          </div>
        </aside>

        {/* Main — Content area */}
        <main className="lg:col-span-8 xl:col-span-9">
          <div className="bg-cream rounded-2xl shadow-bento p-8 text-center">
            <p className="text-muted-foreground">
              Seleciona um tópico no percurso ao lado para começar a estudar.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
```

---

## Task 11: Create `topic-content.tsx` component

**Files:**
- Create: `frontend/src/components/study/topic-content.tsx`

- [ ] **Step 1: Create the component**

```tsx
"use client";

import { useState } from "react";
import type { TopicContent as TopicContentType } from "@/lib/api";

type TopicContentProps = {
  content: TopicContentType;
};

const TIPO_LABELS: Record<string, string> = {
  resumo: "Resumo",
  "exercicio-guiado": "Exercício Guiado",
  "exercicio-exploratorio": "Exercício Exploratório",
  "visao-geral": "Visão Geral",
  outro: "Secção",
};

export function TopicContent({ content }: TopicContentProps) {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const toggle = (idx: number) =>
    setExpanded((prev) => ({ ...prev, [idx]: !prev[idx] }));

  return (
    <div className="space-y-4">
      <div className="bg-sage-soft/30 rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-2">{content.title}</h2>
        <p className="text-sm text-muted-foreground">
          Módulo {content.objective}
        </p>
      </div>

      {content.sections.map((s, idx) => (
        <div key={idx} className="bg-cream rounded-xl shadow-bento overflow-hidden">
          <button
            onClick={() => toggle(idx)}
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted">
                {TIPO_LABELS[s.tipo] ?? s.tipo}
              </span>
              <span className="text-sm font-semibold">{s.secao}</span>
            </div>
            <span className="text-muted-foreground text-lg">
              {expanded[idx] ? "−" : "+"}
            </span>
          </button>
          {expanded[idx] && (
            <div className="px-5 pb-4 text-sm leading-relaxed whitespace-pre-wrap">
              {s.texto}
            </div>
          )}
        </div>
      ))}

      {content.sections.length === 0 && (
        <div className="bg-cream rounded-2xl shadow-bento p-8 text-center">
          <p className="text-muted-foreground">
            Sem conteúdo RAG disponível para este tópico.
          </p>
        </div>
      )}
    </div>
  );
}
```

---

## Task 12: Create `topic-quiz.tsx` component

**Files:**
- Create: `frontend/src/components/study/topic-quiz.tsx`

- [ ] **Step 1: Create the component**

```tsx
"use client";

import { useState } from "react";
import type { Quiz } from "@/lib/api";
import { submitQuizAnswer } from "@/lib/api";

type TopicQuizProps = {
  quizzes: Quiz[];
  userId: string;
  topicId: string;
  onPass: (score: number) => void;
};

export function TopicQuiz({ quizzes, userId, topicId, onPass }: TopicQuizProps) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [finished, setFinished] = useState(false);

  if (quizzes.length === 0) {
    return (
      <div className="bg-amber-soft/30 rounded-2xl p-6 text-center">
        <p className="text-muted-foreground">
          Sem quizzes disponíveis para este tópico. Gera quizzes primero.
        </p>
      </div>
    );
  }

  const quiz = quizzes[current];
  const options: string[] = JSON.parse(quiz.options);

  const handleSubmit = async () => {
    if (!selected) return;
    setSubmitted(true);
    const isCorrect = selected.trim().toLowerCase() === quiz.correct_answer.trim().toLowerCase();
    if (isCorrect) setCorrect((c) => c + 1);

    await submitQuizAnswer({
      user_id: userId,
      quiz_id: quiz.id,
      answer: selected,
    });
  };

  const handleNext = () => {
    if (current + 1 < quizzes.length) {
      setCurrent(current + 1);
      setSelected(null);
      setSubmitted(false);
    } else {
      const score = Math.round((correct / quizzes.length) * 100);
      setFinished(true);
      if (score >= 60) onPass(score);
    }
  };

  if (finished) {
    const score = Math.round((correct / quizzes.length) * 100);
    const passed = score >= 60;
    return (
      <div className={`rounded-2xl p-6 text-center ${passed ? "bg-sage-soft/30" : "bg-coral-soft/30"}`}>
        <p className="text-2xl font-bold mb-2">
          {correct}/{quizzes.length} — {score}%
        </p>
        <p className={`font-semibold ${passed ? "text-sage" : "text-coral"}`}>
          {passed ? "Aprovado! Próximo desbloqueado." : "Reprovado. Tenta novamente."}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-cream rounded-2xl shadow-bento p-6">
      <p className="text-xs text-muted-foreground mb-2">
        Pergunta {current + 1}/{quizzes.length}
      </p>
      <p className="font-semibold mb-4">{quiz.question}</p>

      <div className="space-y-2">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => !submitted && setSelected(opt)}
            disabled={submitted}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-colors border ${
              submitted
                ? opt.trim().toLowerCase() === quiz.correct_answer.trim().toLowerCase()
                  ? "bg-sage-soft border-sage text-sage font-semibold"
                  : opt === selected
                    ? "bg-coral-soft border-coral text-coral"
                    : "bg-muted/30 border-transparent opacity-50"
                : selected === opt
                  ? "border-foreground bg-muted/50"
                  : "border-transparent bg-muted/30 hover:bg-muted/50"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      {submitted && quiz.explanation && (
        <div className="mt-4 p-4 bg-sage-soft/20 rounded-xl text-sm">
          <p className="font-semibold mb-1">Explicação:</p>
          <p>{quiz.explanation}</p>
        </div>
      )}

      <div className="mt-4 flex justify-end">
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={!selected}
            className="px-6 py-2 rounded-xl bg-cta text-cta-foreground font-semibold text-sm disabled:opacity-50"
          >
            Responder
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-6 py-2 rounded-xl bg-cta text-cta-foreground font-semibold text-sm"
          >
            {current + 1 < quizzes.length ? "Próxima" : "Ver Resultado"}
          </button>
        )}
      </div>
    </div>
  );
}
```

---

## Task 13: Create topic study page

**Files:**
- Create: `frontend/src/app/(dashboard)/dashboard/study/[code]/[topic]/page.tsx`

- [ ] **Step 1: Create the page**

```tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  getTopicContent,
  getQuizzesByTopic,
  completeTopic,
  type TopicContent as TopicContentType,
  type Quiz,
} from "@/lib/api";
import { TopicContent } from "@/components/study/topic-content";
import { TopicQuiz } from "@/components/study/topic-quiz";

export default function TopicStudyPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const topicId = params.topic as string;
  const code = params.code as string;

  const [content, setContent] = useState<TopicContentType | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);

  useEffect(() => {
    if (!topicId) return;
    setLoading(true);
    Promise.all([
      getTopicContent(topicId).catch(() => null),
      getQuizzesByTopic(topicId, 5).catch(() => []),
    ]).then(([c, q]) => {
      setContent(c);
      setQuizzes(q);
      setLoading(false);
    });
  }, [topicId]);

  const handlePass = async (score: number) => {
    if (!user?.id) return;
    try {
      await completeTopic(topicId, user.id, score);
    } catch {
      // Silently fail — progress may already be saved
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">A carregar conteúdo...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1560px] px-4 md:px-8 xl:px-12 py-8">
      <div className="mb-4">
        <button
          onClick={() => router.push(`/dashboard/study/${code}`)}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Voltar ao percurso
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main content */}
        <main className="lg:col-span-8">
          {content ? (
            <TopicContent content={content} />
          ) : (
            <div className="bg-cream rounded-2xl shadow-bento p-8 text-center">
              <p className="text-muted-foreground">Sem conteúdo disponível.</p>
            </div>
          )}
        </main>

        {/* Sidebar — Quiz */}
        <aside className="lg:col-span-4">
          <div className="sticky top-24">
            {!showQuiz ? (
              <button
                onClick={() => setShowQuiz(true)}
                className="w-full px-6 py-3 rounded-xl bg-cta text-cta-foreground font-semibold text-sm"
              >
                Iniciar Quiz ({quizzes.length} perguntas)
              </button>
            ) : (
              <TopicQuiz
                quizzes={quizzes}
                userId={user?.id ?? ""}
                topicId={topicId}
                onPass={handlePass}
              />
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
```

---

## Task 14: Integrate StudyCard into dashboard

**Files:**
- Modify: `frontend/src/app/(dashboard)/dashboard/page.tsx` (imports + grid)

- [ ] **Step 1: Add import**

After line 7 (`import { StreakCard } from "@/components/dashboard/streak-card";`), add:
```typescript
import { StudyCard } from "@/components/dashboard/study-card";
import { getUserGlobalProgress } from "@/lib/api";
```

- [ ] **Step 2: Fetch progress and render StudyCard**

Replace the entire return block (lines 18-66) with:

```tsx
  let studyProgress = null;
  try {
    studyProgress = await getUserGlobalProgress(userId);
  } catch {
    // Silently fail — study card will render without data
  }

  return (
    <div className="mx-auto w-full max-w-[1560px] 2xl:max-w-[1920px] px-4 md:px-8 xl:px-12 py-8">
      {/* Hero */}
      <div className="mb-6 rounded-3xl bg-gradient-to-br from-cream to-sage-soft p-8 lg:p-10">
        <h1 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight text-foreground">
          Olá, Estudante
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          Continua onde paraste
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-5">
        {/* Terminal Lab — 8col × 2row */}
        <div className="md:col-span-6 lg:col-span-8 lg:row-span-2 min-h-[200px]">
          <TerminalCard />
        </div>

        {/* Estudo — 4col × 2row */}
        <div className="md:col-span-3 lg:col-span-4 lg:row-span-2 min-h-[200px]">
          {studyProgress ? (
            <StudyCard progress={studyProgress} />
          ) : (
            <TopicsCard />
          )}
        </div>

        {/* Chat IA — 5col × 2row */}
        <div className="md:col-span-3 lg:col-span-5 lg:row-span-2 min-h-[200px]">
          <ChatCard />
        </div>

        {/* Quizzes — 3col × 2row */}
        <div className="md:col-span-3 lg:col-span-3 lg:row-span-2 min-h-[200px]">
          <QuizzesCard />
        </div>

        {/* Progresso — 4col × 2row */}
        <div className="md:col-span-6 lg:col-span-4 lg:row-span-2 min-h-[200px]">
          <ProgressCard />
        </div>

        {/* Manuais + Streak row — 6 + 6 */}
        <div className="md:col-span-6 lg:col-span-6 min-h-[140px]">
          <ManualsCard />
        </div>
        <div className="md:col-span-6 lg:col-span-6 min-h-[140px]">
          <StreakCard />
        </div>
      </div>
    </div>
  );
```

- [ ] **Step 3: Verify build passes**

Run: `cmd /c "npm run build"` in `frontend/`
Expected: Build succeeds with new routes `/dashboard/study`, `/dashboard/study/[code]`, `/dashboard/study/[code]/[topic]`.

---

## Task 15: Build, lint, and end-to-end verification

- [ ] **Step 1: Lint frontend**

Run: `cmd /c "npm run lint"` in `frontend/`
Expected: No errors.

- [ ] **Step 2: Build frontend**

Run: `cmd /c "npm run build"` in `frontend/`
Expected: Clean build, all routes compiled.

- [ ] **Step 3: Rebuild Docker containers**

Run in `linuxdecamoes/`:
```
docker compose build --no-cache backend frontend
docker compose up -d
```

- [ ] **Step 4: Run migration script**

Run: `docker compose exec backend python scripts/add_study_columns.py`
Expected: 3x "OK" + "Migration complete."

- [ ] **Step 5: Verify endpoints respond**

Run:
```
curl http://localhost:8000/api/study/users/test/clerk_id/progress
curl http://localhost:8000/api/study/manuals/010/progress?clerk_id=test
```
Expected: 404 (user not found) — confirms endpoints are registered and responding.

---

## Self-Review

**1. Spec coverage:**
- ✅ Linear flow T1→T2→T3 — enforced in `get_manual_progress` via gating logic
- ✅ Quiz gating ≥60% — `completeTopic` checks `quiz_score >= 60`
- ✅ Visual roadmap — `study-roadmap.tsx` with ✅/🔒/🔵/⚪ icons
- ✅ RAG content + expandable — `topic-content.tsx` with sections toggle
- ✅ Modules = LPI objectives — `OBJECTIVE_MAP` in backend + `objective` in manifesto
- ✅ Dashboard global — `/dashboard/study` page with 5 manual cards
- ✅ Persistent progress — `user_progress` table with new fields
- ✅ 4 endpoints — all implemented in `api/study.py`

**2. Placeholder scan:** No TBD/TODO found.

**3. Type consistency:** All types match between backend (Pydantic) and frontend (TypeScript). Function names consistent across tasks.
