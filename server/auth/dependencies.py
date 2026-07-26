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
