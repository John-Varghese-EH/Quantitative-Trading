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
QuantAdv Sandbox — FastAPI Application Entry Point
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from api.admin import router as admin_router
from api.dashboard import router as dashboard_router
from api.market_data import router as market_router
from api.news import router as news_router
from api.portfolio import router as portfolio_router
from attacks.router import router as attacks_router

# Routers
from auth.router import router as auth_router
from config import settings
from defenses.router import router as defenses_router
from ml.router import router as ml_router
from trading.router import router as trading_router
from utils.logger import logger


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: startup and shutdown events."""
    logger.info(f"🚀 Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    # Firebase is initialized on import via database.firestore
    logger.info("✅ Firebase Admin SDK ready")
    yield
    logger.info("👋 Shutting down QuantAdv Sandbox")


app = FastAPI(
    title="QuantAdv Sandbox API",
    description="Quantitative Trading Adversarial Machine Learning Sandbox",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ─── CORS ────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ─────────────────────────────────────────────────────────────────
app.include_router(auth_router,     prefix="/api/auth",      tags=["Authentication"])
app.include_router(dashboard_router,prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(market_router,   prefix="/api/market",    tags=["Market Data"])
app.include_router(portfolio_router,prefix="/api/portfolio", tags=["Portfolio"])
app.include_router(ml_router,       prefix="/api/ml",        tags=["Machine Learning"])
app.include_router(trading_router,  prefix="/api/trading",   tags=["Trading Simulator"])
app.include_router(attacks_router,  prefix="/api/attacks",   tags=["Adversarial Attacks"])
app.include_router(defenses_router, prefix="/api/defenses",  tags=["Defense Mechanisms"])
app.include_router(admin_router,    prefix="/api/admin",     tags=["Admin Panel"])
app.include_router(news_router,     prefix="/api/news",      tags=["News & Sentiment"])


@app.get("/", tags=["Health"])
async def root():
    return {"status": "online", "app": settings.APP_NAME, "version": settings.APP_VERSION}


@app.get("/health", tags=["Health"])
async def health_check():
    return JSONResponse({"status": "healthy", "database": "connected"})
