# Task: Populate and Finalize `physical-ui-metaphor-curator` Repository

We are building an installable agent skill and reference schema that discovers, researches, deconstructs, and catalogs digital UI/UX designs adapting real-world physical objects, print ephemera, and industrial hardware (e.g., bookshelf spines, receipts, cassettes, ticket stubs, dials) into digital interfaces.

Execute the following file setups and content additions inside the repository workspace:

---

### Step 1: Normalize File Extensions
Ensure root markdown files use lowercase extensions:
- Rename `README.MD` to `README.md`
- Rename `SKILL.MD` to `SKILL.md`

---

### Step 2: Write `SKILL.md`
Write the following content into `SKILL.md`:

```markdown
---
name: physical-ui-metaphor-curator
description: Discovers, researches, deconstructs, and indexes UI/UX patterns that adapt physical real-world objects, tactile ephemera, and industrial hardware into digital components. Trigger when tasked to research physical UI metaphors, curate design aesthetics, inspect visual references, or generate standardized schema entries for a UI reference library.
---

# Physical UI Metaphor & Art Style Curator

An autonomous curation and deconstruction framework for researching how physical artifacts, print ephemera, and real-world mechanical affordances translate into interactive digital interfaces.

## When to Use

Trigger this skill whenever you are tasked to:

- **Conduct Targeted UI/UX Research:** Search, discover, or analyze how real-world objects (e.g., bookshelf spines, thermal receipts, ticket stubs, cassette tapes, manila folders, analog dials) are translated into digital web or app interfaces.
- **Inspect Design References & Artifacts:** Evaluate an input target (a screenshot, website URL, mockup, or batch ingestion item) to identify its physical archetype, visual movement, and tactile design tokens.
- **Deconstruct Physical-to-Digital Affordances:** Map how real-world physical dynamics (gravity, perforation tears, 2D/3D tilt, rotational resistance, slot insertion) function as digital interactive mechanics (accordions, CTAs, drawers, modals).
- **Index Library Entries:** Generate structured, schema-compliant JSON records (`schemas/entry.schema.json`) to populate or expand a UI/UX reference library.

## Analysis Framework

When deconstructing a design reference, systematically analyze these 4 compound dimensions:

### 1. The Physical Metaphor & Affordance
- **Source Object:** The real-world item, tool, or environment referenced.
- **Physical Affordance Preserved:** Gravity, leaning, perforation, tear-off, rotational drag, insertion slots, spine reading, tab stacking.
- **Digital Component Mapping:** How the object functions digitally (e.g., Spine = Category Navigation Accordion; Ticket Stub = Voucher CTA; Receipt = Order Summary).

### 2. Aesthetic & Visual Style Archetype
- **Primary Style:** E.g., Flat Skeuomorphism, Neo-Brutalist, Japanese Editorial, Retro-Tactile Modern, Swiss Minimalist, Industrial Hardware.
- **Secondary Influences:** Print ephemera, packaging design, brutalist web, audio hardware.

### 3. Materiality & Design Tokens
- **Palette:** 3 to 5 representative hex colors (background, surfaces, accents, keylines).
- **Material & Texture:** Paper grain, matte plastic, brushed aluminum, frosted acrylic, clear polycarbonate.
- **Borders & Edges:** Hairline borders, heavy 2-3px solid lines, dashed perforations, jagged zig-zags, stamped bevels.
- **Typography & Layout:** Vertical text orientation (tate-chū-yoko), monospaced serials, thermal dot-matrix, stamped serifs, rotated numerals.

### 4. Interactive Dynamics & Usability
- **Micro-interactions:** Suggested or implemented hover, active, and focus transitions (e.g., Y-axis card lift, slide-out expansion, rotational spin).
- **Usability Evaluation:** Strengths (delight, visual brand recall, spatial memory) vs. Tradeoffs (legibility friction, mobile viewport constraints, scalability limits).

## Output Format

Always structure the output in two parts:
1. **Curator Breakdown:** A concise narrative detailing the object metaphor, visual mechanics, and interactive qualities.
2. **Standardized Library JSON Record:** Ready to commit to a catalog database.

### Schema Template

```json
{
  "id": "ref-<auto-or-sequential-id>",
  "title": "<Reference Title>",
  "tags": {
    "metaphors": ["<source-object>", "<specific-part>"],
    "art_styles": ["<primary-style>", "<secondary-style>"],
    "ui_components": ["<navigation | cta | modal | form-input | data-table | etc.>"],
    "materials": ["<paper | metal | plastic | glass | etc.>"]
  },
  "affordance_translation": {
    "physical_behavior": "<Real-world behavior or physical cue>",
    "digital_mechanic": "<How it translates to digital layout and user actions>"
  },
  "design_tokens": {
    "dominant_colors": ["#...", "#...", "#..."],
    "borders": "<Keyline weight, style, and corner radius>",
    "elevation": "<Shadow type, offset, or flat transformation>",
    "typography": "<Font classifications, orientation, and weights>"
  },
  "interactive_mechanics": [
    "<State 1: e.g., Hover behavior>",
    "<State 2: e.g., Click/Activation expansion>"
  ],
  "usability_notes": "<Best context, recommended item limits, and accessibility considerations>"
}

