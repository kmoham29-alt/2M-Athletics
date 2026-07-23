"""
Club Database Enrichment Pipeline — orchestrator.

Usage:
    python run.py [options]

    --csv PATH          Path to CSV (default: ../youth_flag_football_database.csv)
    --out-dir PATH      Output directory (default: ../enrichment_output)
    --max N             Process only first N orgs (for testing)
    --skip-nonprofit    Skip ProPublica/IRS lookups
    --skip-web          Skip website enrichment
    --dry-run           Skip ALL network calls; produce schema-correct output with null sourced fields

Build order (matches brief):
  Step 1 (--skip-web):      nonprofit lookups only → coverage_report shows 990 status
  Step 2 (full run):        adds web enrichment
"""

import argparse
import csv
import re
import sys
import time
from pathlib import Path

ROOT = Path(__file__).parent.parent
DEFAULT_CSV = ROOT / "youth_flag_football_database.csv"
DEFAULT_OUT = ROOT / "enrichment_output"


# ── CSV helpers ───────────────────────────────────────────────────────────────

def _nullable(v: str) -> str | None:
    stripped = (v or "").strip()
    if stripped.upper() in ("N/A", "", "NULL", "NONE", "N/A (24 LEAGUES)", "N/A (GOVERNING BODY)"):
        return None
    return stripped or None


def _coerce_revenue(v: str) -> int | None:
    if not v:
        return None
    digits = re.sub(r"[^\d]", "", v)
    return int(digits) if digits else None


def _coerce_int(v: str) -> int | None:
    if not v:
        return None
    digits = re.sub(r"[^\d]", "", v)
    return int(digits) if digits else None


