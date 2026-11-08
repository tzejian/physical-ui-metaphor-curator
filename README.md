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
```

## How to Install and Use

### 1. In Agent Environments (Cursor, Claude, Copilot, Antigravity)
Add `SKILL.md` to your agent's system prompt or copy this repository into your project's skills directory:
```bash
git submodule add https://github.com/<your-username>/physical-ui-metaphor-curator.git .skills/physical-ui-metaphor-curator
```

### 2. Validating Reference Entries
To validate curated JSON entries against the JSON Schema:
```bash
python scripts/validate_entries.py
```

