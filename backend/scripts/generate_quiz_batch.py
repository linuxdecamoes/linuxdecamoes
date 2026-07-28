"""Generate quizzes for N pending topics at a time.

Usage: python -m scripts.generate_quiz_batch [batch_size]
Default batch_size = 5
"""
import asyncio
import json
import sys
import os
import time

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import select, func
from db.base import async_session
from models.models import Topic, Quiz
from rag.service import search
from rag.llm import generate_quizzes as generate_quizzes_llm


async def generate_for_topic(topic: Topic, db, retries: int = 3) -> int:
    result = await db.execute(
        select(Quiz).where(Quiz.topic_id == topic.id).limit(1)
    )
    if result.scalar_one_or_none():
        return 0

    chunks = search(topic.title, k=10)
    if not chunks:
        print(f"  [SKIP] {topic.topic_number}: {topic.title} - no RAG chunks")
        return 0

    for attempt in range(1, retries + 1):
        try:
            generated = generate_quizzes_llm(chunks, n=5)
            if not generated:
                print(f"  [ERR] {topic.topic_number} attempt {attempt}: empty LLM response")
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
            print(f"  [OK] {topic.topic_number}: {topic.title} -> {len(generated)} quizzes")
            return len(generated)
        except Exception as e:
            print(f"  [ERR] {topic.topic_number} attempt {attempt}: {e}")
            if attempt < retries:
                wait = 2 ** attempt
                print(f"         Retrying in {wait}s...")
                time.sleep(wait)

    print(f"  [FAIL] {topic.topic_number}: {topic.title} after {retries} attempts")
    return 0


async def main():
    batch_size = int(sys.argv[1]) if len(sys.argv) > 1 else 5

    async with async_session() as db:
        # Get all topics
        result = await db.execute(select(Topic).order_by(Topic.topic_number))
        all_topics = result.scalars().all()

        # Find topics without quizzes
        pending = []
        for t in all_topics:
            r = await db.execute(select(Quiz).where(Quiz.topic_id == t.id).limit(1))
            if not r.scalar_one_or_none():
                pending.append(t)

        total_quizzes = await db.scalar(select(func.count(Quiz.id)))

        print(f"=== Quiz Batch Generator ===")
        print(f"Total topics: {len(all_topics)}")
        print(f"With quizzes: {len(all_topics) - len(pending)}")
        print(f"Pending: {len(pending)}")
        print(f"Current quizzes in DB: {total_quizzes}")
        print(f"Batch size: {batch_size}")
        print()

        if not pending:
            print("All topics already have quizzes!")
            return

        batch = pending[:batch_size]
        print(f"Processing batch ({len(batch)} topics):")
        for t in batch:
            print(f"  - {t.topic_number}: {t.title}")
        print()

        generated = 0
        for i, topic in enumerate(batch, 1):
            count = await generate_for_topic(topic, db)
            generated += count
            if count > 0 and i < len(batch):
                time.sleep(1)

        # Final count
        final_total = await db.scalar(select(func.count(Quiz.id)))
        remaining = len(pending) - len(batch)

        print(f"\n=== Results ===")
        print(f"Generated this batch: {generated} quizzes")
        print(f"Total quizzes in DB: {final_total}")
        print(f"Remaining topics without quizzes: {remaining}")
        if remaining > 0:
            print(f"\nNext batch: python -m scripts.generate_quiz_batch {batch_size}")


if __name__ == "__main__":
    asyncio.run(main())
