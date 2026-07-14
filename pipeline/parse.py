"""
Extract individual club / location candidates from fetched HTML.

Heuristics only — never fabricates. Returns empty list when nothing credible found.
"""

import re
from bs4 import BeautifulSoup
from dataclasses import dataclass, field

# US state full names → abbreviations for normalization
US_STATES = {
    "alabama":"AL","alaska":"AK","arizona":"AZ","arkansas":"AR","california":"CA",
    "colorado":"CO","connecticut":"CT","delaware":"DE","florida":"FL","georgia":"GA",
    "hawaii":"HI","idaho":"ID","illinois":"IL","indiana":"IN","iowa":"IA",
    "kansas":"KS","kentucky":"KY","louisiana":"LA","maine":"ME","maryland":"MD",
    "massachusetts":"MA","michigan":"MI","minnesota":"MN","mississippi":"MS",
    "missouri":"MO","montana":"MT","nebraska":"NE","nevada":"NV",
    "new hampshire":"NH","new jersey":"NJ","new mexico":"NM","new york":"NY",
    "north carolina":"NC","north dakota":"ND","ohio":"OH","oklahoma":"OK",
    "oregon":"OR","pennsylvania":"PA","rhode island":"RI","south carolina":"SC",
    "south dakota":"SD","tennessee":"TN","texas":"TX","utah":"UT","vermont":"VT",
    "virginia":"VA","washington":"WA","west virginia":"WV","wisconsin":"WI",
    "wyoming":"WY","district of columbia":"DC","washington dc":"DC","d.c.":"DC",
}
STATE_ABBREVS = set(US_STATES.values())

# Patterns that strongly suggest a location list page
LOCATION_SIGNALS = [
    r"\bfind\s+(a\s+)?location\b",
    r"\bfind\s+(a\s+)?league\b",
    r"\bfind\s+(a\s+)?club\b",
    r"\bour\s+locations\b",
    r"\bwhere\s+to\s+play\b",
    r"\bchapters?\b",
    r"\bbranch(es)?\b",
    r"\bfranchise\s+locations?\b",
    r"\blocal\s+leagues?\b",
    r"\bregions?\b",
]

# CSS/ARIA patterns for location card containers
LOCATION_CONTAINER_SELECTORS = [
    "[class*='location']", "[class*='Location']",
    "[class*='chapter']", "[class*='branch']",
    "[class*='club']", "[class*='league']",
    "[class*='franchise']", "[class*='region']",
    "[class*='city']", "[class*='program']",
    "[data-location]", "[itemtype*='LocalBusiness']",
]


@dataclass
class ClubCandidate:
    club_name: str | None = None
    city: str | None = None
    state: str | None = None
    age_groups: str | None = None
    contact: str | None = None
    source_url: str = ""


def normalize_state(raw: str) -> str | None:
    """Normalize state string to 2-letter abbreviation."""
    s = raw.strip()
    if s.upper() in STATE_ABBREVS:
        return s.upper()
    if s.lower() in US_STATES:
        return US_STATES[s.lower()]
    return None


def _extract_state_from_text(text: str) -> str | None:
    """Try to find a US state abbreviation or name in arbitrary text."""
    # Try 2-letter abbrev (word boundary)
    for abbrev in STATE_ABBREVS:
        if re.search(rf'\b{abbrev}\b', text):
            return abbrev
    # Try full name
    lower = text.lower()
    for name, abbrev in US_STATES.items():
        if name in lower:
            return abbrev
    return None


def _extract_contact(text: str) -> str | None:
    """Extract email or phone from text."""
    email_match = re.search(r'[\w.+-]+@[\w-]+\.\w+', text)
    if email_match:
        email = email_match.group()
        if not any(spam in email.lower() for spam in ['example.com', 'test.com', 'domain.com']):
            return email
    phone_match = re.search(r'\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}', text)
    if phone_match:
        return phone_match.group().strip()
    return None


def _extract_age_groups(text: str) -> str | None:
    """Extract age group mentions if present."""
    patterns = [
        r'\b(ages?\s+\d+[-–]\d+)\b',
        r'\b(\d+U)\b',
        r'\b(K[-–]\d+|K[–-]\d+)\b',
        r'\b(grades?\s+\d+[-–]\d+)\b',
        r'\b(\d+u[-–]\d+u)\b',
    ]
    found = []
    for p in patterns:
        for m in re.finditer(p, text, re.IGNORECASE):
            found.append(m.group().strip())
    return ", ".join(dict.fromkeys(found)) or None  # deduplicate preserving order


