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

"""
Data Access Objects (DAOs) for Firebase Firestore.
Replaces SQLAlchemy ORM models.
"""
import uuid
from datetime import datetime, timezone
from typing import Any

from google.cloud.firestore_v1.client import Client


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class UserDAO:
    collection = "users"

    @classmethod
    def create_or_update(cls, db: Client, uid: str, email: str, username: str, full_name: str, role: str = "user") -> dict[str, Any]:
        ref = db.collection(cls.collection).document(uid)
        doc = ref.get()
        if not doc.exists:
            data = {
                "id": uid,
                "email": email,
                "username": username,
                "full_name": full_name,
                "role": role,
                "is_active": True,
                "created_at": now_iso(),
                "updated_at": now_iso()
            }
            ref.set(data)
            return data
        
        # Update existing
        data = doc.to_dict()
        data["updated_at"] = now_iso()
        ref.update({"updated_at": data["updated_at"]})
        return data

    @classmethod
    def get_by_id(cls, db: Client, uid: str) -> dict[str, Any] | None:
        doc = db.collection(cls.collection).document(uid).get()
        return doc.to_dict() if doc.exists else None


class MLModelDAO:
    collection = "ml_models"

    @classmethod
    def create(cls, db: Client, user_id: str, name: str, model_type: str, status: str = "untrained") -> dict[str, Any]:
        doc_id = str(uuid.uuid4())
        data = {
            "id": doc_id,
            "user_id": user_id,
            "name": name,
            "model_type": model_type,
            "status": status,
            "metrics": {},
            "hyperparameters": {},
            "created_at": now_iso(),
            "updated_at": now_iso()
        }
        db.collection(cls.collection).document(doc_id).set(data)
        return data

    @classmethod
    def get_by_user(cls, db: Client, user_id: str) -> list[dict[str, Any]]:
        docs = db.collection(cls.collection).where("user_id", "==", user_id).stream()
        return [doc.to_dict() for doc in docs]


class TradeDAO:
    collection = "trades"

    @classmethod
    def create(cls, db: Client, user_id: str, symbol: str, quantity: float, price: float, trade_type: str, model_id: str | None = None) -> dict[str, Any]:
        doc_id = str(uuid.uuid4())
        data = {
            "id": doc_id,
            "user_id": user_id,
            "model_id": model_id,
            "symbol": symbol,
            "quantity": quantity,
            "price": price,
            "trade_type": trade_type,
            "timestamp": now_iso()
        }
        db.collection(cls.collection).document(doc_id).set(data)
        return data

    @classmethod
    def get_by_user(cls, db: Client, user_id: str) -> list[dict[str, Any]]:
        docs = db.collection(cls.collection).where("user_id", "==", user_id).stream()
        return [doc.to_dict() for doc in docs]


class AttackDAO:
    collection = "attacks"

    @classmethod
    def create(cls, db: Client, user_id: str, model_id: str, attack_type: str, success: bool, confidence_drop: float) -> dict[str, Any]:
        doc_id = str(uuid.uuid4())
        data = {
            "id": doc_id,
            "user_id": user_id,
            "model_id": model_id,
            "attack_type": attack_type,
            "success": success,
            "confidence_drop": confidence_drop,
            "timestamp": now_iso()
        }
        db.collection(cls.collection).document(doc_id).set(data)
        return data

    @classmethod
    def get_by_user(cls, db: Client, user_id: str) -> list[dict[str, Any]]:
        docs = db.collection(cls.collection).where("user_id", "==", user_id).stream()
        return [doc.to_dict() for doc in docs]
