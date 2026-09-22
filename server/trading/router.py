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
Trading API Router.
Provides Multi-Agent AI Council deliberation, Natural Language strategy compilation,
Paper & Live Order Execution via Pre-Trade Compliance, and TradingView Webhook Bridge.
"""
from dataclasses import asdict
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from api.market_data import _fetch_yfinance
from auth.dependencies import get_current_user
from database.firestore import get_db
from trading.backtester import run_backtest
from trading.strategies import STRATEGY_MAP
from trading.agents.council import get_ai_council
from trading.execution.broker_gateway import (
    BrokerGateway,
    OrderPayload,
    WebhookPayload,
    get_broker_gateway,
    get_broker_manager,
)
from trading.execution.compliance import get_compliance_firewall
from trading.execution.paper_engine import get_paper_engine
from trading.scanner.scanner_engine import get_market_scanner
from trading.bots.bot_engine import get_bot_manager
from trading.derivatives.options_engine import get_options_engine

router = APIRouter()


class BacktestRequest(BaseModel):
    symbol: str
    strategy: str
    start_date: str
    end_date: str = None
    initial_capital: float = 10_000.0
    params: dict = {}


class PromptStrategyRequest(BaseModel):
    prompt: str


class ExecutionModeRequest(BaseModel):
    mode: str  # "PAPER" or "LIVE"


class KillSwitchRequest(BaseModel):
    active: bool
    reason: Optional[str] = "Manual User Action"


# ─── Standard Strategy & Backtesting Endpoints ───────────────────────────────

@router.get("/strategies")
def list_strategies(current_user: dict = Depends(get_current_user)):
    return {
        "strategies": [
            {"id": "buy_and_hold", "name": "Buy and Hold", "description": "Buy on day 1, hold to end"},
            {"id": "ma_crossover", "name": "MA Crossover", "description": "Trade on moving average crossovers"},
            {"id": "mean_reversion", "name": "Mean Reversion", "description": "Trade on statistical deviations"},
            {"id": "momentum", "name": "Momentum Trading", "description": "Follow price momentum"},
            {"id": "ai_prediction", "name": "AI Prediction Strategy", "description": "Use ML model signals"},
            {"id": "ai_council_consensus", "name": "AI Council Consensus", "description": "5-Agent Multi-Model consensus with Adversarial Red-Teaming"},
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
    try:
        db.collection("users").document(uid).collection("backtests").document(bt_id).set(bt_data)
    except Exception:
        pass

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
    try:
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
    except Exception:
        return {"history": []}


# ─── Multi-Agent AI Council Endpoints ────────────────────────────────────────

@router.get("/council/deliberate")
def deliberate_symbol(
    symbol: str = Query(..., description="Ticker symbol to analyze, e.g. AAPL, NVDA, RELIANCE.NS"),
    current_user: dict = Depends(get_current_user),
):
    """
    Triggers the 5-Agent Council deliberation:
    1. Technical Analyst
    2. Fundamental & Macro Analyst
    3. Sentiment & News Analyst
    4. Adversarial Red Team Analyst (QuantAdv Signature)
    5. Chief Risk Officer (CRO)
    """
    try:
        council = get_ai_council()
        decision = council.deliberate(symbol)
        return {
            "symbol": decision.symbol,
            "timestamp": decision.timestamp,
            "final_verdict": decision.final_verdict,
            "overall_confidence": decision.overall_confidence,
            "consensus_score": decision.consensus_score,
            "suggested_action": decision.suggested_action,
            "risk_level": decision.risk_level,
            "recommended_position_pct": decision.recommended_position_pct,
            "suggested_stop_loss": decision.suggested_stop_loss,
            "suggested_take_profit": decision.suggested_take_profit,
            "risk_reward_ratio": decision.risk_reward_ratio,
            "red_team_warnings": decision.red_team_warnings,
            "compliance_passed": decision.compliance_passed,
            "explanation": decision.explanation,
            "xai_waterfall": decision.xai_waterfall,
            "base_value": decision.base_value,
            "agent_opinions": [asdict(op) for op in decision.agent_opinions],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Council Deliberation failed: {str(e)}")


@router.post("/council/prompt-to-strategy")
def prompt_to_strategy(
    body: PromptStrategyRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Natural Language "Prompt-to-Strategy" Compiler.
    Transforms plain English trading ideas into structured logic with Python execution code.
    """
    council = get_ai_council()
    result = council.synthesize_strategy(body.prompt)
    return result


