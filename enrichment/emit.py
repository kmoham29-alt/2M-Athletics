"""
Emit pipeline outputs:
  1. clubs_database.json   — full sourced records
  2. clubs_database.csv    — flattened with _source columns
  3. verification_call_list.csv — prioritized human follow-up list
  4. coverage_report.md    — honest gap summary
"""

import csv
import json
import re
from pathlib import Path
from datetime import datetime, timezone

DISCLAIMER = (
    "AUTO-COLLECTED — REQUIRES HUMAN CONFIRMATION. "
    "Revenue figures marked 'modelled' are estimates from the original CSV, NOT verified. "
    "990 revenue figures are from IRS filings via ProPublica and reflect total organization "
    "revenue for the filing period, not flag football program revenue alone."
)


def _null_or(d: dict, key: str):
    return d.get(key, {}).get("value") if isinstance(d.get(key), dict) else d.get(key)


def _src(d: dict, key: str):
    return d.get(key, {}).get("source_url") if isinstance(d.get(key), dict) else None


def write_json(records: list[dict], path: Path) -> None:
    out = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "disclaimer": DISCLAIMER,
        "record_count": len(records),
        "records": records,
    }
    path.write_text(json.dumps(out, indent=2, ensure_ascii=False))
    print(f"  ✓ {path.name} ({len(records)} records)")


