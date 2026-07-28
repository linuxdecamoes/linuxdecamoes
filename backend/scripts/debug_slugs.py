import asyncio, sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from db.base import async_session
from models.models import Topic, Manual, Quiz
from sqlalchemy import select, func

async def main():
    async with async_session() as db:
        # Get manuals
        manuals = (await db.execute(select(Manual))).scalars().all()
        for m in manuals:
            topics = (await db.execute(
                select(Topic).where(Topic.manual_id == m.id).order_by(Topic.topic_number)
            )).scalars().all()
            print(f"\n=== {m.code}: {m.title} ===")
            for t in topics[:3]:
                slug_by_title = t.title.lower().replace(" ", "-")
                quiz_count = (await db.execute(
                    select(func.count(Quiz.id)).where(Quiz.topic_id == t.id)
                )).scalar()
                print(f"  T{t.topic_number}: {t.title}")
                print(f"    slug(title): {slug_by_title}")
                print(f"    quizzes: {quiz_count}")

if __name__ == "__main__":
    asyncio.run(main())
