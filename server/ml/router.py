"""
ML API Router — train, predict, explain, list models.
Training runs in a background thread to avoid blocking the API.
"""
import threading
import uuid
from datetime import datetime, timezone
from typing import Optional

import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database.session import get_db
from database.models import MLModel, ModelType, User, Prediction
from auth.dependencies import get_current_user
from ml.trainer import train_model, load_model
from ml.explainer import explain_prediction, get_shap_values
from api.market_data import _fetch_yfinance

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
    start_date: Optional[str] = None
    end_date: Optional[str] = None


# ─── Endpoints ───────────────────────────────────────────────────────────────
@router.post("/train")
def start_training(
    body: TrainRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Start model training in background thread."""
    valid_types = [t.value for t in ModelType]
    if body.model_type not in valid_types:
        raise HTTPException(status_code=422, detail=f"model_type must be one of {valid_types}")

    # Fetch data to validate symbol before queuing
    try:
        df = _fetch_yfinance(body.symbol, body.start_date, body.end_date, body.interval)
    except Exception as e:
        raise HTTPException(status_code=422, detail=str(e))

    # Create model record
    model_id = str(uuid.uuid4())
    ml_model = MLModel(
        id=model_id,
        user_id=current_user.id,
        name=body.name,
        model_type=body.model_type,
        symbol=body.symbol.upper(),
        timeframe=body.interval,
        status="training",
        training_params=body.params,
    )
    db.add(ml_model)
    db.commit()

    # Run training in background
    background_tasks.add_task(
        _run_training_background,
        model_id=model_id,
        model_type=body.model_type,
        user_id=str(current_user.id),
        df=df,
        params=body.params,
    )

    return {"model_id": model_id, "status": "training", "message": f"Training {body.model_type} on {body.symbol}"}


def _run_training_background(model_id: str, model_type: str, user_id: str, df: pd.DataFrame, params: dict):
    """Isolated DB session for background task."""
    from database.session import SessionLocal
    db = SessionLocal()
    try:
        train_model(db, user_id, model_id, model_type, df, params)
    finally:
        db.close()


@router.get("/models")
def list_models(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    models = db.query(MLModel).filter(MLModel.user_id == current_user.id).order_by(MLModel.created_at.desc()).all()
    return {"models": [
        {
            "id": str(m.id),
            "name": m.name,
            "model_type": m.model_type.value,
            "symbol": m.symbol,
            "status": m.status,
            "accuracy": m.accuracy,
            "metrics": m.metrics,
            "created_at": m.created_at.isoformat() if m.created_at else None,
            "trained_at": m.trained_at.isoformat() if m.trained_at else None,
        }
        for m in models
    ]}


@router.get("/models/{model_id}")
def get_model(
    model_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    model = db.query(MLModel).filter(
        MLModel.id == model_id, MLModel.user_id == current_user.id
    ).first()
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    return {
        "id": str(model.id),
        "name": model.name,
        "model_type": model.model_type.value,
        "symbol": model.symbol,
        "status": model.status,
        "accuracy": model.accuracy,
        "loss": model.loss,
        "metrics": model.metrics,
        "training_params": model.training_params,
        "created_at": model.created_at.isoformat() if model.created_at else None,
        "trained_at": model.trained_at.isoformat() if model.trained_at else None,
    }


@router.delete("/models/{model_id}")
def delete_model(
    model_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    model = db.query(MLModel).filter(
        MLModel.id == model_id, MLModel.user_id == current_user.id
    ).first()
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    db.delete(model)
    db.commit()
    return {"message": "Model deleted"}


@router.post("/predict")
def predict(
    body: PredictRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Run prediction using a trained model."""
    ml_model = db.query(MLModel).filter(
        MLModel.id == body.model_id, MLModel.user_id == current_user.id
    ).first()
    if not ml_model or ml_model.status != "ready":
        raise HTTPException(status_code=400, detail="Model not ready")

    artifact = load_model(body.model_id)
    if not artifact:
        raise HTTPException(status_code=404, detail="Model artifact not found")

    # Fetch recent data for prediction
    from datetime import timedelta
    end = body.end_date or datetime.now().strftime("%Y-%m-%d")
    start = body.start_date or (datetime.now() - timedelta(days=200)).strftime("%Y-%m-%d")
    df = _fetch_yfinance(body.symbol, start, end)

    from ml.feature_engineering import engineer_features, FEATURE_COLUMNS
    df_feat = engineer_features(df)
    feat_cols = [c for c in FEATURE_COLUMNS if c in df_feat.columns]
    df_feat = df_feat[feat_cols].dropna()

    X = artifact["scaler"].transform(df_feat.values)
    model = artifact["model"]
    feature_names = artifact["features"]

    explanation = explain_prediction(model, X[-1], feature_names, ml_model.model_type.value)

    # Save prediction
    pred_record = Prediction(
        model_id=ml_model.id,
        symbol=body.symbol.upper(),
        predicted_price=float(df["close"].iloc[-1]) * (1.01 if explanation["direction"] == "BUY" else 0.99),
        direction=explanation["direction"],
        confidence=explanation["confidence"],
        features_used=feature_names,
    )
    db.add(pred_record)
    db.commit()

    return {
        "symbol": body.symbol.upper(),
        "current_price": round(float(df["close"].iloc[-1]), 4),
        "prediction": explanation,
        "model_type": ml_model.model_type.value,
        "model_accuracy": ml_model.accuracy,
    }


@router.get("/explain/{model_id}")
def explain_model(
    model_id: str,
    symbol: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get full SHAP explanation for a model."""
    ml_model = db.query(MLModel).filter(
        MLModel.id == model_id, MLModel.user_id == current_user.id
    ).first()
    if not ml_model or ml_model.status != "ready":
        raise HTTPException(status_code=400, detail="Model not ready")

    artifact = load_model(model_id)
    if not artifact:
        raise HTTPException(status_code=404, detail="Model artifact not found")

    from datetime import timedelta
    from ml.feature_engineering import engineer_features, FEATURE_COLUMNS
    df = _fetch_yfinance(symbol, 
                         (datetime.now() - timedelta(days=300)).strftime("%Y-%m-%d"),
                         datetime.now().strftime("%Y-%m-%d"))
    df_feat = engineer_features(df)
    feat_cols = [c for c in FEATURE_COLUMNS if c in df_feat.columns]
    df_feat = df_feat[feat_cols].dropna()
    X = artifact["scaler"].transform(df_feat.values)

    shap_data = get_shap_values(artifact["model"], X, artifact["features"], ml_model.model_type.value)
    return {
        "model_id": model_id,
        "symbol": symbol,
        **shap_data,
    }
