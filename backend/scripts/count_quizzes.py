import asyncio, sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from db.base import async_session
from sqlalchemy import select, func
from models.models import Quiz

async def main():
    async with async_session() as db:
        r = await db.execute(select(func.count(Quiz.id)))
        print(f"Total quizzes: {r.scalar_one()}")

if __name__ == "__main__":
    asyncio.run(main())
