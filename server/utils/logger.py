"""Structured logging with loguru."""
import sys
import io
from loguru import logger

# Force UTF-8 on Windows to avoid cp1252 UnicodeEncodeError
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

logger.remove()
logger.add(
    sys.stdout,
    colorize=False,
    format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{line} - {message}",
    level="INFO",
)
logger.add(
    "logs/quantadv.log",
    rotation="10 MB",
    retention="14 days",
    level="DEBUG",
    format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{line} - {message}",
)

__all__ = ["logger"]
