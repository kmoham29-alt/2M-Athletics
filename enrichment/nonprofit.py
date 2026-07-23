"""
IRS / ProPublica Nonprofit Explorer lookups.

For each org:
  1. Search ProPublica by name + state to find a matching 501(c)(3).
  2. If found, fetch the org detail page to get EIN + most recent 990 revenue.

Returns structured results with source URLs for every field — never fabricates.

ProPublica Nonprofit Explorer API (free, no key required):
  Search:  https://projects.propublica.org/nonprofits/api/v2/search.json
  Org:     https://projects.propublica.org/nonprofits/api/v2/organizations/{ein}.json

Rate limit: ~5 req/sec enforced by our fetch layer.
"""

import re
import time
from dataclasses import dataclass, field
from web import fetch_json

PROPUBLICA_SEARCH = "https://projects.propublica.org/nonprofits/api/v2/search.json"
PROPUBLICA_ORG    = "https://projects.propublica.org/nonprofits/api/v2/organizations/{ein}.json"
PROPUBLICA_BASE   = "https://projects.propublica.org/nonprofits/api/v2"

# IRS EOS public search (web page — use as a fallback source link, not scraped)
IRS_EOS_URL = "https://apps.irs.gov/app/eos/"


@dataclass
class NonprofitResult:
    found: bool = False
    ein: str | None = None
    ein_source_url: str | None = None
    name_matched: str | None = None          # the name as it appears in ProPublica
    business_type: str | None = None         # "NONPROFIT" | None
    business_type_source_url: str | None = None
    revenue_990: int | None = None
    revenue_filing_year: int | None = None
    revenue_source_url: str | None = None
    filing_type: str | None = None           # "990" | "990-EZ" | "990-N" | None
    error: str | None = None


def _clean_name(name: str) -> str:
    """Strip common suffixes before searching."""
    cleaned = re.sub(
        r"\b(inc\.?|llc\.?|corp\.?|association|assoc\.?|"
        r"foundation|fund|league|program|programs|sports?|"
        r"youth|flag|football)\b",
        " ", name, flags=re.IGNORECASE,
    )
    return re.sub(r"\s+", " ", cleaned).strip()


def _name_similarity(a: str, b: str) -> float:
    """Rough overlap score between two lowercased name strings."""
    a_words = set(re.sub(r"[^a-z0-9 ]", "", a.lower()).split())
    b_words = set(re.sub(r"[^a-z0-9 ]", "", b.lower()).split())
    stopwords = {"the","a","an","of","for","and","or","in","at","to","flag","youth","football","sports","sport"}
    a_words -= stopwords
    b_words -= stopwords
    if not a_words or not b_words:
        return 0.0
    return len(a_words & b_words) / max(len(a_words), len(b_words))


def _search(query: str, state_abbr: str | None) -> tuple[list, str | None]:
    """Run ProPublica search; return (results_list, error)."""
    params: dict = {"q": query}
    if state_abbr and state_abbr not in ("National", ""):
        params["state[id]"] = state_abbr
    data, err = fetch_json(PROPUBLICA_SEARCH, params=params)
    if err:
        return [], err
    if not isinstance(data, dict):
        return [], "unexpected response shape"
    return data.get("organizations", []) or [], None


def _fetch_org_detail(ein: str) -> tuple[dict | None, str, str | None]:
    """
    Fetch detailed org record including 990 filings.
    Returns (org_data, source_url, error).
    """
    source_url = PROPUBLICA_ORG.format(ein=ein)
    data, err = fetch_json(source_url)
    if err:
        return None, source_url, err
    if not isinstance(data, dict):
        return None, source_url, "unexpected response shape"
    return data, source_url, None


def _best_revenue_filing(filings: list) -> tuple[int | None, int | None, str | None, str | None]:
    """
    From a list of 990 filing objects, return the most recent actual revenue figure.
    Returns (revenue_int, tax_year, filing_type, pdf_url).
    Skips 990-N (postcard) filers — they have no financial data.
    """
    # Sort by tax_prd (period end date) descending
    usable = []
    for f in filings:
        totrevenue = f.get("totrevenue") or f.get("totrev")
        tax_prd = f.get("tax_prd") or f.get("tax_prd_yr")
        form = f.get("formtype") or ""
        pdf = f.get("pdf_url") or f.get("pdfurl") or None
        if form.startswith("990N"):
            continue  # no financials on 990-N
        if totrevenue is not None:
            try:
                year = int(str(tax_prd)[:4]) if tax_prd else None
                usable.append((int(totrevenue), year, form, pdf))
            except (ValueError, TypeError):
                pass

    if not usable:
        return None, None, None, None
    usable.sort(key=lambda x: (x[1] or 0), reverse=True)
    return usable[0]


