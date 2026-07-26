"""Simple TTL-based in-memory cache for market data."""
import time
from functools import wraps
from typing import Any, Optional, Dict
from cachetools import TTLCache

from config import settings

_cache: TTLCache = TTLCache(maxsize=200, ttl=settings.CACHE_TTL_SECONDS)


def cache_get(key: str) -> Optional[Any]:
    return _cache.get(key)


def cache_set(key: str, value: Any):
    _cache[key] = value


def cache_delete(key: str):
    _cache.pop(key, None)


def cache_clear():
    _cache.clear()


def cached(key_fn=None):
    """Decorator: cache function result by key."""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            key = key_fn(*args, **kwargs) if key_fn else f"{func.__name__}:{args}:{kwargs}"
            result = cache_get(key)
            if result is not None:
                return result
            result = func(*args, **kwargs)
            cache_set(key, result)
            return result
        return wrapper
    return decorator
