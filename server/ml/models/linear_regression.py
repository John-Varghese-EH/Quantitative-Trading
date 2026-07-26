"""Linear Regression model for binary classification via threshold."""
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.calibration import CalibratedClassifierCV


def train(X_train, X_test, y_train, params: dict):
    C = params.get("C", 1.0)
    max_iter = params.get("max_iter", 1000)
    
    base = LogisticRegression(C=C, max_iter=max_iter, random_state=42, n_jobs=-1)
    model = CalibratedClassifierCV(base, cv=3)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]
    
    return model, y_pred, y_prob