def lookup(org_name: str, state_abbr: str | None, primary_state: str | None = None) -> NonprofitResult:
    """
    Main entry: look up one org by name+state.
    Returns a NonprofitResult with source URLs for every populated field.
    """
    result = NonprofitResult()

    # Try progressively shorter / cleaned queries
    queries = [org_name, _clean_name(org_name)]
    if "/" in org_name:
        # "Northeast Flag Football League (CT FLAG)" → try just the first part
        queries.append(org_name.split("/")[0].strip())
    queries = list(dict.fromkeys(q for q in queries if len(q) >= 4))  # dedup

    # States to search
    states_to_try: list[str | None] = []
    effective_state = state_abbr or primary_state
    if effective_state and effective_state not in ("National", ""):
        states_to_try.append(effective_state)
    states_to_try.append(None)  # nationwide search as fallback

    best_match = None
    best_score = 0.0
    search_source = None

    for q in queries:
        for st in states_to_try:
            results, err = _search(q, st)
            if err:
                result.error = err
                continue
            for r in results:
                score = _name_similarity(org_name, r.get("name", ""))
                if score > best_score and score >= 0.4:
                    best_score = score
                    best_match = r
                    params_q = f"q={q}" + (f"&state%5Bid%5D={st}" if st else "")
                    search_source = f"{PROPUBLICA_SEARCH}?{params_q}"
            if best_match:
                break
        if best_match:
            break

    if not best_match:
        result.found = False
        return result

    # Found a candidate in search results
    ein = str(best_match.get("ein", "")).strip()
    result.found = True
    result.name_matched = best_match.get("name")
    result.ein = ein if ein else None
    result.ein_source_url = search_source
    result.business_type = "NONPROFIT"
    result.business_type_source_url = search_source

    if not ein:
        return result

    # Fetch detailed record for 990 revenue
    org_detail_url = f"https://projects.propublica.org/nonprofits/organizations/{ein}"
    org_api_url = PROPUBLICA_ORG.format(ein=ein)
    detail_data, api_source, err = _fetch_org_detail(ein)

    if err or not detail_data:
        # We have EIN from search but couldn't fetch details — EIN source stays as search URL
        return result

    # Update EIN source to the more canonical org page
    result.ein_source_url = org_detail_url
    result.business_type_source_url = org_detail_url

    # Extract 990 filings
    filings = (
        detail_data.get("filings_with_data", []) or []
        + detail_data.get("filings_without_data", []) or []
    )
    # Also check nested under "organization"
    org_obj = detail_data.get("organization", {}) or {}
    if not filings:
        filings = org_obj.get("filings", []) or []

    rev, filing_year, form_type, pdf_url = _best_revenue_filing(filings)

    if rev is not None:
        result.revenue_990 = rev
        result.revenue_filing_year = filing_year
        result.filing_type = form_type
        result.revenue_source_url = pdf_url or org_detail_url
    else:
        # Check if all filings were 990-N (no financials)
        all_postcard = all(
            (f.get("formtype") or "").startswith("990N")
            for f in filings if f
        )
        if all_postcard and filings:
            result.filing_type = "990-N"  # postcard — no financials available

    return result


def lookup_by_ein(ein: str) -> NonprofitResult:
    """
    Fetch a known EIN directly. Used when CSV already contains an EIN.
    """
    result = NonprofitResult(found=True, ein=ein)
    org_detail_url = f"https://projects.propublica.org/nonprofits/organizations/{ein}"
    result.ein_source_url = org_detail_url
    result.business_type = "NONPROFIT"
    result.business_type_source_url = org_detail_url

    detail_data, _, err = _fetch_org_detail(ein)
    if err or not detail_data:
        result.error = err
        return result

    filings = detail_data.get("filings_with_data", []) or []
    rev, filing_year, form_type, pdf_url = _best_revenue_filing(filings)
    if rev is not None:
        result.revenue_990 = rev
        result.revenue_filing_year = filing_year
        result.filing_type = form_type
        result.revenue_source_url = pdf_url or org_detail_url
    elif filings:
        result.filing_type = "990-N"

    return result
