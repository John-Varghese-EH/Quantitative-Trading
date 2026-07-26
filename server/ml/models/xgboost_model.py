"""XGBoost classifier."""
import xgboost as xgb


def train(X_train, X_test, y_train, params: dict):
    model = xgb.XGBClassifier(
        n_estimators=params.get("n_estimators", 200),
        max_depth=params.get("max_depth", 6),
        learning_rate=params.get("learning_rate", 0.1),
        subsample=params.get("subsample", 0.8),
        colsample_bytree=params.get("colsample_bytree", 0.8),
        use_label_encoder=False,
        eval_metric="logloss",
        random_state=42,
        n_jobs=-1,
    )
    eval_set = [(X_test, y_train[:len(X_test)])]
    model.fit(
        X_train, y_train,
        eval_set=[(X_test, y_train[:len(X_test)] if len(y_train) > len(X_test) else y_train)],
        verbose=False,
    )
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]
    return model, y_pred, y_prob
