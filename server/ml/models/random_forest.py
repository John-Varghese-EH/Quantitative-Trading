"""Random Forest classifier."""
from sklearn.ensemble import RandomForestClassifier


def train(X_train, X_test, y_train, params: dict):
    n_estimators = params.get("n_estimators", 100)
    max_depth = params.get("max_depth", None)
    min_samples_split = params.get("min_samples_split", 2)
    
    model = RandomForestClassifier(
        n_estimators=n_estimators,
        max_depth=max_depth,
        min_samples_split=min_samples_split,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]
    return model, y_pred, y_prob
