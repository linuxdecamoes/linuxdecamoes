import uuid
from datetime import datetime
from sqlalchemy import String, Text, Integer, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from db.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    clerk_id: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True)
    display_name: Mapped[str] = mapped_column(String(128), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    progress: Mapped[list["UserProgress"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    quiz_results: Mapped[list["QuizResult"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class Manual(Base):
    __tablename__ = "manuals"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    code: Mapped[str] = mapped_column(String(16), unique=True)
    title: Mapped[str] = mapped_column(String(255))
    total_topics: Mapped[int] = mapped_column(Integer, default=0)

    topics: Mapped[list["Topic"]] = relationship(back_populates="manual", cascade="all, delete-orphan")


class Topic(Base):
    __tablename__ = "topics"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    manual_id: Mapped[str] = mapped_column(String(64), ForeignKey("manuals.id"))
    topic_number: Mapped[int] = mapped_column(Integer)
    title: Mapped[str] = mapped_column(String(255))
    content_path: Mapped[str] = mapped_column(String(512), nullable=True)

    manual: Mapped["Manual"] = relationship(back_populates="topics")
    user_progress: Mapped[list["UserProgress"]] = relationship(back_populates="topic", cascade="all, delete-orphan")


class UserProgress(Base):
    __tablename__ = "user_progress"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(64), ForeignKey("users.id"))
    topic_id: Mapped[str] = mapped_column(String(64), ForeignKey("topics.id"))
    status: Mapped[str] = mapped_column(String(20), default="not_started")
    score: Mapped[float] = mapped_column(Float, nullable=True)
    commands_executed: Mapped[int] = mapped_column(Integer, default=0)
    last_studied: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    quiz_score: Mapped[float] = mapped_column(Float, nullable=True)
    quiz_passed: Mapped[bool] = mapped_column(Boolean, default=False)

    user: Mapped["User"] = relationship(back_populates="progress")
    topic: Mapped["Topic"] = relationship(back_populates="user_progress")


class Quiz(Base):
    __tablename__ = "quizzes"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    topic_id: Mapped[str] = mapped_column(String(64), ForeignKey("topics.id"))
    question: Mapped[str] = mapped_column(Text)
    options: Mapped[str] = mapped_column(Text)
    correct_answer: Mapped[str] = mapped_column(String(255))
    explanation: Mapped[str] = mapped_column(Text, nullable=True)
    generated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    results: Mapped[list["QuizResult"]] = relationship(back_populates="quiz", cascade="all, delete-orphan")


class QuizResult(Base):
    __tablename__ = "quiz_results"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(64), ForeignKey("users.id"))
    quiz_id: Mapped[str] = mapped_column(String(64), ForeignKey("quizzes.id"))
    is_correct: Mapped[bool] = mapped_column(Boolean)
    next_review: Mapped[datetime] = mapped_column(DateTime)
    ease_factor: Mapped[float] = mapped_column(Float, default=2.5)
    interval_days: Mapped[int] = mapped_column(Integer, default=1)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="quiz_results")
    quiz: Mapped["Quiz"] = relationship(back_populates="results")