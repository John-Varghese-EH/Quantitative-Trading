# QuantAdv - Quantitative Trading Platform
# Copyright (C) 2026 John Varghese (J0X)
# AGPL-3.0 License

"""
High-Fidelity Paper Trading Simulation Engine.
Realistic order matching with slippage, transaction fees, position management,
and balance persistence.
"""

from __future__ import annotations

import json
import logging
import os
import uuid
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

STORAGE_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "paper_account.json"


@dataclass
class PaperOrder:
    id: str
    symbol: str
    side: str  # "BUY" or "SELL"
    order_type: str  # "MARKET", "LIMIT", "STOP_LOSS"
    quantity: float
    requested_price: float
    status: str  # "OPEN", "FILLED", "CANCELLED", "REJECTED"
    filled_price: Optional[float] = None
    filled_at: Optional[str] = None
    slippage: float = 0.0
    fee: float = 0.0
    created_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


@dataclass
class PaperPosition:
    symbol: str
    quantity: float
    entry_price: float
    current_price: float
    unrealized_pnl: float
    unrealized_pnl_pct: float
    realized_pnl: float
    updated_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class PaperTradingEngine:
    """
    Sub-millisecond simulated matching engine for retail & algorithmic paper trading.
    Allows risk-free testing of strategies with realistic execution friction.
    """

    def __init__(self, initial_cash: float = 100_000.0):
        self.initial_cash = initial_cash
        self.cash = initial_cash
        self.realized_pnl_total = 0.0
        self.positions: Dict[str, PaperPosition] = {}
        self.open_orders: List[PaperOrder] = []
        self.trade_history: List[PaperOrder] = []
        self._load_state()

    def _save_state(self) -> None:
        """Persists account state to disk."""
        try:
            STORAGE_PATH.parent.mkdir(parents=True, exist_ok=True)
            data = {
                "initial_cash": self.initial_cash,
                "cash": self.cash,
                "realized_pnl_total": self.realized_pnl_total,
                "positions": {k: asdict(v) for k, v in self.positions.items()},
                "open_orders": [asdict(o) for o in self.open_orders],
                "trade_history": [asdict(o) for o in self.trade_history[-200:]],
            }
            with open(STORAGE_PATH, "w") as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            logger.warning(f"Could not persist paper trading state: {e}")

    def _load_state(self) -> None:
        """Loads state if previous session exists."""
        if not STORAGE_PATH.exists():
            return
        try:
            with open(STORAGE_PATH, "r") as f:
                data = json.load(f)
            self.initial_cash = data.get("initial_cash", self.initial_cash)
            self.cash = data.get("cash", self.cash)
            self.realized_pnl_total = data.get("realized_pnl_total", 0.0)

            self.positions = {}
            for k, v in data.get("positions", {}).items():
                self.positions[k] = PaperPosition(**v)

            self.open_orders = [PaperOrder(**o) for o in data.get("open_orders", [])]
            self.trade_history = [PaperOrder(**o) for o in data.get("trade_history", [])]
        except Exception as e:
            logger.error(f"Failed to load paper trading state: {e}")

    def get_portfolio_value(self) -> float:
        """Calculates total current equity (Cash + Market Value of open positions)."""
        holdings_value = sum(p.quantity * p.current_price for p in self.positions.values())
        return self.cash + holdings_value

    def update_market_prices(self, price_map: Dict[str, float]) -> None:
        """Updates market prices and recalculates unrealized PnL."""
        for symbol, current_price in price_map.items():
            if symbol in self.positions:
                pos = self.positions[symbol]
                pos.current_price = current_price
                pos.unrealized_pnl = (current_price - pos.entry_price) * pos.quantity
                pos.unrealized_pnl_pct = round(((current_price - pos.entry_price) / (pos.entry_price + 1e-6)) * 100, 2)
                pos.updated_at = datetime.now(timezone.utc).isoformat()

        self._check_pending_orders(price_map)
        self._save_state()

    def _check_pending_orders(self, price_map: Dict[str, float]) -> None:
        """Matches open limit or stop-loss orders against current market prices."""
        remaining_orders = []
        for order in self.open_orders:
            curr_price = price_map.get(order.symbol)
            if not curr_price:
                remaining_orders.append(order)
                continue

            filled = False
            if order.order_type == "LIMIT":
                if order.side == "BUY" and curr_price <= order.requested_price:
                    self._fill_order(order, order.requested_price)
                    filled = True
                elif order.side == "SELL" and curr_price >= order.requested_price:
                    self._fill_order(order, order.requested_price)
                    filled = True

            elif order.order_type == "STOP_LOSS":
                if order.side == "SELL" and curr_price <= order.requested_price:
                    self._fill_order(order, curr_price)
                    filled = True

            if not filled:
                remaining_orders.append(order)

        self.open_orders = remaining_orders

    def place_order(
        self,
        symbol: str,
        side: str,
        quantity: float,
        order_type: str = "MARKET",
        requested_price: Optional[float] = None,
        market_price: Optional[float] = None,
    ) -> PaperOrder:
        """Submits an order into the paper simulation."""
        symbol = symbol.upper().strip()
        side = side.upper().strip()
        order_type = order_type.upper().strip()

        price = requested_price or market_price or 100.0

        order = PaperOrder(
            id=f"paper-{uuid.uuid4().hex[:8]}",
            symbol=symbol,
            side=side,
            order_type=order_type,
            quantity=quantity,
            requested_price=price,
            status="OPEN",
        )

        if order_type == "MARKET":
            # Immediate fill with realistic slippage (0.05%) and commission ($1.00 or 0.02%)
            fill_price = market_price or price
            slippage_pct = 0.0005 if side == "BUY" else -0.0005
            actual_fill = fill_price * (1 + slippage_pct)
            order.slippage = abs(actual_fill - fill_price) * quantity
            order.fee = max(1.0, actual_fill * quantity * 0.0002)

            self._fill_order(order, round(actual_fill, 2))
        else:
            self.open_orders.append(order)

        self._save_state()
        return order

    def _fill_order(self, order: PaperOrder, fill_price: float) -> None:
        """Executes the order fill and updates cash & positions."""
        cost = (order.quantity * fill_price) + order.fee

        if order.side == "BUY":
            if self.cash < cost:
                order.status = "REJECTED"
                logger.warning(f"Paper Order {order.id} rejected: Insufficient funds (need ${cost:,.2f}, have ${self.cash:,.2f})")
                self.trade_history.append(order)
                return

            self.cash -= cost

            if order.symbol in self.positions:
                existing = self.positions[order.symbol]
                total_qty = existing.quantity + order.quantity
                avg_entry = ((existing.quantity * existing.entry_price) + (order.quantity * fill_price)) / total_qty
                existing.quantity = total_qty
                existing.entry_price = round(avg_entry, 2)
                existing.current_price = fill_price
                existing.unrealized_pnl = (fill_price - avg_entry) * total_qty
            else:
                self.positions[order.symbol] = PaperPosition(
                    symbol=order.symbol,
                    quantity=order.quantity,
                    entry_price=fill_price,
                    current_price=fill_price,
                    unrealized_pnl=0.0,
                    unrealized_pnl_pct=0.0,
                    realized_pnl=0.0,
                )

        elif order.side == "SELL":
            if order.symbol not in self.positions or self.positions[order.symbol].quantity < order.quantity:
                order.status = "REJECTED"
                logger.warning(f"Paper Order {order.id} rejected: Insufficient position to sell.")
                self.trade_history.append(order)
                return

            pos = self.positions[order.symbol]
            proceeds = (order.quantity * fill_price) - order.fee
            self.cash += proceeds

            trade_realized = (fill_price - pos.entry_price) * order.quantity
            pos.realized_pnl += trade_realized
            self.realized_pnl_total += trade_realized

            pos.quantity -= order.quantity
            if pos.quantity <= 1e-6:
                del self.positions[order.symbol]
            else:
                pos.unrealized_pnl = (fill_price - pos.entry_price) * pos.quantity

        order.status = "FILLED"
        order.filled_price = fill_price
        order.filled_at = datetime.now(timezone.utc).isoformat()
        self.trade_history.append(order)

    def cancel_order(self, order_id: str) -> bool:
        """Cancels an open order."""
        for i, order in enumerate(self.open_orders):
            if order.id == order_id:
                order.status = "CANCELLED"
                self.trade_history.append(order)
                self.open_orders.pop(i)
                self._save_state()
                return True
        return False

    def close_all_positions(self) -> List[PaperOrder]:
        """Emergency Panic: closes every open position at current market price."""
        closed_orders = []
        for symbol, pos in list(self.positions.items()):
            order = self.place_order(
                symbol=symbol,
                side="SELL",
                quantity=pos.quantity,
                order_type="MARKET",
                market_price=pos.current_price,
            )
            closed_orders.append(order)
        return closed_orders

    def reset_account(self, new_cash: Optional[float] = None) -> None:
        """Resets paper account back to starting capital."""
        self.cash = new_cash or self.initial_cash
        self.realized_pnl_total = 0.0
        self.positions.clear()
        self.open_orders.clear()
        self.trade_history.clear()
        self._save_state()

    def get_summary(self) -> Dict[str, Any]:
        """Provides complete real-time dashboard snapshot."""
        portfolio_val = self.get_portfolio_value()
        total_pnl = portfolio_val - self.initial_cash
        total_pnl_pct = round((total_pnl / self.initial_cash) * 100, 2)

        return {
            "initial_cash": self.initial_cash,
            "cash": round(self.cash, 2),
            "portfolio_value": round(portfolio_val, 2),
            "total_pnl": round(total_pnl, 2),
            "total_pnl_pct": total_pnl_pct,
            "realized_pnl": round(self.realized_pnl_total, 2),
            "open_positions_count": len(self.positions),
            "open_positions": [asdict(p) for p in self.positions.values()],
            "open_orders": [asdict(o) for o in self.open_orders],
            "recent_trades": [asdict(o) for o in self.trade_history[-15:]],
        }


# Global singleton factory
_paper_engine_instance: Optional[PaperTradingEngine] = None


def get_paper_engine() -> PaperTradingEngine:
    global _paper_engine_instance
    if _paper_engine_instance is None:
        _paper_engine_instance = PaperTradingEngine()
    return _paper_engine_instance