def _slugify(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")[:60]


def _parse_state(raw: str) -> str | None:
    """Return the primary state abbreviation for this org, or None."""
    from state_parser import parse_state_field
    info = parse_state_field(raw or "")
    if info["is_national"]:
        return "National"
    if info["states"]:
        return info["states"][0]
    return None


def _infer_business_type_from_csv(row: dict) -> str | None:
    """
    The CSV Business_Type column is the source of truth for the initial pass.
    Map it to our standard values. Only return a value if the CSV says it explicitly.
    Source URL will be None (CSV is not a public source — it's our internal research).
    """
    bt = (row.get("Business_Type") or "").strip().upper()
    if bt == "FOR-PROFIT":
        return "FOR-PROFIT"
    if bt == "NONPROFIT":
        return "NONPROFIT"
    return None


# ── Schema builder ────────────────────────────────────────────────────────────

def build_base_record(row: dict) -> dict:
    """
    Build the full schema record from a CSV row.
    All sourced fields start as null — they get filled by nonprofit.py / enrich.py.
    The CSV business_type is carried as a separate field (not treated as sourced).
    """
    name = row.get("Organization_Name", "").strip()
    raw_state = row.get("State", "").strip()
    primary_state = _parse_state(raw_state)

    rev_est = _coerce_revenue(row.get("Est_Annual_Revenue_USD", ""))
    rev_note = _nullable(row.get("Revenue_Notes", ""))

    return {
        "org_id": _slugify(name),
        "name": name,
        "league_affiliation": None,               # requires sourcing — not inferred
        "business_type": {                         # sourced field
            "value": None,
            "source_url": None,
            "_csv_value": _infer_business_type_from_csv(row),  # internal reference only
        },
        "ein": {"value": None, "source_url": None},
        "revenue_990": {
            "value": None,
            "filing_year": None,
            "filing_type": None,
            "source_url": None,
        },
        "revenue_estimate_modelled": {
            "value": rev_est,
            "note": (
                "from original CSV Revenue_Notes column, NOT verified. "
                + (rev_note or "")
            ).strip(),
        },
        "head_name": {"value": None, "source_url": None},
        "head_title": {"value": None, "source_url": None},
        "email": {"value": None, "source_url": None},
        "phone": {"value": None, "source_url": None},
        "instagram": {"value": None, "source_url": None},
        "facebook": {"value": None, "source_url": None},
        # Flat fields
        "website": _nullable(row.get("Website", "")),
        "state": raw_state,
        "primary_state": primary_state,
        "city": _nullable(row.get("City_Region", "")),
        "founded": _nullable(row.get("Founded", "")),
        "players_participants": _nullable(row.get("Players_Participants", "")),
        "gender": _nullable(row.get("Gender", "")),
        "instagram_handle_csv": _nullable(row.get("Instagram_Handle", "")),
        "instagram_followers_csv": _coerce_int(row.get("Instagram_Followers", "")),
        "facebook_page_csv": _nullable(row.get("Facebook_Page", "")),
        "facebook_followers_csv": _coerce_int(row.get("Facebook_Followers", "")),
        "head_name_csv": _nullable(row.get("Head_Name", "")),
        "head_title_csv": _nullable(row.get("Head_Title", "")),
        "email_csv": _nullable(row.get("Email", "")),
        "phone_csv": _nullable(row.get("Phone", "")),
        # Metadata
        "confidence": "unverified",
        "verification_status": "auto-collected — requires human confirmation",
        "_nonprofit_error": None,
    }


def _apply_nonprofit(record: dict, result) -> None:
    """Apply a NonprofitResult onto a record in-place."""
    if not result.found:
        if result.error:
            record["_nonprofit_error"] = result.error
        return

    if result.business_type:
        record["business_type"]["value"] = result.business_type
        record["business_type"]["source_url"] = result.business_type_source_url

    if result.ein:
        record["ein"]["value"] = result.ein
        record["ein"]["source_url"] = result.ein_source_url

    if result.revenue_990 is not None:
        record["revenue_990"]["value"] = result.revenue_990
        record["revenue_990"]["filing_year"] = result.revenue_filing_year
        record["revenue_990"]["filing_type"] = result.filing_type
        record["revenue_990"]["source_url"] = result.revenue_source_url
    elif result.filing_type == "990-N":
        record["revenue_990"]["filing_type"] = "990-N"
        record["revenue_990"]["source_url"] = result.revenue_source_url

    if result.error:
        record["_nonprofit_error"] = result.error

    _update_confidence(record)


def _apply_enrich(record: dict, result) -> None:
    """Apply an EnrichResult onto a record in-place."""
    if result.head_name and record["head_name"]["value"] is None:
        record["head_name"]["value"] = result.head_name
        record["head_name"]["source_url"] = result.head_name_source
    if result.head_title and record["head_title"]["value"] is None:
        record["head_title"]["value"] = result.head_title
        record["head_title"]["source_url"] = result.head_title_source
    if result.email and record["email"]["value"] is None:
        record["email"]["value"] = result.email
        record["email"]["source_url"] = result.email_source
    if result.phone and record["phone"]["value"] is None:
        record["phone"]["value"] = result.phone
        record["phone"]["source_url"] = result.phone_source
    if result.instagram and record["instagram"]["value"] is None:
        record["instagram"]["value"] = result.instagram
        record["instagram"]["source_url"] = result.instagram_source
    if result.facebook and record["facebook"]["value"] is None:
        record["facebook"]["value"] = result.facebook
        record["facebook"]["source_url"] = result.facebook_source
    _update_confidence(record)


def _update_confidence(record: dict) -> None:
    sourced_fields = ["business_type", "ein", "revenue_990", "head_name", "email"]
    sourced = [
        f for f in sourced_fields
        if isinstance(record.get(f), dict) and record[f].get("value") is not None
    ]
    if len(sourced) >= 3:
        record["confidence"] = "sourced"
    elif sourced:
        record["confidence"] = "partial"
    else:
        record["confidence"] = "unverified"


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--csv", default=str(DEFAULT_CSV))
    ap.add_argument("--out-dir", default=str(DEFAULT_OUT))
    ap.add_argument("--max", type=int, default=None)
    ap.add_argument("--skip-nonprofit", action="store_true")
    ap.add_argument("--skip-web", action="store_true")
    ap.add_argument("--dry-run", action="store_true",
                    help="Skip ALL network; produce schema-correct output with null sourced fields")
    args = ap.parse_args()

    if args.dry_run:
        args.skip_nonprofit = True
        args.skip_web = True

    csv_path = Path(args.csv)
    out_dir = Path(args.out_dir)
    if not csv_path.exists():
        print(f"ERROR: CSV not found: {csv_path}", file=sys.stderr)
        sys.exit(1)

    out_dir.mkdir(parents=True, exist_ok=True)

    # Read CSV
    with open(csv_path, newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    rows = [{k.strip(): v.strip() for k, v in r.items()} for r in rows]
    if args.max:
        rows = rows[:args.max]

    print(f"\n{'='*60}")
    print(f"  2M Athletics Enrichment Pipeline")
    print(f"  {len(rows)} orgs | nonprofit={'LIVE' if not args.skip_nonprofit else 'SKIP'} | "
          f"web={'LIVE' if not args.skip_web else 'SKIP'}")
    print(f"{'='*60}\n")

    records = []
    t_start = time.monotonic()

    for i, row in enumerate(rows, 1):
        name = row.get("Organization_Name", "?")
        print(f"[{i:3}/{len(rows)}] {name[:55]:<55}", end=" ", flush=True)

        record = build_base_record(row)
        tags = []

        # Step 1: Nonprofit lookup
        if not args.skip_nonprofit:
            try:
                from nonprofit import lookup
                primary_st = record.get("primary_state")
                if primary_st == "National":
                    primary_st = None
                np_result = lookup(name, primary_st)
                _apply_nonprofit(record, np_result)
                if np_result.found:
                    tags.append(f"np:found(EIN={np_result.ein})")
                    if np_result.revenue_990 is not None:
                        tags.append(f"990=${np_result.revenue_990:,}")
                    elif np_result.filing_type == "990-N":
                        tags.append("990-N(no financials)")
                else:
                    tags.append("np:not_found")
            except Exception as e:
                record["_nonprofit_error"] = str(e)
                tags.append(f"np:error({e})")

        # Step 2: Website enrichment
        if not args.skip_web and record.get("website"):
            try:
                from enrich import enrich_website
                enrich_result = enrich_website(record["website"])
                _apply_enrich(record, enrich_result)
                enriched = [
                    f for f in ["head_name","email","instagram","facebook"]
                    if isinstance(record.get(f), dict) and record[f].get("value")
                ]
                if enriched:
                    tags.append(f"web:{','.join(enriched)}")
                elif enrich_result.errors:
                    tags.append("web:unreachable")
                else:
                    tags.append("web:no_data")
            except Exception as e:
                tags.append(f"web:error({e})")

        records.append(record)
        status_line = " | ".join(tags) if tags else f"conf:{record['confidence']}"
        print(status_line)

    elapsed = time.monotonic() - t_start

    # Emit outputs
    print(f"\nWriting outputs → {out_dir}/")
    from emit import write_json, write_csv, write_call_list, write_coverage_report
    write_json(records, out_dir / "clubs_database.json")
    write_csv(records, out_dir / "clubs_database.csv")
    write_call_list(records, out_dir / "verification_call_list.csv")
    write_coverage_report(records, out_dir / "coverage_report.md", elapsed_secs=elapsed)

    print(f"\n  Done in {elapsed:.1f}s")
    print(f"  Outputs in: {out_dir}/\n")


if __name__ == "__main__":
    # state_parser is in the pipeline/ directory — add to path
    sys.path.insert(0, str(Path(__file__).parent.parent / "pipeline"))
    main()
