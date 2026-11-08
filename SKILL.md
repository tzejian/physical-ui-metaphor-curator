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
```

## Gotchas

- Do not reduce designs to generic labels like "modern" or "minimal"; identify the concrete physical archetype and tactile technique.
- For non-standard typography (e.g., vertical text, rotated numbers), always note the accessibility and legibility tradeoffs.
