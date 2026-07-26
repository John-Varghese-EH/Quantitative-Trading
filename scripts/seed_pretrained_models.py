"""
Script to train base models and seed the models directory so users
can evaluate "pre-built" models without waiting for training.
"""
import os
import sys
from datetime import datetime, timedelta

# Add server to path
sys.path.append(os.path.join(os.path.dirname(__file__), "../server"))

from ml.feature_engineering import prepare_dataset, normalize_features
from api.market_data import _fetch_yfinance
from ml.models.random_forest import train
import joblib

MODELS_DIR = os.path.join(os.path.dirname(__file__), "../server/models")
os.makedirs(MODELS_DIR, exist_ok=True)

TICKERS = ["SPY", "AAPL", "BTC-USD"]
DAYS = 700

def seed_models():
    end = datetime.now().strftime("%Y-%m-%d")
    start = (datetime.now() - timedelta(days=DAYS)).strftime("%Y-%m-%d")
    
    print(f"--- Seeding Pre-built ML Models into {MODELS_DIR} ---")
    
    for ticker in TICKERS:
        try:
            print(f"\nFetching {ticker} data...")
            df = _fetch_yfinance(ticker, start, end)
            
            print("Engineering features...")
            X_train, X_test, y_train, y_test, feature_names = prepare_dataset(df)
            X_train_s, X_test_s, scaler = normalize_features(X_train, X_test)
            
            print(f"Training Random Forest on {ticker}...")
            model, _, _ = train(X_train_s, X_test_s, y_train, {})
            
            model_id = f"prebuilt_rf_{ticker.replace('-', '_').lower()}"
            artifact_path = os.path.join(MODELS_DIR, f"{model_id}.pkl")
            
            joblib.dump({
                "model": model, 
                "scaler": scaler, 
                "features": feature_names, 
                "type": "random_forest",
                "symbol": ticker,
                "is_prebuilt": True
            }, artifact_path)
            
            print(f"✅ Saved pre-built model to {artifact_path}")
            
        except Exception as e:
            print(f"❌ Failed to seed model for {ticker}: {e}")

if __name__ == "__main__":
    seed_models()
