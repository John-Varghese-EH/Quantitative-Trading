"""
Dashboard API — aggregated portfolio and system metrics (Firestore).
"""
from datetime import datetime, timedelta
import yfinance as yf
from fastapi import APIRouter, Depends

from database.firestore import get_db
from auth.dependencies import get_current_user
from api.portfolio import get_current_prices
from google.cloud.firestore_v1.base_query import FieldFilter

router = APIRouter()

@router.get("/stats")
def get_dashboard_stats(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db),
):
    """Return aggregated dashboard statistics for the current user."""
    uid = current_user.get("id")
    user_ref = db.collection("users").document(uid)
    
    # ML Models
    models_docs = list(user_ref.collection("models").stream())
    ready_models = [m for m in models_docs if m.to_dict().get("status") == "ready"]
    avg_accuracy = (
        sum(m.to_dict().get("accuracy", 0) or 0 for m in ready_models) / len(ready_models)
        if ready_models else 0
    )

    # Trades
    trades_docs = list(user_ref.collection("trades").stream())
    closed_trades = [t for t in trades_docs if t.to_dict().get("status") == "closed"]
    open_trades = [t for t in trades_docs if t.to_dict().get("status") == "open"]
    
    total_realized_pnl = sum(float(t.to_dict().get("profit_loss", 0)) for t in closed_trades)
    winning_trades = [t for t in closed_trades if float(t.to_dict().get("profit_loss", 0)) > 0]
    win_rate = (len(winning_trades) / len(closed_trades) * 100) if closed_trades else 0

    # Calculate real Unrealized PnL for open trades
    symbols = list(set([t.to_dict().get("symbol") for t in open_trades if t.to_dict().get("symbol")]))
    current_prices = get_current_prices(symbols)
    
    total_unrealized_pnl = 0.0
    for t in open_trades:
        td = t.to_dict()
        sym = td.get("symbol")
        entry = float(td.get("entry_price", 0))
        qty = float(td.get("quantity", 0))
        side = td.get("side", "long")
        curr = current_prices.get(sym)
        if curr and entry:
            if side == "long":
                total_unrealized_pnl += (curr - entry) * qty
            else:
                total_unrealized_pnl += (entry - curr) * qty

    # Attacks
    attacks_count = len(list(user_ref.collection("attacks").stream()))

    # Backtests
    backtests_docs = list(user_ref.collection("backtests").stream())
    best_backtest = max(backtests_docs, key=lambda b: float(b.to_dict().get("total_return", 0)), default=None)
    best_return = float(best_backtest.to_dict().get("total_return", 0)) if best_backtest else 0

    # Portfolio value
    portfolio_value = 10000 + total_realized_pnl + total_unrealized_pnl
    
    # Use SPY as a baseline for risk score (VIX proxy would be better, but SPY volatility works)
    try:
        spy = yf.download("SPY", period="1mo", progress=False)
        daily_returns = spy['Close'].pct_change().dropna()
        volatility = float(daily_returns.std().iloc[0] * 100) if isinstance(daily_returns.std(), yf.shared._pd.Series) else float(daily_returns.std() * 100)
        risk_score = min(100, max(0, volatility * 20)) # Scale volatility to 0-100
    except:
        risk_score = 50.0

    return {
        "portfolio_value": round(portfolio_value, 2),
        "daily_pnl": round(total_unrealized_pnl, 2), # Using unrealized as daily proxy
        "daily_pnl_pct": round((total_unrealized_pnl / portfolio_value * 100) if portfolio_value else 0, 2),
        "ai_confidence": round(avg_accuracy * 100, 1) if avg_accuracy else 0,
        "model_accuracy": round(avg_accuracy * 100, 1) if avg_accuracy else 0,
        "risk_score": round(risk_score, 1),
        "open_positions": len(open_trades),
        "total_trades": len(closed_trades),
        "win_rate": round(win_rate, 1),
        "total_models": len(models_docs),
        "ready_models": len(ready_models),
        "total_attacks": attacks_count,
        "best_strategy_return": round(best_return, 2),
    }


