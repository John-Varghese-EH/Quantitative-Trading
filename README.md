# QuantAdv

A production-quality full-stack sandbox combining quantitative finance, adversarial machine learning, explainable AI, and real-time analytics.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.11+-green.svg)
![React](https://img.shields.io/badge/react-18+-blue.svg)
![FastAPI](https://img.shields.io/badge/fastapi-0.110+-teal.svg)

## Overview

QuantAdv is an advanced sandbox environment designed for testing and deploying quantitative trading strategies against adversarial machine learning attacks. It provides a secure, simulated market environment where you can train models, execute strategies, and evaluate their robustness against various data perturbations.

## Architecture

The system is built on a modern, scalable stack:

- **Client**: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, and Plotly.js.
- **Server**: FastAPI, Python 3.11, and a robust ML stack (scikit-learn, XGBoost, PyTorch, TensorFlow).
- **Database**: PostgreSQL 15 for reliable data persistence.
- **Infrastructure**: Containerized with Docker for consistent deployment across environments.

## Core Features

- **Trading Simulator**: Backtest strategies including Mean Reversion, Momentum, and custom models.
- **AI Prediction Models**: Leverage Linear Regression, Random Forest, XGBoost, LSTM, and Transformer networks.
- **Adversarial Testing**: Evaluate model resilience using FGSM, PGD, data poisoning, and label flipping.
- **Defensive Mechanisms**: Implement adversarial training, defensive distillation, and outlier detection.
- **Explainable AI (XAI)**: Understand model decisions with SHAP values and feature importance analysis.
- **Real-Time Analytics**: Monitor portfolio growth, risk metrics, and market data through interactive dashboards.

## Quick Start (Docker)

To run the application locally using Docker:

1. Clone the repository and navigate to the project directory:
   ```bash
   git clone <repo-url>
   cd quantadv-sandbox
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Add your API keys to the `.env` file if necessary.

3. Start all services:
   ```bash
   docker-compose up --build
   ```

4. Access the applications:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000/docs
   - DB Management (pgAdmin): http://localhost:5050

## Deployment Readiness

While the current Docker configuration is optimized for development (using `npm run dev` and Uvicorn with hot-reload), the application can be easily adapted for production:

1. **Frontend**: The React client can be built statically (`npm run build`) and deployed to Vercel, Netlify, or served via Nginx.
2. **Backend**: The FastAPI server should be run using Gunicorn with Uvicorn workers for production workloads.
3. **Database**: Managed PostgreSQL instances (e.g., AWS RDS, Supabase) are recommended for production environments.

## Testing

Execute the test suites to ensure system integrity:

```bash
# Backend tests
cd server
pytest tests/ -v --cov=.

# Frontend tests
cd client
npm run test
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
