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

"""Trading performance metrics."""
import numpy as np
import pandas as pd
from typing import List


def compute_sharpe(returns: pd.Series, risk_free_rate: float = 0.05) -> float:
    daily_returns = returns.pct_change().dropna()
    if daily_returns.std() == 0:
        return 0.0
    excess = daily_returns - risk_free_rate / 252
    return round(float(excess.mean() / daily_returns.std() * np.sqrt(252)), 4)


def compute_max_drawdown(equity: pd.Series) -> float:
    peak = equity.cummax()
    drawdown = (equity - peak) / (peak + 1e-10)
    return round(float(drawdown.min() * 100), 2)


def compute_win_rate(trade_log: List[dict]) -> float:
    sells = [t for t in trade_log if t.get("type") == "SELL"]
    if not sells:
        return 0.0
    winners = [t for t in sells if t.get("pnl", 0) > 0]
    return round(len(winners) / len(sells) * 100, 2)


def compute_cagr(initial: float, final: float, years: float) -> float:
    if years <= 0 or initial <= 0:
        return 0.0
    return round(((final / initial) ** (1 / years) - 1) * 100, 2)


def compute_sortino(returns: pd.Series, risk_free_rate: float = 0.05) -> float:
    daily_returns = returns.pct_change().dropna()
    excess = daily_returns - risk_free_rate / 252
    downside = daily_returns[daily_returns < 0].std()
    if downside == 0:
        return 0.0
    return round(float(excess.mean() / downside * np.sqrt(252)), 4)
