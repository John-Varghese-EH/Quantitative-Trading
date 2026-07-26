# ⚡ QuantAdv — Quantitative Trading Adversarial ML Sandbox

> A production-quality full-stack sandbox combining quantitative finance, adversarial machine learning, explainable AI, and real-time analytics.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.11+-green.svg)
![React](https://img.shields.io/badge/react-18+-blue.svg)
![FastAPI](https://img.shields.io/badge/fastapi-0.110+-teal.svg)

---

## 🚀 Quick Start (Docker)

```bash
# 1. Clone and enter directory
git clone <repo-url>
cd quantadv-sandbox

# 2. Copy environment variables
cp .env.example .env
# Edit .env and add your API keys (optional)

# 3. Start all services
docker-compose up --build

# 4. Open browser
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000/docs
# pgAdmin: http://localhost:5050
```

---

## 🏗️ Architecture

```
QuantAdv-Sandbox/
├── client/          → React 18 + TypeScript + Vite + Tailwind CSS
├── server/          → FastAPI + Python 3.11 + ML stack
├── models/          → Saved ML model artifacts (.pkl, .h5, .pt)
├── datasets/        → Sample financial data (CSV/Parquet)
├── notebooks/       → Jupyter EDA notebooks
├── tests/           → Unit + integration tests
└── docker-compose.yml
```

---

## ✨ Features

| Module | Description |
|--------|-------------|
| 🔐 **Authentication** | JWT login/register, email verification, role-based access |
| 📊 **Dashboard** | Animated stat cards, live price ticker, portfolio overview |
| 📈 **Market Data** | Candlestick charts, RSI, MACD, Bollinger Bands via yfinance |
| 🤖 **AI Prediction** | Linear Regression, Random Forest, XGBoost, LSTM, Transformer |
| 💹 **Trading Simulator** | Backtest 5 strategies — Buy & Hold, MA Crossover, Momentum, etc. |
| ⚔️ **Adversarial Attacks** | FGSM, PGD, Data Poisoning, Label Flipping, Feature Manipulation |
| 🛡️ **Defenses** | Adversarial Training, Outlier Detection, Defensive Distillation |
| 🧪 **Sandbox** | Risk-free environment — train, attack, defend, reset |
| 📉 **Analytics** | Plotly dashboards — model accuracy, portfolio growth, risk |
| 🔍 **Explainable AI** | SHAP values, feature importance, buy/sell reasoning |
| 👑 **Admin Panel** | User management, system logs, model registry |
| 🔔 **Notifications** | Real-time alerts for prices, attacks, trade events |

---

## 🛠️ Tech Stack

**Frontend**: React 18, TypeScript, Vite, Tailwind CSS v3, Framer Motion, Recharts, Plotly.js, React Router v6, Zustand, React Query

**Backend**: FastAPI, SQLAlchemy, Alembic, python-jose (JWT), bcrypt, loguru

**Machine Learning**: scikit-learn, XGBoost, TensorFlow/Keras (LSTM), PyTorch (Transformer), SHAP, pandas, numpy, yfinance, pandas-ta

**Database**: PostgreSQL 15

**Infrastructure**: Docker, Docker Compose, GitHub Actions

---

## 📁 Environment Variables

See `.env.example` for all required variables. Key ones:

```env
SECRET_KEY=your-super-secret-key
DATABASE_URL=postgresql://user:password@localhost:5432/quantadv
ALPHA_VANTAGE_API_KEY=optional
BINANCE_API_KEY=optional
```

---

## 📖 API Documentation

Visit `http://localhost:8000/docs` for interactive Swagger UI after starting the backend.

---

## 🧪 Running Tests

```bash
# Backend tests
cd server
pytest tests/ -v --cov=.

# Frontend tests
cd client
npm run test
```

---

## 📄 License

MIT License — see [LICENSE](LICENSE)
