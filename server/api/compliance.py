import datetime
import random
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/trading/compliance", tags=["Compliance"])

# Dummy store for compliance logs
compliance_logs = [
    {
        "id": "cpl-1",
        "timestamp": (datetime.datetime.utcnow() - datetime.timedelta(minutes=15)).isoformat() + "Z",
        "rule": "SEBI_RESTRICTED_SECURITY",
        "action": "REJECT",
        "details": "Order rejected: Ticker is under GSM framework.",
    },
    {
        "id": "cpl-2",
        "timestamp": (datetime.datetime.utcnow() - datetime.timedelta(minutes=45)).isoformat() + "Z",
        "rule": "INTRADAY_LEVERAGE_LIMIT",
        "action": "WARN",
        "details": "Position size approaches SEBI 5x intraday peak margin limit.",
    }
]

class PreTradeRequest(BaseModel):
    symbol: str
    order_type: str
    quantity: int
    price: Optional[float] = None
    side: str
    jurisdiction: str = "SEBI"

@router.get("/status")
def get_compliance_status():
    """Returns the current status of the compliance firewall, including SEBI norms."""
    return {
        "status": "ACTIVE",
        "jurisdiction": "SEBI",
        "static_ip_bound": True,
        "static_ip_address": "203.0.113.45",
        "firewall_rules_active": 42,
        "recent_interventions": compliance_logs[:5]
    }

@router.post("/pre-trade-check")
def pre_trade_check(req: PreTradeRequest):
    """
    Simulates a pre-trade compliance check.
    In SEBI jurisdiction, enforces specific rules.
    """
    if req.jurisdiction == "SEBI":
        # 1. Check for restricted securities (GSM/ASM)
        restricted_symbols = ["ADANIENT", "ZOMATO", "SUZLON"]
        if req.symbol.upper() in restricted_symbols:
            return {
                "status": "REJECTED",
                "reasons": [f"{req.symbol} is under GSM/ASM framework. Algorithmic trading restricted."]
            }
        
        # 2. Check F&O lot size / quantity anomalies
        if req.quantity > 10000:
            return {
                "status": "REJECTED",
                "reasons": ["Order quantity exceeds SEBI prescribed maximum order value limits for F&O."]
            }
            
        # 3. Static IP check (simulated)
        # Assuming the static IP is bound as returned in /status
        pass 

    return {
        "status": "APPROVED",
        "reasons": []
    }
