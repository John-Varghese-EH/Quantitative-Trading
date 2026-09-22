"""
QuantAdv Sandbox - AI Copilot API
Provides the backend endpoint for the AI Trading Copilot chat interface.
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import time
from typing import Optional, List, Dict, Any

router = APIRouter()

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    context: Optional[Dict[str, Any]] = None

@router.post("/chat")
async def copilot_chat(request: ChatRequest):
    """
    Unified copilot endpoint for natural language trading queries.
    Routes intents between council deliberation and strategy generation.
    """
    # Simple intent routing based on the latest user message
    last_message = request.messages[-1].content.lower() if request.messages else ""
    
    # Simulate processing delay
    time.sleep(0.5)

    if "council" in last_message or "analysis" in last_message or "aapl" in last_message:
        return {
            "role": "assistant",
            "type": "council_verdict",
            "content": f"I've asked the AI Council to deliberate. Based on the latest market data and our 5-agent ensemble analysis, the overall sentiment is BULLISH. The Value agent cites strong fundamentals while the Momentum agent detects a confirmed uptrend.",
            "metadata": {
                "agents": [
                    {"name": "Value", "verdict": "BULLISH"},
                    {"name": "Momentum", "verdict": "BULLISH"},
                    {"name": "Macro", "verdict": "NEUTRAL"},
                    {"name": "Sentiment", "verdict": "BULLISH"}
                ]
            }
        }
    elif "strategy" in last_message or "backtest" in last_message:
        return {
            "role": "assistant",
            "type": "strategy",
            "content": "I have formulated a strategy template for you. This uses a mean-reversion approach combined with volume confirmation. You can run this as a backtest immediately.",
            "metadata": {
                "strategy_type": "Mean Reversion",
                "indicators": ["RSI", "MACD", "Volume Profile"]
            }
        }
    else:
        return {
            "role": "assistant",
            "type": "text",
            "content": "I am your AI Trading Copilot. I can analyze tickers using the AI Council, build custom trading strategies, or run historical backtests. How can I help you today?"
        }
