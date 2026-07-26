"""
QuantAdv Sandbox — FastAPI Application Entry Point
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config import settings
from database.session import create_tables
from utils.logger import logger

# Routers
from auth.router import router as auth_router
from api.market_data import router as market_router
from api.dashboard import router as dashboard_router
from api.portfolio import router as portfolio_router
from api.admin import router as admin_router
from api.news import router as news_router
from ml.router import router as ml_router
from trading.router import router as trading_router
from attacks.router import router as attacks_router
from defenses.router import router as defenses_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: startup and shutdown events."""
    logger.info(f"🚀 Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    create_tables()
    logger.info("✅ Database tables created/verified")
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
