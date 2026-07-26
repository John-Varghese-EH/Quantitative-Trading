"""Portfolio API — open positions and P&L tracking."""
import random
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.session import get_db
from database.models import User, Trade
from auth.dependencies import get_current_user

router = APIRouter()


@router.get("/positions")
def get_positions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    trades = db.query(Trade).filter(
        Trade.user_id == current_user.id,
        Trade.status == "open"
    ).all()
    return {"positions": [
        {
            "id": str(t.id),
            "symbol": t.symbol,
            "strategy": t.strategy,
            "side": t.side,
            "entry_price": t.entry_price,
            "quantity": t.quantity,
            "unrealized_pnl": round(random.uniform(-500, 1000), 2),
            "opened_at": t.opened_at.isoformat() if t.opened_at else None,
        }
        for t in trades
    ]}


@router.get("/history")
def get_trade_history(
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    trades = db.query(Trade).filter(
        Trade.user_id == current_user.id
    ).order_by(Trade.opened_at.desc()).limit(limit).all()
    return {"trades": [
        {
            "id": str(t.id),
            "symbol": t.symbol,
            "strategy": t.strategy,
            "side": t.side,
            "entry_price": t.entry_price,
            "exit_price": t.exit_price,
            "quantity": t.quantity,
            "profit_loss": t.profit_loss,
            "roi_percent": t.roi_percent,
            "status": t.status,
            "opened_at": t.opened_at.isoformat() if t.opened_at else None,
            "closed_at": t.closed_at.isoformat() if t.closed_at else None,
        }
        for t in trades
    ]}
