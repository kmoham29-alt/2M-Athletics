# Club Discovery Pipeline

Reads `youth_flag_football_database.csv`, attempts to discover individual clubs from
each league's website, geocodes them, and writes `clubs.json` + `coverage_report.csv`.

## Why this must run locally

The pipeline makes outbound HTTP requests to 159 league websites. Remote execution
environments (including this repo's cloud sessions) route traffic through a strict
proxy that blocks arbitrary HTTPS — all sites return 403 from the proxy. **Run the
pipeline on a local machine with unrestricted internet access.**

## Setup

```bash
cd pipeline
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

## Run

```bash
# From the project root:
python pipeline/run.py
```

This writes:
- `clubs.json` — the data contract consumed by the map
- `pipeline/coverage_report.csv` — one row per league with discovery status

### Options

```bash
python pipeline/run.py --help

--csv PATH        Path to CSV (default: youth_flag_football_database.csv)
--out-json PATH   Path for clubs.json output (default: clubs.json)
--out-csv PATH    Path for coverage report (default: pipeline/coverage_report.csv)
--max N           Process only first N leagues (useful for testing)
--skip-fetch      Skip HTTP fetching; write league metadata only (status: fetch_not_attempted)
```

### Quick test (no network needed)

```bash
python pipeline/run.py --max 5 --skip-fetch
```

## What it does per league

1. **Fetches** the league's homepage + common location-page paths (`/locations`,
   `/find-a-location`, `/leagues`, `/chapters`, etc.)
2. **Parses** for structured location containers or city+state patterns
3. **Geocodes** each found club (`city + state → lat/lng`) via Nominatim (OSM),
   with results cached in `geocode_cache.json`
4. Records one of three statuses:
   - `clubs_found` — found a list of locations/clubs
   - `no_club_list_found` — site reachable but no location list detected
   - `unreachable` — site down, blocked, or timeout

## Expected results

- **Franchise operators** (i9 Sports, NFL FLAG via RCX, N Zone, Skyhawks) are most
  likely to have `/find-a-location` pages that yield clubs.
- **Small single-site nonprofits** (most entries) will return `no_club_list_found`.
- A minority of clubs_found with the majority no_club_list_found is the expected
  and honest outcome.

## Honesty rules

The pipeline never fabricates. If a value is not found on a real page, it is stored
as `null`. Run it, trust the `discovery_status`, read the coverage report.

## Re-running to refresh data

```bash
python pipeline/run.py
```

Re-running overwrites `clubs.json` with fresh data. The geocode cache
(`geocode_cache.json`) persists across runs so already-geocoded cities are not
re-requested.

## Output schema (`clubs.json`)

```json
{
  "generated_at": "ISO-8601 timestamp",
  "leagues": [{
    "league_id": "slug",
    "name": "...",
    "business_type": "FOR-PROFIT | NONPROFIT",
    "gender": "Co-ed | Girls",
    "raw_state_field": "...",
    "states": ["CA"],
    "is_national": false,
    "multi_state_unspecified": false,
    "website": "...",
    "est_annual_revenue_usd": 1200000,
    "revenue_notes": "...",
    "discovery_status": "clubs_found | no_club_list_found | unreachable | fetch_not_attempted | no_website",
    "clubs": [{
      "club_name": "...",
      "city": "...",
      "state": "CA",
      "lat": 37.77,
      "lng": -122.4,
      "age_groups": "Ages 6-14",
      "contact": "...",
      "source_url": "..."
    }]
  }]
}
```
