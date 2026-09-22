# QuantAdv - Quantitative Trading Platform
# Copyright (C) 2026 John Varghese (J0X)
# AGPL-3.0 License

import pytest
import numpy as np
import pandas as pd
from server.trading.agents.council import AICouncil
from server.trading.execution.compliance import ComplianceFirewall, ComplianceConfig
from server.trading.execution.paper_engine import PaperTradingEngine
from server.trading.execution.broker_gateway import BrokerGateway, OrderPayload, WebhookPayload


@pytest.fixture
def mock_ohlcv():
    dates = pd.date_range("2023-01-01", periods=100, freq="D")
    prices = 150 + np.cumsum(np.random.normal(0.2, 2.0, 100))
    return pd.DataFrame({
        "Open": prices,
        "High": prices + 2.0,
        "Low": prices - 2.0,
        "Close": prices,
        "Volume": np.random.randint(1000000, 5000000, 100),
    }, index=dates)


def test_ai_council_technicals_and_deliberation(mock_ohlcv):
    council = AICouncil()
    decision = council.deliberate("TEST_TICKER", df=mock_ohlcv)

    assert decision.symbol == "TEST_TICKER"
    assert decision.final_verdict in ["STRONG_BUY", "BUY", "HOLD", "AVOID", "SELL"]
    assert -1.0 <= decision.consensus_score <= 1.0
    assert 0.0 <= decision.overall_confidence <= 1.0
    assert len(decision.agent_opinions) == 5

    # Check that Red Team and CRO opinions exist
    agent_names = [op.agent_name for op in decision.agent_opinions]
    assert "Technical Analyst" in agent_names
    assert "Adversarial Red Team" in agent_names
    assert "Chief Risk Officer" in agent_names


def test_prompt_to_strategy_synthesis():
    council = AICouncil()
    res = council.synthesize_strategy("Buy when RSI < 30 and 50 EMA is rising, risk 2% max")

    assert "strategy_name" in res
    assert "compiled_rules" in res
    assert len(res["compiled_rules"]) > 0
    assert "execute_strategy" in res["python_code"]
    assert res["compliance_ready"] is True


def test_compliance_firewall_rules():
    config = ComplianceConfig(
        max_order_notional=50_000.0,
        max_position_pct=0.20,
    )
    firewall = ComplianceFirewall(config=config)

    # 1. Normal order passes
    res = firewall.validate_order(
        symbol="AAPL",
        side="BUY",
        quantity=10,
        price=150.0,
        portfolio_value=100_000.0,
    )
    assert res.passed is True
    assert len(res.rejections) == 0

    # 2. Fat-finger / Notional cap check (SEC Rule 15c3-5)
    res_large = firewall.validate_order(
        symbol="AAPL",
        side="BUY",
        quantity=1000,
        price=150.0,  # $150,000 > $50,000
        portfolio_value=100_000.0,
    )
    assert res_large.passed is False
    assert any("SEC 15c3-5" in r for r in res_large.rejections)

    # 3. Kill-Switch Activation
    firewall.activate_kill_switch("Test Kill Switch")
    assert firewall.kill_switch_active is True

    res_blocked = firewall.validate_order(
        symbol="AAPL",
        side="BUY",
        quantity=1,
        price=150.0,
        portfolio_value=100_000.0,
    )
    assert res_blocked.passed is False
    assert any("Kill Switch" in r for r in res_blocked.rejections)

    # Reset
    firewall.deactivate_kill_switch()
    assert firewall.kill_switch_active is False


def test_paper_trading_engine():
    engine = PaperTradingEngine(initial_cash=50_000.0)
    engine.reset_account(50_000.0)

    # Place Market BUY
    order = engine.place_order(
        symbol="TSLA",
        side="BUY",
        quantity=10,
        order_type="MARKET",
        market_price=200.0,
    )

    assert order.status == "FILLED"
    assert "TSLA" in engine.positions
    pos = engine.positions["TSLA"]
    assert pos.quantity == 10
    assert engine.cash < 50_000.0  # Cash deducted including fee & slippage

    # Price moves up to $220
    engine.update_market_prices({"TSLA": 220.0})
    assert pos.unrealized_pnl > 0

    # Place Market SELL
    sell_order = engine.place_order(
        symbol="TSLA",
        side="SELL",
        quantity=10,
        order_type="MARKET",
        market_price=220.0,
    )
    assert sell_order.status == "FILLED"
    assert "TSLA" not in engine.positions
    assert engine.realized_pnl_total > 0


@pytest.mark.asyncio
async def test_broker_gateway_and_webhook():
    firewall = ComplianceFirewall()
    engine = PaperTradingEngine(initial_cash=100_000.0)
    gateway = BrokerGateway(firewall, engine)

    # Test TradingView Webhook bridge
    webhook = WebhookPayload(
        ticker="MSFT",
        action="BUY",
        quantity=5,
        price=300.0,
        strategy="TradingView Breakout Alert",
    )
    result = await gateway.handle_tradingview_webhook(webhook)
    assert result["status"] == "APPROVED_AND_EXECUTED"
    assert result["execution_mode"] == "PAPER"


