# QuantAdv - Quantitative Trading Platform
# Copyright (C) 2026 John Varghese (J0X)

"""
Background Tasks Scheduler for ETL and Model Retraining.
Uses APScheduler to pull OHLCV data periodically.
"""

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from utils.logger import logger
import yfinance as yf
from datetime import datetime, timedelta
import pandas as pd
from database.postgres import upsert_market_data

scheduler = BackgroundScheduler()

def etl_market_data():
    """
    Automated Data Collector.
    Pulls historical and real-time market data and upserts it into the DB.
    """
    logger.info("Starting scheduled ETL job for market data...")
    symbols = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'BTC-USD']
    
    end = datetime.now()
    start = end - timedelta(days=5)
    
    records_to_insert = []
    
    for symbol in symbols:
        try:
            ticker = yf.Ticker(symbol)
            df = ticker.history(start=start.strftime("%Y-%m-%d"), end=end.strftime("%Y-%m-%d"), interval="5m")
            if df.empty:
                continue
                
            df = df.reset_index()
            # yfinance returns Datetime as index
            # Columns: Datetime, Open, High, Low, Close, Volume
            for _, row in df.iterrows():
                records_to_insert.append({
                    "symbol": symbol,
                    "timestamp": row['Datetime'].to_pydatetime() if hasattr(row['Datetime'], 'to_pydatetime') else row['Datetime'],
                    "interval": "5m",
                    "open": float(row['Open']),
                    "high": float(row['High']),
                    "low": float(row['Low']),
                    "close": float(row['Close']),
                    "volume": float(row['Volume']),
                })
        except Exception as e:
            logger.error(f"ETL error for {symbol}: {e}")
            
    if records_to_insert:
        try:
            upsert_market_data(records_to_insert)
            logger.info(f"ETL completed. Upserted {len(records_to_insert)} records.")
        except Exception as e:
            logger.error(f"ETL Database error: {e}")


def start_scheduler():
    """Start the APScheduler."""
    # Run the ETL job every 15 minutes
    scheduler.add_job(
        etl_market_data,
        trigger=CronTrigger(minute='*/15'),
        id='etl_market_data_job',
        name='Fetch market data and upsert into PostgreSQL',
        replace_existing=True
    )
    
    scheduler.start()
    logger.info("Background scheduler started.")


def stop_scheduler():
    """Stop the APScheduler."""
    scheduler.shutdown()
    logger.info("Background scheduler stopped.")
