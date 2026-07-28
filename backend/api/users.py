from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from db.base import get_db
from models.models import User
from pydantic import BaseModel

router = APIRouter(prefix="/users", tags=["users"])


class UserCreate(BaseModel):
    clerk_id: str
    email: str
    display_name: str | None = None


class UserResponse(BaseModel):
    id: str
    clerk_id: str
    email: str
    display_name: str | None

    class Config:
        from_attributes = True


@router.post("/", response_model=UserResponse)
async def create_user(data: UserCreate, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(User.clerk_id == data.clerk_id))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="User already exists")

    user = User(clerk_id=data.clerk_id, email=data.email, display_name=data.display_name)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@router.get("/{clerk_id}", response_model=UserResponse)
async def get_user(clerk_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.clerk_id == clerk_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user