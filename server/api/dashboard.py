"""
Dashboard API — aggregated portfolio and system metrics.
"""
import random
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.session import get_db
from database.models import User, Trade, MLModel, AttackLog, BacktestResult
from auth.dependencies import get_current_user

router = APIRouter()


@router.get("/stats")
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return aggregated dashboard statistics for the current user."""
    # ML Models
    models = db.query(MLModel).filter(MLModel.user_id == current_user.id).all()
    ready_models = [m for m in models if m.status == "ready"]
    avg_accuracy = (
        sum(m.accuracy for m in ready_models if m.accuracy) / len(ready_models)
        if ready_models else 0
    )

    # Trades
    trades = db.query(Trade).filter(Trade.user_id == current_user.id).all()
    closed_trades = [t for t in trades if t.status == "closed"]
    total_pnl = sum(t.profit_loss for t in closed_trades if t.profit_loss) or 0
    winning_trades = [t for t in closed_trades if (t.profit_loss or 0) > 0]
    win_rate = (len(winning_trades) / len(closed_trades) * 100) if closed_trades else 0

    # Attacks
    attacks = db.query(AttackLog).filter(AttackLog.user_id == current_user.id).count()

    # Backtests
    backtests = db.query(BacktestResult).filter(BacktestResult.user_id == current_user.id).all()
    best_backtest = max(backtests, key=lambda b: b.total_return or 0, default=None)

    # Simulated portfolio value (paper trading starting at $10,000)
    portfolio_value = 10000 + total_pnl
    daily_pnl = total_pnl * 0.01 * (1 + random.uniform(-0.5, 0.5))  # simulated daily

    return {
        "portfolio_value": round(portfolio_value, 2),
        "daily_pnl": round(daily_pnl, 2),
        "daily_pnl_pct": round((daily_pnl / portfolio_value * 100) if portfolio_value else 0, 2),
        "ai_confidence": round(avg_accuracy * 100, 1) if avg_accuracy else 0,
        "model_accuracy": round(avg_accuracy * 100, 1) if avg_accuracy else 0,
        "risk_score": round(random.uniform(20, 60), 1),
        "open_positions": len([t for t in trades if t.status == "open"]),
        "total_trades": len(closed_trades),
        "win_rate": round(win_rate, 1),
        "total_models": len(models),
        "ready_models": len(ready_models),
        "total_attacks": attacks,
        "best_strategy_return": round(best_backtest.total_return or 0, 2) if best_backtest else 0,
    }


@router.get("/portfolio-history")
def get_portfolio_history(
    days: int = 30,
    current_user: User = Depends(get_current_user),
):
    """Return simulated portfolio value history for charting."""
    history = []
    value = 10000.0
    for i in range(days, -1, -1):
        date = (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d")
        change = random.gauss(0, 0.01)
        value *= (1 + change)
        history.append({"date": date, "value": round(value, 2)})
    return {"history": history, "initial": 10000, "current": round(value, 2)}


@router.get("/market-heatmap")
def get_market_heatmap(current_user: User = Depends(get_current_user)):
    """Return sector heatmap data."""
    sectors = [
        {"sector": "Technology", "change": round(random.uniform(-3, 4), 2), "symbols": ["AAPL", "MSFT", "NVDA"]},
        {"sector": "Healthcare", "change": round(random.uniform(-2, 3), 2), "symbols": ["JNJ", "PFE", "UNH"]},
        {"sector": "Finance", "change": round(random.uniform(-2, 2), 2), "symbols": ["JPM", "BAC", "GS"]},
        {"sector": "Energy", "change": round(random.uniform(-4, 3), 2), "symbols": ["XOM", "CVX", "BP"]},
        {"sector": "Consumer", "change": round(random.uniform(-1, 3), 2), "symbols": ["AMZN", "TSLA", "NKE"]},
        {"sector": "Crypto", "change": round(random.uniform(-8, 10), 2), "symbols": ["BTC-USD", "ETH-USD"]},
        {"sector": "Industrials", "change": round(random.uniform(-2, 2), 2), "symbols": ["BA", "CAT", "GE"]},
        {"sector": "Real Estate", "change": round(random.uniform(-2, 2), 2), "symbols": ["AMT", "PLD", "SPG"]},
    ]
    return {"sectors": sectors}
