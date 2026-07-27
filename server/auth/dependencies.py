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

"""FastAPI dependencies for authentication and authorization using Firebase."""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth
from database.firestore import get_db

security = HTTPBearer()

def get_current_user(
    cred: HTTPAuthorizationCredentials = Depends(security),
    db = Depends(get_db),
):
    """Verify Firebase ID token and return user profile from Firestore."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        token = cred.credentials
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token.get("uid")
    except Exception as e:
        raise credentials_exception

    # Fetch user data from Firestore
    user_ref = db.collection("users").document(uid)
    user_doc = user_ref.get()
    
    if not user_doc.exists:
        # Auto-create user if they don't exist in Firestore but have a valid Firebase Auth token
        user_data = {
            "id": uid,
            "email": decoded_token.get("email"),
            "username": decoded_token.get("email", "").split("@")[0] if decoded_token.get("email") else "user",
            "role": "user",
            "is_active": True,
            "is_verified": decoded_token.get("email_verified", False),
        }
        user_ref.set(user_data)
        return user_data

    user_data = user_doc.to_dict()
    user_data["id"] = uid
    
    if not user_data.get("is_active", True):
        raise credentials_exception
        
    return user_data

def require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user

def get_current_active_user(current_user: dict = Depends(get_current_user)) -> dict:
    if not current_user.get("is_active", True):
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user
