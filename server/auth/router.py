"""
Auth router: register, login, email verification, password reset, token refresh.
"""
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr, field_validator
from sqlalchemy.orm import Session

from database.session import get_db
from database.models import User, UserRole, ActivityLog
from auth.service import (
    hash_password, verify_password,
    create_access_token, create_refresh_token, decode_token,
    generate_verification_token,
    send_verification_email, send_password_reset_email,
)
from auth.dependencies import get_current_user

router = APIRouter()


# ─── Schemas ─────────────────────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    email: EmailStr
    username: str
    password: str
    full_name: str = ""

    @field_validator("password")
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v

    @field_validator("username")
    @classmethod
    def validate_username(cls, v):
        if len(v) < 3:
            raise ValueError("Username must be at least 3 characters")
        if not v.isalnum() and "_" not in v:
            raise ValueError("Username can only contain letters, numbers and underscores")
        return v.lower()


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict


class RefreshRequest(BaseModel):
    refresh_token: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


class VerifyEmailRequest(BaseModel):
    token: str


# ─── Helpers ─────────────────────────────────────────────────────────────────
def _log_activity(db: Session, user_id, action: str, request: Request = None, details: dict = None):
    log = ActivityLog(
        user_id=user_id,
        action=action,
        ip_address=request.client.host if request else None,
        details=details,
    )
    db.add(log)


def _user_dict(user: User) -> dict:
    return {
        "id": str(user.id),
        "email": user.email,
        "username": user.username,
        "full_name": user.full_name,
        "role": user.role.value,
        "is_verified": user.is_verified,
        "avatar_url": user.avatar_url,
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }


# ─── Endpoints ───────────────────────────────────────────────────────────────
@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user account."""
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(User).filter(User.username == body.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")

    verification_token = generate_verification_token()
    user = User(
        email=body.email,
        username=body.username,
        hashed_password=hash_password(body.password),
        full_name=body.full_name,
        verification_token=verification_token,
        is_verified=False,
        role=UserRole.USER,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    send_verification_email(body.email, verification_token)
    return {"message": "Registration successful. Check your email to verify your account.", "user_id": str(user.id)}


@router.post("/login", response_model=TokenResponse)
def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """Login with email/username and password."""
    user = (
        db.query(User).filter(User.email == form_data.username).first()
        or db.query(User).filter(User.username == form_data.username).first()
    )
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account disabled")

    payload = {"sub": str(user.id), "role": user.role.value}
    access_token = create_access_token(payload)
    refresh_token = create_refresh_token(payload)

    user.last_login = datetime.now(timezone.utc)
    _log_activity(db, user.id, "login", request)
    db.commit()

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=_user_dict(user),
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(body: RefreshRequest, db: Session = Depends(get_db)):
    """Issue new access token using a valid refresh token."""
    payload = decode_token(body.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    user = db.query(User).filter(User.id == payload["sub"]).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found")

    new_payload = {"sub": str(user.id), "role": user.role.value}
    return TokenResponse(
        access_token=create_access_token(new_payload),
        refresh_token=create_refresh_token(new_payload),
        user=_user_dict(user),
    )


@router.post("/verify-email")
def verify_email(body: VerifyEmailRequest, db: Session = Depends(get_db)):
    """Verify email using the token sent via email."""
    user = db.query(User).filter(User.verification_token == body.token).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired verification token")

    user.is_verified = True
    user.verification_token = None
    db.commit()
    return {"message": "Email verified successfully. You can now log in."}


@router.post("/forgot-password")
def forgot_password(body: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Send password reset email."""
    user = db.query(User).filter(User.email == body.email).first()
    if user:
        token = generate_verification_token()
        user.reset_token = token
        user.reset_token_expires = datetime.now(timezone.utc).replace(hour=datetime.now(timezone.utc).hour + 1)
        db.commit()
        send_password_reset_email(body.email, token)
    return {"message": "If that email exists, a reset link has been sent."}


@router.post("/reset-password")
def reset_password(body: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Reset password using the reset token."""
    user = db.query(User).filter(User.reset_token == body.token).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    user.hashed_password = hash_password(body.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    db.commit()
    return {"message": "Password reset successfully. You can now log in."}


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    """Get current authenticated user profile."""
    return _user_dict(current_user)


@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    """Logout (client-side token removal)."""
    return {"message": "Logged out successfully"}
