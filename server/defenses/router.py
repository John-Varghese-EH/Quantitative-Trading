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

"""Defenses API router (Firestore)."""
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sklearn.metrics import accuracy_score

from api.market_data import _fetch_yfinance
from auth.dependencies import get_current_user
from database.firestore import get_db
from defenses.defenses import (
    adversarial_training,
    defensive_distillation,
    feature_sanitization,
    input_validation,
    outlier_detection,
)
from ml.feature_engineering import normalize_features, prepare_dataset
from ml.trainer import load_model

router = APIRouter()

class DefenseRequest(BaseModel):
    model_id: str
    defense_type: str
    symbol: str
    params: dict = {}

@router.get("/types")
def list_defense_types(current_user: dict = Depends(get_current_user)):
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
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db),
):
    """Apply a defense mechanism and evaluate improvement."""
    uid = current_user.get("id")
    ml_model_doc = db.collection("users").document(uid).collection("models").document(body.model_id).get()
    
    if not ml_model_doc.exists:
        raise HTTPException(status_code=404, detail="Model not found")
        
    ml_model = ml_model_doc.to_dict()
    if ml_model.get("status") != "ready":
        raise HTTPException(status_code=400, detail="Model not ready")

    artifact = load_model(body.model_id)
    if not artifact:
        raise HTTPException(status_code=404, detail="Model artifact not found")

    end = datetime.now().strftime("%Y-%m-%d")
    start = (datetime.now() - timedelta(days=365)).strftime("%Y-%m-%d")
    df = _fetch_yfinance(body.symbol, start, end)
    X_train, X_test, y_train, y_test, feature_names = prepare_dataset(df)
    X_train_s, X_test_s, scaler = normalize_features(X_train, X_test)

    model = artifact["model"]
    model_type = ml_model.get("model_type")
    params = body.params
    defense_type = body.defense_type

    y_pred_before = model.predict(X_test_s)
    min_len = min(len(y_test), len(y_pred_before))
    acc_before = round(float(accuracy_score(y_test[:min_len], y_pred_before[:min_len])), 4)

    meta = {}
    defended_model = model
    X_test_defended = X_test_s

    if defense_type == "adversarial_training":
        defended_model, meta = adversarial_training(model, X_train_s, y_train, params.get("epsilon", 0.01), model_type)
    elif defense_type == "input_validation":
        X_test_defended, meta = input_validation(X_test_s, X_train_s, params.get("z_thresh", 3.0))
    elif defense_type == "outlier_detection":
        X_test_defended, meta = outlier_detection(X_test_s, X_train_s, params.get("contamination", 0.05))
    elif defense_type == "defensive_distillation":
        defended_model, meta = defensive_distillation(model, X_train_s, y_train, params.get("temperature", 10.0), model_type)
    elif defense_type == "feature_sanitization":
        X_test_defended, meta = feature_sanitization(X_test_s, X_train_s)
    else:
        raise HTTPException(status_code=422, detail=f"Unknown defense: {defense_type}")

    n = min(len(X_test_defended), len(y_test))
    y_pred_after = defended_model.predict(X_test_defended[:n])
    min_len2 = min(len(y_test[:n]), len(y_pred_after))
    acc_after = round(float(accuracy_score(y_test[:min_len2], y_pred_after[:min_len2])), 4)

    improvement = round((acc_after - acc_before) * 100, 2)
    security_score = min(100, round(acc_after * 80 + (max(0, improvement)) + 10, 1))

    log_id = str(uuid.uuid4())
    log_data = {
        "id": log_id,
        "user_id": uid,
        "model_id": body.model_id,
        "defense_type": defense_type,
        "accuracy_before": acc_before,
        "accuracy_after": acc_after,
        "security_score": security_score,
        "results": {**meta, "improvement": improvement},
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    db.collection("users").document(uid).collection("defenses").document(log_id).set(log_data)

    return {
        "defense_type": defense_type,
        "model_id": body.model_id,
        "accuracy_before": acc_before,
        "accuracy_after": acc_after,
        "improvement_pct": improvement,
        "security_score": security_score,
        "metadata": meta,
        "log_id": log_id,
    }

@router.get("/history")
def get_defense_history(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db),
):
    uid = current_user.get("id")
    docs = db.collection("users").document(uid).collection("defenses").order_by("created_at", direction="DESCENDING").limit(20).stream()
    
    history = []
    for doc in docs:
        l = doc.to_dict()
        history.append({
            "id": l.get("id"),
            "defense_type": l.get("defense_type"),
            "accuracy_before": l.get("accuracy_before"),
            "accuracy_after": l.get("accuracy_after"),
            "security_score": l.get("security_score"),
            "created_at": l.get("created_at"),
        })
    return {"history": history}
