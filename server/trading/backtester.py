"""
Vectorized backtesting engine.
Runs a strategy function over historical OHLCV and computes performance metrics.
"""
import numpy as np
import pandas as pd
from typing import Callable, Dict, List


def run_backtest(
    df: pd.DataFrame,
    strategy_fn: Callable,
    initial_capital: float = 10_000.0,
    commission: float = 0.001,
) -> Dict:
    """
    Run a backtest for a given strategy function.
    
    strategy_fn: (df) -> pd.Series of signals (1=BUY, -1=SELL, 0=HOLD)
    Returns dict with equity curve, trade log, and performance metrics.
    """
    df = df.copy().reset_index(drop=True)
    signals = strategy_fn(df)
    df["signal"] = signals.values if hasattr(signals, "values") else signals

    capital = initial_capital
    position = 0.0
    entry_price = 0.0
    equity_curve = []
    trade_log = []

    for i, row in df.iterrows():
        price = row["close"]
        sig = row.get("signal", 0)

        if sig == 1 and position == 0:  # Enter long
            shares = capital / price
            cost = shares * price * (1 + commission)
            if cost <= capital:
                position = shares
                entry_price = price
                capital -= cost
                trade_log.append({
                    "type": "BUY",
                    "price": round(price, 4),
                    "shares": round(shares, 4),
                    "date": str(row.get("date", i)),
                })

        elif sig == -1 and position > 0:  # Exit long
            proceeds = position * price * (1 - commission)
            pnl = proceeds - (position * entry_price)
            capital += proceeds
            trade_log.append({
                "type": "SELL",
                "price": round(price, 4),
                "shares": round(position, 4),
                "pnl": round(pnl, 4),
                "roi": round(pnl / (position * entry_price) * 100, 2),
                "date": str(row.get("date", i)),
            })
            position = 0
            entry_price = 0

        portfolio_value = capital + position * price
        equity_curve.append({
            "date": str(row.get("date", i)),
            "value": round(portfolio_value, 2),
        })

    # Close any open position at last price
    if position > 0:
        last_price = df["close"].iloc[-1]
        capital += position * last_price * (1 - commission)
        position = 0

    final_value = capital
    returns = pd.Series([e["value"] for e in equity_curve])
    
    from trading.metrics import (
        compute_sharpe, compute_max_drawdown, compute_win_rate, compute_cagr
    )

    return {
        "initial_capital": initial_capital,
        "final_value": round(final_value, 2),
        "total_return": round((final_value - initial_capital) / initial_capital * 100, 2),
        "sharpe_ratio": compute_sharpe(returns),
        "max_drawdown": compute_max_drawdown(returns),
        "win_rate": compute_win_rate(trade_log),
        "total_trades": len([t for t in trade_log if t["type"] == "BUY"]),
        "cagr": compute_cagr(initial_capital, final_value, len(df) / 252),
        "equity_curve": equity_curve[-200:],  # Last 200 points
        "trade_log": trade_log[-50:],
    }
