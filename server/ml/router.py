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
ML API Router — train, predict, explain, list models (Firestore).
Training runs in a background thread to avoid blocking the API.
"""
import uuid
from datetime import datetime, timezone

import pandas as pd
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from pydantic import BaseModel

from api.market_data import _fetch_yfinance
from auth.dependencies import get_current_user
from database.firestore import get_db
from ml.explainer import explain_prediction, get_shap_values
from ml.trainer import load_model, train_model_firestore

router = APIRouter()


# ─── Schemas ─────────────────────────────────────────────────────────────────
class TrainRequest(BaseModel):
    name: str
    model_type: str
    symbol: str
    start_date: str
    end_date: str
    interval: str = "1d"
    params: dict = {}


class PredictRequest(BaseModel):
    model_id: str
    symbol: str
    start_date: str | None = None
    end_date: str | None = None


# ─── Endpoints ───────────────────────────────────────────────────────────────
@router.post("/train")
def start_training(
    body: TrainRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db),
):
    """Start model training in background thread."""
    valid_types = ["linear_regression", "random_forest", "xgboost", "lstm", "transformer"]
    if body.model_type not in valid_types:
        raise HTTPException(status_code=422, detail=f"model_type must be one of {valid_types}")

    try:
        df = _fetch_yfinance(body.symbol, body.start_date, body.end_date, body.interval)
    except Exception as e:
        raise HTTPException(status_code=422, detail=str(e))

    model_id = str(uuid.uuid4())
    uid = current_user.get("id")
    
    ml_model = {
        "id": model_id,
        "name": body.name,
        "model_type": body.model_type,
        "symbol": body.symbol.upper(),
        "timeframe": body.interval,
        "status": "training",
        "training_params": body.params,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "accuracy": None,
        "loss": None,
        "metrics": None
    }
    
    db.collection("users").document(uid).collection("models").document(model_id).set(ml_model)

    background_tasks.add_task(
        _run_training_background,
        model_id=model_id,
        model_type=body.model_type,
        user_id=uid,
        df=df,
        params=body.params,
    )

    return {"model_id": model_id, "status": "training", "message": f"Training {body.model_type} on {body.symbol}"}


def _run_training_background(model_id: str, model_type: str, user_id: str, df: pd.DataFrame, params: dict):
    """Isolated task for background."""
    from database.firestore import get_db
    db = get_db()
    # Mocking train_model_firestore since ML dependencies need to be refactored too
    try:
        train_model_firestore(db, user_id, model_id, model_type, df, params)
    except Exception as e:
        db.collection("users").document(user_id).collection("models").document(model_id).update({
            "status": "failed",
            "error": str(e)
        })


@router.get("/models")
def list_models(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db),
):
    uid = current_user.get("id")
    docs = db.collection("users").document(uid).collection("models").order_by("created_at", direction="DESCENDING").stream()
    return {"models": [doc.to_dict() for doc in docs]}


@router.get("/models/{model_id}")
def get_model(
    model_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db),
):
    uid = current_user.get("id")
    doc = db.collection("users").document(uid).collection("models").document(model_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Model not found")
    return doc.to_dict()


@router.delete("/models/{model_id}")
def delete_model(
    model_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db),
):
    uid = current_user.get("id")
    doc_ref = db.collection("users").document(uid).collection("models").document(model_id)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Model not found")
    doc_ref.delete()
    return {"message": "Model deleted"}


@router.post("/predict")
def predict(
    body: PredictRequest,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db),
):
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

    from datetime import timedelta
    end = body.end_date or datetime.now().strftime("%Y-%m-%d")
    start = body.start_date or (datetime.now() - timedelta(days=200)).strftime("%Y-%m-%d")
    df = _fetch_yfinance(body.symbol, start, end)

    from ml.feature_engineering import FEATURE_COLUMNS, engineer_features
    df_feat = engineer_features(df)
    feat_cols = [c for c in FEATURE_COLUMNS if c in df_feat.columns]
    df_feat = df_feat[feat_cols].dropna()

    X = artifact["scaler"].transform(df_feat.values)
    model = artifact["model"]
    feature_names = artifact["features"]

    explanation = explain_prediction(model, X[-1], feature_names, ml_model.get("model_type"))

    # Save prediction
    pred_record = {
        "model_id": ml_model.get("id"),
        "symbol": body.symbol.upper(),
        "predicted_price": float(df["close"].iloc[-1]) * (1.01 if explanation["direction"] == "BUY" else 0.99),
        "direction": explanation["direction"],
        "confidence": explanation["confidence"],
        "features_used": feature_names,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    db.collection("users").document(uid).collection("predictions").add(pred_record)

    return {
        "symbol": body.symbol.upper(),
        "current_price": round(float(df["close"].iloc[-1]), 4),
        "prediction": explanation,
        "model_type": ml_model.get("model_type"),
        "model_accuracy": ml_model.get("accuracy"),
    }


@router.get("/explain/{model_id}")
def explain_model(
    model_id: str,
    symbol: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db),
):
    uid = current_user.get("id")
    ml_model_doc = db.collection("users").document(uid).collection("models").document(model_id).get()
    
    if not ml_model_doc.exists or ml_model_doc.to_dict().get("status") != "ready":
        raise HTTPException(status_code=400, detail="Model not ready or not found")

    artifact = load_model(model_id)
    if not artifact:
        raise HTTPException(status_code=404, detail="Model artifact not found")

    from datetime import timedelta

    from ml.feature_engineering import FEATURE_COLUMNS, engineer_features
    df = _fetch_yfinance(symbol, 
                         (datetime.now() - timedelta(days=300)).strftime("%Y-%m-%d"),
                         datetime.now().strftime("%Y-%m-%d"))
    df_feat = engineer_features(df)
    feat_cols = [c for c in FEATURE_COLUMNS if c in df_feat.columns]
    df_feat = df_feat[feat_cols].dropna()
    X = artifact["scaler"].transform(df_feat.values)

    shap_data = get_shap_values(artifact["model"], X, artifact["features"], ml_model_doc.to_dict().get("model_type"))
    return {
        "model_id": model_id,
        "symbol": symbol,
        **shap_data,
    }
