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
Market Data API — fetches OHLCV, computes technical indicators.
Uses yfinance as primary source; stubs for Alpha Vantage and Binance.
"""
from datetime import datetime, timedelta

import numpy as np
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, Query

from auth.dependencies import get_current_user
from utils.cache import cache_get, cache_set
from utils.logger import logger

router = APIRouter()


def _fetch_yfinance(symbol: str, start: str, end: str, interval: str = "1d") -> pd.DataFrame:
    """Fetch OHLCV data from Yahoo Finance."""
    try:
        import yfinance as yf
        ticker = yf.Ticker(symbol)
        df = ticker.history(start=start, end=end, interval=interval)
        if df.empty:
            raise ValueError(f"No data for {symbol}")
        df = df.reset_index()
        df.columns = [c.lower() for c in df.columns]
        df["date"] = df["date"].astype(str).str[:10]
        return df
    except Exception as e:
        logger.error(f"yfinance error for {symbol}: {e}")
        raise HTTPException(status_code=422, detail=f"Could not fetch data for {symbol}: {e!s}")


def _compute_indicators(df: pd.DataFrame) -> pd.DataFrame:
    """Compute RSI, MACD, Bollinger Bands, Moving Averages."""
    close = df["close"]
    
    # Moving Averages
    df["ma_20"] = close.rolling(20).mean()
    df["ma_50"] = close.rolling(50).mean()
    df["ma_200"] = close.rolling(200).mean()
    df["ema_12"] = close.ewm(span=12, adjust=False).mean()
    df["ema_26"] = close.ewm(span=26, adjust=False).mean()

    # MACD
    df["macd"] = df["ema_12"] - df["ema_26"]
    df["macd_signal"] = df["macd"].ewm(span=9, adjust=False).mean()
    df["macd_hist"] = df["macd"] - df["macd_signal"]

    # RSI
    delta = close.diff()
    gain = delta.clip(lower=0).rolling(14).mean()
    loss = (-delta.clip(upper=0)).rolling(14).mean()
    rs = gain / (loss + 1e-10)
    df["rsi"] = 100 - (100 / (1 + rs))

    # Bollinger Bands
    df["bb_mid"] = close.rolling(20).mean()
    rolling_std = close.rolling(20).std()
    df["bb_upper"] = df["bb_mid"] + 2 * rolling_std
    df["bb_lower"] = df["bb_mid"] - 2 * rolling_std
    df["bb_width"] = df["bb_upper"] - df["bb_lower"]

    # Volume MA
    df["volume_ma"] = df["volume"].rolling(20).mean()

    # Momentum
    df["momentum"] = close.pct_change(10)

    return df.replace({np.nan: None})


@router.get("/ohlcv")
def get_ohlcv(
    symbol: str = Query(..., description="Ticker symbol, e.g. AAPL"),
    start: str = Query(default=None),
    end: str = Query(default=None),
    interval: str = Query(default="1d", description="1d, 1wk, 1mo, 1h"),
    current_user: dict = Depends(get_current_user),
):
    """Fetch OHLCV candlestick data with technical indicators."""
    if not end:
        end = datetime.now().strftime("%Y-%m-%d")
    if not start:
        start = (datetime.now() - timedelta(days=365)).strftime("%Y-%m-%d")

    cache_key = f"ohlcv:{symbol}:{start}:{end}:{interval}"
    cached = cache_get(cache_key)
    if cached:
        return cached

    df = _fetch_yfinance(symbol.upper(), start, end, interval)
    df = _compute_indicators(df)

    result = {
        "symbol": symbol.upper(),
        "interval": interval,
        "start": start,
        "end": end,
        "count": len(df),
        "data": df.to_dict(orient="records"),
    }
    cache_set(cache_key, result)
    return result


@router.get("/quote")
def get_quote(
    symbol: str = Query(...),
    current_user: dict = Depends(get_current_user),
):
    """Get latest quote for a symbol."""
    try:
        import yfinance as yf
        ticker = yf.Ticker(symbol.upper())
        info = ticker.fast_info
        hist = ticker.history(period="2d")
        if hist.empty:
            raise HTTPException(status_code=404, detail="Symbol not found")

        current_price = float(hist["Close"].iloc[-1])
        prev_price = float(hist["Close"].iloc[-2]) if len(hist) > 1 else current_price
        change = current_price - prev_price
        change_pct = (change / prev_price * 100) if prev_price else 0

        return {
            "symbol": symbol.upper(),
            "price": round(current_price, 4),
            "change": round(change, 4),
            "change_pct": round(change_pct, 4),
            "volume": int(hist["Volume"].iloc[-1]),
            "high": round(float(hist["High"].iloc[-1]), 4),
            "low": round(float(hist["Low"].iloc[-1]), 4),
            "open": round(float(hist["Open"].iloc[-1]), 4),
        }
    except Exception as e:
        raise HTTPException(status_code=422, detail=str(e))


@router.get("/search")
def search_symbols(
    q: str = Query(..., min_length=1),
    current_user: dict = Depends(get_current_user),
):
    """Search for ticker symbols using Yahoo Finance."""
    import requests
    try:
        url = f"https://query2.finance.yahoo.com/v1/finance/search?q={q}"
        headers = {'User-Agent': 'Mozilla/5.0'}
        response = requests.get(url, headers=headers, timeout=5)
        response.raise_for_status()
        data = response.json()
        
        results = []
        for quote in data.get('quotes', []):
            if 'symbol' in quote and 'shortname' in quote:
                results.append({
                    "symbol": quote['symbol'],
                    "name": quote['shortname'],
                    "type": quote.get('quoteType', 'UNKNOWN').lower(),
                    "exchange": quote.get('exchange', 'UNKNOWN')
                })
        
        return {"results": results[:10]}
    except Exception as e:
        logger.error(f"Search API error: {e}")
        # Fallback to popular if API fails
        popular = [
            {"symbol": "AAPL", "name": "Apple Inc.", "type": "stock", "exchange": "NMS"},
            {"symbol": "MSFT", "name": "Microsoft Corporation", "type": "stock", "exchange": "NMS"},
        ]
        q_upper = q.upper()
        results = [s for s in popular if q_upper in s["symbol"] or q_upper in s["name"].upper()]
        return {"results": results[:10]}


@router.get("/live-prices")
def get_live_prices(
    symbols: str = Query(default="AAPL,MSFT,GOOGL,TSLA,BTC-USD"),
    current_user: dict = Depends(get_current_user),
):
    """Get current prices for multiple symbols (ticker bar)."""
    import yfinance as yf
    symbol_list = [s.strip() for s in symbols.split(",")]
    results = []
    for sym in symbol_list[:10]:
        try:
            ticker = yf.Ticker(sym)
            hist = ticker.history(period="2d")
            if not hist.empty:
                curr = float(hist["Close"].iloc[-1])
                prev = float(hist["Close"].iloc[-2]) if len(hist) > 1 else curr
                change_pct = ((curr - prev) / prev * 100) if prev else 0
                results.append({
                    "symbol": sym,
                    "price": round(curr, 4),
                    "change_pct": round(change_pct, 2),
                    "positive": change_pct >= 0,
                })
        except Exception:
            pass
    return {"prices": results}


@router.get("/indicators/{symbol}")
def get_indicators(
    symbol: str,
    start: str = Query(default=None),
    end: str = Query(default=None),
    current_user: dict = Depends(get_current_user),
):
    """Fetch pre-computed technical indicators for a symbol."""
    if not end:
        end = datetime.now().strftime("%Y-%m-%d")
    if not start:
        start = (datetime.now() - timedelta(days=365)).strftime("%Y-%m-%d")

    df = _fetch_yfinance(symbol.upper(), start, end)
    df = _compute_indicators(df)

    cols = ["date", "close", "rsi", "macd", "macd_signal", "macd_hist",
            "bb_upper", "bb_mid", "bb_lower", "ma_20", "ma_50", "momentum"]
    return {"symbol": symbol.upper(), "indicators": df[cols].to_dict(orient="records")}
