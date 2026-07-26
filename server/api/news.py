"""News and sentiment feed (NewsAPI-ready, mock fallback)."""
import random
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, Query
from auth.dependencies import get_current_user
from database.models import User

router = APIRouter()

MOCK_NEWS = [
    {"title": "Fed signals rate cut may come sooner than expected", "sentiment": "positive", "source": "Reuters", "impact": "bullish"},
    {"title": "Tech stocks rally as AI spending continues to surge", "sentiment": "positive", "source": "Bloomberg", "impact": "bullish"},
    {"title": "Bitcoin ETF sees record inflows in Q1 2024", "sentiment": "positive", "source": "CoinDesk", "impact": "bullish"},
    {"title": "Inflation data comes in hotter than expected", "sentiment": "negative", "source": "WSJ", "impact": "bearish"},
    {"title": "NVDA beats earnings estimates by 30% on AI demand", "sentiment": "positive", "source": "CNBC", "impact": "bullish"},
    {"title": "Oil prices surge amid Middle East tensions", "sentiment": "negative", "source": "Reuters", "impact": "bearish"},
    {"title": "S&P 500 hits new all-time high", "sentiment": "positive", "source": "MarketWatch", "impact": "bullish"},
    {"title": "Credit card delinquencies rise to decade high", "sentiment": "negative", "source": "FT", "impact": "bearish"},
    {"title": "Apple announces $110B share buyback program", "sentiment": "positive", "source": "Bloomberg", "impact": "bullish"},
    {"title": "China manufacturing PMI falls below 50", "sentiment": "negative", "source": "Reuters", "impact": "bearish"},
]


@router.get("/feed")
def get_news_feed(
    symbol: str = Query(default=None),
    current_user: User = Depends(get_current_user),
):
    """Return latest news articles with sentiment scores."""
    news = []
    for i, item in enumerate(MOCK_NEWS):
        hours_ago = random.randint(1, 48)
        score = random.uniform(0.3, 0.95) * (1 if item["sentiment"] == "positive" else -1)
        news.append({
            **item,
            "sentiment_score": round(score, 3),
            "published_at": (datetime.now() - timedelta(hours=hours_ago)).isoformat(),
            "url": f"https://example.com/news/{i}",
        })
    random.shuffle(news)
    return {"articles": news[:8], "overall_sentiment": "bullish"}


@router.get("/sentiment")
def get_market_sentiment(current_user: User = Depends(get_current_user)):
    """Return aggregated market sentiment indicators."""
    return {
        "fear_greed_index": random.randint(40, 75),
        "fear_greed_label": "Greed",
        "bullish_pct": round(random.uniform(50, 70), 1),
        "bearish_pct": round(random.uniform(20, 35), 1),
        "neutral_pct": round(random.uniform(5, 20), 1),
        "twitter_sentiment": round(random.uniform(0.1, 0.7), 3),
        "reddit_sentiment": round(random.uniform(0.0, 0.6), 3),
        "updated_at": datetime.now().isoformat(),
    }
