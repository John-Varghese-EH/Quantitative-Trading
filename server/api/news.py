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

"""News and sentiment feed (Real Yahoo Finance RSS)."""
from datetime import datetime, timezone

import feedparser
from fastapi import APIRouter, Depends, Query
from textblob import TextBlob

from auth.dependencies import get_current_user

router = APIRouter()

def fetch_yahoo_finance_news(symbol=None):
    if symbol:
        url = f"https://feeds.finance.yahoo.com/rss/2.0/headline?s={symbol}&region=US&lang=en-US"
    else:
        # General market news (S&P 500 as proxy)
        url = "https://feeds.finance.yahoo.com/rss/2.0/headline?s=^GSPC&region=US&lang=en-US"
        
    feed = feedparser.parse(url)
    articles = []
    
    for entry in feed.entries[:10]:
        title = entry.title
        link = entry.link
        published = entry.get("published", datetime.now(timezone.utc).isoformat())
        
        # Simple sentiment analysis using TextBlob
        blob = TextBlob(title)
        polarity = blob.sentiment.polarity  # -1 to 1
        
        if polarity > 0.1:
            sentiment_label = "positive"
            impact = "bullish"
        elif polarity < -0.1:
            sentiment_label = "negative"
            impact = "bearish"
        else:
            sentiment_label = "neutral"
            impact = "neutral"
            
        articles.append({
            "title": title,
            "sentiment": sentiment_label,
            "source": "Yahoo Finance",
            "impact": impact,
            "sentiment_score": round(polarity, 3),
            "published_at": published,
            "url": link,
        })
        
    return articles

@router.get("/feed")
def get_news_feed(
    symbol: str = Query(default=None),
    current_user: dict = Depends(get_current_user),
):
    """Return latest news articles with real sentiment scores."""
    try:
        articles = fetch_yahoo_finance_news(symbol)
        overall_score = sum([a["sentiment_score"] for a in articles]) / (len(articles) or 1)
        
        return {
            "articles": articles,
            "overall_sentiment": "bullish" if overall_score > 0 else "bearish" if overall_score < 0 else "neutral"
        }
    except Exception as e:
        return {"articles": [], "overall_sentiment": "neutral", "error": str(e)}

@router.get("/sentiment")
def get_market_sentiment(current_user: dict = Depends(get_current_user)):
    """Return aggregated market sentiment indicators."""
    # We will fetch general news and aggregate the sentiment
    try:
        articles = fetch_yahoo_finance_news()
        scores = [a["sentiment_score"] for a in articles]
        avg_score = sum(scores) / (len(scores) or 1)
        
        # Map avg_score (-1 to 1) to Fear/Greed Index (0 to 100)
        fg_index = int(((avg_score + 1) / 2) * 100)
        
        if fg_index > 75: label = "Extreme Greed"
        elif fg_index > 55: label = "Greed"
        elif fg_index < 25: label = "Extreme Fear"
        elif fg_index < 45: label = "Fear"
        else: label = "Neutral"
        
        bullish = sum(1 for s in scores if s > 0.1)
        bearish = sum(1 for s in scores if s < -0.1)
        neutral = len(scores) - bullish - bearish
        
        total = len(scores) or 1
        
        return {
            "fear_greed_index": fg_index,
            "fear_greed_label": label,
            "bullish_pct": round((bullish / total) * 100, 1),
            "bearish_pct": round((bearish / total) * 100, 1),
            "neutral_pct": round((neutral / total) * 100, 1),
            "twitter_sentiment": round(avg_score, 3), # Mocking social using news as proxy
            "reddit_sentiment": round(avg_score * 0.9, 3),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
    except Exception:
        return {
            "fear_greed_index": 50,
            "fear_greed_label": "Neutral",
            "bullish_pct": 33.3,
            "bearish_pct": 33.3,
            "neutral_pct": 33.3,
            "twitter_sentiment": 0,
            "reddit_sentiment": 0,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
