"""
QuantAdv - Quantitative Trading Platform
Copyright (C) 2026 John Varghese (J0X)
AGPL-3.0 License

Institutional Options & Derivatives Analytics Engine.
Calculates Black-Scholes analytical Greeks (Delta, Gamma, Theta, Vega, Rho),
Max Pain strike, Put-Call Ratio (PCR), and multi-leg strategy payoff curves.
"""

import math
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timezone
import pandas as pd
import numpy as np
import yfinance as yf

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# Standard Normal CDF & PDF via math.erf (Sub-microsecond, Zero-dependency)
# ─────────────────────────────────────────────────────────────────────────────

def norm_cdf(x: float) -> float:
    """Standard normal cumulative distribution function Phi(x)."""
    return 0.5 * (1.0 + math.erf(x / math.sqrt(2.0)))


def norm_pdf(x: float) -> float:
    """Standard normal probability density function phi(x)."""
    return math.exp(-0.5 * x * x) / math.sqrt(2.0 * math.pi)


class OptionsEngine:
    """
    Quantitative Derivatives Engine.
    Computes pricing, analytical Greeks, Max Pain, and multi-leg strategy payoffs.
    """

    def __init__(self, risk_free_rate: float = 0.045):
        self.r = risk_free_rate  # 4.5% baseline benchmark Treasury / Repo rate

    def black_scholes_greeks(
        self,
        spot: float,
        strike: float,
        time_to_expiry_years: float,
        volatility: float,
        option_type: str = "CALL",
    ) -> Dict[str, float]:
        """
        Calculates Black-Scholes price and 1st/2nd order Greeks.
        option_type: 'CALL' or 'PUT'
        """
        if spot <= 0 or strike <= 0 or volatility <= 0:
            return {
                "price": 0.0,
                "delta": 0.0,
                "gamma": 0.0,
                "theta": 0.0,
                "vega": 0.0,
                "rho": 0.0,
            }

        t = max(0.001, time_to_expiry_years)
        sqrt_t = math.sqrt(t)
        sigma = max(0.01, volatility)

        d1 = (math.log(spot / strike) + (self.r + 0.5 * sigma * sigma) * t) / (sigma * sqrt_t)
        d2 = d1 - sigma * sqrt_t

        pdf_d1 = norm_pdf(d1)
        discount = math.exp(-self.r * t)

        gamma = pdf_d1 / (spot * sigma * sqrt_t)
        vega = (spot * pdf_d1 * sqrt_t) / 100.0  # 1% move in IV

        is_call = option_type.upper() == "CALL"

        if is_call:
            price = spot * norm_cdf(d1) - strike * discount * norm_cdf(d2)
            delta = norm_cdf(d1)
            # Daily theta (per 1 day)
            theta = (- (spot * pdf_d1 * sigma) / (2.0 * sqrt_t) - self.r * strike * discount * norm_cdf(d2)) / 365.0
            rho = (strike * t * discount * norm_cdf(d2)) / 100.0
        else:
            price = strike * discount * norm_cdf(-d2) - spot * norm_cdf(-d1)
            delta = norm_cdf(d1) - 1.0
            theta = (- (spot * pdf_d1 * sigma) / (2.0 * sqrt_t) + self.r * strike * discount * norm_cdf(-d2)) / 365.0
            rho = (- strike * t * discount * norm_cdf(-d2)) / 100.0

        return {
            "price": round(max(0.01, price), 2),
            "delta": round(delta, 3),
            "gamma": round(gamma, 4),
            "theta": round(theta, 3),
            "vega": round(vega, 3),
            "rho": round(rho, 3),
        }

    def calculate_max_pain(self, strikes: List[float], calls_oi: List[int], puts_oi: List[int]) -> float:
        """
        Computes the 'Max Pain' strike—the price where option writers (institutions)
        suffer the minimal payout and option buyers lose the most capital at expiry.
        """
        if not strikes:
            return 0.0

        total_losses = []
        for test_strike in strikes:
            loss = 0.0
            for s, c_oi, p_oi in zip(strikes, calls_oi, puts_oi):
                # Call payout if spot finishes at test_strike
                if test_strike > s:
                    loss += (test_strike - s) * c_oi
                # Put payout if spot finishes at test_strike
                if test_strike < s:
                    loss += (s - test_strike) * p_oi
            total_losses.append(loss)

        min_idx = int(np.argmin(total_losses))
        return strikes[min_idx]

    def get_options_chain(self, symbol: str) -> Dict[str, Any]:
        """
        Retrieves options chain or generates institutional synthetic chain
        with full Greeks, OI matrix, PCR, and Max Pain strike.
        """
        symbol = symbol.upper().strip()
        spot_price = 150.0
        hist_vol = 0.28

        try:
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period="1mo")
            if not hist.empty:
                spot_price = float(hist["Close"].iloc[-1])
                returns = hist["Close"].pct_change().dropna()
                if len(returns) > 5:
                    hist_vol = float(returns.std() * math.sqrt(252))
        except Exception as e:
            logger.warning(f"Failed to fetch market data for options chain {symbol}: {e}")

        # Standard strike spacing based on asset price tier
        strike_step = 2.5 if spot_price < 100 else (5.0 if spot_price < 300 else 10.0)
        center_strike = round(spot_price / strike_step) * strike_step

        # 9 Strikes around center (-4 to +4)
        strikes = [round(center_strike + (i * strike_step), 2) for i in range(-4, 5)]

        # Time to expiry: 21 days (approx 3 weeks front-month)
        days_to_expiry = 21
        t_years = days_to_expiry / 365.0

        chain_rows = []
        calls_oi = []
        puts_oi = []

        total_call_oi = 0
        total_put_oi = 0
        total_call_vol = 0
        total_put_vol = 0

        for s in strikes:
            # Distance from ATM
            dist_pct = (s - spot_price) / spot_price
            # Skew / smile: OTM puts often trade at higher IV than OTM calls (volatility smirk)
            iv = max(0.12, hist_vol + (0.04 if s < spot_price else -0.02 * dist_pct))

            call_greeks = self.black_scholes_greeks(spot_price, s, t_years, iv, "CALL")
            put_greeks = self.black_scholes_greeks(spot_price, s, t_years, iv, "PUT")

            # Simulated institutional OI clustering around key strikes
            call_oi = int(max(200, 5000 * math.exp(-abs(dist_pct) * 8) + (1500 if s >= spot_price else 0)))
            put_oi = int(max(200, 4800 * math.exp(-abs(dist_pct) * 8) + (1800 if s <= spot_price else 0)))

            call_vol = int(call_oi * 0.25)
            put_vol = int(put_oi * 0.28)

            calls_oi.append(call_oi)
            puts_oi.append(put_oi)

            total_call_oi += call_oi
            total_put_oi += put_oi
            total_call_vol += call_vol
            total_put_vol += put_vol

            chain_rows.append({
                "strike": s,
                "iv": round(iv * 100, 1),
                "call": {
                    "price": call_greeks["price"],
                    "delta": call_greeks["delta"],
                    "gamma": call_greeks["gamma"],
                    "theta": call_greeks["theta"],
                    "vega": call_greeks["vega"],
                    "oi": call_oi,
                    "volume": call_vol,
                },
                "put": {
                    "price": put_greeks["price"],
                    "delta": put_greeks["delta"],
                    "gamma": put_greeks["gamma"],
                    "theta": put_greeks["theta"],
                    "vega": put_greeks["vega"],
                    "oi": put_oi,
                    "volume": put_vol,
                },
            })

        max_pain = self.calculate_max_pain(strikes, calls_oi, puts_oi)
        pcr_ratio = round(total_put_oi / max(1, total_call_oi), 2)

        # Sentiment Interpretation of PCR
        if pcr_ratio > 1.25:
            pcr_bias = "EXTREME_PUTS_OVERSOLD"
            pcr_sentiment = "Bullish Contrarian (Heavy put build-up provides strong downside floor)"
        elif pcr_ratio < 0.70:
            pcr_bias = "EXTREME_CALLS_OVERBOUGHT"
            pcr_sentiment = "Bearish Contrarian (Overcrowded call buying vulnerable to long squeeze)"
        else:
            pcr_bias = "BALANCED"
            pcr_sentiment = "Neutral / Healthy Distribution across Call and Put books"

        return {
            "symbol": symbol,
            "spot_price": round(spot_price, 2),
            "historical_volatility": round(hist_vol * 100, 1),
            "days_to_expiry": days_to_expiry,
            "max_pain_strike": max_pain,
            "put_call_ratio": pcr_ratio,
            "pcr_bias": pcr_bias,
            "pcr_sentiment": pcr_sentiment,
            "total_call_open_interest": total_call_oi,
            "total_put_open_interest": total_put_oi,
            "chain": chain_rows,
        }

    def generate_strategy_payoff(
        self,
        strategy_name: str,
        spot_price: float,
        strikes: Optional[List[float]] = None,
    ) -> Dict[str, Any]:
        """
        Generates terminal profit/loss curves and risk metrics for multi-leg strategies:
        BULL_CALL_SPREAD, BEAR_PUT_SPREAD, LONG_STRADDLE, COVERED_CALL, CASH_SECURED_PUT.
        """
        s0 = spot_price
        step = 5.0 if s0 < 200 else 10.0
        atm_strike = round(s0 / step) * step

        # Price simulation points from -15% to +15%
        price_range = np.linspace(s0 * 0.85, s0 * 1.15, 31)

        strat = strategy_name.upper()

        if strat == "BULL_CALL_SPREAD":
            # Buy ATM Call, Sell OTM Call
            k_long = atm_strike
            k_short = atm_strike + step
            prem_long = round(s0 * 0.04, 2)
            prem_short = round(s0 * 0.018, 2)
            net_debit = round(prem_long - prem_short, 2)
            max_loss = net_debit
            max_profit = round((k_short - k_long) - net_debit, 2)
            breakeven = round(k_long + net_debit, 2)

            curve = []
            for p in price_range:
                val_long = max(0.0, p - k_long)
                val_short = max(0.0, p - k_short)
                pnl = round(val_long - val_short - net_debit, 2)
                curve.append({"price": round(float(p), 2), "pnl": pnl})

            legs = [
                f"BUY 1x Call Strike ${k_long} @ ${prem_long}",
                f"SELL 1x Call Strike ${k_short} @ ${prem_short}",
            ]
            thesis = "Directional bullish play with protected downside and reduced volatility premium."

        elif strat == "BEAR_PUT_SPREAD":
            # Buy ATM Put, Sell OTM Put
            k_long = atm_strike
            k_short = atm_strike - step
            prem_long = round(s0 * 0.038, 2)
            prem_short = round(s0 * 0.016, 2)
            net_debit = round(prem_long - prem_short, 2)
            max_loss = net_debit
            max_profit = round((k_long - k_short) - net_debit, 2)
            breakeven = round(k_long - net_debit, 2)

            curve = []
            for p in price_range:
                val_long = max(0.0, k_long - p)
                val_short = max(0.0, k_short - p)
                pnl = round(val_long - val_short - net_debit, 2)
                curve.append({"price": round(float(p), 2), "pnl": pnl})

            legs = [
                f"BUY 1x Put Strike ${k_long} @ ${prem_long}",
                f"SELL 1x Put Strike ${k_short} @ ${prem_short}",
            ]
            thesis = "Moderately bearish outlook capitalizing on downward price momentum."

        elif strat == "LONG_STRADDLE":
            # Buy ATM Call + Buy ATM Put
            k = atm_strike
            prem_call = round(s0 * 0.035, 2)
            prem_put = round(s0 * 0.035, 2)
            net_debit = round(prem_call + prem_put, 2)
            max_loss = net_debit
            max_profit = float("inf")
            breakeven_up = round(k + net_debit, 2)
            breakeven_down = round(k - net_debit, 2)
            breakeven = f"${breakeven_down} & ${breakeven_up}"

            curve = []
            for p in price_range:
                val_call = max(0.0, p - k)
                val_put = max(0.0, k - p)
                pnl = round(val_call + val_put - net_debit, 2)
                curve.append({"price": round(float(p), 2), "pnl": pnl})

            legs = [
                f"BUY 1x Call Strike ${k} @ ${prem_call}",
                f"BUY 1x Put Strike ${k} @ ${prem_put}",
            ]
            thesis = "High-volatility event trade (earnings, rate decision) expecting explosive directional expansion."

        elif strat == "COVERED_CALL":
            # 100 Shares Long Stock + Sell OTM Call
            k_call = atm_strike + step
            prem = round(s0 * 0.025, 2)
            net_debit = s0 - prem
            max_profit = round((k_call - s0) + prem, 2)
            max_loss = round(s0 - prem, 2)
            breakeven = round(s0 - prem, 2)

            curve = []
            for p in price_range:
                stock_pnl = p - s0
                call_loss = max(0.0, p - k_call)
                pnl = round(stock_pnl - call_loss + prem, 2)
                curve.append({"price": round(float(p), 2), "pnl": pnl})

            legs = [
                f"HOLD 100x Shares Long @ ${s0:.2f}",
                f"SELL 1x OTM Call Strike ${k_call} @ ${prem}",
            ]
            thesis = "Cash-flow generating income strategy on long core holdings in neutral-to-mildly-bullish regimes."

        else:  # CASH_SECURED_PUT
            k_put = atm_strike - step
            prem = round(s0 * 0.022, 2)
            max_profit = prem
            max_loss = round(k_put - prem, 2)
            breakeven = round(k_put - prem, 2)

            curve = []
            for p in price_range:
                put_loss = max(0.0, k_put - p)
                pnl = round(prem - put_loss, 2)
                curve.append({"price": round(float(p), 2), "pnl": pnl})

            legs = [
                f"SELL 1x OTM Put Strike ${k_put} @ ${prem}",
                f"HOLD Cash Collateral ${k_put * 100:,.0f}",
            ]
            thesis = "Earn yield while waiting to acquire quality equities at an attractive discount."

        return {
            "strategy": strat,
            "underlying_price": round(s0, 2),
            "net_debit": net_debit,
            "max_profit": max_profit if max_profit != float("inf") else "UNLIMITED",
            "max_loss": max_loss,
            "breakeven": breakeven,
            "legs": legs,
            "thesis": thesis,
            "payoff_curve": curve,
        }


_options_engine_instance: Optional[OptionsEngine] = None


def get_options_engine() -> OptionsEngine:
    global _options_engine_instance
    if _options_engine_instance is None:
        _options_engine_instance = OptionsEngine()
    return _options_engine_instance
