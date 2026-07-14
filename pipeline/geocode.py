"""
Geocode city+state → lat/lng using Nominatim (OpenStreetMap).
Aggressive caching to /pipeline/geocode_cache.json.
Rate-limited to ≤1 req/sec.
"""

import json
import time
from pathlib import Path
import requests

USER_AGENT = "2M-Athletics-Research-Bot/1.0 (investment research)"
NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
RATE_LIMIT_DELAY = 1.1  # seconds between requests
TIMEOUT = 10

CACHE_PATH = Path(__file__).parent / "geocode_cache.json"

_cache: dict[str, tuple[float, float] | None] = {}
_cache_loaded = False
_last_request_time = 0.0


def _load_cache() -> None:
    global _cache, _cache_loaded
    if _cache_loaded:
        return
    if CACHE_PATH.exists():
        try:
            with open(CACHE_PATH) as f:
                raw = json.load(f)
            # Values are either [lat, lng] or null
            _cache = {k: tuple(v) if v is not None else None for k, v in raw.items()}
        except Exception:
            _cache = {}
    _cache_loaded = True


def _save_cache() -> None:
    try:
        with open(CACHE_PATH, "w") as f:
            json.dump(
                {k: list(v) if v is not None else None for k, v in _cache.items()},
                f, indent=2
            )
    except Exception as e:
        print(f"  [geocode] Warning: could not save cache: {e}")


def geocode(city: str | None, state: str | None) -> tuple[float | None, float | None]:
    """
    Return (lat, lng) for city+state, or (None, None) on failure.
    Uses cache; never re-requests an already-cached city+state pair.
    """
    _load_cache()

    if not city and not state:
        return None, None

    # Build a normalized cache key
    city_norm = city.strip().lower() if city else ""
    state_norm = state.strip().upper() if state else ""
    cache_key = f"{city_norm}|{state_norm}"

    if cache_key in _cache:
        result = _cache[cache_key]
        if result is None:
            return None, None
        return result[0], result[1]

    # Rate-limit
    global _last_request_time
    elapsed = time.time() - _last_request_time
    if elapsed < RATE_LIMIT_DELAY:
        time.sleep(RATE_LIMIT_DELAY - elapsed)

    query_parts = [p for p in [city, state, "USA"] if p]
    query = ", ".join(query_parts)

    try:
        resp = requests.get(
            NOMINATIM_URL,
            params={"q": query, "format": "json", "limit": 1},
            headers={"User-Agent": USER_AGENT},
            timeout=TIMEOUT,
        )
        _last_request_time = time.time()

        if resp.status_code == 200:
            data = resp.json()
            if data:
                lat = float(data[0]["lat"])
                lng = float(data[0]["lon"])
                _cache[cache_key] = (lat, lng)
                _save_cache()
                return lat, lng

        _cache[cache_key] = None
        _save_cache()
        return None, None

    except Exception as e:
        print(f"  [geocode] Error for {query!r}: {e}")
        _cache[cache_key] = None
        _save_cache()
        return None, None
