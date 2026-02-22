import os
import json

REDIS_URL = os.getenv("REDIS_URL", "")
REDIS_AVAILABLE = False
_client = None

if REDIS_URL:
    try:
        import redis
        _client = redis.from_url(REDIS_URL, decode_responses=True, socket_connect_timeout=1)
        _client.ping()
        REDIS_AVAILABLE = True
    except Exception:
        _client = None
        REDIS_AVAILABLE = False


def cache_get(key: str):
    if not REDIS_AVAILABLE or _client is None:
        return None
    try:
        val = _client.get(key)
        return json.loads(val) if val else None
    except Exception:
        return None


def cache_set(key: str, value, ttl: int = 300):
    if not REDIS_AVAILABLE or _client is None:
        return
    try:
        _client.setex(key, ttl, json.dumps(value))
    except Exception:
        pass


def cache_delete(key: str):
    if not REDIS_AVAILABLE or _client is None:
        return
    try:
        _client.delete(key)
    except Exception:
        pass


def cache_status() -> dict:
    return {"redis_available": REDIS_AVAILABLE, "url": REDIS_URL}
