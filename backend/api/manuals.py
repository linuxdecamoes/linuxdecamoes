from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from db.base import get_db
from models.models import Manual, Topic, Quiz, UserProgress
from pydantic import BaseModel

router = APIRouter(prefix="/manuals", tags=["manuals"])


class ManualResponse(BaseModel):
    id: str
    code: str
    title: str
    total_topics: int

    class Config:
        from_attributes = True


class TopicResponse(BaseModel):
    id: str
    topic_number: int
    title: str
    content_path: str | None

    class Config:
        from_attributes = True


@router.get("/", response_model=list[ManualResponse])
async def list_manuals(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Manual))
    return result.scalars().all()


@router.get("/{code}", response_model=ManualResponse)
async def get_manual(code: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Manual).where(Manual.code == code))
    manual = result.scalar_one_or_none()
    if not manual:
        raise HTTPException(status_code=404, detail="Manual not found")
    return manual


@router.get("/{code}/topics", response_model=list[TopicResponse])
async def list_topics(code: str, db: AsyncSession = Depends(get_db)):
    manual_result = await db.execute(select(Manual).where(Manual.code == code))
    manual = manual_result.scalar_one_or_none()
    if not manual:
        raise HTTPException(status_code=404, detail="Manual not found")

    result = await db.execute(
        select(Topic).where(Topic.manual_id == manual.id).order_by(Topic.topic_number)
    )
    return result.scalars().all()