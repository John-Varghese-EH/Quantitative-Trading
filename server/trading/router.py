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

"""Trading simulator API router (Firestore)."""
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from database.firestore import get_db
from auth.dependencies import get_current_user
from api.market_data import _fetch_yfinance
from trading.backtester import run_backtest
from trading.strategies import STRATEGY_MAP
import uuid

router = APIRouter()

class BacktestRequest(BaseModel):
    symbol: str
    strategy: str
    start_date: str
    end_date: str = None
    initial_capital: float = 10_000.0
    params: dict = {}

@router.get("/strategies")
def list_strategies(current_user: dict = Depends(get_current_user)):
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
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db),
):
    """Run a strategy backtest on historical data."""
    if body.strategy not in STRATEGY_MAP:
        raise HTTPException(status_code=422, detail=f"Unknown strategy: {body.strategy}")

    end = body.end_date or datetime.now().strftime("%Y-%m-%d")
    df = _fetch_yfinance(body.symbol.upper(), body.start_date, end)

    strategy_fn = STRATEGY_MAP[body.strategy]
    if body.params:
        import functools
        strategy_fn = functools.partial(strategy_fn, **body.params)

    result = run_backtest(df, strategy_fn, body.initial_capital)

    # Save to Firestore
    uid = current_user.get("id")
    bt_id = str(uuid.uuid4())
    bt_data = {
        "id": bt_id,
        "user_id": uid,
        "symbol": body.symbol.upper(),
        "strategy": body.strategy,
        "start_date": body.start_date,
        "end_date": end,
        "initial_capital": body.initial_capital,
        "final_value": result.get("final_value"),
        "total_return": result.get("total_return"),
        "sharpe_ratio": result.get("sharpe_ratio"),
        "max_drawdown": result.get("max_drawdown"),
        "win_rate": result.get("win_rate"),
        "total_trades": result.get("total_trades"),
        "equity_curve": result.get("equity_curve"),
        "trade_log": result.get("trade_log"),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    db.collection("users").document(uid).collection("backtests").document(bt_id).set(bt_data)

    return {
        "backtest_id": bt_id,
        "symbol": body.symbol.upper(),
        "strategy": body.strategy,
        **result,
    }

@router.get("/backtest/history")
def get_backtest_history(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db),
):
    uid = current_user.get("id")
    docs = db.collection("users").document(uid).collection("backtests").order_by("created_at", direction="DESCENDING").limit(20).stream()
    
    history = []
    for doc in docs:
        r = doc.to_dict()
        history.append({
            "id": r.get("id"),
            "symbol": r.get("symbol"),
            "strategy": r.get("strategy"),
            "total_return": r.get("total_return"),
            "sharpe_ratio": r.get("sharpe_ratio"),
            "max_drawdown": r.get("max_drawdown"),
            "win_rate": r.get("win_rate"),
            "total_trades": r.get("total_trades"),
            "created_at": r.get("created_at"),
        })
    return {"history": history}
