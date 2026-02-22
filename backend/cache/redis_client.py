"""
AquaSentinel — Redis Cache Client
Person 1 owns this file.
Caches expensive computations (risk scores, forecasts) for <10ms response.
Gracefully falls back if Redis is not running.
"""

import os
import json
import redis

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

try:
    _client = redis.from_url(REDIS_URL, decode_responses=True, socket_connect_timeout=1)
    _client.ping()
    REDIS_AVAILABLE = True
except Exception:
    _client = None
    REDIS_AVAILABLE = False


def cache_get(key: str):
    """Return cached value or None if missing / Redis unavailable."""
    if not REDIS_AVAILABLE or _client is None:
        return None
    try:
        val = _client.get(key)
        return json.loads(val) if val else None
    except Exception:
        return None


def cache_set(key: str, value, ttl: int = 300):
    """
    Store value in Redis.
    ttl = seconds until expiry (default 5 minutes).
    Silently skips if Redis unavailable.
    """
    if not REDIS_AVAILABLE or _client is None:
        return
    try:
        _client.setex(key, ttl, json.dumps(value))
    except Exception:
        pass


def cache_delete(key: str):
    """Remove a cached key."""
    if not REDIS_AVAILABLE or _client is None:
        return
    try:
        _client.delete(key)
    except Exception:
        pass


def cache_status() -> dict:
    return {"redis_available": REDIS_AVAILABLE, "url": REDIS_URL}
