from __future__ import annotations

from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.models import Base

DB_DIR = Path(__file__).resolve().parent.parent / "data"
DB_FILE = DB_DIR / "cyberops.db"
DATABASE_URL = f"sqlite:///{DB_FILE}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db() -> None:
    DB_DIR.mkdir(parents=True, exist_ok=True)
    Base.metadata.create_all(bind=engine)