Gotchas
Do not reduce designs to generic labels like "modern" or "minimal"; identify the concrete physical archetype and tactile technique.

For non-standard typography (e.g., vertical text, rotated numbers), always note the accessibility and legibility tradeoffs.

---

### Step 3: Write `schemas/entry.schema.json`
Write the validation schema into `schemas/entry.schema.json`:

```json
{
  "$schema": "[http://json-schema.org/draft-07/schema#](http://json-schema.org/draft-07/schema#)",
  "title": "ReferenceEntry",
  "type": "object",
  "required": [
    "id",
    "title",
    "tags",
    "affordance_translation",
    "design_tokens",
    "interactive_mechanics",
    "usability_notes"
  ],
  "properties": {
    "id": { "type": "string" },
    "title": { "type": "string" },
    "tags": {
      "type": "object",
      "required": ["metaphors", "art_styles", "ui_components", "materials"],
      "properties": {
        "metaphors": { "type": "array", "items": { "type": "string" } },
        "art_styles": { "type": "array", "items": { "type": "string" } },
        "ui_components": { "type": "array", "items": { "type": "string" } },
        "materials": { "type": "array", "items": { "type": "string" } }
      }
    },
    "affordance_translation": {
      "type": "object",
      "required": ["physical_behavior", "digital_mechanic"],
      "properties": {
        "physical_behavior": { "type": "string" },
        "digital_mechanic": { "type": "string" }
      }
    },
    "design_tokens": {
      "type": "object",
      "required": ["dominant_colors", "borders", "elevation", "typography"],
      "properties": {
        "dominant_colors": { "type": "array", "items": { "type": "string" } },
        "borders": { "type": "string" },
        "elevation": { "type": "string" },
        "typography": { "type": "string" }
      }
    },
    "interactive_mechanics": {
      "type": "array",
      "items": { "type": "string" }
    },
    "usability_notes": { "type": "string" }
  }
}

Step 4: Write examples/ref-001-bookshelf-spine.json
Write the sample seed record into examples/ref-001-bookshelf-spine.json:

{
  "id": "ref-001",
  "title": "FREAK MAG - Bookshelf Spine Navigation",
  "tags": {
    "metaphors": ["bookshelf", "book-spine", "library-shelf"],
    "art_styles": ["japanese-editorial", "neo-brutalist", "flat-skeuomorphic"],
    "ui_components": ["navigation", "category-filter", "accordion"],
    "materials": ["paper-jacket", "matte-surface"]
  },
  "affordance_translation": {
    "physical_behavior": "Books leaning against gravity on a shelf, vertical spine typography, colored dust jackets.",
    "digital_mechanic": "Full-height vertical card layout standing side-by-side; leftmost card tilted via 2D rotation; horizontal shelf divider grounds the base."
  },
  "design_tokens": {
    "dominant_colors": [
      "#99D4FF",
      "#FE8667",
      "#FEA7B0",
      "#219DFE",
      "#6D7B48",
      "#FFCA00",
      "#000000"
    ],
    "borders": "1px to 2px solid black keylines, 0px border radius",
    "elevation": "Flat, 0px shadow; depth achieved through 2D tilt transformation",
    "typography": "Vertical CJK Gothic text paired with rotated monospace dates and bold numerals"
  },
  "interactive_mechanics": [
    "Hover triggers a slight Y-axis lift or forward translation",
    "Clicking a spine expands the column into an article archive drawer"
  ],
  "usability_notes": "High visual memorability and strong editorial personality. Best suited for small curated collections under 15–20 items; vertical text can introduce legibility friction for non-CJK alphabets."
}

Step 5: Write scripts/validate_entries.py
Create a Python validation utility in scripts/validate_entries.py:

import json
import glob
import sys
from pathlib import Path

try:
    import jsonschema
except ImportError:
    print("jsonschema library not found. Install with: pip install jsonschema")
    sys.exit(1)

schema_path = Path("schemas/entry.schema.json")
if not schema_path.exists():
    print(f"Error: Schema file not found at {schema_path}")
    sys.exit(1)

with open(schema_path, "r", encoding="utf-8") as f:
    schema = json.load(f)

example_files = glob.glob("examples/*.json")
if not example_files:
    print("No examples found to validate.")
    sys.exit(0)

has_error = False
for file_path in example_files:
    with open(file_path, "r", encoding="utf-8") as f:
        try:
            data = json.load(f)
            jsonschema.validate(instance=data, schema=schema)
            print(f"[OK] {file_path} is valid.")
        except jsonschema.exceptions.ValidationError as e:
            print(f"[ERROR] {file_path} failed validation: {e.message}")
            has_error = True
        except Exception as e:
            print(f"[ERROR] {file_path} parse failed: {e}")
            has_error = True

if has_error:
    sys.exit(1)
print("All reference entries valid.")

Step 6: Write .github/workflows/validate.yml
Create a GitHub Actions CI workflow in .github/workflows/validate.yml:

name: Validate Schema & Entries

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: pip install jsonschema

      - name: Validate JSON entries against schema
        run: python scripts/validate_entries.py



Step 7: Write README.md
Write the project documentation into README.md:
# Physical UI Metaphor & Art Style Curator 📚🎛️

An autonomous AI agent skill and taxonomy framework designed to discover, deconstruct, and catalog digital UI/UX designs that adapt **real-world physical objects, tactile artifacts, and print ephemera** (bookshelf spines, receipts, cassette tapes, ticket stubs, analog dials, filing folders).

## Overview

Modern web design frequently borrows tactile affordances from physical objects to create memorable, humanized interfaces. This repository acts as both:
1. An **installable Agent Skill (`SKILL.md`)** that autonomously analyzes UI references, extracts design tokens, and maps physical affordances to digital components.
2. A **standardized schema specification** for structuring entries in an open UI/UX reference library.

## Repository Layout

```text
├── .github/workflows/     # CI automation testing JSON entry validity
├── examples/              # Seed curated reference entries
├── schemas/               # JSON Schema for reference entries
├── scripts/               # Validation and extraction utilities
├── SKILL.md               # The portable agent skill definition
└── README.md              # Project documentation



How to Install and Use
1. In Agent Environments (Cursor, Claude, Copilot, Custom Agents)
Add SKILL.md to your agent's system prompt or copy this repository into your project's skills directory:

git submodule add https://github.com/<your-username>/physical-ui-metaphor-curator.git .skills/physical-ui-metaphor-curator

python scripts/validate_entries.py

---

### Verification
Once the files are created, run:
```bash
python scripts/validate_entries.py