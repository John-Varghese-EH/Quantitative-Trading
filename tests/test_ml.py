"""
Tests for ML feature engineering and model modules.
Run with: pytest tests/test_ml.py -v
"""
import pytest
import numpy as np
import pandas as pd


class TestFeatureEngineering:
    def test_feature_columns_defined(self):
        from ml.feature_engineering import FEATURE_COLUMNS
        assert len(FEATURE_COLUMNS) > 0
        assert isinstance(FEATURE_COLUMNS, list)

    def test_engineer_features_output(self):
        from ml.feature_engineering import engineer_features
        dates = pd.date_range("2022-01-01", periods=200, freq="D")
        df = pd.DataFrame({
            "open": np.random.randn(200).cumsum() + 150,
            "high": np.random.randn(200).cumsum() + 155,
            "low":  np.random.randn(200).cumsum() + 145,
            "close": np.random.randn(200).cumsum() + 150,
            "volume": np.abs(np.random.randn(200)) * 1e6,
        }, index=dates)
        result = engineer_features(df)
        assert isinstance(result, pd.DataFrame)
        assert len(result) < len(df)  # NaN rows dropped
        assert "rsi" in result.columns
        assert "bb_upper" in result.columns
        assert "target" in result.columns

    def test_normalize_features(self):
        from ml.feature_engineering import normalize_features
        X_train = np.random.randn(100, 20)
        X_test = np.random.randn(30, 20)
        Xt, Xte, scaler = normalize_features(X_train, X_test)
        assert Xt.shape == X_train.shape
        assert Xte.shape == X_test.shape
        # Verify standardized
        assert abs(Xt.mean()) < 0.5


class TestLinearRegressionModel:
    def test_train_predict(self):
        from ml.models.linear_regression import LogisticRegressionModel
        m = LogisticRegressionModel()
        X = np.random.randn(100, 10)
        y = (np.random.randn(100) > 0).astype(int)
        m.fit(X, y)
        preds = m.predict(X[:5])
        assert len(preds) == 5
        assert set(preds).issubset({0, 1})

    def test_predict_proba(self):
        from ml.models.linear_regression import LogisticRegressionModel
        m = LogisticRegressionModel()
        X = np.random.randn(60, 8)
        y = (np.random.randn(60) > 0).astype(int)
        m.fit(X, y)
        proba = m.predict_proba(X[:10])
        assert proba.shape == (10, 2)
        assert np.allclose(proba.sum(axis=1), 1.0, atol=1e-5)


class TestRandomForestModel:
    def test_train_predict(self):
        from ml.models.random_forest import RandomForestModel
        m = RandomForestModel(n_estimators=10)
        X = np.random.randn(80, 12)
        y = (np.random.randn(80) > 0).astype(int)
        m.fit(X, y)
        preds = m.predict(X[:10])
        assert len(preds) == 10


class TestAttacksModule:
    def test_noise_injection(self):
        from attacks.attacks import noise_injection
        m = self._dummy_model()
        X = np.random.randn(20, 10)
        X_adv, meta = noise_injection(X, noise_std=0.01)
        assert X_adv.shape == X.shape
        assert meta["defense"] == "NoiseInjection"
        assert not np.allclose(X, X_adv)

    def _dummy_model(self):
        from sklearn.linear_model import LogisticRegression
        model = LogisticRegression()
        model.fit(np.random.randn(50, 10), (np.random.randn(50) > 0).astype(int))
        return model


class TestDefensesModule:
    def test_input_validation(self):
        from defenses.defenses import input_validation
        X_train = np.random.randn(100, 10)
        X_test = np.random.randn(20, 10) * 10  # Outlier scale
        X_clean, meta = input_validation(X_test, X_train, z_thresh=3.0)
        assert X_clean.shape == X_test.shape
        assert meta["defense"] == "InputValidation"
        assert meta["z_threshold"] == 3.0

    def test_feature_sanitization(self):
        from defenses.defenses import feature_sanitization
        X_train = np.random.randn(100, 15)
        X_test = np.random.randn(30, 15)
        X_san, meta = feature_sanitization(X_test, X_train)
        assert X_san.shape == X_test.shape
        assert meta["defense"] == "FeatureSanitization"
        assert meta["variance_explained"] > 0
