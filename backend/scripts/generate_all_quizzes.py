"""Seed script: generate quizzes for all topics using LLM + RAG.

Usage: python -m scripts.generate_all_quizzes
"""
import asyncio
import json
import sys
import os
import time

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import select
from db.base import async_session
from models.models import Topic, Quiz
from rag.service import search
from rag.llm import generate_quizzes as generate_quizzes_llm


async def generate_for_topic(topic: Topic, db, retries: int = 3) -> int:
    """Generate quizzes for a single topic. Returns count generated."""
    result = await db.execute(
        select(Quiz).where(Quiz.topic_id == topic.id).limit(1)
    )
    if result.scalar_one_or_none():
        return 0

    chunks = search(topic.title, k=10)
    if not chunks:
        print(f"  [WARN] No RAG chunks for topic {topic.topic_number}: {topic.title}")
        return 0

    for attempt in range(1, retries + 1):
        try:
            generated = generate_quizzes_llm(chunks, n=5)
            if not generated:
                print(f"  [ERROR] LLM returned empty for topic {topic.topic_number} (attempt {attempt})")
                if attempt < retries:
                    time.sleep(2 ** attempt)
                continue

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
            print(f"  [OK] Topic {topic.topic_number}: {topic.title} -> {len(generated)} quizzes")
            return len(generated)
        except Exception as e:
            print(f"  [ERROR] Topic {topic.topic_number} attempt {attempt}: {e}")
            if attempt < retries:
                wait = 2 ** attempt
                print(f"         Retrying in {wait}s...")
                time.sleep(wait)

    print(f"  [FAIL] Topic {topic.topic_number}: {topic.title} failed after {retries} attempts")
    return 0


async def main():
    async with async_session() as db:
        result = await db.execute(select(Topic).order_by(Topic.topic_number))
        topics = result.scalars().all()

        # count existing
        existing = 0
        for t in topics:
            r = await db.execute(select(Quiz).where(Quiz.topic_id == t.id).limit(1))
            if r.scalar_one_or_none():
                existing += 1

        pending = len(topics) - existing
        print(f"Topics: {len(topics)} total, {existing} with quizzes, {pending} pending\n")

        total = 0
        for i, topic in enumerate(topics, 1):
            count = await generate_for_topic(topic, db)
            total += count
            if count > 0 and i < len(topics):
                time.sleep(1)  # rate limit spacing

        print(f"\nDone! Generated {total} new quizzes.")
        final_count = await db.scalar(select(Topic.id))
        from sqlalchemy import func
        total_quizzes = await db.scalar(select(func.count(Quiz.id)))
        print(f"Total quizzes in DB: {total_quizzes}")


if __name__ == "__main__":
    asyncio.run(main())
