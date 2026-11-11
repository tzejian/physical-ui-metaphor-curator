#!/usr/bin/env python3
"""Backfill the `evidence` block on legacy entries and report what still needs human work.

What it does
  - Adds `evidence` to every entry in examples/ that lacks one. Defaults are deliberately
    conservative: palette/tokens/interactions = "inferred", stack = "inferred" if the entry's
    text names a known technology, otherwise "unknown". An entry with no colors gets palette "none".
  - Never changes colors, tags, or any other existing field.
  - Never invents `sources`. A source needs a real URL, so the report lists a guessed tier and
    source name for each entry (read from its own "Source:" wording) for you to fill in.
  - Reports colors shared by many entries, and how much of the library rests on one showcase site.

Safe by default
  - Dry run unless --write is passed. Re-running is a no-op for entries that already have evidence.

Upgrading evidence is a deliberate act: if you have verified a palette, pass its id with
--published (for example --published ref-006,ref-008). Entries the agent reported as having
published palettes are NOT assumed to be published here.
"""
import argparse
import json
import re
import sys
from collections import defaultdict
from pathlib import Path

IGNORED_HEX = {"#000000", "#FFFFFF"}

# (regex on the entry text, tier, source name). First match wins. Heuristic, for the report only.
SOURCE_HINTS = [
    (r"tactileui\.dev|component documentation", "A", "component docs"),
    (r"web\.dev|full source walkthrough", "A", "source walkthrough (web.dev)"),
    (r"component page|self-documentation|self-documented|author's own", "A", "author's own page"),
    (r"design-lounge|component writeup", "C", "component write-up (check for code)"),
    (r"dokle\.design|design-review", "C", "design-review article"),
    (r"devpost", "C", "Devpost project page"),
    (r"communication arts", "C", "Communication Arts coverage"),
    (r"awwwards", "C", "Awwwards listing"),
]
STACK_KEYWORDS = [
    "webgl", "three.js", "curtains.js", "gsap", "web audio", "canvas", "view transitions",
    "web animations api", "svg", "css 3d", "shader", "rigid-body", "gatsby", "shadcn",
]


def entry_text(data):
    return json.dumps(data, ensure_ascii=False).lower()


def guess_source(text):
    for pattern, tier, name in SOURCE_HINTS:
        if re.search(pattern, text):
            return tier, name
    return None, None


def build_evidence(data, published):
    colors = (data.get("design_tokens") or {}).get("dominant_colors") or []
    if not colors:
        palette = "none"
    elif data.get("id") in published:
        palette = "published"
    else:
        palette = "inferred"
    text = entry_text(data)
    matched = [k for k in STACK_KEYWORDS if k in text]
    stack = "inferred" if matched else "unknown"
    return {
        "palette": palette,
        "tokens": "inferred",
        "interactions": "inferred",
        "stack": stack,
    }, matched


def with_evidence(data, evidence):
    out = {}
    placed = False
    for k, v in data.items():
        out[k] = v
        if k == "title":
            out["evidence"] = evidence
            placed = True
    if not placed:
        out = {"evidence": evidence, **out}
    return out


def parse_args():
    script_dir = Path(__file__).resolve().parent
    default_root = script_dir if (script_dir / "schemas").exists() else script_dir.parent
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--root", type=Path, default=default_root, help="repo root (default: repo root directory)")
    p.add_argument("--write", action="store_true", help="apply changes to the files (default: dry run)")
    p.add_argument("--published", default="", help="comma-separated ids whose palettes you have verified as published")
    p.add_argument("--repeat-threshold", type=int, default=4, help="flag a color used by this many entries (default 4)")
    p.add_argument("--report", type=Path, help="write the report to this file instead of printing it")
    return p.parse_args()


