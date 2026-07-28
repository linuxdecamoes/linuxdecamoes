import asyncio, sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from db.base import async_session
from models.models import Manual, Topic
from sqlalchemy import select, func

async def main():
    async with async_session() as db:
        manuals = (await db.execute(select(Manual))).scalars().all()
        for m in manuals:
            c = (await db.execute(select(func.count(Topic.id)).where(Topic.manual_id == m.id))).scalar()
            print(f"{m.code}: {m.title} ({c} topics)")

if __name__ == "__main__":
    asyncio.run(main())
