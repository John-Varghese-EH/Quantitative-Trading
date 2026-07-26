"""
Database session factory and engine configuration.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator

from config import settings
from database.models import Base
from utils.logger import logger


_is_sqlite = settings.DATABASE_URL.startswith("sqlite")

if _is_sqlite:
    from sqlalchemy.pool import StaticPool
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=settings.DEBUG,
    )
else:
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=300,
        echo=settings.DEBUG,
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def create_tables():
    """Create all database tables and seed admin user."""
    Base.metadata.create_all(bind=engine)
    _seed_admin()


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency: yields a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _seed_admin():
    """Create the default admin user if it doesn't exist."""
    from database.models import User, UserRole
    from auth.service import hash_password

    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
        if not existing:
            admin = User(
                email=settings.ADMIN_EMAIL,
                username="admin",
                hashed_password=hash_password(settings.ADMIN_PASSWORD[:72]),
                full_name="System Administrator",
                role=UserRole.ADMIN,
                is_active=True,
                is_verified=True,
            )
            db.add(admin)
            db.commit()
            logger.info(f"✅ Admin user created: {settings.ADMIN_EMAIL}")
    except Exception as e:
        logger.warning(f"Admin seed skipped: {e}")
        db.rollback()
    finally:
        db.close()
