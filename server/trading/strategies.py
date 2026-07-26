"""All 5 trading strategy signal generators."""
import numpy as np
import pandas as pd


def buy_and_hold(df: pd.DataFrame) -> pd.Series:
    """Buy on first day, hold forever."""
    signals = pd.Series(0, index=df.index)
    signals.iloc[0] = 1
    return signals


def ma_crossover(df: pd.DataFrame, short: int = 20, long: int = 50) -> pd.Series:
    """Buy when short MA crosses above long MA, sell on cross below."""
    close = df["close"]
    short_ma = close.rolling(short).mean()
    long_ma = close.rolling(long).mean()
    
    signals = pd.Series(0, index=df.index)
    prev_short = short_ma.shift(1)
    prev_long = long_ma.shift(1)
    
    signals[short_ma > long_ma] = 1      # BUY signal zone
    signals[short_ma < long_ma] = -1     # SELL signal zone
    
    # Only signal on crossovers
    crossover_buy = (short_ma > long_ma) & (prev_short <= prev_long)
    crossover_sell = (short_ma < long_ma) & (prev_short >= prev_long)
    
    final = pd.Series(0, index=df.index)
    final[crossover_buy] = 1
    final[crossover_sell] = -1
    return final


def mean_reversion(df: pd.DataFrame, window: int = 20, z_thresh: float = 1.5) -> pd.Series:
    """Buy when price is significantly below its moving average, sell when above."""
    close = df["close"]
    ma = close.rolling(window).mean()
    std = close.rolling(window).std()
    z_score = (close - ma) / (std + 1e-10)
    
    signals = pd.Series(0, index=df.index)
    signals[z_score < -z_thresh] = 1    # Oversold → BUY
    signals[z_score > z_thresh] = -1    # Overbought → SELL
    return signals


def momentum(df: pd.DataFrame, lookback: int = 10, threshold: float = 0.02) -> pd.Series:
    """Buy when momentum is positive above threshold, sell when negative."""
    close = df["close"]
    mom = close.pct_change(lookback)
    
    signals = pd.Series(0, index=df.index)
    signals[mom > threshold] = 1
    signals[mom < -threshold] = -1
    return signals


def ai_prediction_strategy(df: pd.DataFrame, predictions: list = None) -> pd.Series:
    """Use AI model predictions as signals."""
    signals = pd.Series(0, index=df.index)
    if predictions and len(predictions) > 0:
        for i, pred in enumerate(predictions[-len(df):]):
            if i < len(signals):
                signals.iloc[i] = 1 if pred == 1 else -1
    else:
        # Fallback: use momentum
        return momentum(df)
    return signals


STRATEGY_MAP = {
    "buy_and_hold": buy_and_hold,
    "ma_crossover": ma_crossover,
    "mean_reversion": mean_reversion,
    "momentum": momentum,
    "ai_prediction": ai_prediction_strategy,
}
