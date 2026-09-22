# QuantAdv - Quantitative Trading Platform
# Copyright (C) 2026 John Varghese (J0X)
# AGPL-3.0 License

"""
Pre-Trade Legal & Regulatory Compliance Firewall.
Supports US (SEC Rule 15c3-5, FINRA PDT), India (SEBI Circulars, Circuit limits),
EU/UK (MiFID II RTS 6 kill switches, order throttles), and Global self-custodial safety.
"""

from __future__ import annotations

import logging
from dataclasses import asdict, dataclass, field
from datetime import datetime, time, timezone
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)


@dataclass
class ComplianceResult:
    passed: bool
    jurisdiction: str
    rejections: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)
    timestamp: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    @property
    def rejection_reason(self) -> str:
        return "; ".join(self.rejections) if self.rejections else ""


@dataclass
class ComplianceConfig:
    # US SEC & FINRA settings
    max_order_notional: float = 100_000.0  # SEC Rule 15c3-5 fat-finger limit
    max_position_pct: float = 0.25  # Max 25% of account in a single ticker
    pdt_min_equity: float = 25_000.0  # FINRA Pattern Day Trader threshold

    # Indian SEBI settings
    enforce_ist_market_hours: bool = False
    nse_circuit_limit_pct: float = 0.20  # 20% max price deviation collar
    sebi_non_guaranteed_disclaimer: str = (
        "Securities trading is subject to market risks. Past algorithmic performance "
        "does not guarantee future returns. QuantAdv does not offer guaranteed profit schemes."
    )

    # EU MiFID II RTS 6 settings
    max_orders_per_minute: int = 60  # Order-to-Trade Ratio (OTR) throttle
    mandatory_stop_loss_required: bool = False

    # Global Hard Circuit Breakers
    max_daily_loss_pct: float = 0.05  # 5% daily loss limit halts all trading
    max_drawdown_limit_pct: float = 0.15  # 15% overall drawdown freezes bots


