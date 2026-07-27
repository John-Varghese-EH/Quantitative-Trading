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
Unified model trainer — dispatches to model-specific implementations (Firestore).
"""
import os
import joblib
from datetime import datetime, timezone
from typing import Optional

from ml.feature_engineering import prepare_dataset, normalize_features
from ml.evaluator import compute_metrics
from utils.logger import logger

MODELS_DIR = os.path.join(os.path.dirname(__file__), "../../models")
os.makedirs(MODELS_DIR, exist_ok=True)

def train_model_firestore(
    db,
    user_id: str,
    model_id: str,
    model_type: str,
    df,
    params: dict,
) -> dict:
    """
    Main training entry point for Firestore. Updates model document throughout.
    Returns final metrics dict.
    """
    model_ref = db.collection("users").document(user_id).collection("models").document(model_id)
    doc = model_ref.get()
    
    if not doc.exists:
        return {"error": "Model not found"}

    try:
        model_ref.update({"status": "training"})

        X_train, X_test, y_train, y_test, feature_names = prepare_dataset(df)
        X_train_s, X_test_s, scaler = normalize_features(X_train, X_test)

        logger.info(f"Training {model_type} | Train: {len(X_train)}, Test: {len(X_test)}")

        model, y_pred, y_prob = _dispatch_train(model_type, X_train_s, X_test_s, y_train, params)

        metrics = compute_metrics(y_test, y_pred, y_prob, feature_names, X_test_s)

        artifact_path = os.path.join(MODELS_DIR, f"{model_id}.pkl")
        joblib.dump({"model": model, "scaler": scaler, "features": feature_names, "type": model_type}, artifact_path)

        model_ref.update({
            "status": "ready",
            "accuracy": metrics.get("accuracy"),
            "loss": metrics.get("log_loss"),
            "confidence": metrics.get("accuracy"),
            "metrics": metrics,
            "artifact_path": artifact_path,
            "trained_at": datetime.now(timezone.utc).isoformat()
        })

        logger.info(f"✅ Model {model_id} trained — Accuracy: {metrics.get('accuracy', 0):.3f}")
        return metrics

    except Exception as e:
        logger.error(f"Training failed: {e}")
        model_ref.update({"status": "failed", "error": str(e)})
        return {"error": str(e)}


def _dispatch_train(model_type: str, X_train, X_test, y_train, params):
    """Route to appropriate model implementation."""
    if model_type == "linear_regression":
        from ml.models.linear_regression import train
    elif model_type == "random_forest":
        from ml.models.random_forest import train
    elif model_type == "xgboost":
        from ml.models.xgboost_model import train
    elif model_type == "lstm":
        from ml.models.lstm_model import train
    elif model_type == "transformer":
        from ml.models.transformer_model import train
    else:
        raise ValueError(f"Unknown model type: {model_type}")

    return train(X_train, X_test, y_train, params)


def load_model(model_id: str) -> Optional[dict]:
    """Load a saved model artifact."""
    path = os.path.join(MODELS_DIR, f"{model_id}.pkl")
    if not os.path.exists(path):
        return None
    return joblib.load(path)
