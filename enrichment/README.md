# Enrichment Pipeline

Builds a source-cited, verification-ready database of all youth flag football orgs.

**Non-negotiable rule:** every field is sourced or null. No value exists without a `source_url`. No estimation, no inference.

## Setup

```bash
cd enrichment
pip install -r requirements.txt
```

## Usage

```bash
# Dry run — no network, validates schema and all 4 outputs
python run.py --dry-run

# Step 1: nonprofit lookups only (ProPublica/IRS)
python run.py --skip-web

# Step 2: full run (nonprofit + website enrichment)
python run.py

# Limit to first N orgs (testing)
python run.py --max 10
```

## Outputs (written to `../enrichment_output/`)

| File | Contents |
|------|----------|
| `clubs_database.json` | Full sourced records with source URLs |
| `clubs_database.csv` | Flattened: each field + matching `_source` column |
| `verification_call_list.csv` | Prioritized human follow-up list |
| `coverage_report.md` | Honest gap summary |

## Important notes

- **Proxy:** Outbound HTTPS is blocked in the cloud CI environment. Run locally with unrestricted internet.
- **Rate limiting:** 1.5s between requests to the same domain; 0.6s for ProPublica API calls. The full dataset (~161 orgs) takes 10–30 minutes.
- **Revenue:** `revenue_estimate_modelled` (from original CSV) and `revenue_990` (from IRS filings) are kept strictly separate. Never conflated.
- **Confidence levels:** `sourced` (≥3 fields verified) / `partial` (≥1) / `unverified` (0).

## Module responsibilities

| Module | Role |
|--------|------|
| `web.py` | HTTP client: robots.txt, rate limiting, retries |
| `nonprofit.py` | ProPublica/IRS lookups → EIN, business type, 990 revenue |
| `enrich.py` | Website scraping → head name, email, social handles |
| `emit.py` | Write all 4 output files |
| `run.py` | Orchestrator: reads CSV → calls modules → emits outputs |