def has_location_signals(html: str) -> bool:
    """Quick check: does this page contain signals of a location list?"""
    lower = html.lower()
    return any(re.search(p, lower) for p in LOCATION_SIGNALS)


def extract_clubs(html: str, source_url: str, league_state_abbrevs: list[str]) -> list[ClubCandidate]:
    """
    Main extraction function. Returns a (possibly empty) list of ClubCandidates.
    Never fabricates — returns [] when nothing credible is found.
    """
    if not html or not has_location_signals(html):
        return []

    soup = BeautifulSoup(html, "html.parser")
    # Remove noise
    for tag in soup.find_all(["script", "style", "nav", "footer", "header"]):
        tag.decompose()

    candidates: list[ClubCandidate] = []

    # Strategy 1: structured location containers
    for selector in LOCATION_CONTAINER_SELECTORS:
        try:
            containers = soup.select(selector)
        except Exception:
            continue
        for c in containers:
            text = c.get_text(" ", strip=True)
            if len(text) < 5 or len(text) > 500:
                continue
            state = _extract_state_from_text(text)
            if not state and league_state_abbrevs:
                # Assume league's primary state if only one
                state = league_state_abbrevs[0] if len(league_state_abbrevs) == 1 else None

            # Try to find city from heading within the container
            heading = c.find(re.compile(r"h[1-6]"))
            city_text = heading.get_text(strip=True) if heading else None

            # Sometimes the container text itself is "City, ST"
            city_state_match = re.search(r'([A-Z][a-zA-Z\s]+),\s*([A-Z]{2})', text)
            if city_state_match and not city_text:
                city_text = city_state_match.group(1).strip()
                state = city_state_match.group(2)

            if not city_text:
                continue

            # Skip generic/nav-looking entries
            if len(city_text) > 60 or city_text.lower() in {"home","about","contact","register","login","sign in","sign up"}:
                continue

            candidates.append(ClubCandidate(
                club_name=city_text,
                city=city_text,
                state=state,
                age_groups=_extract_age_groups(text),
                contact=_extract_contact(text),
                source_url=source_url,
            ))

    # Strategy 2: "City, ST" patterns in page text (broad sweep)
    if not candidates:
        # Look for address-like patterns: "City, ST ZIP" or "City, ST"
        page_text = soup.get_text(" ", strip=True)
        # Pattern: word chars + optional spaces + comma + space + 2-letter state
        for m in re.finditer(
            r'\b([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){0,3}),\s+([A-Z]{2})\b',
            page_text
        ):
            city, state_raw = m.group(1), m.group(2)
            if state_raw not in STATE_ABBREVS:
                continue
            if city.lower() in {"the","and","or","but","is","are","for","our","you","your"}:
                continue
            if len(city) < 3 or len(city) > 40:
                continue
            candidates.append(ClubCandidate(
                club_name=city,
                city=city,
                state=state_raw,
                source_url=source_url,
            ))

    # Deduplicate by (city, state)
    seen: set[tuple[str | None, str | None]] = set()
    deduped: list[ClubCandidate] = []
    for c in candidates:
        key = (c.city, c.state)
        if key not in seen:
            seen.add(key)
            deduped.append(c)

    # Quality filter: require at least city or club_name
    return [c for c in deduped if c.club_name or c.city]


def parse_all_candidate_pages(
    pages: list[tuple[str, str]],  # [(url, html), ...]
    league_state_abbrevs: list[str],
) -> tuple[list[ClubCandidate], str]:
    """
    Try all candidate pages; return (clubs, best_status).
    best_status: 'clubs_found' | 'no_club_list_found' | 'unreachable'
    """
    any_reachable = False
    all_clubs: list[ClubCandidate] = []
    seen_clubs: set[tuple[str | None, str | None]] = set()

    for url, html in pages:
        if html is None:
            continue
        any_reachable = True
        clubs = extract_clubs(html, url, league_state_abbrevs)
        for c in clubs:
            key = (c.city, c.state)
            if key not in seen_clubs:
                seen_clubs.add(key)
                all_clubs.append(c)

    if not any_reachable:
        return [], "unreachable"
    if all_clubs:
        return all_clubs, "clubs_found"
    return [], "no_club_list_found"
