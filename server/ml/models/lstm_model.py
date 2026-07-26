"""
LSTM model using TensorFlow/Keras for sequential financial time series.
"""
import numpy as np
from typing import Tuple


def _reshape_for_lstm(X: np.ndarray, timesteps: int = 10) -> np.ndarray:
    """Reshape flat features into (samples, timesteps, features) for LSTM."""
    n_samples, n_features = X.shape
    # Pad if not enough samples
    if n_samples < timesteps:
        pad = np.zeros((timesteps - n_samples, n_features))
        X = np.vstack([pad, X])
    sequences = []
    for i in range(timesteps, len(X) + 1):
        sequences.append(X[i - timesteps:i])
    return np.array(sequences)


def train(X_train, X_test, y_train, params: dict):
    import tensorflow as tf
    from tensorflow import keras

    timesteps = params.get("timesteps", 10)
    units = params.get("units", 64)
    dropout = params.get("dropout", 0.2)
    epochs = params.get("epochs", 20)
    batch_size = params.get("batch_size", 32)

    # Reshape for LSTM
    X_train_seq = _reshape_for_lstm(X_train, timesteps)
    X_test_seq = _reshape_for_lstm(X_test, timesteps)
    y_train_seq = y_train[timesteps - 1:] if len(y_train) >= timesteps else y_train

    # Align lengths
    min_len = min(len(X_train_seq), len(y_train_seq))
    X_train_seq = X_train_seq[:min_len]
    y_train_seq = y_train_seq[:min_len]

    n_features = X_train.shape[1]

    # Build LSTM model
    model = keras.Sequential([
        keras.layers.LSTM(units, return_sequences=True, input_shape=(timesteps, n_features)),
        keras.layers.Dropout(dropout),
        keras.layers.LSTM(units // 2),
        keras.layers.Dropout(dropout),
        keras.layers.Dense(32, activation="relu"),
        keras.layers.Dense(1, activation="sigmoid"),
    ])

    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=0.001),
        loss="binary_crossentropy",
        metrics=["accuracy"],
    )

    model.fit(
        X_train_seq, y_train_seq,
        epochs=epochs,
        batch_size=batch_size,
        verbose=0,
        validation_split=0.1,
    )

    # Predict
    y_prob_raw = model.predict(X_test_seq, verbose=0).flatten()
    # Align with y_test length
    y_prob = y_prob_raw[:len(X_test)]
    y_pred = (y_prob >= 0.5).astype(int)

    # Wrap model to expose predict_proba for evaluator compatibility
    class LSTMWrapper:
        def __init__(self, keras_model, ts):
            self.model = keras_model
            self.timesteps = ts
            self.feature_importances_ = None  # LSTM doesn't have this natively

        def predict(self, X):
            Xs = _reshape_for_lstm(X, self.timesteps)
            probs = self.model.predict(Xs, verbose=0).flatten()
            return (probs >= 0.5).astype(int)[:len(X)]

        def predict_proba(self, X):
            Xs = _reshape_for_lstm(X, self.timesteps)
            probs = self.model.predict(Xs, verbose=0).flatten()[:len(X)]
            return np.column_stack([1 - probs, probs])

    return LSTMWrapper(model, timesteps), y_pred, y_prob