@router.get("/portfolio-history")
def get_portfolio_history(
    days: int = 30,
    current_user: dict = Depends(get_current_user),
):
    """Return portfolio value history mapping to market SPY performance."""
    history = []
    initial = 10000.0
    
    # We will fetch SPY history for the last N days and apply its % change to our initial portfolio
    try:
        end = datetime.now()
        start = end - timedelta(days=days+5) # extra days for weekends
        spy = yf.download("SPY", start=start.strftime("%Y-%m-%d"), end=end.strftime("%Y-%m-%d"), progress=False)
        
        # Take the last 'days' rows
        spy = spy.tail(days)
        base_price = float(spy['Close'].iloc[0].iloc[0]) if hasattr(spy['Close'].iloc[0], 'iloc') else float(spy['Close'].iloc[0])
        
        for idx, row in spy.iterrows():
            close_price = float(row['Close'].iloc[0]) if hasattr(row['Close'], 'iloc') else float(row['Close'])
            ratio = close_price / base_price
            val = initial * ratio
            history.append({"date": idx.strftime("%Y-%m-%d"), "value": round(val, 2)})
            
        current = float(history[-1]["value"]) if history else initial
    except Exception as e:
        print(f"Error fetching portfolio history proxy: {e}")
        # Fallback to flat
        for i in range(days, -1, -1):
            date = (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d")
            history.append({"date": date, "value": initial})
        current = initial
        
    return {"history": history, "initial": initial, "current": current}


@router.get("/market-heatmap")
def get_market_heatmap(current_user: dict = Depends(get_current_user)):
    """Return real sector heatmap data using Sector ETFs."""
    sector_etfs = {
        "Technology": {"ticker": "XLK", "symbols": ["AAPL", "MSFT", "NVDA"]},
        "Healthcare": {"ticker": "XLV", "symbols": ["JNJ", "PFE", "UNH"]},
        "Finance": {"ticker": "XLF", "symbols": ["JPM", "BAC", "GS"]},
        "Energy": {"ticker": "XLE", "symbols": ["XOM", "CVX", "BP"]},
        "Consumer": {"ticker": "XLY", "symbols": ["AMZN", "TSLA", "NKE"]},
        "Industrials": {"ticker": "XLI", "symbols": ["BA", "CAT", "GE"]},
        "Real Estate": {"ticker": "XLRE", "symbols": ["AMT", "PLD", "SPG"]},
    }
    
    sectors = []
    try:
        tickers_str = " ".join([data["ticker"] for data in sector_etfs.values()])
        etf_data = yf.Tickers(tickers_str)
        
        for name, data in sector_etfs.items():
            ticker = data["ticker"]
            try:
                # Get daily change percentage
                hist = etf_data.tickers[ticker].history(period="2d")
                if len(hist) >= 2:
                    prev_close = float(hist['Close'].iloc[0])
                    curr_close = float(hist['Close'].iloc[1])
                    change_pct = ((curr_close - prev_close) / prev_close) * 100
                else:
                    change_pct = 0.0
            except:
                change_pct = 0.0
                
            sectors.append({
                "sector": name,
                "change": round(change_pct, 2),
                "symbols": data["symbols"]
            })
            
        # Add Crypto manually since it's not a standard ETF
        try:
            btc = yf.Ticker("BTC-USD").history(period="2d")
            if len(btc) >= 2:
                prev_close = float(btc['Close'].iloc[0])
                curr_close = float(btc['Close'].iloc[1])
                change_pct = ((curr_close - prev_close) / prev_close) * 100
            else:
                change_pct = 0.0
            sectors.append({
                "sector": "Crypto",
                "change": round(change_pct, 2),
                "symbols": ["BTC-USD", "ETH-USD"]
            })
        except:
            pass
            
    except Exception as e:
        print(f"Heatmap error: {e}")
        
    return {"sectors": sectors}
