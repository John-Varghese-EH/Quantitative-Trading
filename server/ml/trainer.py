"""
Unified model trainer — dispatches to model-specific implementations.
"""
import os
import uuid
import joblib
import numpy as np
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session

from database.models import MLModel, ModelType
from ml.feature_engineering import prepare_dataset, normalize_features
from ml.evaluator import compute_metrics
from utils.logger import logger


MODELS_DIR = os.path.join(os.path.dirname(__file__), "../../models")
os.makedirs(MODELS_DIR, exist_ok=True)


def train_model(
    db: Session,
    user_id: str,
    model_id: str,
    model_type: str,
    df,
    params: dict,
) -> dict:
    """
    Main training entry point. Updates MLModel record in DB throughout.
    Returns final metrics dict.
    """
    ml_model = db.query(MLModel).filter(MLModel.id == model_id).first()
    if not ml_model:
        return {"error": "Model not found"}

    try:
        ml_model.status = "training"
        db.commit()

        X_train, X_test, y_train, y_test, feature_names = prepare_dataset(df)
        X_train_s, X_test_s, scaler = normalize_features(X_train, X_test)

        logger.info(f"Training {model_type} | Train: {len(X_train)}, Test: {len(X_test)}")

        model, y_pred, y_prob = _dispatch_train(model_type, X_train_s, X_test_s, y_train, params)

        metrics = compute_metrics(y_test, y_pred, y_prob, feature_names, X_test_s)

        # Save artifacts
        artifact_path = os.path.join(MODELS_DIR, f"{model_id}.pkl")
        joblib.dump({"model": model, "scaler": scaler, "features": feature_names, "type": model_type}, artifact_path)

        ml_model.status = "ready"
        ml_model.accuracy = metrics["accuracy"]
        ml_model.loss = metrics.get("log_loss")
        ml_model.confidence = metrics["accuracy"]
        ml_model.metrics = metrics
        ml_model.artifact_path = artifact_path
        ml_model.trained_at = datetime.now(timezone.utc)
        db.commit()

        logger.info(f"✅ Model {model_id} trained — Accuracy: {metrics['accuracy']:.3f}")
        return metrics

    except Exception as e:
        logger.error(f"Training failed: {e}")
        ml_model.status = "failed"
        db.commit()
        return {"error": str(e)}


def _dispatch_train(model_type: str, X_train, X_test, y_train, params):
    """Route to appropriate model implementation."""
    if model_type == ModelType.LINEAR_REGRESSION.value:
        from ml.models.linear_regression import train
    elif model_type == ModelType.RANDOM_FOREST.value:
        from ml.models.random_forest import train
    elif model_type == ModelType.XGBOOST.value:
        from ml.models.xgboost_model import train
    elif model_type == ModelType.LSTM.value:
        from ml.models.lstm_model import train
    elif model_type == ModelType.TRANSFORMER.value:
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
