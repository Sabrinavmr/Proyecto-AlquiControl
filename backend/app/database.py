from sqlmodel import SQLModel, create_engine, Session
from pydantic_settings import BaseSettings
from typing import Generator
import os


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./alquicontrol.db"
    GEMINI_API_KEY: str = ""
    RESEND_API_KEY: str = ""
    RESEND_FROM_EMAIL: str = "AlquiControl <noreply@alquicontrol.app>"
    ENVIRONMENT: str = "development"
    FRONTEND_URL: str = "http://localhost:5173"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()

# SQLite necesita check_same_thread=False
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=settings.ENVIRONMENT == "development",
)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
