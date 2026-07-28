from datetime import datetime, timezone, timedelta, date as date_type
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, cast, Date
from db.base import get_db
from models.models import Manual, Topic, UserProgress, User, QuizResult
from pydantic import BaseModel
from rag.service import search

router = APIRouter(prefix="/study", tags=["study"])


OBJECTIVE_MAP = {
    "010": {
        "1.1": [1, 2, 3, 4, 5],
        "1.2": [6, 7, 8],
        "1.3": [9, 10],
        "1.4": [11, 12, 13, 14],
    },
    "020": {
        "1.1": [1, 2, 3],
        "1.2": [4, 5, 6],
        "1.3": [7, 8, 9, 10, 11, 12],
    },
    "030": {
        "1.1": [1, 2, 3, 4],
        "1.2": [5],
        "1.3": [6, 7, 8],
        "1.4": [9, 10, 11, 12, 13, 14],
    },
    "101": {
        "1.1": [1, 2, 3, 4, 5],
        "1.2": [6, 7, 8, 9],
        "1.3": [10, 11, 12, 13],
        "1.4": [14, 15, 16],
        "1.5": [17, 18, 19, 20, 21, 22, 23, 24, 25, 26],
    },
    "102": {
        "2.1": [1, 2, 3],
        "2.2": [4, 5, 6, 7, 8],
        "2.3": [9, 10, 11, 12, 13, 14, 15],
        "2.4": [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26],
    },
}

