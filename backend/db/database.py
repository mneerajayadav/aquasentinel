"""
AquaSentinel — Database Connection
Person 1 owns this file.
Uses PostgreSQL + PostGIS via SQLAlchemy.
For demo/hackathon: if DB is unavailable, routes fall back to mock data in seed.py
"""

import os
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://aqua:aqua1234@localhost:5432/aquasentinel"
)

# Create engine — echo=True logs all SQL (useful for debugging)
engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """FastAPI dependency — yields a DB session, always closes it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_connection() -> bool:
    """Returns True if PostgreSQL is reachable."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception:
        return False
