import asyncio, sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from db.base import async_session
from models.models import Topic, Quiz
from sqlalchemy import select, func

async def main():
    async with async_session() as db:
        t = (await db.execute(select(func.count(Topic.id)))).scalar()
        q = (await db.execute(select(func.count(Quiz.id)))).scalar()
        dq = (await db.execute(
            select(func.count(func.distinct(Quiz.topic_id)))
        )).scalar()
        print(f"Topics: {t} | With quizzes: {dq} | Total quizzes: {q}")

if __name__ == "__main__":
    asyncio.run(main())
