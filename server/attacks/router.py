"""Adversarial attacks API router (Firestore)."""
import numpy as np
from datetime import datetime, timezone
import uuid
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from database.firestore import get_db
from auth.dependencies import get_current_user
from ml.trainer import load_model
from ml.feature_engineering import engineer_features, FEATURE_COLUMNS
from api.market_data import _fetch_yfinance
from attacks.attacks import (
    fgsm_attack, pgd_attack, data_poisoning_attack,
    label_flipping_attack, feature_manipulation_attack, noise_injection_attack,
)

router = APIRouter()

class AttackRequest(BaseModel):
    model_id: str
    attack_type: str
    symbol: str
    params: dict = {}

@router.get("/types")
def list_attack_types(current_user: dict = Depends(get_current_user)):
    return {
        "attacks": [
            {"id": "fgsm", "name": "FGSM", "description": "Fast Gradient Sign Method — minimal perturbation", "category": "gradient"},
            {"id": "pgd", "name": "PGD", "description": "Projected Gradient Descent — iterative FGSM", "category": "gradient"},
            {"id": "data_poisoning", "name": "Data Poisoning", "description": "Corrupt training data samples", "category": "training"},
            {"id": "label_flipping", "name": "Label Flipping", "description": "Flip training labels randomly", "category": "training"},
            {"id": "feature_manipulation", "name": "Feature Manipulation", "description": "Scale key input features", "category": "input"},
            {"id": "noise_injection", "name": "Noise Injection", "description": "Add random noise to inputs", "category": "input"},
        ]
    }

@router.post("/simulate")
def simulate_attack(
    body: AttackRequest,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db),
):
    uid = current_user.get("id")
    ml_model_doc = db.collection("users").document(uid).collection("models").document(body.model_id).get()
    
    if not ml_model_doc.exists:
        raise HTTPException(status_code=404, detail="Model not found")
        
    ml_model = ml_model_doc.to_dict()
    if ml_model.get("status") != "ready":
        raise HTTPException(status_code=400, detail="Model not ready for attack")

    artifact = load_model(body.model_id)
    if not artifact:
        raise HTTPException(status_code=404, detail="Model artifact not found")

    from datetime import timedelta
    end = datetime.now().strftime("%Y-%m-%d")
    start = (datetime.now() - timedelta(days=300)).strftime("%Y-%m-%d")
    df = _fetch_yfinance(body.symbol, start, end)
    df_feat = engineer_features(df)
    feat_cols = [c for c in FEATURE_COLUMNS if c in df_feat.columns]
    df_clean = df_feat[feat_cols].dropna()
    X = artifact["scaler"].transform(df_clean.values)

    model = artifact["model"]
    attack_type = body.attack_type
    params = body.params

    orig_probs = model.predict_proba(X)[:, 1]
    orig_preds = (orig_probs >= 0.5).astype(int)

    X_adv = X.copy()
    meta = {}

    if attack_type == "fgsm":
        X_adv, meta = fgsm_attack(model, X, params.get("epsilon", 0.01))
    elif attack_type == "pgd":
        X_adv, meta = pgd_attack(model, X, params.get("epsilon", 0.05), params.get("alpha", 0.01), params.get("steps", 10))
    elif attack_type == "feature_manipulation":
        X_adv, meta = feature_manipulation_attack(X, params.get("target_features"), params.get("factor", 2.0))
    elif attack_type == "noise_injection":
        X_adv, meta = noise_injection_attack(X, params.get("noise_type", "gaussian"), params.get("scale", 0.1))
    elif attack_type in ("data_poisoning", "label_flipping"):
        X_adv, meta = noise_injection_attack(X, "gaussian", params.get("rate", 0.2))
        meta["attack"] = attack_type
    else:
        raise HTTPException(status_code=422, detail=f"Unknown attack: {attack_type}")

    adv_probs = model.predict_proba(X_adv)[:, 1]
    adv_preds = (adv_probs >= 0.5).astype(int)

    n_flipped = int(np.sum(orig_preds != adv_preds))
    success_rate = round(n_flipped / len(orig_preds) * 100, 2)
    confidence_drop = round(float(np.mean(np.abs(orig_probs - adv_probs))) * 100, 2)

    comparison = []
    for i in range(min(20, len(X))):
        comparison.append({
            "index": i,
            "original_prob": round(float(orig_probs[-20 + i]), 4),
            "original_pred": int(orig_preds[-20 + i]),
            "adversarial_prob": round(float(adv_probs[-20 + i]), 4),
            "adversarial_pred": int(adv_preds[-20 + i]),
            "flipped": bool(orig_preds[-20 + i] != adv_preds[-20 + i]),
        })

    log_id = str(uuid.uuid4())
    log_data = {
        "id": log_id,
        "user_id": uid,
        "model_id": body.model_id,
        "attack_type": attack_type,
        "parameters": {**params, **meta},
        "original_prediction": {"predictions": orig_preds[-5:].tolist(), "avg_confidence": round(float(np.mean(orig_probs)), 4)},
        "adversarial_prediction": {"predictions": adv_preds[-5:].tolist(), "avg_confidence": round(float(np.mean(adv_probs)), 4)},
        "attack_success": success_rate > 10,
        "success_rate": success_rate,
        "confidence_drop": confidence_drop,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    
    db.collection("users").document(uid).collection("attacks").document(log_id).set(log_data)

    return {
        "attack_type": attack_type,
        "model_id": body.model_id,
        "symbol": body.symbol,
        "n_samples": len(X),
        "n_flipped_predictions": n_flipped,
        "attack_success_rate": success_rate,
        "confidence_drop_pct": confidence_drop,
        "original_avg_confidence": round(float(np.mean(orig_probs)) * 100, 2),
        "adversarial_avg_confidence": round(float(np.mean(adv_probs)) * 100, 2),
        "comparison": comparison,
        "metadata": meta,
        "log_id": log_id,
    }

@router.get("/history")
def get_attack_history(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db),
):
    uid = current_user.get("id")
    docs = db.collection("users").document(uid).collection("attacks").order_by("created_at", direction="DESCENDING").limit(50).stream()
    
    history = []
    for doc in docs:
        l = doc.to_dict()
        history.append({
            "id": l.get("id"),
            "attack_type": l.get("attack_type"),
            "success_rate": l.get("success_rate"),
            "confidence_drop": l.get("confidence_drop"),
            "created_at": l.get("created_at"),
        })
    return {"history": history}