class ComplianceFirewall:
    """
    Mandatory pre-trade validation engine.
    Every order—whether Paper or Live—MUST pass through this firewall before execution.
    """

    def __init__(self, config: Optional[ComplianceConfig] = None):
        self.config = config or ComplianceConfig()
        self.kill_switch_active: bool = False
        self.kill_switch_reason: Optional[str] = None
        self.recent_order_timestamps: List[datetime] = []
        self.daily_starting_equity: float = 100_000.0
        self.current_equity: float = 100_000.0
        self.peak_equity: float = 100_000.0
        self.day_trade_count: int = 0
        self.audit_log: List[Dict[str, Any]] = []

    def activate_kill_switch(self, reason: str = "Manual User Trigger / Emergency Stop") -> None:
        """Instantly disables all order processing across all connected accounts."""
        self.kill_switch_active = True
        self.kill_switch_reason = reason
        logger.critical(f"🛑 [KILL SWITCH ACTIVATED]: {reason}")
        self._log_audit("KILL_SWITCH_ENGAGED", {"reason": reason})

    def deactivate_kill_switch(self) -> None:
        """Resets the kill switch with explicit user override."""
        self.kill_switch_active = False
        self.kill_switch_reason = None
        logger.info("✅ [KILL SWITCH DISENGAGED]: System returned to normal trading state")
        self._log_audit("KILL_SWITCH_RESET", {})

    def update_portfolio_equity(self, current_equity: float) -> None:
        """Update tracked equity for daily loss and peak-to-trough drawdown checks."""
        self.current_equity = current_equity
        if current_equity > self.peak_equity:
            self.peak_equity = current_equity

        # Daily loss circuit breaker check
        daily_loss_pct = (self.daily_starting_equity - self.current_equity) / (self.daily_starting_equity + 1e-6)
        if daily_loss_pct >= self.config.max_daily_loss_pct:
            self.activate_kill_switch(
                f"Automatic Daily Loss Breaker: Portfolio dropped {daily_loss_pct*100:.1f}% "
                f"(Exceeded {self.config.max_daily_loss_pct*100}% limit)"
            )

        # Max Drawdown check
        drawdown_pct = (self.peak_equity - self.current_equity) / (self.peak_equity + 1e-6)
        if drawdown_pct >= self.config.max_drawdown_limit_pct:
            self.activate_kill_switch(
                f"Maximum Drawdown Limit Hit: Current drawdown {drawdown_pct*100:.1f}% "
                f"exceeds {self.config.max_drawdown_limit_pct*100}% safety collar."
            )

    def validate_order(
        self,
        symbol: str,
        side: str,  # "BUY" or "SELL"
        quantity: float,
        price: float,
        portfolio_value: float,
        jurisdiction: str = "GLOBAL",
        has_stop_loss: bool = False,
    ) -> ComplianceResult:
        """
        Runs comprehensive regulatory and safety checks.
        Returns ComplianceResult(passed=True/False, rejections=[...], warnings=[...]).
        """
        rejections: List[str] = []
        warnings: List[str] = []
        order_notional = quantity * price
        now_utc = datetime.now(timezone.utc)

        # 1. Global Kill-Switch Check
        if self.kill_switch_active:
            rejections.append(f"Global Kill Switch is ACTIVE: {self.kill_switch_reason}")
            return ComplianceResult(passed=False, jurisdiction=jurisdiction, rejections=rejections)

        # 2. SEC Rule 15c3-5: Fat-Finger / Max Notional Check
        if order_notional > self.config.max_order_notional:
            rejections.append(
                f"[SEC 15c3-5] Order value (${order_notional:,.2f}) exceeds maximum single-order ceiling "
                f"(${self.config.max_order_notional:,.2f})."
            )

        # 3. Max Single Position Concentration Check
        if portfolio_value > 0:
            order_pct = order_notional / portfolio_value
            if order_pct > self.config.max_position_pct:
                rejections.append(
                    f"Position concentration hazard: Order allocates {order_pct*100:.1f}% of total portfolio "
                    f"(Limit: {self.config.max_position_pct*100}%)."
                )

        # 4. MiFID II RTS 6: Order Rate Throttling (Spam / Loop Prevention)
        self.recent_order_timestamps = [
            t for t in self.recent_order_timestamps if (now_utc - t).total_seconds() < 60
        ]
        if len(self.recent_order_timestamps) >= self.config.max_orders_per_minute:
            rejections.append(
                f"[MiFID II RTS 6] Rate limit exceeded: Maximum {self.config.max_orders_per_minute} orders/minute allowed."
            )
        else:
            self.recent_order_timestamps.append(now_utc)

        # 5. Mandatory Stop Loss Check (if enabled)
        if self.config.mandatory_stop_loss_required and not has_stop_loss and side.upper() == "BUY":
            rejections.append("Policy violation: Every algorithmic entry order must specify an active Stop-Loss.")

        # 6. Jurisdiction Specific Checks
        if jurisdiction.upper() in ["IN", "INDIA"]:
            # SEBI Indian Equity Rules
            if symbol.endswith(".NS") or symbol.endswith(".BO") or not ("-" in symbol or symbol.endswith("USD")):
                # Check IST trading hours: 09:15 to 15:30 IST (UTC + 5:30)
                if self.config.enforce_ist_market_hours:
                    ist_hour = (now_utc.hour + 5 + (now_utc.minute + 30) // 60) % 24
                    ist_minute = (now_utc.minute + 30) % 60
                    current_ist_time = time(ist_hour, ist_minute)
                    if not (time(9, 15) <= current_ist_time <= time(15, 30)):
                        rejections.append(
                            f"[SEBI Market Hours] Order rejected: Indian markets open 09:15 to 15:30 IST (Current IST: {current_ist_time.strftime('%H:%M')})."
                        )
            warnings.append(self.config.sebi_non_guaranteed_disclaimer)

        elif jurisdiction.upper() in ["US", "USA"]:
            # FINRA PDT Warning
            if portfolio_value < self.config.pdt_min_equity and self.day_trade_count >= 3:
                warnings.append(
                    f"[FINRA PDT Rule] Account equity is under ${self.config.pdt_min_equity:,.0f} and day trades >= 3. "
                    "Further round-trip intraday trades will trigger Pattern Day Trader lock."
                )

        passed = len(rejections) == 0

        self._log_audit(
            "ORDER_VALIDATION",
            {
                "symbol": symbol,
                "side": side,
                "notional": order_notional,
                "passed": passed,
                "rejections": rejections,
            },
        )

        return ComplianceResult(
            passed=passed,
            jurisdiction=jurisdiction,
            rejections=rejections,
            warnings=warnings,
        )

    def _log_audit(self, action: str, details: Dict[str, Any]) -> None:
        entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "action": action,
            "details": details,
        }
        self.audit_log.append(entry)
        if len(self.audit_log) > 500:
            self.audit_log.pop(0)


# Global singleton factory
_firewall_instance: Optional[ComplianceFirewall] = None


def get_compliance_firewall() -> ComplianceFirewall:
    global _firewall_instance
    if _firewall_instance is None:
        _firewall_instance = ComplianceFirewall()
    return _firewall_instance
