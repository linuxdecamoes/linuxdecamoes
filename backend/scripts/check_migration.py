"""Check quizzes table columns and add generated_at if missing."""
import asyncio
from sqlalchemy import text
from db.base import engine


async def main():
    async with engine.begin() as conn:
        # Check existing columns
        result = await conn.execute(
            text("SELECT column_name FROM information_schema.columns WHERE table_name='quizzes'")
        )
        cols = [row[0] for row in result]
        print(f"Current columns: {cols}")

        if "generated_at" not in cols:
            await conn.execute(
                text("ALTER TABLE quizzes ADD COLUMN generated_at TIMESTAMP DEFAULT NOW()")
            )
            print("Added 'generated_at' column")
        else:
            print("Column 'generated_at' already exists")


if __name__ == "__main__":
    asyncio.run(main())
