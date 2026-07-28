"""Add completed_at, quiz_score, quiz_passed to user_progress table."""

import asyncio
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from sqlalchemy import text
from db.base import engine

async def migrate():
    sql_statements = [
        "ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP NULL",
        "ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS quiz_score DOUBLE PRECISION NULL",
        "ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS quiz_passed BOOLEAN DEFAULT FALSE",
    ]
    async with engine.begin() as conn:
        for stmt in sql_statements:
            await conn.execute(text(stmt))
            print(f"OK: {stmt}")
    print("Migration complete.")


if __name__ == "__main__":
    asyncio.run(migrate())