OBJECTIVE_TITLES = {
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


class TopicProgressResponse(BaseModel):
    topic_id: str
    topic_number: int
    title: str
    status: str
    quiz_score: float | None
    quiz_passed: bool
    completed_at: str | None


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
    streak_consecutive_days: int = 0
    due_quiz_count: int = 0
    total_quizzes_taken: int = 0
    total_quizzes_correct: int = 0


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _topic_to_objective(manual_code: str, topic_number: int) -> str | None:
    mapping = OBJECTIVE_MAP.get(manual_code, {})
    for obj, nums in mapping.items():
        if topic_number in nums:
            return obj
    return None


def _build_modules(
    manual_code: str,
    topics: list[Topic],
    progress_map: dict[str, UserProgress],
) -> list[ModuleProgressResponse]:
    mapping = OBJECTIVE_MAP.get(manual_code, {})
    titles = OBJECTIVE_TITLES.get(manual_code, {})

    topic_by_number = {t.topic_number: t for t in topics}

    modules: list[ModuleProgressResponse] = []
    for objective, topic_numbers in mapping.items():
        topic_responses: list[TopicProgressResponse] = []
        for num in sorted(topic_numbers):
            topic = topic_by_number.get(num)
            if not topic:
                continue

            prog = progress_map.get(topic.id)
            status = prog.status if prog else "not_started"
            quiz_score = prog.quiz_score if prog else None
            quiz_passed = prog.quiz_passed if prog else False
            completed_at = prog.completed_at.isoformat() if prog and prog.completed_at else None

            topic_responses.append(TopicProgressResponse(
                topic_id=topic.id,
                topic_number=topic.topic_number,
                title=topic.title,
                status=status,
                quiz_score=quiz_score,
                quiz_passed=quiz_passed,
                completed_at=completed_at,
            ))

        # Enforce gating: lock topic if previous topic not passed
        for i, tr in enumerate(topic_responses):
            if i == 0:
                continue
            prev = topic_responses[i - 1]
            if not prev.quiz_passed:
                if tr.status not in ("completed",):
                    tr.status = "locked"

        modules.append(ModuleProgressResponse(
            objective=objective,
            title=titles.get(objective, objective),
            topics=topic_responses,
        ))

    return modules


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.get("/manuals/{code}/progress")
async def get_manual_progress(code: str, clerk_id: str, db: AsyncSession = Depends(get_db)):
    manual_result = await db.execute(select(Manual).where(Manual.code == code))
    manual = manual_result.scalar_one_or_none()
    if not manual:
        raise HTTPException(status_code=404, detail="Manual not found")

    user_result = await db.execute(select(User).where(User.clerk_id == clerk_id))
    user = user_result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    topics_result = await db.execute(
        select(Topic).where(Topic.manual_id == manual.id).order_by(Topic.topic_number)
    )
    topics = list(topics_result.scalars().all())

    topic_ids = [t.id for t in topics]
    progress_map: dict[str, UserProgress] = {}
    if topic_ids:
        prog_result = await db.execute(
            select(UserProgress).where(
                UserProgress.user_id == user.id,
                UserProgress.topic_id.in_(topic_ids),
            )
        )
        for p in prog_result.scalars().all():
            progress_map[p.topic_id] = p

    modules = _build_modules(code, topics, progress_map)

    # Count completed (quiz_passed)
    completed = sum(1 for p in progress_map.values() if p.quiz_passed)

    return ManualProgressResponse(
        manual_code=code,
        total_topics=len(topics),
        completed_topics=completed,
        modules=modules,
    )


@router.get("/topics/{topic_id}/content")
async def get_topic_content(topic_id: str, db: AsyncSession = Depends(get_db)):
    topic_result = await db.execute(select(Topic).where(Topic.id == topic_id))
    topic = topic_result.scalar_one_or_none()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    manual_result = await db.execute(select(Manual).where(Manual.id == topic.manual_id))
    manual = manual_result.scalar_one_or_none()
    if not manual:
        raise HTTPException(status_code=404, detail="Manual not found")

    chunks = search(topic.title, k=10)

    sections = [
        TopicSection(
            secao=c.get("secao", ""),
            tipo=c.get("tipo", ""),
            texto=c.get("texto", ""),
            manual=c.get("manual", ""),
            topico=c.get("topico", ""),
        )
        for c in chunks
    ]

    objective = _topic_to_objective(manual.code, topic.topic_number) or ""

    return TopicContentResponse(
        topic_id=topic.id,
        title=topic.title,
        objective=objective,
        summary=topic.title,
        sections=sections,
    )


@router.post("/topics/{topic_id}/complete")
async def complete_topic(
    topic_id: str,
    data: CompleteTopicRequest,
    clerk_id: str,
    db: AsyncSession = Depends(get_db),
):
    topic_result = await db.execute(select(Topic).where(Topic.id == topic_id))
    topic = topic_result.scalar_one_or_none()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    user_result = await db.execute(select(User).where(User.clerk_id == clerk_id))
    user = user_result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    prog_result = await db.execute(
        select(UserProgress).where(
            UserProgress.user_id == user.id,
            UserProgress.topic_id == topic_id,
        )
    )
    progress = prog_result.scalar_one_or_none()
    if not progress:
        progress = UserProgress(user_id=user.id, topic_id=topic_id)
        db.add(progress)

    progress.quiz_score = data.quiz_score
    progress.quiz_passed = data.quiz_score >= 60.0

    if progress.quiz_passed:
        progress.status = "completed"
        progress.completed_at = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(progress)

    # Find next topic
    next_result = await db.execute(
        select(Topic).where(
            Topic.manual_id == topic.manual_id,
            Topic.topic_number > topic.topic_number,
        ).order_by(Topic.topic_number).limit(1)
    )
    next_topic = next_result.scalar_one_or_none()

    return CompletionResultResponse(
        topic_id=topic.id,
        quiz_score=data.quiz_score,
        quiz_passed=progress.quiz_passed,
        completed_at=progress.completed_at.isoformat() if progress.completed_at else "",
        next_topic_unlocked=progress.quiz_passed,
        next_topic_id=next_topic.id if next_topic else None,
    )


@router.get("/users/{clerk_id}/progress")
async def get_global_progress(clerk_id: str, db: AsyncSession = Depends(get_db)):
    user_result = await db.execute(select(User).where(User.clerk_id == clerk_id))
    user = user_result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    manuals_result = await db.execute(select(Manual))
    manuals = list(manuals_result.scalars().all())

    summaries: list[ManualSummary] = []
    total_completed = 0
    total_topics = 0

    for manual in manuals:
        topics_result = await db.execute(
            select(Topic).where(Topic.manual_id == manual.id).order_by(Topic.topic_number)
        )
        topics = list(topics_result.scalars().all())

        topic_ids = [t.id for t in topics]
        completed_count = 0
        if topic_ids:
            prog_result = await db.execute(
                select(UserProgress).where(
                    UserProgress.user_id == user.id,
                    UserProgress.topic_id.in_(topic_ids),
                )
            )
            completed_count = sum(1 for p in prog_result.scalars().all() if p.quiz_passed)

        # Modules completed
        mapping = OBJECTIVE_MAP.get(manual.code, {})
        modules_total = len(mapping)
        modules_completed = 0
        for obj, topic_numbers in mapping.items():
            obj_topic_ids = [t.id for t in topics if t.topic_number in topic_numbers]
            if not obj_topic_ids:
                continue
            obj_prog_result = await db.execute(
                select(UserProgress).where(
                    UserProgress.user_id == user.id,
                    UserProgress.topic_id.in_(obj_topic_ids),
                    UserProgress.quiz_passed == True,
                )
            )
            passed_count = len(obj_prog_result.scalars().all())
            if passed_count == len(topic_numbers):
                modules_completed += 1

        total_completed += completed_count
        total_topics += len(topics)

        summaries.append(ManualSummary(
            code=manual.code,
            title=manual.title,
            total_topics=len(topics),
            completed_topics=completed_count,
            modules_completed=modules_completed,
            modules_total=modules_total,
        ))

    # ── Quiz stats ──────────────────────────────────────────────────────
    now_utc = datetime.now(timezone.utc)
    today = now_utc.date()

    # Due quizzes count
    due_result = await db.execute(
        select(func.count(QuizResult.id)).where(
            QuizResult.user_id == user.id,
            QuizResult.next_review <= now_utc,
        )
    )
    due_quiz_count = due_result.scalar() or 0

    # Total quizzes taken / correct
    total_taken_result = await db.execute(
        select(func.count(QuizResult.id)).where(QuizResult.user_id == user.id)
    )
    total_quizzes_taken = total_taken_result.scalar() or 0

    total_correct_result = await db.execute(
        select(func.count(QuizResult.id)).where(
            QuizResult.user_id == user.id,
            QuizResult.is_correct == True,
        )
    )
    total_quizzes_correct = total_correct_result.scalar() or 0

    # Consecutive day streak (backward from today)
    quiz_date_rows = await db.execute(
        select(func.distinct(cast(QuizResult.created_at, Date)))
        .where(QuizResult.user_id == user.id)
        .order_by(cast(QuizResult.created_at, Date).desc())
    )
    dates = [row[0] for row in quiz_date_rows.fetchall()]
    streak = 0
    for i, d in enumerate(dates):
        if d == today - timedelta(days=i):
            streak += 1
        else:
            break

    return GlobalProgressResponse(
        manuals=summaries,
        total_topics_completed=total_completed,
        total_topics=total_topics,
        streak_consecutive_days=streak,
        due_quiz_count=due_quiz_count,
        total_quizzes_taken=total_quizzes_taken,
        total_quizzes_correct=total_quizzes_correct,
    )
