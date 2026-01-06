from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent


class Settings(BaseSettings):
    APP_NAME: str = "Hackathon App"
    DEBUG: bool = True
    PROJECT_URL: str = ""

    # Postgres (Neon)
    ASYNC_DB_DSN: str = ""  # e.g. postgresql+asyncpg://user:pass@host/db?sslmode=require

    # GROQ
    GROQ_PRIVATE_API_KEY: str = ""
    GROQ_PHONE_NUMBER_ID: str = ""

    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="allow",
    )


settings = Settings()
