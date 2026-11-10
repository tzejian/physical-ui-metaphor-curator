---
name: physical-ui-metaphor-curator
description: Discovers, researches, deconstructs, and indexes UI/UX patterns that adapt physical real-world objects, tactile ephemera, and industrial hardware (bookshelf spines, receipts, ticket stubs, cassettes, dials, folders) into digital components. Trigger when asked to research physical UI metaphors, analyze a screenshot or URL for a physical-object metaphor, curate design aesthetics, or produce schema-compliant entries for a UI reference library. Do not use for general UI critique, or for generic skeuomorphism (glossy buttons, drop shadows) that does not reference a specific physical object.
---

# Physical UI Metaphor & Art Style Curator

Researches and deconstructs how physical artifacts, print ephemera, and mechanical affordances translate into interactive digital interfaces, then records each finding as a standardized library entry.

## Workflow

1. **Identify the input.** A URL, a screenshot, a mockup, or an open-ended research request ("find sites that use cassette-tape UI"). For open-ended requests, find real, live references first and curate several distinct ones; do not invent examples.
2. **Inspect the reference.** For URLs, open the page and read the actual CSS and markup where possible. For screenshots, work only from what is visible.
3. **Name the physical archetype.** Identify the specific object and the specific part of it (spine, perforation, tape window), not a general mood.
4. **Analyze** using the four dimensions below.
5. **Write the output** in the format below: one breakdown and one JSON record per reference.
6. **Self-check** before returning:
   - Every hex value, border weight, and interaction is either observed or marked as estimated.
   - Tags follow the tag rules.
   - Required JSON fields are all present.
   - Accessibility tradeoffs are stated.

## Analysis Framework

Analyze these four dimensions for every reference.

### 1. The Physical Metaphor & Affordance
- **Source Object:** The real-world item, tool, or environment referenced, and the specific part of it.
- **Physical Affordance Preserved:** Gravity, leaning, perforation, tear-off, rotational drag, insertion slots, spine reading, tab stacking. Say which affordance survives in the digital version and which is lost.
- **Digital Component Mapping:** How the object functions digitally (e.g., spine = category navigation accordion; ticket stub = voucher CTA; receipt = order summary).

### 2. Aesthetic & Visual Style Archetype
- **Primary Style:** E.g., flat skeuomorphism, neo-brutalist, Japanese editorial, retro-tactile modern, Swiss minimalist, industrial hardware.
- **Secondary Influences:** Print ephemera, packaging design, brutalist web, audio hardware.

### 3. Materiality & Design Tokens
- **Palette:** 3 to 5 representative hex colors (background, surface, accent, keyline). Pick the most representative; do not list every color on the page.
- **Material & Texture:** Paper grain, matte plastic, brushed aluminum, frosted acrylic, clear polycarbonate.
- **Borders & Edges:** Hairline borders, heavy 2-3px solid lines, dashed perforations, jagged zig-zags, stamped bevels. Include corner radius.
- **Typography & Layout:** Vertical text (tategaki, `writing-mode: vertical-rl`), upright digits inside vertical text (tate-chu-yoko), monospaced serials, thermal dot-matrix, stamped serifs, rotated numerals.

### 4. Interactive Dynamics & Usability
- **Micro-interactions:** Hover, active, and focus transitions. Be specific about the transform: say `translateY` for a lift and `rotateY` for a flip.
- **Usability Evaluation:** Strengths (delight, brand recall, spatial memory) versus tradeoffs (legibility friction, mobile viewport limits, scalability limits, recommended item count).
- **Accessibility check:** Note each of the following, or state that it is unknown:
  - text contrast
  - keyboard focus order and visible focus state
  - `prefers-reduced-motion` handling
  - touch target size
  - reading order for rotated or vertical text

## Evidence Rules

The agent often cannot verify design values from an image alone. Follow these rules.

- Report a value as observed only if it came from inspected CSS or markup, or is unambiguous in the image.
- Otherwise prefix it with "approx." (for example, `approx. 2px solid`) and set `evidence` to `"estimated"`.
- Never describe a hover, click, or animation you did not observe. If you could not test interactions, write "not verified" in `interactive_mechanics`.
- Always include `source_url` when the reference is a live page.

## Output Format

For each reference, return two parts:

1. **Curator Breakdown:** A concise narrative on the object metaphor, visual mechanics, and interactive qualities.
2. **Library JSON Record:** Ready to commit to the catalog and valid against `schemas/entry.schema.json`.

When handling multiple references, return one breakdown and one JSON record per reference. Never merge references into a single record.

### Tag Rules
- All tags are lowercase kebab-case (`neo-brutalist`, not `Neo-Brutalist`).
- Reuse existing tags before inventing new ones. Check existing entries first.
- Preferred starting vocabulary:
  - **art_styles:** `flat-skeuomorphic`, `neo-brutalist`, `japanese-editorial`, `swiss-minimalist`, `retro-tactile`, `industrial-hardware`
  - **materials:** `paper`, `card-stock`, `matte-plastic`, `brushed-metal`, `glass`, `acrylic`
  - **ui_components:** `navigation`, `cta`, `modal`, `form-input`, `data-table`, `accordion`, `drawer`, `category-filter`

### ID Rules
- Format: `ref-NNN-short-slug` (for example, `ref-002-thermal-receipt`).
- Take NNN as the highest existing number plus one. Check the `examples/` and `entries/` folders; do not reuse a number.

### Schema Template

```json
{
  "id": "ref-NNN-short-slug",
  "title": "<Reference Title>",
  "source_url": "<URL, or null if from a screenshot>",
  "evidence": "<inspected | estimated | mixed>",
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
    "<State 1: e.g., hover behavior, or 'not verified'>",
    "<State 2: e.g., click/activation expansion>"
  ],
  "usability_notes": "<Best context, recommended item limits, and accessibility considerations>"
}
```

## Gotchas

- Do not reduce designs to generic labels like "modern" or "minimal". Identify the concrete physical archetype and tactile technique.
- Separate a functional affordance from decoration. A tear-off that actually works as a CTA is a metaphor; a paper texture on an ordinary button is just styling.
- Do not anchor on the bookshelf-spine example. Describe each object on its own terms.
- For non-standard typography (vertical text, rotated numbers), always note accessibility and legibility tradeoffs.
- Do not invent references, URLs, or design values. If a reference cannot be verified, say so rather than filling the gap.
- Do not reproduce a site's copyrighted imagery or full copy in an entry. Describe it and link to it.