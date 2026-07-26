"""Admin panel API — user management, logs, system stats."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from database.session import get_db
from database.models import User, UserRole, ActivityLog, AttackLog, MLModel, Trade
from auth.dependencies import require_admin
import platform, os

router = APIRouter()


@router.get("/users")
def list_users(
    limit: int = Query(50),
    offset: int = Query(0),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    users = db.query(User).offset(offset).limit(limit).all()
    total = db.query(func.count(User.id)).scalar()
    return {
        "total": total,
        "users": [
            {
                "id": str(u.id),
                "email": u.email,
                "username": u.username,
                "full_name": u.full_name,
                "role": u.role.value,
                "is_active": u.is_active,
                "is_verified": u.is_verified,
                "created_at": u.created_at.isoformat() if u.created_at else None,
                "last_login": u.last_login.isoformat() if u.last_login else None,
            }
            for u in users
        ],
    }


@router.delete("/users/{user_id}")
def delete_user(
    user_id: str,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role == UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Cannot delete admin users")
    db.delete(user)
    db.commit()
    return {"message": f"User {user.username} deleted"}


@router.patch("/users/{user_id}/toggle-active")
def toggle_user_active(
    user_id: str,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = not user.is_active
    db.commit()
    return {"message": f"User {'activated' if user.is_active else 'deactivated'}", "is_active": user.is_active}


@router.get("/logs")
def get_activity_logs(
    limit: int = Query(100),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    logs = db.query(ActivityLog).order_by(ActivityLog.created_at.desc()).limit(limit).all()
    return {"logs": [
        {
            "id": str(l.id),
            "user_id": str(l.user_id),
            "action": l.action,
            "ip_address": l.ip_address,
            "created_at": l.created_at.isoformat() if l.created_at else None,
        }
        for l in logs
    ]}


@router.get("/attacks")
def get_all_attacks(
    limit: int = Query(100),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    attacks = db.query(AttackLog).order_by(AttackLog.created_at.desc()).limit(limit).all()
    return {"attacks": [
        {
            "id": str(a.id),
            "user_id": str(a.user_id),
            "attack_type": a.attack_type.value,
            "success_rate": a.success_rate,
            "created_at": a.created_at.isoformat() if a.created_at else None,
        }
        for a in attacks
    ]}


@router.get("/system")
def get_system_stats(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    total_users = db.query(func.count(User.id)).scalar()
    total_models = db.query(func.count(MLModel.id)).scalar()
    total_trades = db.query(func.count(Trade.id)).scalar()
    total_attacks = db.query(func.count(AttackLog.id)).scalar()

    return {
        "platform": platform.system(),
        "python_version": platform.python_version(),
        "total_users": total_users,
        "total_models": total_models,
        "total_trades": total_trades,
        "total_attacks": total_attacks,
        "database": "PostgreSQL",
        "status": "healthy",
    }
