#!/usr/bin/env python3
"""Validate reference entries in examples/ against schemas/entry.schema.json.

Errors fail the run. Warnings are advisory unless --strict is passed.

Errors:
  - invalid JSON, or the entry does not match the schema
  - the schema itself is invalid
  - the id does not match the filename prefix (ref-NNN-slug.json)
  - duplicate ids
  - no entries found

Warnings:
  - missing sources or evidence (legacy entry)
  - art_styles / ui_components tags outside schemas/vocabulary.json (aliases are hinted)
  - a hex color shared by many entries (palette values may be copied or invented)
  - promotional wording in usability_notes
  - new-format entries whose usability_notes lack "Tested" / "Not tested"
  - all sources are tier C but interactions or stack are marked inspected

Gaps in id numbering are fine; numbers are never reused.
"""
import argparse
import json
import re
import sys
from collections import defaultdict
from pathlib import Path

try:
    from jsonschema import Draft7Validator
except ImportError:
    print("jsonschema library not found. Install with: pip install jsonschema")
    sys.exit(2)

FILENAME_RE = re.compile(r"^(ref-[0-9]{3,})-[a-z0-9]+(?:-[a-z0-9]+)*\.json$")
PROMO_WORDS = [
    "masterclass", "strongest", "most complete", "extremely", "excellent",
    "perfect", "unmatched", "best-in-class", "flawless", "stunning",
]
REPEATED_HEX_THRESHOLD = 4
IGNORED_HEX = {"#000000", "#FFFFFF"}


def parse_args():
    default_root = Path(__file__).resolve().parent.parent
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--root", type=Path, default=default_root, help="repo root (default: parent of scripts/)")
    p.add_argument("--strict", action="store_true", help="treat warnings as errors")
    return p.parse_args()


def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def main():
    args = parse_args()
    root = args.root
    schema_path = root / "schemas" / "entry.schema.json"
    vocab_path = root / "schemas" / "vocabulary.json"
    examples_dir = root / "examples"

    if not schema_path.exists():
        print(f"Error: schema not found at {schema_path}")
        return 1
    schema = load_json(schema_path)
    try:
        Draft7Validator.check_schema(schema)
    except Exception as e:  # jsonschema.SchemaError
        print(f"[ERROR] schema is invalid: {e}")
        return 1
    validator = Draft7Validator(schema)

    vocab = load_json(vocab_path) if vocab_path.exists() else None

    files = sorted(examples_dir.glob("*.json")) if examples_dir.exists() else []
    if not files:
        print(f"[ERROR] no entries found in {examples_dir}")
        return 1

    errors, warnings = [], []
    entries = {}          # path -> data (schema-valid or not)
    seen_ids = {}         # id -> path
    hex_users = defaultdict(set)

    for path in files:
        name = path.name
        try:
            data = load_json(path)
        except Exception as e:
            errors.append(f"{name}: parse failed: {e}")
            continue

        # schema
        schema_errors = sorted(validator.iter_errors(data), key=lambda e: list(e.absolute_path))
        for e in schema_errors:
            loc = "/".join(str(p) for p in e.absolute_path) or "(root)"
            errors.append(f"{name}: {loc}: {e.message}")

        if not isinstance(data, dict):
            continue
        entries[path] = data

        # filename and id
        m = FILENAME_RE.match(name)
        eid = data.get("id")
        if not m:
            errors.append(f"{name}: filename must look like ref-NNN-short-slug.json (lowercase kebab-case slug)")
        elif eid != m.group(1):
            errors.append(f"{name}: id '{eid}' does not match filename prefix '{m.group(1)}'")
        if eid in seen_ids:
            errors.append(f"{name}: duplicate id '{eid}' (also in {seen_ids[eid]})")
        elif eid:
            seen_ids[eid] = name

        # legacy / evidence
        has_sources = "sources" in data
        has_evidence = "evidence" in data
        if not has_sources or not has_evidence:
            missing = [k for k, ok in (("sources", has_sources), ("evidence", has_evidence)) if not ok]
            warnings.append(f"{name}: legacy entry, missing {' and '.join(missing)}")

        # vocabulary
        if vocab and isinstance(data.get("tags"), dict):
            aliases = vocab.get("aliases", {})
            for group in ("art_styles", "ui_components"):
                allowed = set(vocab.get(group, []))
                for tag in data["tags"].get(group, []) or []:
                    if tag in allowed:
                        continue
                    hint = f" ({aliases[tag]})" if tag in aliases else ""
                    warnings.append(f"{name}: {group} tag '{tag}' is not in the vocabulary{hint}")
            # alias tags used in the open groups too
            for group in ("metaphors", "materials"):
                for tag in data["tags"].get(group, []) or []:
                    if tag in aliases:
                        warnings.append(f"{name}: {group} tag '{tag}' is a known alias ({aliases[tag]})")

        # palette tracking
        tokens = data.get("design_tokens")
        if isinstance(tokens, dict):
            for c in tokens.get("dominant_colors", []) or []:
                if isinstance(c, str):
                    up = c.upper()
                    if up not in IGNORED_HEX:
                        hex_users[up].add(name)

        # voice
        notes = data.get("usability_notes")
        if isinstance(notes, str):
            low = notes.lower()
            for w in PROMO_WORDS:
                if w in low:
                    warnings.append(f"{name}: promotional wording in usability_notes ('{w}')")
            if has_evidence and "tested" not in low:
                warnings.append(f"{name}: usability_notes should say 'Tested: ...' or 'Not tested'")

        # tier C consistency
        srcs = data.get("sources")
        ev = data.get("evidence")
        if isinstance(srcs, list) and srcs and isinstance(ev, dict):
            if all(isinstance(s, dict) and s.get("tier") == "C" for s in srcs):
                for field in ("interactions", "stack"):
                    if ev.get(field) == "inspected":
                        warnings.append(f"{name}: all sources are tier C but evidence.{field} is 'inspected'")

    # repeated palette colors
    for hex_value, users in sorted(hex_users.items(), key=lambda kv: (-len(kv[1]), kv[0])):
        if len(users) >= REPEATED_HEX_THRESHOLD:
            warnings.append(
                f"palette: {hex_value} appears in {len(users)} entries "
                f"({', '.join(sorted(u.split('-')[0] + '-' + u.split('-')[1] for u in users))}); check these are real values"
            )

    for line in errors:
        print(f"[ERROR] {line}")
    for line in warnings:
        print(f"[WARN]  {line}")

    ok_count = len(files) - len({e.split(":")[0] for e in errors})
    print(f"\n{len(files)} entries checked: {ok_count} clean of errors, {len(errors)} error(s), {len(warnings)} warning(s).")

    if errors:
        return 1
    if warnings and args.strict:
        print("Failing because --strict treats warnings as errors.")
        return 1
    print("All reference entries valid.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
