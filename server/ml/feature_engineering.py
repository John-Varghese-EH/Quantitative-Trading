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
Feature engineering for financial time series.
Creates ML-ready features from OHLCV + technical indicators.
"""
import numpy as np
import pandas as pd
from typing import Tuple, List


FEATURE_COLUMNS = [
    "returns", "log_returns", "volatility",
    "ma_20_ratio", "ma_50_ratio",
    "rsi", "macd", "macd_signal",
    "bb_position", "bb_width_norm",
    "volume_ratio", "momentum",
    "high_low_ratio", "close_open_ratio",
    "day_of_week", "month",
]


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Transform raw OHLCV data into ML-ready features.
    Expects columns: open, high, low, close, volume
    """
    df = df.copy()
    close = df["close"]
    
    # Price-based features
    df["returns"] = close.pct_change()
    df["log_returns"] = np.log(close / close.shift(1))
    df["volatility"] = df["returns"].rolling(20).std()
    
    # Moving average ratios
    df["ma_20"] = close.rolling(20).mean()
    df["ma_50"] = close.rolling(50).mean()
    df["ma_20_ratio"] = close / df["ma_20"] - 1
    df["ma_50_ratio"] = close / df["ma_50"] - 1
    
    # RSI
    delta = close.diff()
    gain = delta.clip(lower=0).rolling(14).mean()
    loss = (-delta.clip(upper=0)).rolling(14).mean()
    rs = gain / (loss + 1e-10)
    df["rsi"] = 100 - (100 / (1 + rs))
    df["rsi"] = df["rsi"] / 100  # Normalize 0-1
    
    # MACD
    ema12 = close.ewm(span=12, adjust=False).mean()
    ema26 = close.ewm(span=26, adjust=False).mean()
    df["macd"] = (ema12 - ema26) / close  # Normalized
    df["macd_signal"] = df["macd"].ewm(span=9, adjust=False).mean()
    
    # Bollinger Bands
    bb_mid = close.rolling(20).mean()
    bb_std = close.rolling(20).std()
    bb_upper = bb_mid + 2 * bb_std
    bb_lower = bb_mid - 2 * bb_std
    df["bb_position"] = (close - bb_lower) / (bb_upper - bb_lower + 1e-10)
    df["bb_width_norm"] = (bb_upper - bb_lower) / bb_mid
    
    # Volume features
    df["volume_ma"] = df["volume"].rolling(20).mean()
    df["volume_ratio"] = df["volume"] / (df["volume_ma"] + 1e-10)
    
    # Momentum
    df["momentum"] = close.pct_change(10)
    
    # Candlestick ratios
    df["high_low_ratio"] = (df["high"] - df["low"]) / (close + 1e-10)
    df["close_open_ratio"] = (close - df["open"]) / (df["open"] + 1e-10)
    
    # Temporal features
    if "date" in df.columns:
        df["date_parsed"] = pd.to_datetime(df["date"])
        df["day_of_week"] = df["date_parsed"].dt.dayofweek / 6
        df["month"] = df["date_parsed"].dt.month / 12
    else:
        df["day_of_week"] = 0
        df["month"] = 0
    
    return df


def create_target(df: pd.DataFrame, horizon: int = 1) -> pd.Series:
    """Binary target: 1 if price goes up in `horizon` days, 0 otherwise."""
    return (df["close"].shift(-horizon) > df["close"]).astype(int)


def prepare_dataset(
    df: pd.DataFrame,
    horizon: int = 1,
    test_size: float = 0.2,
) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, List[str]]:
    """
    Full pipeline: engineer features → create targets → train/test split.
    Returns: X_train, X_test, y_train, y_test, feature_names
    """
    df = engineer_features(df)
    df["target"] = create_target(df, horizon)

    # Drop rows with NaN
    feature_cols = [c for c in FEATURE_COLUMNS if c in df.columns]
    df_clean = df[feature_cols + ["target"]].dropna()

    X = df_clean[feature_cols].values
    y = df_clean["target"].values

    split = int(len(X) * (1 - test_size))
    return X[:split], X[split:], y[:split], y[split:], feature_cols


def normalize_features(X_train: np.ndarray, X_test: np.ndarray):
    """Min-max normalization based on training data statistics."""
    from sklearn.preprocessing import StandardScaler
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    return X_train_scaled, X_test_scaled, scaler
