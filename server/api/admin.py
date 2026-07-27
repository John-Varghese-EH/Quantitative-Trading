# QuantAdv - Quantitative Trading Platform
# Copyright (C) 2026 John Varghese (J0X)
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published
# by the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program. If not, see <https://www.gnu.org/licenses/>.

"""Admin panel API — user management, logs, system stats (Firestore)."""
from fastapi import APIRouter, Depends, HTTPException, Query
from database.firestore import get_db
from auth.dependencies import require_admin
import platform

router = APIRouter()

@router.get("/users")
def list_users(
    limit: int = Query(50),
    offset: int = Query(0), # Note: Offset pagination in Firestore is tricky without cursors
    admin: dict = Depends(require_admin),
    db = Depends(get_db),
):
    users_ref = db.collection("users")
    docs = list(users_ref.limit(limit).stream())
    
    users = []
    for doc in docs:
        u = doc.to_dict()
        users.append({
            "id": doc.id,
            "email": u.get("email"),
            "username": u.get("username"),
            "full_name": u.get("full_name"),
            "role": u.get("role", "user"),
            "is_active": u.get("is_active", True),
            "is_verified": u.get("is_verified", False),
            "created_at": u.get("created_at"),
            "last_login": u.get("last_login"),
        })
        
    return {
        "total": len(docs), # Simplified
        "users": users,
    }


@router.delete("/users/{user_id}")
def delete_user(
    user_id: str,
    admin: dict = Depends(require_admin),
    db = Depends(get_db),
):
    user_ref = db.collection("users").document(user_id)
    doc = user_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="User not found")
        
    user = doc.to_dict()
    if user.get("role") == "admin":
        raise HTTPException(status_code=403, detail="Cannot delete admin users")
        
    user_ref.delete()
    return {"message": f"User {user.get('username')} deleted"}


@router.patch("/users/{user_id}/toggle-active")
def toggle_user_active(
    user_id: str,
    admin: dict = Depends(require_admin),
    db = Depends(get_db),
):
    user_ref = db.collection("users").document(user_id)
    doc = user_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="User not found")
        
    user = doc.to_dict()
    new_status = not user.get("is_active", True)
    user_ref.update({"is_active": new_status})
    
    return {"message": f"User {'activated' if new_status else 'deactivated'}", "is_active": new_status}


@router.get("/logs")
def get_activity_logs(
    limit: int = Query(100),
    admin: dict = Depends(require_admin),
    db = Depends(get_db),
):
    # Fetch logs across all users (requires collectionGroup in Firestore if nested)
    # Assuming logs are stored globally for admins
    logs_ref = db.collection("activity_logs")
    docs = list(logs_ref.order_by("created_at", direction="DESCENDING").limit(limit).stream())
    
    logs = []
    for doc in docs:
        l = doc.to_dict()
        logs.append({
            "id": doc.id,
            "user_id": l.get("user_id"),
            "action": l.get("action"),
            "ip_address": l.get("ip_address"),
            "created_at": l.get("created_at"),
        })
    return {"logs": logs}


@router.get("/attacks")
def get_all_attacks(
    limit: int = Query(100),
    admin: dict = Depends(require_admin),
    db = Depends(get_db),
):
    # Cross-user attacks via collectionGroup
    attacks_ref = db.collection_group("attacks")
    docs = list(attacks_ref.limit(limit).stream())
    
    attacks = []
    for doc in docs:
        a = doc.to_dict()
        attacks.append({
            "id": doc.id,
            "user_id": a.get("user_id"),
            "attack_type": a.get("attack_type"),
            "success_rate": a.get("success_rate"),
            "created_at": a.get("created_at"),
        })
    return {"attacks": attacks}


@router.get("/system")
def get_system_stats(admin: dict = Depends(require_admin), db = Depends(get_db)):
    # Very expensive in Firestore to count all, simplified for now
    total_users = len(list(db.collection("users").limit(1000).stream()))
    
    return {
        "platform": platform.system(),
        "python_version": platform.python_version(),
        "total_users": total_users,
        "total_models": "N/A (Firestore)",
        "total_trades": "N/A (Firestore)",
        "total_attacks": "N/A (Firestore)",
        "database": "Firebase Firestore",
        "status": "healthy",
    }
