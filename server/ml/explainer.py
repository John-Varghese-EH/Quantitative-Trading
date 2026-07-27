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

"""SHAP-based explainability for model predictions."""
import numpy as np
from typing import List, Optional


def get_shap_values(model, X: np.ndarray, feature_names: List[str], model_type: str) -> dict:
    """
    Compute SHAP values for the given model.
    Falls back to feature importance for tree models; uses KernelExplainer for others.
    """
    try:
        import shap

        if model_type in ("random_forest", "xgboost"):
            explainer = shap.TreeExplainer(model)
            shap_values = explainer.shap_values(X[:50])  # Limit for speed
            if isinstance(shap_values, list):
                shap_values = shap_values[1]  # Class 1
        else:
            # KernelExplainer for other models (slower)
            background = shap.kmeans(X, min(10, len(X)))
            def predict_fn(x):
                return model.predict_proba(x)[:, 1]
            explainer = shap.KernelExplainer(predict_fn, background)
            shap_values = explainer.shap_values(X[:20], nsamples=50)

        mean_abs_shap = np.abs(shap_values).mean(axis=0)
        feature_importance = [
            {"feature": name, "importance": round(float(val), 6)}
            for name, val in sorted(
                zip(feature_names, mean_abs_shap),
                key=lambda x: x[1], reverse=True
            )
        ]

        # Sample explanation for single prediction
        single_shap = shap_values[0] if len(shap_values) > 0 else mean_abs_shap
        waterfall_data = [
            {"feature": name, "shap_value": round(float(val), 6)}
            for name, val in zip(feature_names, single_shap)
        ]

        return {
            "feature_importance": feature_importance,
            "waterfall": sorted(waterfall_data, key=lambda x: abs(x["shap_value"]), reverse=True)[:10],
            "base_value": 0.5,
        }
    except Exception as e:
        # Fallback: use feature importances if available
        return _fallback_importance(model, feature_names, str(e))


def _fallback_importance(model, feature_names: List[str], error: str = "") -> dict:
    """Use sklearn feature_importances_ if SHAP fails."""
    try:
        importances = model.feature_importances_
        data = [
            {"feature": name, "importance": round(float(val), 6)}
            for name, val in sorted(
                zip(feature_names, importances),
                key=lambda x: x[1], reverse=True
            )
        ]
        return {
            "feature_importance": data,
            "waterfall": [{"feature": d["feature"], "shap_value": d["importance"]} for d in data[:10]],
            "base_value": 0.5,
            "note": f"SHAP unavailable ({error}), using model feature_importances_",
        }
    except Exception:
        # Final fallback: uniform importance
        n = len(feature_names)
        data = [{"feature": f, "importance": round(1 / n, 6)} for f in feature_names]
        return {
            "feature_importance": data,
            "waterfall": [{"feature": d["feature"], "shap_value": d["importance"]} for d in data[:10]],
            "base_value": 0.5,
            "note": "Feature importance not available for this model type",
        }


def explain_prediction(model, x: np.ndarray, feature_names: List[str], model_type: str) -> dict:
    """
    Explain a single prediction: what features pushed the decision
    toward BUY or SELL.
    """
    prob = float(model.predict_proba(x.reshape(1, -1))[0, 1])
    direction = "BUY" if prob >= 0.5 else "SELL"
    confidence = prob if prob >= 0.5 else 1 - prob

    shap_data = get_shap_values(model, x.reshape(1, -1), feature_names, model_type)
    top_features = shap_data["feature_importance"][:5]

    reasons = []
    for feat in top_features:
        reasons.append(f"{feat['feature']} (importance: {feat['importance']:.4f})")

    return {
        "direction": direction,
        "confidence": round(confidence, 4),
        "probability": round(prob, 4),
        "top_reasons": reasons,
        "feature_importance": shap_data["feature_importance"],
        "waterfall": shap_data["waterfall"],
    }
