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

"""Simple TTL-based in-memory cache for market data."""
from functools import wraps
from typing import Any

from cachetools import TTLCache

from config import settings

_cache: TTLCache = TTLCache(maxsize=200, ttl=settings.CACHE_TTL_SECONDS)


def cache_get(key: str) -> Any | None:
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
