"""
Website enrichment: extract head_name, email, social handles
from an org's own published web pages.

RULE: every extracted value must carry the exact source_url it came from.
If a value is not published on a real page, it is not returned.
No guessing, no inferring email patterns.
"""

import re
from dataclasses import dataclass, field
from urllib.parse import urljoin, urlparse
from web import fetch_html

# Patterns for published contact info
EMAIL_RE = re.compile(r'[\w.+\-]+@[\w\-]+\.[\w.]{2,}')
PHONE_RE = re.compile(r'\(?\d{3}\)?[\s.\-]\d{3}[\s.\-]\d{4}')
IG_RE    = re.compile(r'instagram\.com/([A-Za-z0-9_.]{2,30})', re.IGNORECASE)
FB_RE    = re.compile(r'facebook\.com/([A-Za-z0-9_.]{2,60})', re.IGNORECASE)
TW_RE    = re.compile(r'twitter\.com/([A-Za-z0-9_]{1,15})\b', re.IGNORECASE)

# Common "about / contact / staff" page slug fragments
CONTACT_SLUGS = [
    "/contact", "/contact-us", "/about", "/about-us",
    "/staff", "/our-team", "/team", "/leadership",
    "/who-we-are", "/board", "/directors",
]

# Name patterns: look for "Name, Title" or labeled fields
# e.g. "Commissioner: John Smith" / "Director – Jane Doe"
PERSON_LABEL_RE = re.compile(
    r'(?:commissioner|director|executive director|president|ceo|founder|'
    r'owner|manager|coordinator|head coach|league director|contact)\s*[:\-–]\s*'
    r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})',
    re.IGNORECASE,
)
# Meta og:title or structured data rarely helps here but worth scanning
SCHEMA_NAME_RE = re.compile(r'"name"\s*:\s*"([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})"')

SPAM_EMAILS = {
    "example.com", "test.com", "domain.com", "email.com",
    "yourdomain.com", "samplesite.com",
}


@dataclass
class EnrichResult:
    head_name: str | None = None
    head_name_source: str | None = None
    head_title: str | None = None
    head_title_source: str | None = None
    email: str | None = None
    email_source: str | None = None
    phone: str | None = None
    phone_source: str | None = None
    instagram: str | None = None
    instagram_source: str | None = None
    facebook: str | None = None
    facebook_source: str | None = None
    twitter: str | None = None
    twitter_source: str | None = None
    pages_fetched: list[str] = field(default_factory=list)
    errors: list[str] = field(default_factory=list)


def _extract_from_html(html: str, source_url: str, result: EnrichResult) -> None:
    """Scan html and fill result fields that are still None."""
    # Email
    if result.email is None:
        for m in EMAIL_RE.finditer(html):
            addr = m.group().lower()
            domain = addr.split("@")[-1]
            if domain not in SPAM_EMAILS and not addr.startswith("no-reply"):
                result.email = m.group()
                result.email_source = source_url
                break

    # Instagram
    if result.instagram is None:
        m = IG_RE.search(html)
        if m and m.group(1) not in ("p", "reel", "stories", "explore", "accounts"):
            result.instagram = "@" + m.group(1)
            result.instagram_source = source_url

    # Facebook
    if result.facebook is None:
        m = FB_RE.search(html)
        if m and m.group(1).lower() not in ("sharer", "share", "login", "dialog"):
            result.facebook = "facebook.com/" + m.group(1)
            result.facebook_source = source_url

    # Twitter / X
    if result.twitter is None:
        m = TW_RE.search(html)
        if m and m.group(1).lower() not in ("intent", "share", "home"):
            result.twitter = "@" + m.group(1)
            result.twitter_source = source_url  # stored in twitter field (no separate schema field currently)

    # Head name + title
    if result.head_name is None:
        m = PERSON_LABEL_RE.search(html)
        if m:
            result.head_name = m.group(1).strip()
            result.head_name_source = source_url
            # Extract title from the label
            label_match = re.match(
                r'(commissioner|director|executive director|president|ceo|'
                r'founder|owner|manager|coordinator|head coach|league director|contact)',
                m.group(0), re.IGNORECASE,
            )
            if label_match:
                result.head_title = label_match.group(1).title()
                result.head_title_source = source_url

    # Phone (lower priority)
    if result.phone is None:
        m = PHONE_RE.search(html)
        if m:
            result.phone = m.group().strip()
            result.phone_source = source_url


def enrich_website(website: str) -> EnrichResult:
    """
    Fetch the org homepage + likely contact/about pages.
    Return an EnrichResult with source URLs for every non-null field.
    """
    result = EnrichResult()

    if not website or not website.startswith(("http://", "https://")):
        result.errors.append("no valid website url")
        return result

    parsed = urlparse(website)
    base = f"{parsed.scheme}://{parsed.netloc}"

    # Pages to try: homepage first, then slug candidates
    pages_to_try = [website]
    for slug in CONTACT_SLUGS:
        pages_to_try.append(urljoin(base, slug))

    for url in pages_to_try:
        html, err = fetch_html(url)
        if err:
            result.errors.append(f"{url}: {err}")
            continue

        result.pages_fetched.append(url)
        _extract_from_html(html, url, result)

        # Stop early if we've found everything we're looking for
        if all([result.email, result.head_name, result.instagram or result.facebook]):
            break

    return result