def test_market_scanner(monkeypatch, mock_ohlcv):
    from server.trading.scanner.scanner_engine import MarketScanner

    scanner = MarketScanner()

    # Mock yfinance Ticker history
    class MockTicker:
        def __init__(self, sym):
            self.sym = sym
        def history(self, period="1mo", interval="1d"):
            return mock_ohlcv

    monkeypatch.setattr("yfinance.Ticker", MockTicker)

    candidates = scanner.scan_universe(market="US")
    # Even if mock data doesn't trigger breakout, scanner should run without errors
    assert isinstance(candidates, list)


@pytest.mark.asyncio
async def test_xai_waterfall_and_broker_manager(mock_ohlcv):
    from server.trading.agents.council import AICouncil
    from server.trading.execution.broker_gateway import get_broker_manager

    # 1. Test XAI Waterfall
    council = AICouncil()
    decision = council.deliberate("TEST_XAI", df=mock_ohlcv)
    assert hasattr(decision, "xai_waterfall")
    assert len(decision.xai_waterfall) > 0
    for feature in decision.xai_waterfall:
        assert "feature" in feature
        assert "shap_value" in feature
        assert "direction" in feature

    # 2. Test Broker Manager
    manager = get_broker_manager()
    brokers = manager.list_brokers()
    assert len(brokers) >= 6
    broker_ids = [b["id"] for b in brokers]
    assert "paper" in broker_ids
    assert "zerodha" in broker_ids
    assert "alpaca" in broker_ids

    # Test configuration
    res = manager.configure_broker("zerodha", {"api_key": "mysecretapikey123", "client_id": "AB1234"})
    assert res["status"] == "SUCCESS"
    assert "my***y123" in res["masked_key"] or "***" in res["masked_key"]

    # Test ping
    ping_res = await manager.test_broker_connection("zerodha")
    assert ping_res["status"] == "CONNECTED"
    assert ping_res["latency_ms"] > 0


def test_autonomous_bot_manager():
    from server.trading.bots.bot_engine import get_bot_manager

    mgr = get_bot_manager()
    bots = mgr.list_bots()
    assert len(bots) >= 4
    bot_types = [b["bot_type"] for b in bots]
    assert "BREAKOUT" in bot_types
    assert "MEAN_REVERSION" in bot_types
    assert "GRID" in bot_types
    assert "COUNCIL_AUTOPILOT" in bot_types

    # Create new bot
    new_bot = mgr.create_bot(
        name="Test DCA Ethereum",
        bot_type="DCA",
        symbol="ETH-USD",
        capital=5000.0,
        parameters={"step_pct": 2.5},
    )
    assert new_bot["id"].startswith("bot_dca_")
    assert new_bot["status"] == "RUNNING"

    # Toggle to PAUSED
    toggled = mgr.toggle_bot(new_bot["id"])
    assert toggled["status"] == "PAUSED"

    # Toggle back to RUNNING
    resumed = mgr.toggle_bot(new_bot["id"])
    assert resumed["status"] == "RUNNING"

    # Trigger iteration
    iter_res = mgr.trigger_iteration(new_bot["id"])
    assert iter_res["status"] == "EXECUTED"

    # Stop and delete
    stopped = mgr.stop_bot(new_bot["id"])
    assert stopped["status"] == "STOPPED"
    deleted = mgr.delete_bot(new_bot["id"])
    assert deleted is True


def test_options_derivatives_engine():
    from server.trading.derivatives.options_engine import get_options_engine

    engine = get_options_engine()

    # 1. Black-Scholes Greeks
    spot = 150.0
    strike = 150.0  # ATM
    t_years = 30 / 365.0
    vol = 0.25

    call = engine.black_scholes_greeks(spot, strike, t_years, vol, "CALL")
    assert call["price"] > 0
    assert 0.45 <= call["delta"] <= 0.60  # ATM call delta is ~0.50
    assert call["gamma"] > 0
    assert call["vega"] > 0
    assert call["theta"] < 0  # Time decay is negative

    put = engine.black_scholes_greeks(spot, strike, t_years, vol, "PUT")
    assert put["price"] > 0
    assert -0.60 <= put["delta"] <= -0.40  # ATM put delta is ~ -0.50
    assert put["gamma"] > 0
    assert put["vega"] > 0

    # 2. Max Pain Strike
    strikes = [140.0, 145.0, 150.0, 155.0, 160.0]
    calls_oi = [1000, 2000, 5000, 8000, 12000]
    puts_oi = [11000, 7500, 4800, 1500, 800]
    max_pain = engine.calculate_max_pain(strikes, calls_oi, puts_oi)
    assert max_pain in strikes

    # 3. Full Options Chain
    chain_data = engine.get_options_chain("AAPL")
    assert chain_data["symbol"] == "AAPL"
    assert "max_pain_strike" in chain_data
    assert "put_call_ratio" in chain_data
    assert len(chain_data["chain"]) > 0

    # 4. Multi-leg Strategy Payoffs
    payoff_bull = engine.generate_strategy_payoff("BULL_CALL_SPREAD", spot_price=150.0)
    assert payoff_bull["strategy"] == "BULL_CALL_SPREAD"
    assert payoff_bull["max_loss"] > 0
    assert payoff_bull["max_profit"] > 0
    assert len(payoff_bull["payoff_curve"]) > 0

    payoff_straddle = engine.generate_strategy_payoff("LONG_STRADDLE", spot_price=150.0)
    assert payoff_straddle["strategy"] == "LONG_STRADDLE"
    assert payoff_straddle["max_profit"] == "UNLIMITED"



