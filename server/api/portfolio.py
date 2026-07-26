"""Portfolio API — open positions and P&L tracking (Firestore)."""
from fastapi import APIRouter, Depends
from database.firestore import get_db
from auth.dependencies import get_current_user
from google.cloud.firestore_v1.base_query import FieldFilter
import yfinance as yf

router = APIRouter()

def get_current_prices(symbols):
    """Fetch current prices for a list of symbols."""
    if not symbols:
        return {}
    try:
        # Fetching latest prices efficiently
        tickers = yf.Tickers(" ".join(symbols))
        prices = {}
        for sym in symbols:
            try:
                # yfinance API can be inconsistent, use fast_info or history
                prices[sym] = tickers.tickers[sym].fast_info['last_price']
            except:
                try:
                    df = tickers.tickers[sym].history(period="1d")
                    if not df.empty:
                        prices[sym] = df['Close'].iloc[-1]
                except:
                    prices[sym] = None
        return prices
    except Exception as e:
        print(f"Error fetching prices: {e}")
        return {}

@router.get("/positions")
def get_positions(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db),
):
    uid = current_user.get("id")
    trades_ref = db.collection("users").document(uid).collection("trades")
    # Fetch open trades
    docs = list(trades_ref.where(filter=FieldFilter("status", "==", "open")).stream())
    
    positions = []
    symbols = list(set([doc.to_dict().get("symbol") for doc in docs if doc.to_dict().get("symbol")]))
    
    # Fetch real-time prices for all unique symbols
    current_prices = get_current_prices(symbols)
    
    for doc in docs:
        t = doc.to_dict()
        sym = t.get("symbol")
        entry_price = float(t.get("entry_price", 0))
        quantity = float(t.get("quantity", 0))
        side = t.get("side", "long")
        
        current_price = current_prices.get(sym)
        
        unrealized_pnl = 0.0
        if current_price and entry_price:
            if side == "long":
                unrealized_pnl = (current_price - entry_price) * quantity
            else: # short
                unrealized_pnl = (entry_price - current_price) * quantity
                
        positions.append({
            "id": doc.id,
            "symbol": sym,
            "strategy": t.get("strategy"),
            "side": side,
            "entry_price": entry_price,
            "current_price": round(current_price, 2) if current_price else entry_price,
            "quantity": quantity,
            "unrealized_pnl": round(unrealized_pnl, 2),
            "opened_at": t.get("opened_at"),
        })
        
    return {"positions": positions}


@router.get("/history")
def get_trade_history(
    limit: int = 50,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db),
):
    uid = current_user.get("id")
    trades_ref = db.collection("users").document(uid).collection("trades")
    
    docs = trades_ref.order_by("opened_at", direction="DESCENDING").limit(limit).stream()
    
    trades = []
    for doc in docs:
        t = doc.to_dict()
        trades.append({
            "id": doc.id,
            "symbol": t.get("symbol"),
            "strategy": t.get("strategy"),
            "side": t.get("side"),
            "entry_price": t.get("entry_price"),
            "exit_price": t.get("exit_price"),
            "quantity": t.get("quantity"),
            "profit_loss": t.get("profit_loss"),
            "roi_percent": t.get("roi_percent"),
            "status": t.get("status"),
            "opened_at": t.get("opened_at"),
            "closed_at": t.get("closed_at"),
        })
        
    return {"trades": trades}
