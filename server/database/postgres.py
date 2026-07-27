# QuantAdv - Quantitative Trading Platform
# Copyright (C) 2026 John Varghese (J0X)
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published
# by the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

"""
PostgreSQL Database Setup and Models via SQLAlchemy.
Used for storing historical and live market time-series data.
"""

import os
from datetime import datetime
from typing import List, Dict, Any

from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, UniqueConstraint
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.dialects.postgresql import insert
from utils.logger import logger

# By default, falls back to a local postgres URI or SQLite for local dev
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./quantadv.db")

# If using sqlite locally, we need to adjust the dialect for UPSERT,
# but the blueprint specifies PostgreSQL, so we'll structure for postgres
engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


class MarketData(Base):
    __tablename__ = "market_data"
    
    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(20), index=True, nullable=False)
    timestamp = Column(DateTime, index=True, nullable=False)
    interval = Column(String(10), nullable=False)
    
    open = Column(Float, nullable=False)
    high = Column(Float, nullable=False)
    low = Column(Float, nullable=False)
    close = Column(Float, nullable=False)
    volume = Column(Float, nullable=False)

    __table_args__ = (
        UniqueConstraint('symbol', 'timestamp', 'interval', name='uix_market_data'),
    )


def init_db():
    """Create tables."""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("PostgreSQL database initialized.")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")


def upsert_market_data(records: List[Dict[str, Any]]):
    """
    Perform a PostgreSQL UPSERT (ON CONFLICT DO UPDATE) to prevent duplicates
    when data collection windows overlap.
    """
    if not records:
        return

    with SessionLocal() as session:
        try:
            # If we're on SQLite (local dev), we handle it differently or use standard merge.
            # But we'll write the Postgres-specific insert structure as requested by the blueprint.
            if "postgres" in engine.name:
                stmt = insert(MarketData).values(records)
                stmt = stmt.on_conflict_do_update(
                    constraint='uix_market_data',
                    set_={
                        'open': stmt.excluded.open,
                        'high': stmt.excluded.high,
                        'low': stmt.excluded.low,
                        'close': stmt.excluded.close,
                        'volume': stmt.excluded.volume,
                    }
                )
                session.execute(stmt)
            else:
                # Fallback for SQLite
                for record in records:
                    existing = session.query(MarketData).filter_by(
                        symbol=record['symbol'],
                        timestamp=record['timestamp'],
                        interval=record['interval']
                    ).first()
                    if existing:
                        existing.open = record['open']
                        existing.high = record['high']
                        existing.low = record['low']
                        existing.close = record['close']
                        existing.volume = record['volume']
                    else:
                        new_record = MarketData(**record)
                        session.add(new_record)
            
            session.commit()
            logger.info(f"Upserted {len(records)} records into market_data.")
        except Exception as e:
            session.rollback()
            logger.error(f"Failed to upsert market data: {e}")
            raise
