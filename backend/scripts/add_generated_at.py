"""Add generated_at column to quizzes table if missing."""
import asyncio
import sys
sys.path.insert(0, "/app")

from db.base import engine
from sqlalchemy import text


async def main():
    async with engine.begin() as conn:
        result = await conn.execute(
            text("SELECT column_name FROM information_schema.columns WHERE table_name='quizzes'")
        )
        cols = [row[0] for row in result]
        print(f"Current columns: {cols}")

        if "generated_at" not in cols:
            await conn.execute(
                text("ALTER TABLE quizzes ADD COLUMN generated_at TIMESTAMP DEFAULT NOW()")
            )
            print("SUCCESS: Added 'generated_at' column")
        else:
            print("OK: Column 'generated_at' already exists")


if __name__ == "__main__":
    asyncio.run(main())
