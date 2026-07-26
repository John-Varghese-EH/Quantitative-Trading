import os
import firebase_admin
from firebase_admin import credentials, firestore
from config import settings
from utils.logger import logger

def init_firebase():
    """Initialize Firebase Admin SDK"""
    if not firebase_admin._apps:
        try:
            # Check if service account file exists
            if os.path.exists(settings.FIREBASE_SERVICE_ACCOUNT_PATH):
                cred = credentials.Certificate(settings.FIREBASE_SERVICE_ACCOUNT_PATH)
                firebase_admin.initialize_app(cred)
                logger.info("✅ Firebase Admin SDK initialized with service account.")
            elif settings.FIREBASE_PROJECT_ID:
                # Use default credentials (e.g., in Google Cloud environment)
                firebase_admin.initialize_app(options={'projectId': settings.FIREBASE_PROJECT_ID})
                logger.info("✅ Firebase Admin SDK initialized with default credentials.")
            else:
                # Mock initialization for local dev without credentials
                os.environ["FIRESTORE_EMULATOR_HOST"] = "localhost:8080"
                os.environ["FIREBASE_AUTH_EMULATOR_HOST"] = "localhost:9099"
                firebase_admin.initialize_app(options={'projectId': 'demo-quantadv'})
                logger.warning("⚠️ Firebase Admin initialized in EMULATOR/DEMO mode.")
        except Exception as e:
            logger.error(f"❌ Failed to initialize Firebase: {e}")

# Call immediately on import
init_firebase()

# Export Firestore client
db = firestore.client()

def get_db():
    """Dependency injection for FastAPI"""
    return db
