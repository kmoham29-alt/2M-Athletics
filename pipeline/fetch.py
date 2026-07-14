"""Polite HTTP fetcher with robots.txt respect, retries, and timeouts."""

import time
import urllib.robotparser
from urllib.parse import urlparse, urljoin
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

USER_AGENT = "2M-Athletics-Research-Bot/1.0 (investment research; contact: research@2mathletics.com)"
REQUEST_TIMEOUT = 15  # seconds per request
INTER_REQUEST_DELAY = 1.5  # seconds between requests
MAX_RESPONSE_BYTES = 2 * 1024 * 1024  # 2 MB cap

_session = None
_robots_cache: dict[str, urllib.robotparser.RobotFileParser] = {}


def _get_session() -> requests.Session:
    global _session
    if _session is None:
        _session = requests.Session()
        _session.headers.update({"User-Agent": USER_AGENT})
        retry = Retry(
            total=3,
            backoff_factor=2,
            status_forcelist=[429, 500, 502, 503, 504],
            allowed_methods=["GET", "HEAD"],
            raise_on_status=False,
        )
        adapter = HTTPAdapter(max_retries=retry)
        _session.mount("http://", adapter)
        _session.mount("https://", adapter)
    return _session


def _robots_allows(url: str) -> bool:
    parsed = urlparse(url)
    base = f"{parsed.scheme}://{parsed.netloc}"
    robots_url = f"{base}/robots.txt"

    if base not in _robots_cache:
        rp = urllib.robotparser.RobotFileParser()
        rp.set_url(robots_url)
        try:
            rp.read()
        except Exception:
            # If robots.txt unreachable, be conservative and allow
            rp = urllib.robotparser.RobotFileParser()
        _robots_cache[base] = rp

    return _robots_cache[base].can_fetch(USER_AGENT, url)


def fetch_html(url: str, delay: bool = True) -> tuple[str | None, str | None]:
    """
    Fetch URL, return (html_text, error_msg).
    html_text is None on failure; error_msg is None on success.
    Respects robots.txt, enforces delay, caps response size.
    """
    if not url or not url.startswith(("http://", "https://")):
        return None, f"invalid url: {url!r}"

    if not _robots_allows(url):
        return None, "disallowed by robots.txt"

    if delay:
        time.sleep(INTER_REQUEST_DELAY)

    session = _get_session()
    try:
        resp = session.get(
            url,
            timeout=REQUEST_TIMEOUT,
            stream=True,
            allow_redirects=True,
        )
        if resp.status_code == 200:
            content = b""
            for chunk in resp.iter_content(chunk_size=65536):
                content += chunk
                if len(content) > MAX_RESPONSE_BYTES:
                    break
            encoding = resp.encoding or "utf-8"
            try:
                text = content.decode(encoding, errors="replace")
            except (LookupError, UnicodeDecodeError):
                text = content.decode("utf-8", errors="replace")
            return text, None
        else:
            return None, f"http {resp.status_code}"
    except requests.exceptions.Timeout:
        return None, "timeout"
    except requests.exceptions.ConnectionError as e:
        return None, f"connection error: {e}"
    except Exception as e:
        return None, f"unexpected: {e}"


def discover_location_urls(base_url: str) -> list[str]:
    """
    Given a league's homepage, heuristically find pages likely to list
    individual locations/clubs/branches. Returns list of candidate URLs to try.
    """
    parsed = urlparse(base_url)
    base = f"{parsed.scheme}://{parsed.netloc}"

    location_slugs = [
        "/locations", "/find-a-location", "/find-league", "/find-program",
        "/leagues", "/programs", "/chapters", "/branches", "/clubs",
        "/find-us", "/where-to-play", "/local-leagues", "/regions",
        "/franchise-locations", "/find-a-league", "/find-a-club",
        "/youth-leagues", "/youth-programs", "/flag-football",
        "/register", "/sign-up",
    ]

    candidates = []
    for slug in location_slugs:
        candidates.append(urljoin(base, slug))
    # Also the homepage itself
    candidates.insert(0, base_url)
    return candidates
