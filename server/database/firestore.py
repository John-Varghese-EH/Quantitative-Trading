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

import json
import os

import firebase_admin
from firebase_admin import credentials, firestore

from config import settings
from utils.logger import logger


def init_firebase():
    """Initialize Firebase Admin SDK"""
    if not firebase_admin._apps:
        try:
            # Check if JSON string is provided in env (e.g. on Render)
            if settings.FIREBASE_SERVICE_ACCOUNT_JSON:
                cred_dict = json.loads(settings.FIREBASE_SERVICE_ACCOUNT_JSON)
                cred = credentials.Certificate(cred_dict)
                firebase_admin.initialize_app(cred)
                logger.info("✅ Firebase Admin SDK initialized from JSON environment variable.")
            # Check if service account file exists (Local dev)
            elif os.path.exists(settings.FIREBASE_SERVICE_ACCOUNT_PATH):
                cred = credentials.Certificate(settings.FIREBASE_SERVICE_ACCOUNT_PATH)
                firebase_admin.initialize_app(cred)
                logger.info("✅ Firebase Admin SDK initialized with service account file.")
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
