import json
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from db.base import get_db
from models.models import Manual, Quiz, QuizResult, User, UserProgress, Topic
from pydantic import BaseModel
from rag.service import search
from rag.llm import generate_quizzes as generate_quizzes_llm

router = APIRouter(prefix="/quizzes", tags=["quizzes"])


class QuizResponse(BaseModel):
    id: str
    question: str
    options: str
    correct_answer: str
    explanation: str | None

    class Config:
        from_attributes = True


class QuizSubmit(BaseModel):
    clerk_id: str
    quiz_id: str
    answer: str


class QuizResultResponse(BaseModel):
    is_correct: bool
    next_review: datetime
    interval_days: int

    class Config:
        from_attributes = True


def calculate_next_review(is_correct: bool, ease_factor: float, interval_days: int):
    if is_correct:
        new_ease = ease_factor + 0.1
        new_interval = int(interval_days * new_ease)
    else:
        new_ease = max(1.3, ease_factor - 0.2)
        new_interval = 1

    return datetime.utcnow() + timedelta(days=new_interval), new_ease, new_interval


@router.get("/topic/{topic_id}", response_model=list[QuizResponse])
async def get_quizzes_for_topic(topic_id: str, limit: int = 10, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Quiz).where(Quiz.topic_id == topic_id).limit(limit)
    )
    return result.scalars().all()


@router.get("/by-slug/{manual_code}/{slug}")
async def get_quizzes_by_slug(
    manual_code: str,
    slug: str,
    limit: int = 10,
    db: AsyncSession = Depends(get_db),
):
    """Get quizzes for a topic identified by manual code and slug."""
    import re
    result = await db.execute(
        select(Manual).where(Manual.code == manual_code)
    )
    manual = result.scalar_one_or_none()
    if not manual:
        raise HTTPException(status_code=404, detail="Manual not found")

    result = await db.execute(
        select(Topic).where(Topic.manual_id == manual.id)
    )
    topics = result.scalars().all()

    def _title_to_slug(title: str) -> str:
        """Normalize a topic title to the slug format used in manuals.ts."""
        import unicodedata
        s = unicodedata.normalize("NFD", title)
        s = "".join(c for c in s if unicodedata.category(c) != "Mn")
        s = s.lower().replace(" ", "-")
        s = s.replace(".", "-").replace(",", "")
        s = re.sub(r"-{2,}", "-", s)
        return s

    target_topic = None
    for t in topics:
        topic_slug = f"topico-{t.topic_number}"
        full_slug = _title_to_slug(t.title)
        # Also try without leading prefix (e.g. "001-1-" stripped) since
        # the frontend slug omits it.
        no_prefix = re.sub(r"^\d{3}-\d+-", "", full_slug)
        if topic_slug == slug or full_slug == slug or no_prefix == slug:
            target_topic = t
            break

    if not target_topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    result = await db.execute(
        select(Quiz)
        .where(Quiz.topic_id == target_topic.id)
        .limit(limit)
    )
    quizzes = result.scalars().all()

    return [
        {
            "id": q.id,
            "topic_id": q.topic_id,
            "question": q.question,
            "options": q.options,
            "correct_answer": q.correct_answer,
            "explanation": q.explanation,
        }
        for q in quizzes
    ]


@router.post("/submit", response_model=QuizResultResponse)
async def submit_quiz(data: QuizSubmit, db: AsyncSession = Depends(get_db)):
    user_result = await db.execute(select(User).where(User.clerk_id == data.clerk_id))
    user = user_result.scalar_one_or_none()
    if not user:
        user = User(clerk_id=data.clerk_id, email=f"{data.clerk_id}@placeholder.local")
        db.add(user)
        await db.flush()

    quiz_result = await db.execute(select(Quiz).where(Quiz.id == data.quiz_id))
    quiz = quiz_result.scalar_one_or_none()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    is_correct = data.answer.strip().lower() == quiz.correct_answer.strip().lower()

    existing_result = await db.execute(
        select(QuizResult)
        .where(QuizResult.user_id == user.id, QuizResult.quiz_id == data.quiz_id)
        .order_by(QuizResult.created_at.desc())
        .limit(1)
    )
    prev = existing_result.scalar_one_or_none()
    ease_factor = prev.ease_factor if prev else 2.5
    interval_days = prev.interval_days if prev else 1

    next_review, new_ease, new_interval = calculate_next_review(is_correct, ease_factor, interval_days)

    result = QuizResult(
        user_id=user.id,
        quiz_id=data.quiz_id,
        is_correct=is_correct,
        next_review=next_review,
        ease_factor=new_ease,
        interval_days=new_interval,
    )
    db.add(result)
    await db.commit()

    return QuizResultResponse(
        is_correct=is_correct,
        next_review=next_review,
        interval_days=new_interval,
    )


@router.get("/due/{user_id}", response_model=list[QuizResultResponse])
async def get_due_quizzes(user_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(QuizResult)
        .where(QuizResult.user_id == user_id, QuizResult.next_review <= datetime.utcnow())
        .order_by(QuizResult.next_review)
        .limit(20)
    )
    return result.scalars().all()


@router.post("/generate/{topic_id}")
async def generate_topic_quizzes(
    topic_id: str,
    db: AsyncSession = Depends(get_db),
):
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
            "quizzes": [
            {
                "id": q.id,
                "topic_id": q.topic_id,
                "question": q.question,
                "options": q.options,
                "correct_answer": q.correct_answer,
                "explanation": q.explanation,
            }
            for q in quizzes.scalars().all()
        ],
        }

    topic = await db.get(Topic, topic_id)
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    chunks = search(topic.title, k=10)

    generated = generate_quizzes_llm(chunks, n=5)
    if not generated:
        raise HTTPException(
            status_code=502,
            detail="Failed to generate quizzes from LLM",
        )

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
        "quizzes": [
            {
                "id": q.id,
                "topic_id": q.topic_id,
                "question": q.question,
                "options": q.options,
                "correct_answer": q.correct_answer,
                "explanation": q.explanation,
            }
            for q in created
        ],
    }