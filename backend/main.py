from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from db.base import engine, Base
from api.users import router as users_router
from api.manuals import router as manuals_router
from api.quizzes import router as quizzes_router
from api.study import router as study_router
from api.chat import router as chat_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users_router, prefix="/api")
app.include_router(manuals_router, prefix="/api")
app.include_router(quizzes_router, prefix="/api")
app.include_router(study_router, prefix="/api")
app.include_router(chat_router, prefix="/api")


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "version": settings.APP_VERSION}