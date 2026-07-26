"""
SQLAlchemy ORM Models for QuantAdv Sandbox
"""
import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import (
    Column, String, Float, Integer, Boolean,
    DateTime, Text, ForeignKey, JSON, Enum
)
from sqlalchemy.orm import relationship, DeclarativeBase
from sqlalchemy.sql import func
import enum

# Cross-database UUID type: uses native UUID on PostgreSQL, String(36) on SQLite
try:
    from sqlalchemy.dialects.postgresql import UUID as PG_UUID
    _UUID = lambda: PG_String(36)
    _uuid_default = uuid.uuid4
except ImportError:
    _UUID = lambda: String(36)
    _uuid_default = lambda: str(uuid.uuid4())

# Simple portable UUID column factory
def _uuid_col(primary_key=False, fk=None):
    if fk:
        return Column(String(36), ForeignKey(fk), nullable=False)
    return Column(String(36), primary_key=primary_key, default=lambda: str(uuid.uuid4()))



class Base(DeclarativeBase):
    pass


class UserRole(str, enum.Enum):
    USER = "user"
    ADMIN = "admin"


class ModelType(str, enum.Enum):
    LINEAR_REGRESSION = "linear_regression"
    RANDOM_FOREST = "random_forest"
    XGBOOST = "xgboost"
    LSTM = "lstm"
    TRANSFORMER = "transformer"


class AttackType(str, enum.Enum):
    FGSM = "fgsm"
    PGD = "pgd"
    DATA_POISONING = "data_poisoning"
    LABEL_FLIPPING = "label_flipping"
    FEATURE_MANIPULATION = "feature_manipulation"
    NOISE_INJECTION = "noise_injection"


class DefenseType(str, enum.Enum):
    ADVERSARIAL_TRAINING = "adversarial_training"
    INPUT_VALIDATION = "input_validation"
    OUTLIER_DETECTION = "outlier_detection"
    DEFENSIVE_DISTILLATION = "defensive_distillation"
    FEATURE_SANITIZATION = "feature_sanitization"


# â”€â”€â”€ User â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(100), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(200), nullable=True)
    role = Column(Enum(UserRole), default=UserRole.USER, nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    verification_token = Column(String(255), nullable=True)
    reset_token = Column(String(255), nullable=True)
    reset_token_expires = Column(DateTime, nullable=True)
    avatar_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    ml_models = relationship("MLModel", back_populates="user", cascade="all, delete-orphan")
    trades = relationship("Trade", back_populates="user", cascade="all, delete-orphan")
    attacks = relationship("AttackLog", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    activity_logs = relationship("ActivityLog", back_populates="user", cascade="all, delete-orphan")


# â”€â”€â”€ ML Model Registry â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
class MLModel(Base):
    __tablename__ = "ml_models"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    name = Column(String(200), nullable=False)
    model_type = Column(Enum(ModelType), nullable=False)
    symbol = Column(String(20), nullable=False)          # e.g. AAPL
    timeframe = Column(String(10), default="1d")
    status = Column(String(50), default="training")      # training, ready, failed
    accuracy = Column(Float, nullable=True)
    loss = Column(Float, nullable=True)
    confidence = Column(Float, nullable=True)
    training_params = Column(JSON, nullable=True)
    metrics = Column(JSON, nullable=True)
    artifact_path = Column(String(500), nullable=True)   # path to saved model
    trained_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="ml_models")
    predictions = relationship("Prediction", back_populates="model", cascade="all, delete-orphan")


# â”€â”€â”€ Predictions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    model_id = Column(String(36), ForeignKey("ml_models.id"), nullable=False)
    symbol = Column(String(20), nullable=False)
    predicted_price = Column(Float, nullable=False)
    actual_price = Column(Float, nullable=True)
    direction = Column(String(10), nullable=False)       # BUY or SELL
    confidence = Column(Float, nullable=False)
    features_used = Column(JSON, nullable=True)
    shap_values = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    model = relationship("MLModel", back_populates="predictions")


# â”€â”€â”€ Trades â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
class Trade(Base):
    __tablename__ = "trades"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    symbol = Column(String(20), nullable=False)
    strategy = Column(String(100), nullable=False)
    entry_price = Column(Float, nullable=False)
    exit_price = Column(Float, nullable=True)
    quantity = Column(Float, nullable=False)
    side = Column(String(10), nullable=False)            # BUY or SELL
    profit_loss = Column(Float, nullable=True)
    roi_percent = Column(Float, nullable=True)
    status = Column(String(20), default="open")         # open, closed
    opened_at = Column(DateTime(timezone=True), server_default=func.now())
    closed_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="trades")


# â”€â”€â”€ Backtest Results â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
class BacktestResult(Base):
    __tablename__ = "backtest_results"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    symbol = Column(String(20), nullable=False)
    strategy = Column(String(100), nullable=False)
    start_date = Column(String(20), nullable=False)
    end_date = Column(String(20), nullable=False)
    initial_capital = Column(Float, default=10000.0)
    final_value = Column(Float, nullable=True)
    total_return = Column(Float, nullable=True)
    sharpe_ratio = Column(Float, nullable=True)
    max_drawdown = Column(Float, nullable=True)
    win_rate = Column(Float, nullable=True)
    total_trades = Column(Integer, nullable=True)
    equity_curve = Column(JSON, nullable=True)
    trade_log = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# â”€â”€â”€ Attack Logs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
class AttackLog(Base):
    __tablename__ = "attack_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    model_id = Column(String(36), ForeignKey("ml_models.id"), nullable=True)
    attack_type = Column(Enum(AttackType), nullable=False)
    parameters = Column(JSON, nullable=True)
    original_prediction = Column(JSON, nullable=True)
    adversarial_prediction = Column(JSON, nullable=True)
    attack_success = Column(Boolean, nullable=True)
    success_rate = Column(Float, nullable=True)
    confidence_drop = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="attacks")


# â”€â”€â”€ Defense Logs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
class DefenseLog(Base):
    __tablename__ = "defense_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    model_id = Column(String(36), ForeignKey("ml_models.id"), nullable=True)
    defense_type = Column(Enum(DefenseType), nullable=False)
    accuracy_before = Column(Float, nullable=True)
    accuracy_after = Column(Float, nullable=True)
    security_score = Column(Float, nullable=True)
    results = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# â”€â”€â”€ Notifications â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    type = Column(String(50), nullable=False)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    extra_data = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="notifications")


# â”€â”€â”€ Activity Logs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    action = Column(String(100), nullable=False)
    resource = Column(String(100), nullable=True)
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(String(500), nullable=True)
    details = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="activity_logs")


