<p align="center">
  <img src="client/public/favicon.svg" alt="QuantAdv Logo" width="100" />
</p>

<h1 align="center">QuantAdv</h1>

<p align="center">
  A production-quality full-stack sandbox combining quantitative finance, adversarial machine learning, explainable AI, and real-time analytics.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-AGPL--3.0-blue.svg" alt="License" />
  <img src="https://img.shields.io/badge/python-3.11+-green.svg" alt="Python" />
  <img src="https://img.shields.io/badge/next.js-15+-black.svg" alt="Next.js" />
  <img src="https://img.shields.io/badge/fastapi-0.110+-teal.svg" alt="FastAPI" />
</p>

## Overview

QuantAdv is an advanced sandbox environment designed for testing and deploying quantitative trading strategies against adversarial machine learning attacks. It provides a secure, simulated market environment where you can train models, execute strategies, and evaluate their robustness against various data perturbations.

## Architecture

The system is built on a modern, scalable stack:

- **Client**: Next.js 15 (App Router), React 18, TypeScript, Tailwind CSS, Framer Motion, and Recharts.
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
   
   **Required API Keys (Free Tier Compatible):**
   - `DATABASE_URL`: Your PostgreSQL connection string (e.g., from Supabase or Render).
   - `FMP_API_KEY`: Financial Modeling Prep API key for high-frequency market data.
   - `GEMINI_API_KEY`: Google Gemini API key for the Red Team threat intelligence analyst.
   - Firebase Credentials: Set up a Firebase project, download the service account JSON, and place it in `server/credentials.json`.

3. Start all services:
   ```bash
   docker-compose up --build
   ```

4. Access the applications:
   - Frontend: http://localhost:3000 (Next.js default)
   - Backend API: http://localhost:8000/docs
   - DB Management (pgAdmin): http://localhost:5050

## Deployment Readiness

The application is fully configured for production deployment:

1. **Frontend (Vercel)**: The Next.js client is optimized for seamless deployment to Vercel. Simply import the repository, select `client` as the Root Directory, and Vercel will auto-configure the Next.js build settings.
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

## License & Open Source Guidelines

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**. See the [LICENSE](LICENSE) file for details. 

**Network Interaction Clause:** The AGPLv3 specifically closes the "Application Service Provider loophole." This means that because this is a web application, anyone who modifies this code and hosts it publicly *must* offer their modified source code to the users interacting with it over the network. 

*Note: This platform is for educational and sandbox purposes only. It is not intended for live financial trading.*
