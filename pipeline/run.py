"""
Club Discovery Pipeline — orchestrator.

Usage:
    python run.py [--csv PATH] [--out-json PATH] [--out-csv PATH] [--max N] [--skip-fetch]

Reads youth_flag_football_database.csv, discovers individual clubs from league websites,
geocodes them, and writes clubs.json + coverage_report.csv.
"""

import argparse
import csv
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

from fetch import fetch_html, discover_location_urls
from parse import parse_all_candidate_pages, ClubCandidate
from geocode import geocode
from state_parser import parse_state_field

ROOT = Path(__file__).parent.parent
DEFAULT_CSV = ROOT / "youth_flag_football_database.csv"
DEFAULT_JSON = ROOT / "clubs.json"
DEFAULT_REPORT = ROOT / "pipeline" / "coverage_report.csv"


def slugify(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")[:60]


def coerce_int(val: str) -> int | None:
    if not val or val.strip().upper() in ("N/A", "", "NULL"):
        return None
    cleaned = re.sub(r"[^\d]", "", val)
    return int(cleaned) if cleaned else None


def coerce_revenue(val: str) -> int | None:
    if not val or val.strip().upper() in ("N/A", "", "NULL"):
        return None
    cleaned = re.sub(r"[^\d]", "", val)
    return int(cleaned) if cleaned else None


def nullable(val: str) -> str | None:
    if not val or val.strip().upper() in ("N/A", "", "NULL", "N/A (24 LEAGUES)", "N/A (GOVERNING BODY)"):
        return None
    return val.strip() or None


def read_csv(path: Path) -> list[dict]:
    rows = []
    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append({k.strip(): v.strip() for k, v in row.items()})
    return rows


def process_league(row: dict, skip_fetch: bool) -> tuple[dict, dict]:
    """
    Process one CSV row → (league_dict, coverage_row).
    """
    name = row.get("Organization_Name", "").strip()
    website = nullable(row.get("Website", ""))
    raw_state = row.get("State", "").strip()

    state_info = parse_state_field(raw_state)

    league = {
        "league_id": slugify(name),
        "name": name,
        "business_type": row.get("Business_Type", "").strip() or None,
        "gender": row.get("Gender", "").strip() or None,
        "raw_state_field": raw_state,
        "states": state_info["states"],
        "is_national": state_info["is_national"],
        "multi_state_unspecified": state_info.get("multi_state_unspecified", False),
        "city_region": nullable(row.get("City_Region", "")),
        "founded": nullable(row.get("Founded", "")),
        "players_participants": nullable(row.get("Players_Participants", "")),
        "website": website,
        "instagram_handle": nullable(row.get("Instagram_Handle", "")),
        "instagram_followers": coerce_int(row.get("Instagram_Followers", "")),
        "facebook_page": nullable(row.get("Facebook_Page", "")),
        "facebook_followers": coerce_int(row.get("Facebook_Followers", "")),
        "twitter_x": nullable(row.get("Twitter_X", "")),
        "head_name": nullable(row.get("Head_Name", "")),
        "head_title": nullable(row.get("Head_Title", "")),
        "email": nullable(row.get("Email", "")),
        "phone": nullable(row.get("Phone", "")),
        "est_annual_revenue_usd": coerce_revenue(row.get("Est_Annual_Revenue_USD", "")),
        "revenue_notes": nullable(row.get("Revenue_Notes", "")),
        "discovery_status": None,
        "clubs": [],
    }

    coverage = {
        "league_name": name,
        "website": website or "",
        "discovery_status": "no_website",
        "clubs_found_count": 0,
    }

    if not website:
        league["discovery_status"] = "no_website"
        coverage["discovery_status"] = "no_website"
        return league, coverage

    if skip_fetch:
        league["discovery_status"] = "fetch_not_attempted"
        coverage["discovery_status"] = "fetch_not_attempted"
        return league, coverage

    # Discover candidate URLs and fetch them
    candidate_urls = discover_location_urls(website)
    fetched_pages: list[tuple[str, str | None]] = []

    for url in candidate_urls:
        html, err = fetch_html(url)
        if html is not None:
            fetched_pages.append((url, html))
        # Limit: stop after finding at least the homepage + 2 location candidates
        if len(fetched_pages) >= 3:
            break

    clubs_raw, status = parse_all_candidate_pages(fetched_pages, state_info["states"])

    # Geocode each club
    clubs_out = []
    for c in clubs_raw:
        lat, lng = geocode(c.city, c.state)
        clubs_out.append({
            "club_name": c.club_name,
            "city": c.city,
            "state": c.state,
            "lat": lat,
            "lng": lng,
            "age_groups": c.age_groups,
            "contact": c.contact,
            "source_url": c.source_url,
        })

    league["discovery_status"] = status
    league["clubs"] = clubs_out
    coverage["discovery_status"] = status
    coverage["clubs_found_count"] = len(clubs_out)

    return league, coverage


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--csv", default=str(DEFAULT_CSV))
    parser.add_argument("--out-json", default=str(DEFAULT_JSON))
    parser.add_argument("--out-csv", default=str(DEFAULT_REPORT))
    parser.add_argument("--max", type=int, default=None, help="Limit rows processed (for testing)")
    parser.add_argument("--skip-fetch", action="store_true", help="Skip HTTP fetching (data only)")
    args = parser.parse_args()

    csv_path = Path(args.csv)
    json_path = Path(args.out_json)
    report_path = Path(args.out_csv)

    if not csv_path.exists():
        print(f"ERROR: CSV not found: {csv_path}", file=sys.stderr)
        sys.exit(1)

    rows = read_csv(csv_path)
    if args.max:
        rows = rows[:args.max]

    print(f"Processing {len(rows)} leagues from {csv_path.name}")
    print(f"Fetch mode: {'SKIP (data only)' if args.skip_fetch else 'LIVE HTTP'}")
    print()

    leagues_out = []
    coverage_rows = []

    for i, row in enumerate(rows, 1):
        name = row.get("Organization_Name", "?")
        print(f"[{i:3}/{len(rows)}] {name[:60]:<60}", end=" ", flush=True)

        league, coverage = process_league(row, skip_fetch=args.skip_fetch)
        leagues_out.append(league)
        coverage_rows.append(coverage)

        status = league["discovery_status"]
        n_clubs = len(league["clubs"])
        print(f"→ {status} ({n_clubs} clubs)")

    # Write clubs.json
    output = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "leagues": leagues_out,
    }
    json_path.write_text(json.dumps(output, indent=2, ensure_ascii=False))
    print(f"\n✓ clubs.json written → {json_path}")

    # Write coverage_report.csv
    report_path.parent.mkdir(parents=True, exist_ok=True)
    with open(report_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["league_name","website","discovery_status","clubs_found_count"])
        writer.writeheader()
        writer.writerows(coverage_rows)
    print(f"✓ coverage_report.csv written → {report_path}")

    # Summary
    from collections import Counter
    status_counts = Counter(r["discovery_status"] for r in coverage_rows)
    total_clubs = sum(r["clubs_found_count"] for r in coverage_rows)
    print("\n── Coverage Summary ──────────────────────────")
    for status, count in sorted(status_counts.items()):
        print(f"  {status:<30} {count:>4} leagues")
    print(f"  {'Total clubs discovered':<30} {total_clubs:>4}")
    print("─────────────────────────────────────────────")


if __name__ == "__main__":
    main()
