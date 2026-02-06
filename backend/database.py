"""
Database configuration and session management using SQLAlchemy.
Implements connection pooling and dependency injection pattern for FastAPI.
"""

import os
from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker, declarative_base
from sqlalchemy.engine import URL


def load_env_file(filepath: str = ".env") -> None:
    """Load environment variables from .env file."""
    import pathlib
    env_path = pathlib.Path(__file__).parent / filepath
    try:
        with open(env_path, "rb") as f:
            content = f.read().decode("utf-8", errors="ignore")
        for line in content.split("\n"):
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, value = line.split("=", 1)
                os.environ[key.strip()] = value.strip()
    except FileNotFoundError:
        pass


# Load .env file
load_env_file()

# Build connection URL using SQLAlchemy URL object to avoid encoding issues
# SQLite configuration for local development, PostgreSQL for production
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./pmo.db")

connect_args = {}
# Only use check_same_thread for SQLite
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args=connect_args
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """Dependency injection for database sessions."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Initialize database tables."""
    Base.metadata.create_all(bind=engine)