def write_csv(records: list[dict], path: Path) -> None:
    """
    Flattened CSV: one row per org, one column per field,
    plus a matching _source column for every sourced field.
    """
    if not records:
        path.write_text("")
        return

    SOURCED_FIELDS = [
        "business_type", "ein", "revenue_990",
        "head_name", "head_title", "email",
        "instagram", "facebook",
    ]
    FLAT_FIELDS = [
        "org_id", "name", "league_affiliation", "website", "state", "city",
        "confidence", "verification_status",
    ]
    REVENUE_EST = ["revenue_estimate_modelled_value", "revenue_estimate_modelled_note"]
    REVENUE_990_EXTRA = ["revenue_990_filing_year"]

    header = list(FLAT_FIELDS)
    for f in SOURCED_FIELDS:
        header.append(f)
        header.append(f"{f}_source")
    header += REVENUE_EST + REVENUE_990_EXTRA
    header += ["nonprofit_lookup_error"]

    with open(path, "w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=header, extrasaction="ignore")
        w.writeheader()
        for r in records:
            row: dict = {}
            for f in FLAT_FIELDS:
                row[f] = r.get(f, "")
            for f in SOURCED_FIELDS:
                obj = r.get(f, {})
                if isinstance(obj, dict):
                    row[f] = obj.get("value", "") or ""
                    row[f"{f}_source"] = obj.get("source_url", "") or ""
                    if f == "revenue_990":
                        row["revenue_990_filing_year"] = obj.get("filing_year", "") or ""
                else:
                    row[f] = ""
                    row[f"{f}_source"] = ""
            est = r.get("revenue_estimate_modelled", {}) or {}
            row["revenue_estimate_modelled_value"] = est.get("value", "") or ""
            row["revenue_estimate_modelled_note"] = est.get("note", "") or ""
            row["nonprofit_lookup_error"] = r.get("_nonprofit_error", "") or ""
            w.writerow(row)

    print(f"  ✓ {path.name} ({len(records)} rows, {len(header)} columns)")


def _priority_score(r: dict) -> float:
    """
    Higher = more important to call.
    Uses modelled revenue (CSV) and players as proxies for size.
    """
    rev_est = (r.get("revenue_estimate_modelled") or {}).get("value") or 0
    try:
        rev_est = float(rev_est)
    except (TypeError, ValueError):
        rev_est = 0
    return rev_est


def write_call_list(records: list[dict], path: Path) -> None:
    """
    Prioritized list of orgs where high-value fields are null or unverified.
    Sorted by priority (modelled revenue descending — larger orgs first).
    """
    HEADER = [
        "priority_rank",
        "org_name", "website", "state",
        "league_affiliation",
        "revenue_estimate_modelled",
        "revenue_990_sourced", "revenue_990_filing_year",
        "business_type_sourced", "ein_sourced",
        "head_name_sourced", "email_sourced",
        "instagram_sourced",
        "missing_high_value_fields",
        "suggested_action",
    ]

    HIGH_VALUE = ["revenue_990", "head_name", "email"]

    rows = []
    for r in records:
        missing = []
        for f in HIGH_VALUE:
            obj = r.get(f, {}) or {}
            if not (isinstance(obj, dict) and obj.get("value") is not None):
                missing.append(f)
        if not missing:
            continue  # all high-value fields sourced — skip

        bt_obj = r.get("business_type", {}) or {}
        bt = bt_obj.get("value") if isinstance(bt_obj, dict) else None

        actions = []
        if "revenue_990" in missing:
            if bt == "NONPROFIT":
                actions.append("Search ProPublica/IRS for 990 revenue")
            else:
                actions.append("Confirm business type; for-profits rarely file public revenue")
        if "head_name" in missing:
            actions.append("Visit website / LinkedIn for director name")
        if "email" in missing:
            actions.append("Visit website contact page for email")

        rows.append({
            "priority_score": _priority_score(r),
            "priority_rank": 0,  # filled after sort
            "org_name": r.get("name", ""),
            "website": r.get("website", "") or "",
            "state": r.get("state", "") or "",
            "league_affiliation": r.get("league_affiliation", "") or "",
            "revenue_estimate_modelled": (r.get("revenue_estimate_modelled") or {}).get("value", "") or "",
            "revenue_990_sourced": (r.get("revenue_990") or {}).get("value", "") or "",
            "revenue_990_filing_year": (r.get("revenue_990") or {}).get("filing_year", "") or "",
            "business_type_sourced": (r.get("business_type") or {}).get("value", "") or "",
            "ein_sourced": (r.get("ein") or {}).get("value", "") or "",
            "head_name_sourced": (r.get("head_name") or {}).get("value", "") or "",
            "email_sourced": (r.get("email") or {}).get("value", "") or "",
            "instagram_sourced": (r.get("instagram") or {}).get("value", "") or "",
            "missing_high_value_fields": ", ".join(missing),
            "suggested_action": "; ".join(actions),
        })

    # Sort by modelled revenue descending
    rows.sort(key=lambda x: x["priority_score"], reverse=True)
    for i, row in enumerate(rows, 1):
        row["priority_rank"] = i
        del row["priority_score"]

    with open(path, "w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=HEADER, extrasaction="ignore")
        w.writeheader()
        w.writerows(rows)

    print(f"  ✓ {path.name} ({len(rows)} orgs need human follow-up)")


def write_coverage_report(records: list[dict], path: Path, elapsed_secs: float = 0.0) -> None:
    total = len(records)
    if total == 0:
        path.write_text("No records.\n")
        return

    def pct(n): return f"{n}/{total} ({100*n//total}%)"

    def sourced(field):
        return sum(
            1 for r in records
            if isinstance(r.get(field), dict) and r[field].get("value") is not None
        )

    def has_990_revenue():
        return sum(
            1 for r in records
            if isinstance(r.get("revenue_990"), dict) and r["revenue_990"].get("value") is not None
        )

    n_np = sum(
        1 for r in records
        if isinstance(r.get("business_type"), dict) and r["business_type"].get("value") == "NONPROFIT"
    )
    n_fp = sum(
        1 for r in records
        if isinstance(r.get("business_type"), dict) and r["business_type"].get("value") == "FOR-PROFIT"
    )
    n_bt_sourced = sourced("business_type")
    n_ein = sourced("ein")
    n_rev990 = has_990_revenue()
    n_head = sourced("head_name")
    n_email = sourced("email")
    n_ig = sourced("instagram")
    n_fb = sourced("facebook")

    # Nothing added beyond CSV
    def is_enriched(r):
        sourced_keys = ["business_type","ein","revenue_990","head_name","email","instagram","facebook"]
        return any(
            isinstance(r.get(k), dict) and r[k].get("value") is not None
            for k in sourced_keys
        )
    n_enriched = sum(1 for r in records if is_enriched(r))
    n_csv_only = total - n_enriched

    lines = [
        "# Club Database Coverage Report",
        "",
        f"*Generated: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}*",
        f"*Pipeline runtime: {elapsed_secs:.0f}s*",
        "",
        f"> {DISCLAIMER}",
        "",
        "## Summary",
        "",
        f"| Metric | Count |",
        f"|---|---|",
        f"| Total organizations | {total} |",
        f"| Organizations with any sourced enrichment | {pct(n_enriched)} |",
        f"| **CSV-only (nothing added)** | **{pct(n_csv_only)}** |",
        "",
        "## Business Type",
        "",
        f"| Status | Count |",
        f"|---|---|",
        f"| Business type sourced (ProPublica/IRS) | {pct(n_bt_sourced)} |",
        f"| Confirmed NONPROFIT | {n_np} |",
        f"| Confirmed FOR-PROFIT | {n_fp} |",
        f"| EIN sourced | {pct(n_ein)} |",
        "",
        "## Revenue",
        "",
        f"| Status | Count |",
        f"|---|---|",
        f"| 990 revenue sourced (nonprofits only) | {pct(n_rev990)} |",
        f"| Orgs with modelled revenue estimate (CSV) | {pct(sum(1 for r in records if (r.get('revenue_estimate_modelled') or {}).get('value')))} |",
        "",
        "## Contact & Social",
        "",
        f"| Field | Sourced |",
        f"|---|---|",
        f"| Head name | {pct(n_head)} |",
        f"| Email | {pct(n_email)} |",
        f"| Instagram | {pct(n_ig)} |",
        f"| Facebook | {pct(n_fb)} |",
        "",
        "## Coverage gaps (expected)",
        "",
        "- For-profit businesses do not file 990s — revenue is not publicly available.",
        "- Small nonprofits filing 990-N (postcard) have no revenue figures.",
        "- Most clubs do not publish director names in machine-readable form.",
        "- A partial, honest dataset is the deliverable. The call list shows exactly what to verify.",
        "",
        "## How to improve coverage",
        "",
        "1. Run the pipeline locally (outbound HTTPS is required — blocked in cloud CI).",
        "2. Work through `verification_call_list.csv` — call each org, confirm fields.",
        "3. For nonprofits: search ProPublica directly at https://projects.propublica.org/nonprofits/",
        "4. For for-profits: check state secretary-of-state business registries.",
        "5. Re-run the pipeline with `--skip-fetch False` to refresh auto-collected fields.",
    ]

    path.write_text("\n".join(lines) + "\n")
    print(f"  ✓ {path.name}")
