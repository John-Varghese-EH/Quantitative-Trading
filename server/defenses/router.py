"""Defenses API router."""
import numpy as np
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database.session import get_db
from database.models import User, DefenseLog, DefenseType, MLModel
from auth.dependencies import get_current_user
from ml.trainer import load_model
from ml.feature_engineering import engineer_features, FEATURE_COLUMNS, prepare_dataset, normalize_features
from api.market_data import _fetch_yfinance
from defenses.defenses import (
    adversarial_training, input_validation,
    outlier_detection, defensive_distillation, feature_sanitization,
)
from sklearn.metrics import accuracy_score

router = APIRouter()


class DefenseRequest(BaseModel):
    model_id: str
    defense_type: str
    symbol: str
    params: dict = {}


@router.get("/types")
def list_defense_types(current_user: User = Depends(get_current_user)):
    return {
        "defenses": [
            {"id": "adversarial_training", "name": "Adversarial Training", "description": "Augment training with adversarial examples"},
            {"id": "input_validation", "name": "Input Validation", "description": "Validate and clip anomalous inputs"},
            {"id": "outlier_detection", "name": "Outlier Detection", "description": "Remove outliers using Isolation Forest"},
            {"id": "defensive_distillation", "name": "Defensive Distillation", "description": "Train on soft labels to reduce gradient sensitivity"},
            {"id": "feature_sanitization", "name": "Feature Sanitization", "description": "PCA-based reconstruction to remove perturbations"},
        ]
    }


@router.post("/apply")
def apply_defense(
    body: DefenseRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Apply a defense mechanism and evaluate improvement."""
    ml_model = db.query(MLModel).filter(
        MLModel.id == body.model_id,
        MLModel.user_id == current_user.id,
    ).first()
    if not ml_model or ml_model.status != "ready":
        raise HTTPException(status_code=400, detail="Model not ready")

    artifact = load_model(body.model_id)
    if not artifact:
        raise HTTPException(status_code=404, detail="Model artifact not found")

    # Fetch data
    end = datetime.now().strftime("%Y-%m-%d")
    start = (datetime.now() - timedelta(days=365)).strftime("%Y-%m-%d")
    df = _fetch_yfinance(body.symbol, start, end)
    X_train, X_test, y_train, y_test, feature_names = prepare_dataset(df)
    X_train_s, X_test_s, scaler = normalize_features(X_train, X_test)

    model = artifact["model"]
    model_type = ml_model.model_type.value
    params = body.params
    defense_type = body.defense_type

    # Baseline accuracy
    y_pred_before = model.predict(X_test_s)
    min_len = min(len(y_test), len(y_pred_before))
    acc_before = round(float(accuracy_score(y_test[:min_len], y_pred_before[:min_len])), 4)

    meta = {}
    defended_model = model
    X_test_defended = X_test_s

    if defense_type == "adversarial_training":
        defended_model, meta = adversarial_training(model, X_train_s, y_train,
                                                     params.get("epsilon", 0.01), model_type)
    elif defense_type == "input_validation":
        X_test_defended, meta = input_validation(X_test_s, X_train_s, params.get("z_thresh", 3.0))
    elif defense_type == "outlier_detection":
        X_test_defended, meta = outlier_detection(X_test_s, X_train_s, params.get("contamination", 0.05))
    elif defense_type == "defensive_distillation":
        defended_model, meta = defensive_distillation(model, X_train_s, y_train,
                                                       params.get("temperature", 10.0), model_type)
    elif defense_type == "feature_sanitization":
        X_test_defended, meta = feature_sanitization(X_test_s, X_train_s)
    else:
        raise HTTPException(status_code=422, detail=f"Unknown defense: {defense_type}")

    # Post-defense accuracy
    n = min(len(X_test_defended), len(y_test))
    y_pred_after = defended_model.predict(X_test_defended[:n])
    min_len2 = min(len(y_test[:n]), len(y_pred_after))
    acc_after = round(float(accuracy_score(y_test[:min_len2], y_pred_after[:min_len2])), 4)

    improvement = round((acc_after - acc_before) * 100, 2)
    security_score = min(100, round(acc_after * 80 + (improvement if improvement > 0 else 0) + 10, 1))

    # Log defense
    log = DefenseLog(
        user_id=current_user.id,
        model_id=ml_model.id,
        defense_type=defense_type,
        accuracy_before=acc_before,
        accuracy_after=acc_after,
        security_score=security_score,
        results={**meta, "improvement": improvement},
    )
    db.add(log)
    db.commit()

    return {
        "defense_type": defense_type,
        "model_id": body.model_id,
        "accuracy_before": acc_before,
        "accuracy_after": acc_after,
        "improvement_pct": improvement,
        "security_score": security_score,
        "metadata": meta,
        "log_id": str(log.id),
    }


@router.get("/history")
def get_defense_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    logs = db.query(DefenseLog).filter(
        DefenseLog.user_id == current_user.id
    ).order_by(DefenseLog.created_at.desc()).limit(20).all()
    return {"history": [
        {
            "id": str(l.id),
            "defense_type": l.defense_type.value,
            "accuracy_before": l.accuracy_before,
            "accuracy_after": l.accuracy_after,
            "security_score": l.security_score,
            "created_at": l.created_at.isoformat() if l.created_at else None,
        }
        for l in logs
    ]}