# ─── Order Execution & Pre-Trade Compliance Endpoints ────────────────────────

@router.post("/order/execute")
async def execute_order(
    payload: OrderPayload,
    current_user: dict = Depends(get_current_user),
):
    """
    Executes an order through the Pre-Trade Legal Compliance Firewall
    and routes it to the active broker (Paper or Live).
    """
    gateway = get_broker_gateway()
    result = await gateway.execute_order(payload)
    return result


@router.post("/webhook")
async def tradingview_webhook(payload: WebhookPayload):
    """
    TradingView Webhook Bridge.
    Receives automated signals from TradingView alerts and executes them
    through the Compliance Firewall.
    """
    gateway = get_broker_gateway()
    result = await gateway.handle_tradingview_webhook(payload)
    return result


@router.get("/paper/summary")
def get_paper_summary(current_user: dict = Depends(get_current_user)):
    """Provides complete real-time Paper Trading account status, positions, and trades."""
    engine = get_paper_engine()
    return engine.get_summary()


@router.post("/paper/reset")
def reset_paper_account(
    initial_cash: float = 100_000.0,
    current_user: dict = Depends(get_current_user),
):
    """Resets paper account balance back to specified starting capital."""
    engine = get_paper_engine()
    engine.reset_account(initial_cash)
    return {"status": "SUCCESS", "message": f"Paper trading account reset to ${initial_cash:,.2f}"}


@router.post("/panic")
async def panic_liquidate(current_user: dict = Depends(get_current_user)):
    """Emergency Panic Button: Halts all trading and liquidates open positions."""
    gateway = get_broker_gateway()
    result = await gateway.panic_kill_switch("Emergency User Panic Trigger")
    return result


@router.post("/kill-switch/toggle")
def toggle_kill_switch(
    body: KillSwitchRequest,
    current_user: dict = Depends(get_current_user),
):
    """Enables or disables the global execution kill-switch."""
    firewall = get_compliance_firewall()
    if body.active:
        firewall.activate_kill_switch(body.reason or "Manual Admin Toggle")
    else:
        firewall.deactivate_kill_switch()

    return {
        "kill_switch_active": firewall.kill_switch_active,
        "reason": firewall.kill_switch_reason,
    }


@router.get("/compliance/status")
def get_compliance_status(current_user: dict = Depends(get_current_user)):
    """Returns current Compliance Firewall state, active jurisdiction, and audit history."""
    firewall = get_compliance_firewall()
    return {
        "kill_switch_active": firewall.kill_switch_active,
        "kill_switch_reason": firewall.kill_switch_reason,
        "max_daily_loss_limit": f"{firewall.config.max_daily_loss_pct * 100}%",
        "max_drawdown_limit": f"{firewall.config.max_drawdown_limit_pct * 100}%",
        "max_single_order_notional": firewall.config.max_order_notional,
        "rate_limit_per_minute": firewall.config.max_orders_per_minute,
        "audit_logs_count": len(firewall.audit_log),
        "recent_audit_logs": firewall.audit_log[-10:],
    }


@router.get("/scanner/scan")
def scan_market(
    market: str = Query("ALL", description="Market universe: ALL, US, IN, CRYPTO, or comma-separated tickers"),
    signal: Optional[str] = Query("ALL", description="Signal filter: ALL, BREAKOUT, VOLUME_SURGE, OVERSOLD_DIP, MOMENTUM_RUN"),
    current_user: dict = Depends(get_current_user),
):
    """
    Real-Time Quantitative Market Scanner.
    Screens multi-asset universes for institutional volume surges, 20-day high breakouts,
    oversold bounces, and momentum thrusts.
    """
    scanner = get_market_scanner()
    candidates = scanner.scan_universe(market=market, signal_filter=signal)
    return {
        "market": market,
        "signal_filter": signal,
        "count": len(candidates),
        "candidates": [asdict(c) for c in candidates],
    }


class BrokerConfigRequest(BaseModel):
    broker_id: str
    credentials: Dict[str, Any]


@router.get("/brokers/list")
def list_brokers(current_user: dict = Depends(get_current_user)):
    """Lists supported brokers, regions, and active connection status."""
    manager = get_broker_manager()
    return {"brokers": manager.list_brokers()}


