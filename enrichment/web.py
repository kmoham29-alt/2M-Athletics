"""
Polite HTTP client for the enrichment pipeline.
- Respects robots.txt
- Identifying User-Agent
- Rate-limited with per-domain delays
- Retries with exponential backoff on transient failures
- Hard timeout per request
- Never raises — returns (content, error_string) tuples
"""

import time
import urllib.robotparser
from collections import defaultdict
from urllib.parse import urlparse
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

USER_AGENT = (
    "2M-Athletics-EnrichmentBot/1.0 "
    "(investment research on public data; "
    "contact: research@2mathletics.com)"
)
TIMEOUT_SECS = 12
MAX_BYTES = 2_000_000          # 2 MB hard cap
BASE_DELAY_SECS = 1.5          # between requests to the same domain
API_DELAY_SECS = 0.6           # for JSON APIs (ProPublica)

_session: requests.Session | None = None
_robots: dict[str, urllib.robotparser.RobotFileParser] = {}
_last_request: dict[str, float] = defaultdict(float)


def _build_session() -> requests.Session:
    global _session
    if _session is not None:
        return _session
    s = requests.Session()
    s.headers.update({"User-Agent": USER_AGENT, "Accept-Language": "en-US,en;q=0.9"})
    retry = Retry(
        total=3,
        backoff_factor=2.0,
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=["GET"],
        raise_on_status=False,
    )
    adapter = HTTPAdapter(max_retries=retry)
    s.mount("https://", adapter)
    s.mount("http://", adapter)
    _session = s
    return s


def _rate_limit(domain: str, delay: float = BASE_DELAY_SECS) -> None:
    elapsed = time.monotonic() - _last_request[domain]
    if elapsed < delay:
        time.sleep(delay - elapsed)
    _last_request[domain] = time.monotonic()


def _robots_allow(url: str) -> bool:
    parsed = urlparse(url)
    base = f"{parsed.scheme}://{parsed.netloc}"
    if base not in _robots:
        rp = urllib.robotparser.RobotFileParser()
        rp.set_url(f"{base}/robots.txt")
        try:
            rp.read()
        except Exception:
            rp = urllib.robotparser.RobotFileParser()   # permissive fallback
        _robots[base] = rp
    return _robots[base].can_fetch(USER_AGENT, url)


def fetch_html(url: str) -> tuple[str | None, str | None]:
    """Fetch a web page. Returns (html_text, error_msg); one is always None."""
    if not url or not url.startswith(("http://", "https://")):
        return None, f"invalid url: {url!r}"
    if not _robots_allow(url):
        return None, "disallowed by robots.txt"
    domain = urlparse(url).netloc
    _rate_limit(domain, BASE_DELAY_SECS)
    return _do_get(url)


def fetch_json(url: str, params: dict | None = None) -> tuple[dict | list | None, str | None]:
    """Fetch a JSON API endpoint. Returns (parsed_data, error_msg)."""
    domain = urlparse(url).netloc
    _rate_limit(domain, API_DELAY_SECS)
    raw, err = _do_get(url, params=params, is_api=True)
    if err:
        return None, err
    try:
        import json
        return json.loads(raw), None
    except Exception as e:
        return None, f"json parse error: {e}"


def _do_get(
    url: str,
    params: dict | None = None,
    is_api: bool = False,
) -> tuple[str | None, str | None]:
    s = _build_session()
    try:
        resp = s.get(url, params=params, timeout=TIMEOUT_SECS, stream=True, allow_redirects=True)
        if resp.status_code != 200:
            return None, f"http {resp.status_code}"
        buf = b""
        for chunk in resp.iter_content(65_536):
            buf += chunk
            if len(buf) >= MAX_BYTES:
                break
        enc = resp.encoding or ("utf-8" if is_api else "utf-8")
        try:
            return buf.decode(enc, errors="replace"), None
        except (LookupError, UnicodeDecodeError):
            return buf.decode("utf-8", errors="replace"), None
    except requests.exceptions.Timeout:
        return None, "timeout"
    except requests.exceptions.ConnectionError as exc:
        return None, f"connection error: {exc}"
    except Exception as exc:
        return None, f"unexpected: {exc}"
