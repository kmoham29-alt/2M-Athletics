"""
Parse raw CSV State field into structured state data.
Single function, reused everywhere — no per-row special cases.
"""

import re

# All valid 2-letter US state/territory abbreviations
VALID_ABBREVS = {
    "AL","AK","AZ","AR","CA","CO","CT","DE","DC","FL","GA","HI","ID",
    "IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO",
    "MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA",
    "RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
}

# Aliases that need expansion
ALIAS_EXPANSIONS = {
    "DMV": ["DC", "VA", "MD"],
    "LA":  ["LA"],  # Could be Louisiana — context dependent; treat as abbreviation
}

NATIONAL_SIGNALS = {
    "national", "nationwide", "all 50 states", "all 50", "all states",
}


def parse_state_field(raw: str) -> dict:
    """
    Parse raw State column value into:
    {
        "is_national": bool,
        "multi_state_unspecified": bool,
        "states": [list of 2-letter abbrevs]
    }

    Rules:
    - National/Nationwide/All 50 states → is_national=True, states=[]
    - "CA/LA/TX", "MO/KS", "VA/DC/MD", "DMV" → explicit multi-state list
    - "15 states", "Multi-state", "Multi-state (no list)" → multi_state_unspecified=True
    - Single clean abbrev → states=[abbrev]
    - Anything unrecognized → multi_state_unspecified=True
    """
    if not raw:
        return {"is_national": False, "multi_state_unspecified": True, "states": []}

    normalized = raw.strip()
    lower = normalized.lower()

    # National check
    if any(sig in lower for sig in NATIONAL_SIGNALS):
        return {"is_national": True, "multi_state_unspecified": False, "states": []}

    # Explicit multi-state via slash notation: "CA/LA/TX", "MO/KS", "VA/DC/MD"
    parts = re.split(r"[/,\s]+", normalized)
    parts = [p.strip().upper() for p in parts if p.strip()]

    resolved: list[str] = []
    all_valid = True

    for part in parts:
        if part in VALID_ABBREVS:
            resolved.append(part)
        elif part in ALIAS_EXPANSIONS:
            resolved.extend(ALIAS_EXPANSIONS[part])
        else:
            all_valid = False

    if resolved and all_valid and len(resolved) <= 10:
        is_multi = len(resolved) > 1
        return {
            "is_national": False,
            "multi_state_unspecified": False,
            "states": list(dict.fromkeys(resolved)),  # dedup preserving order
        }

    # Patterns like "15 states", "Multi-state", "27 states"
    if re.search(r'\d+\s+states?', lower) or "multi" in lower or "midwest" in lower:
        return {"is_national": False, "multi_state_unspecified": True, "states": []}

    # Try to salvage: look for any valid abbrevs within the string
    found_abbrevs = [a for a in VALID_ABBREVS if re.search(rf'\b{a}\b', normalized)]
    if found_abbrevs:
        return {
            "is_national": False,
            "multi_state_unspecified": False,
            "states": found_abbrevs,
        }

    # Fallback
    return {"is_national": False, "multi_state_unspecified": True, "states": []}
