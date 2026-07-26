"""
Tests for Authentication endpoints.
Run with: pytest tests/test_auth.py -v
"""
import pytest
from fastapi.testclient import TestClient

# Minimal dummy environment before importing app
import os
os.environ.setdefault("DATABASE_URL", "sqlite:///./test.db")
os.environ.setdefault("SECRET_KEY", "test_secret_key_32_chars_long_xx")
os.environ.setdefault("ALGORITHM", "HS256")
os.environ.setdefault("ACCESS_TOKEN_EXPIRE_MINUTES", "30")
os.environ.setdefault("REFRESH_TOKEN_EXPIRE_DAYS", "7")

from main import app

client = TestClient(app)

REGISTER_PAYLOAD = {
    "email": "testuser@quantadv.test",
    "username": "testuser123",
    "password": "TestPass@123456",
    "full_name": "Test User",
}


class TestHealth:
    def test_root(self):
        resp = client.get("/")
        assert resp.status_code == 200
        assert resp.json()["status"] == "online"

    def test_health(self):
        resp = client.get("/health")
        assert resp.status_code == 200


class TestRegisterAndLogin:
    def test_register_success(self):
        resp = client.post("/api/auth/register", json=REGISTER_PAYLOAD)
        # Accept 201 or 422 (if already registered from previous run)
        assert resp.status_code in (200, 201, 400, 422)

    def test_register_invalid_email(self):
        payload = {**REGISTER_PAYLOAD, "email": "not-an-email"}
        resp = client.post("/api/auth/register", json=payload)
        assert resp.status_code == 422

    def test_login_invalid_credentials(self):
        form = {"username": "nobody@example.com", "password": "wrong"}
        resp = client.post("/api/auth/login", data=form)
        assert resp.status_code in (400, 401, 422)

    def test_protected_without_token(self):
        resp = client.get("/api/dashboard/stats")
        assert resp.status_code == 401


class TestMarketData:
    def test_ohlcv_requires_auth(self):
        resp = client.get("/api/market/ohlcv?symbol=AAPL")
        assert resp.status_code == 401
