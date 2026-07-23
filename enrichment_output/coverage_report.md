# Club Database Coverage Report

*Generated: 2026-07-23 14:03 UTC*
*Pipeline runtime: 0s*

> AUTO-COLLECTED — REQUIRES HUMAN CONFIRMATION. Revenue figures marked 'modelled' are estimates from the original CSV, NOT verified. 990 revenue figures are from IRS filings via ProPublica and reflect total organization revenue for the filing period, not flag football program revenue alone.

## Summary

| Metric | Count |
|---|---|
| Total organizations | 5 |
| Organizations with any sourced enrichment | 0/5 (0%) |
| **CSV-only (nothing added)** | **5/5 (100%)** |

## Business Type

| Status | Count |
|---|---|
| Business type sourced (ProPublica/IRS) | 0/5 (0%) |
| Confirmed NONPROFIT | 0 |
| Confirmed FOR-PROFIT | 0 |
| EIN sourced | 0/5 (0%) |

## Revenue

| Status | Count |
|---|---|
| 990 revenue sourced (nonprofits only) | 0/5 (0%) |
| Orgs with modelled revenue estimate (CSV) | 5/5 (100%) |

## Contact & Social

| Field | Sourced |
|---|---|
| Head name | 0/5 (0%) |
| Email | 0/5 (0%) |
| Instagram | 0/5 (0%) |
| Facebook | 0/5 (0%) |

## Coverage gaps (expected)

- For-profit businesses do not file 990s — revenue is not publicly available.
- Small nonprofits filing 990-N (postcard) have no revenue figures.
- Most clubs do not publish director names in machine-readable form.
- A partial, honest dataset is the deliverable. The call list shows exactly what to verify.

## How to improve coverage

1. Run the pipeline locally (outbound HTTPS is required — blocked in cloud CI).
2. Work through `verification_call_list.csv` — call each org, confirm fields.
3. For nonprofits: search ProPublica directly at https://projects.propublica.org/nonprofits/
4. For for-profits: check state secretary-of-state business registries.
5. Re-run the pipeline with `--skip-fetch False` to refresh auto-collected fields.
