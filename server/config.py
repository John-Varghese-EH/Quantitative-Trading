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
Application configuration using Pydantic Settings.
Reads from environment variables and .env file.
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # ── App ──────────────────────────────────────────────────────────
    APP_NAME: str = "QuantAdv Sandbox"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    ENVIRONMENT: str = "development"

    # ── Security ─────────────────────────────────────────────────────
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ── Database (Firebase) ──────────────────────────────────────────
    FIREBASE_SERVICE_ACCOUNT_PATH: str = "serviceAccountKey.json"
    FIREBASE_SERVICE_ACCOUNT_JSON: str = ""
    FIREBASE_PROJECT_ID: str = ""

    # ── CORS ─────────────────────────────────────────────────────────────
    ALLOWED_ORIGINS_STR: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"

    @property
    def ALLOWED_ORIGINS(self) -> list[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS_STR.split(",")]

    # ── External APIs ────────────────────────────────────────────────
    ALPHA_VANTAGE_API_KEY: str = ""
    BINANCE_API_KEY: str = ""
    BINANCE_API_SECRET: str = ""
    NEWS_API_KEY: str = ""

    # ── Email ────────────────────────────────────────────────────────
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAIL_FROM: str = "noreply@quantadv.io"
    MOCK_EMAIL: bool = True

    # ── Admin ────────────────────────────────────────────────────────
    ADMIN_EMAIL: str = "admin@quantadv.io"
    ADMIN_PASSWORD: str = "Admin@123456"

    # ── Cache ────────────────────────────────────────────────────────
    CACHE_TTL_SECONDS: int = 300

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


settings = Settings()