def main():
    args = parse_args()
    published = {s.strip() for s in args.published.split(",") if s.strip()}
    files = sorted((args.root / "examples").glob("*.json"))
    if not files:
        print(f"No entries found in {args.root / 'examples'}")
        return 1

    rows = []                      # report rows
    hex_users = defaultdict(set)
    changed = skipped = 0
    unknown_published = set(published)

    for path in files:
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except Exception as e:
            print(f"[SKIP] {path.name}: cannot parse ({e})")
            continue
        if not isinstance(data, dict) or "id" not in data:
            print(f"[SKIP] {path.name}: not an entry")
            continue
        unknown_published.discard(data["id"])

        for c in (data.get("design_tokens") or {}).get("dominant_colors") or []:
            if isinstance(c, str) and c.upper() not in IGNORED_HEX:
                hex_users[c.upper()].add(data["id"])

        text = entry_text(data)
        tier, source_name = guess_source(text)
        row = {"id": data["id"], "file": path.name, "title": data.get("title", ""),
               "tier": tier, "source": source_name, "has_sources": "sources" in data}

        if "evidence" in data:
            row["action"] = "already has evidence (unchanged)"
            skipped += 1
        else:
            ev, matched = build_evidence(data, published)
            row["action"] = f"add evidence {ev}"
            row["stack_keywords"] = matched
            changed += 1
            if args.write:
                new = with_evidence(data, ev)
                path.write_text(json.dumps(new, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        rows.append(row)

    # ---- report ----
    lines = []
    mode = "WROTE" if args.write else "DRY RUN (no files changed)"
    lines.append(f"# Backfill report: {mode}\n")
    lines.append(f"{len(rows)} entries read: {changed} {'updated' if args.write else 'would be updated'}, {skipped} already had evidence.\n")
    if unknown_published:
        lines.append(f"Note: --published ids not found in examples/: {', '.join(sorted(unknown_published))}\n")

    lines.append("## Colors shared by many entries\n")
    repeated = [(h, sorted(u)) for h, u in hex_users.items() if len(u) >= args.repeat_threshold]
    repeated.sort(key=lambda kv: (-len(kv[1]), kv[0]))
    if repeated:
        lines.append("These may be copied or invented values. Check them against the real sites; clear the ones you cannot verify.\n")
        lines.append("| Color | Entries | Used by |")
        lines.append("|---|---|---|")
        for h, users in repeated:
            lines.append(f"| `{h}` | {len(users)} | {', '.join(users)} |")
        lines.append("")
    else:
        lines.append(f"None shared by {args.repeat_threshold} or more entries.\n")

    lines.append("## Source concentration\n")
    by_source = defaultdict(list)
    for r in rows:
        by_source[r["source"] or "none stated"].append(r["id"])
    total = len(rows)
    lines.append("| Source (guessed from each entry's own wording) | Entries | Share |")
    lines.append("|---|---|---|")
    for name, ids in sorted(by_source.items(), key=lambda kv: -len(kv[1])):
        lines.append(f"| {name} | {len(ids)} ({', '.join(ids)}) | {len(ids) * 100 // total}% |")
    lines.append("")

    lines.append("## Per entry: what still needs a human\n")
    lines.append("`sources` cannot be filled automatically because each needs a real URL.\n")
    lines.append("| Entry | Guessed tier | Guessed source | Needs `sources` | Action |")
    lines.append("|---|---|---|---|---|")
    for r in rows:
        need = "no" if r["has_sources"] else "yes"
        lines.append(f"| {r['id']} | {r['tier'] or '?'} | {r['source'] or 'none stated'} | {need} | {r['action']} |")
    lines.append("")
    lines.append("Tier is a guess from the entry's own text (A = code or docs, B = live site, C = showcase or article). "
                 "A live-site visit (tier B) is not detectable from the text, so confirm each one.\n")

    report = "\n".join(lines)
    if args.report:
        args.report.write_text(report, encoding="utf-8")
        print(f"Report written to {args.report}")
    else:
        print(report)
    print(f"\n{changed} {'updated' if args.write else 'to update'}, {skipped} unchanged.")
    if not args.write and changed:
        print("Dry run only. Re-run with --write to apply.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

