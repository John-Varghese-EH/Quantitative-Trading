"""
Auth router: simplified for Firebase Authentication.
"""
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel

from database.firestore import get_db
from auth.dependencies import get_current_user

router = APIRouter()

class RegisterRequest(BaseModel):
    email: str
    username: str
    full_name: str = ""

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(body: RegisterRequest, current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    """
    Update profile data after Firebase Auth registration.
    The user is already authenticated via Firebase ID token.
    """
    uid = current_user.get("id")
    
    # Check if username is taken by someone else
    users_ref = db.collection("users")
    docs = users_ref.where("username", "==", body.username).stream()
    for doc in docs:
        if doc.id != uid:
            raise HTTPException(status_code=400, detail="Username already taken")
            
    # Update Firestore document
    user_data = {
        "username": body.username.lower(),
        "full_name": body.full_name,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    users_ref.document(uid).update(user_data)
    
    return {"message": "Profile updated successfully"}


@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
    """Get current authenticated user profile."""
    return current_user


@router.post("/logout")
def logout(current_user: dict = Depends(get_current_user)):
    """Logout (handled primarily client-side with Firebase)."""
    return {"message": "Logged out successfully"}
