"""Model evaluation utilities: metrics, confusion matrix, loss curves."""
import numpy as np
from typing import List, Optional
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, log_loss, confusion_matrix,
)


def compute_metrics(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    y_prob: np.ndarray,
    feature_names: List[str],
    X_test: np.ndarray,
) -> dict:
    """Compute full classification metrics."""
    # Align lengths (LSTM/Transformer may produce shorter predictions)
    min_len = min(len(y_true), len(y_pred), len(y_prob))
    y_true = y_true[:min_len]
    y_pred = y_pred[:min_len]
    y_prob = y_prob[:min_len]

    acc = float(accuracy_score(y_true, y_pred))
    prec = float(precision_score(y_true, y_pred, zero_division=0))
    rec = float(recall_score(y_true, y_pred, zero_division=0))
    f1 = float(f1_score(y_true, y_pred, zero_division=0))
    auc = float(roc_auc_score(y_true, y_prob)) if len(np.unique(y_true)) > 1 else 0.5
    ll = float(log_loss(y_true, y_prob)) if len(np.unique(y_true)) > 1 else 1.0
    cm = confusion_matrix(y_true, y_pred).tolist()

    return {
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4),
        "roc_auc": round(auc, 4),
        "log_loss": round(ll, 4),
        "confusion_matrix": cm,
        "n_samples": min_len,
        "n_features": len(feature_names),
        "feature_names": feature_names,
    }
