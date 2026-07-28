from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Nome público da API (identidade de produto = "Linux de Camões")
    APP_NAME: str = "Linux de Camões API"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False

    # Identificador de infraestrutura: o nome da base de dados / db_user "kubeai"
    # NÃO é branding (não é visível ao utilizador); alterá-lo exige migração da BD.
    DATABASE_URL: str = "postgresql+asyncpg://kubeai:kubeai@db:5432/kubeai"

    CLERK_SECRET_KEY: str = ""
    CLERK_PUBLISHABLE_KEY: str = ""

    GROQ_API_KEY: str = ""

    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:3001"]

    class Config:
        env_file = ".env"


settings = Settings()