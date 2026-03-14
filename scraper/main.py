#!/usr/bin/env python3
import argparse
import json
import sys
import time
from pathlib import Path

import requests

import api
import constants
import parser

RATE_LIMIT_SECONDS = 1
DATA_DIR = Path(__file__).resolve().parent.parent / "data"
RAW_OUTPUT_PATH = DATA_DIR / "characters-raw.json"
FILTERED_OUTPUT_PATH = DATA_DIR / "characters.json"


def run_full_scrape(dry_run: bool, limit: int | None = None) -> int:
    arcs_data = api.load_canon_arcs_data()
    overrides_path = DATA_DIR / "jutsu-type-overrides.json"
    jutsu_overrides: dict[str, list[str]] = {}
    if overrides_path.exists():
        with open(overrides_path) as f:
            jutsu_overrides = json.load(f)

    titles = api.fetch_category_members()
    if limit:
        titles = titles[:limit]
    print(f"Fetched {len(titles)} character page titles")

    characters: list[dict] = []
    # Note: deduplication here is redundant since filter-characters.ts also deduplicates,
    # but kept to ensure characters-raw.json itself has no duplicates.
    seen_ids: set[str] = set()
    skipped_missing = 0

    for i, title in enumerate(titles):
        try:
            time.sleep(RATE_LIMIT_SECONDS)
            wikitext = api.fetch_infobox_content(title)
            if not wikitext:
                print(f"  [{i + 1}/{len(titles)}] {title}: skipped (no infobox)")
                skipped_missing += 1
                continue

            char, skip_reason = parser.parse_character(wikitext, title, arcs_data, jutsu_overrides)
            if skip_reason:
                print(f"  [{i + 1}/{len(titles)}] {title}: skipped ({skip_reason})")
                skipped_missing += 1
                continue

            if char and char["id"] not in seen_ids:
                seen_ids.add(char["id"])
                characters.append(char)
                print(f"  [{i + 1}/{len(titles)}] {title}: added")
            else:
                print(f"  [{i + 1}/{len(titles)}] {title}: skipped (duplicate)")
        except requests.RequestException as e:
            print(f"  [{i + 1}/{len(titles)}] {title}: skipped ({e})", file=sys.stderr)
            skipped_missing += 1

    characters.sort(key=lambda c: c["id"])

    print(f"\nSummary:")
    print(f"  Fetched: {len(titles)}")
    print(f"  Skipped (missing data): {skipped_missing}")
    print(f"  Written: {len(characters)}")

    if not dry_run:
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        with open(RAW_OUTPUT_PATH, "w") as f:
            json.dump(characters, f, indent=2)

    return 0


def run_single_character(name: str) -> int:
    arcs_data = api.load_canon_arcs_data()
    overrides_path = DATA_DIR / "jutsu-type-overrides.json"
    jutsu_overrides: dict[str, list[str]] = {}
    if overrides_path.exists():
        with open(overrides_path) as f:
            jutsu_overrides = json.load(f)

    wikitext = api.fetch_infobox_content(name)
    if not wikitext:
        print(f"No infobox found for '{name}'", file=sys.stderr)
        return 1

    print("=== RAW WIKI INFOBOX ===")
    print(wikitext)
    print("=== PARSED CHARACTER ===")

    char, skip_reason = parser.parse_character(wikitext, name, arcs_data, jutsu_overrides)
    if char:
        print(json.dumps(char, indent=2))
        return 0

    print(f"Skipped: {skip_reason}", file=sys.stderr)
    return 1


def run_validate_only() -> int:
    if not FILTERED_OUTPUT_PATH.exists():
        print(f"Error: {FILTERED_OUTPUT_PATH} does not exist.", file=sys.stderr)
        return 1

    with open(FILTERED_OUTPUT_PATH) as f:
        data = json.load(f)

    if not isinstance(data, list):
        print("Error: characters.json must be a JSON array.", file=sys.stderr)
        return 1

    canon_arcs = api.load_canon_arcs()
    required = {"id", "name", "imageUrl", "village", "rank", "kekkeiGenkai", "natureTypes", "jutsuTypes", "status", "debutArc", "gender", "species"}
    array_fields = ("village", "kekkeiGenkai", "natureTypes", "jutsuTypes", "species")
    errors = 0

    for i, char in enumerate(data):
        if not isinstance(char, dict):
            print(f"  [{i}] Not an object", file=sys.stderr)
            errors += 1
            continue

        missing = required - set(char.keys())
        if missing:
            print(f"  [{i}] {char.get('name', '?')}: missing fields {missing}", file=sys.stderr)
            errors += 1
            continue

        name = char.get("name", "?")

        if char.get("rank") not in constants.RANK_VALUES:
            print(f"  [{i}] {name}: invalid rank '{char.get('rank')}'", file=sys.stderr)
            errors += 1

        if char.get("status") not in constants.STATUS_VALUES:
            print(f"  [{i}] {name}: invalid status '{char.get('status')}'", file=sys.stderr)
            errors += 1

        if char.get("debutArc") not in canon_arcs:
            print(f"  [{i}] {name}: debutArc '{char.get('debutArc')}' not in canon-arcs.json", file=sys.stderr)
            errors += 1

        if char.get("gender") not in constants.GENDER_VALUES:
            print(f"  [{i}] {name}: invalid gender '{char.get('gender')}'", file=sys.stderr)
            errors += 1

        enum_checks = {
            "kekkeiGenkai": constants.KKG_CATEGORIES,
            "natureTypes": constants.NATURE_TYPES,
            "jutsuTypes": constants.JUTSU_TYPES,
        }
        for field in array_fields:
            arr = char.get(field)
            if not isinstance(arr, list):
                print(f"  [{i}] {name}: {field} must be array", file=sys.stderr)
                errors += 1
                continue
            if arr != sorted(arr):
                print(f"  [{i}] {name}: {field} not sorted alphabetically", file=sys.stderr)
                errors += 1
            valid_values = enum_checks.get(field)
            if valid_values:
                for v in arr:
                    if v not in valid_values:
                        print(f"  [{i}] {name}: invalid {field} '{v}'", file=sys.stderr)
                        errors += 1

    if errors:
        print(f"\nValidation failed with {errors} error(s).", file=sys.stderr)
        return 1

    print(f"Validated {len(data)} characters successfully.")
    return 0


def main() -> int:
    arg_parser = argparse.ArgumentParser(description="Narutopedia character scraper")
    arg_parser.add_argument("--dry-run", action="store_true", help="Print summary without writing files")
    arg_parser.add_argument("--limit", type=int, metavar="N", help="Limit to first N characters (for testing)")
    arg_parser.add_argument("--character", metavar="NAME", help="Scrape a single character for testing")
    arg_parser.add_argument("--validate-only", action="store_true", help="Validate existing characters.json")

    args = arg_parser.parse_args()

    if args.validate_only:
        return run_validate_only()

    if args.character:
        return run_single_character(args.character)

    return run_full_scrape(dry_run=args.dry_run, limit=args.limit)


if __name__ == "__main__":
    sys.exit(main())
