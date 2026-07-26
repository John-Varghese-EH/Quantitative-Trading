"""Auth service: password hashing and JWT token management."""
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from config import settings

import warnings
warnings.filterwarnings("ignore", ".*error reading bcrypt version.*")
warnings.filterwarnings("ignore", ".*trapped.*")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ─── Password ────────────────────────────────────────────────────────────────
def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


# ─── JWT ─────────────────────────────────────────────────────────────────────
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        return None


def generate_verification_token() -> str:
    return str(uuid.uuid4()).replace("-", "")


# ─── Email (Mock) ─────────────────────────────────────────────────────────────
def send_verification_email(email: str, token: str):
    if settings.MOCK_EMAIL:
        from utils.logger import logger
        logger.info(f"[MOCK EMAIL] Verification token for {email}: {token}")
        logger.info(f"[MOCK EMAIL] URL: http://localhost:5173/verify-email?token={token}")
    else:
        # TODO: Integrate SendGrid or SMTP
        pass


def send_password_reset_email(email: str, token: str):
    if settings.MOCK_EMAIL:
        from utils.logger import logger
        logger.info(f"[MOCK EMAIL] Password reset token for {email}: {token}")
        logger.info(f"[MOCK EMAIL] URL: http://localhost:5173/reset-password?token={token}")
    else:
        pass