@router.post("/brokers/configure")
def configure_broker(
    body: BrokerConfigRequest,
    current_user: dict = Depends(get_current_user),
):
    """Configures broker credentials securely with local masking."""
    manager = get_broker_manager()
    return manager.configure_broker(body.broker_id, body.credentials)


class BrokerTestRequest(BaseModel):
    broker_id: Optional[str] = None


@router.post("/brokers/test")
async def test_broker(
    broker_id: Optional[str] = Query(None, description="Broker ID to ping and verify"),
    body: Optional[BrokerTestRequest] = None,
    current_user: dict = Depends(get_current_user),
):
    """Tests broker handshake, verifies API credentials, and fetches available margins."""
    target_id = broker_id or (body.broker_id if body else None)
    if not target_id:
        raise HTTPException(status_code=400, detail="broker_id is required")
    manager = get_broker_manager()
    return await manager.test_broker_connection(target_id)


# ─── Autonomous Trading Bots Endpoints ─────────────────────────────────────────

class CreateBotRequest(BaseModel):
    name: str
    bot_type: str
    symbol: str
    capital: float = 10000.0
    parameters: Optional[Dict[str, Any]] = None
    mode: str = "PAPER"
    broker_id: str = "paper"


@router.get("/bots/list")
def list_bots(current_user: dict = Depends(get_current_user)):
    """Lists all configured autonomous trading bots with live performance metrics."""
    manager = get_bot_manager()
    return {"bots": manager.list_bots()}


@router.post("/bots/create")
def create_bot(
    body: CreateBotRequest,
    current_user: dict = Depends(get_current_user),
):
    """Deploys a new autonomous trading bot."""
    manager = get_bot_manager()
    bot = manager.create_bot(
        name=body.name,
        bot_type=body.bot_type,
        symbol=body.symbol,
        capital=body.capital,
        parameters=body.parameters,
        mode=body.mode,
        broker_id=body.broker_id,
    )
    return {"status": "SUCCESS", "bot": bot}


@router.post("/bots/{bot_id}/toggle")
def toggle_bot(
    bot_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Toggles bot status between RUNNING and PAUSED."""
    manager = get_bot_manager()
    try:
        updated = manager.toggle_bot(bot_id)
        return {"status": "SUCCESS", "bot": updated}
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/bots/{bot_id}/stop")
def stop_bot(
    bot_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Permanently stops an active bot."""
    manager = get_bot_manager()
    try:
        updated = manager.stop_bot(bot_id)
        return {"status": "SUCCESS", "bot": updated}
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/bots/{bot_id}")
def delete_bot(
    bot_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Deletes a bot from registry."""
    manager = get_bot_manager()
    deleted = manager.delete_bot(bot_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Bot not found")
    return {"status": "SUCCESS", "deleted_bot_id": bot_id}


@router.post("/bots/{bot_id}/iterate")
def iterate_bot(
    bot_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Triggers one quantitative evaluation iteration of a bot."""
    manager = get_bot_manager()
    try:
        result = manager.trigger_iteration(bot_id)
        return result
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))


# ─── Options & Derivatives Analytics Endpoints ─────────────────────────────────

@router.get("/derivatives/options-chain")
def get_options_chain(
    symbol: str = Query(..., description="Ticker symbol, e.g. AAPL, NVDA, SPY, NIFTY"),
    current_user: dict = Depends(get_current_user),
):
    """
    Returns options chain with Black-Scholes Greeks (Delta, Gamma, Theta, Vega, Rho),
    Max Pain strike, Put-Call Ratio (PCR), and institutional sentiment.
    """
    engine = get_options_engine()
    return engine.get_options_chain(symbol)


@router.get("/derivatives/payoff")
def get_strategy_payoff(
    strategy: str = Query("BULL_CALL_SPREAD", description="Strategy: BULL_CALL_SPREAD, BEAR_PUT_SPREAD, LONG_STRADDLE, COVERED_CALL, CASH_SECURED_PUT"),
    spot_price: float = Query(150.0, description="Current underlying spot price"),
    current_user: dict = Depends(get_current_user),
):
    """
    Generates multi-leg options strategy payoff curve, max profit, max loss, and breakevens.
    """
    engine = get_options_engine()
    return engine.generate_strategy_payoff(strategy, spot_price)




