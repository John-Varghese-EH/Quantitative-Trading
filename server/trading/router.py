"""Trading simulator API router."""
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database.session import get_db
from database.models import User, BacktestResult
from auth.dependencies import get_current_user
from api.market_data import _fetch_yfinance
from trading.backtester import run_backtest
from trading.strategies import STRATEGY_MAP

router = APIRouter()


class BacktestRequest(BaseModel):
    symbol: str
    strategy: str
    start_date: str
    end_date: str = None
    initial_capital: float = 10_000.0
    params: dict = {}


@router.get("/strategies")
def list_strategies(current_user: User = Depends(get_current_user)):
    return {
        "strategies": [
            {"id": "buy_and_hold", "name": "Buy and Hold", "description": "Buy on day 1, hold to end"},
            {"id": "ma_crossover", "name": "MA Crossover", "description": "Trade on moving average crossovers"},
            {"id": "mean_reversion", "name": "Mean Reversion", "description": "Trade on statistical deviations"},
            {"id": "momentum", "name": "Momentum Trading", "description": "Follow price momentum"},
            {"id": "ai_prediction", "name": "AI Prediction Strategy", "description": "Use ML model signals"},
        ]
    }


@router.post("/backtest")
def run_backtest_endpoint(
    body: BacktestRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Run a strategy backtest on historical data."""
    if body.strategy not in STRATEGY_MAP:
        raise HTTPException(status_code=422, detail=f"Unknown strategy: {body.strategy}")

    end = body.end_date or datetime.now().strftime("%Y-%m-%d")
    df = _fetch_yfinance(body.symbol.upper(), body.start_date, end)

    strategy_fn = STRATEGY_MAP[body.strategy]

    # Inject params if strategy supports them
    if body.params:
        import functools
        strategy_fn = functools.partial(strategy_fn, **body.params)

    result = run_backtest(df, strategy_fn, body.initial_capital)

    # Save to DB
    bt = BacktestResult(
        user_id=current_user.id,
        symbol=body.symbol.upper(),
        strategy=body.strategy,
        start_date=body.start_date,
        end_date=end,
        initial_capital=body.initial_capital,
        final_value=result["final_value"],
        total_return=result["total_return"],
        sharpe_ratio=result["sharpe_ratio"],
        max_drawdown=result["max_drawdown"],
        win_rate=result["win_rate"],
        total_trades=result["total_trades"],
        equity_curve=result["equity_curve"],
        trade_log=result["trade_log"],
    )
    db.add(bt)
    db.commit()
    db.refresh(bt)

    return {
        "backtest_id": str(bt.id),
        "symbol": body.symbol.upper(),
        "strategy": body.strategy,
        **result,
    }


@router.get("/backtest/history")
def get_backtest_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    results = db.query(BacktestResult).filter(
        BacktestResult.user_id == current_user.id
    ).order_by(BacktestResult.created_at.desc()).limit(20).all()
    return {"history": [
        {
            "id": str(r.id),
            "symbol": r.symbol,
            "strategy": r.strategy,
            "total_return": r.total_return,
            "sharpe_ratio": r.sharpe_ratio,
            "max_drawdown": r.max_drawdown,
            "win_rate": r.win_rate,
            "total_trades": r.total_trades,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in results
    ]}
