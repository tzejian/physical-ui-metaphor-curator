---
name: physical-ui-metaphor-curator
description: Finds and records UI/UX designs that borrow from a specific physical thing, such as an object, material, space or layout (bookshelf spines, receipts, cassettes, dials, floor tiling, signage) as inspiration for designers. Trigger when asked to find, research, or analyze physical-object UI metaphors, or to add entries to the reference library. Do not use for general UI critique, or for generic skeuomorphism (glossy buttons, drop shadows) that does not reference a specific object.
---

# Physical UI Metaphor Curator

Builds an inspiration library: designs where something physical (an object, a material, a space, a layout) shapes the interface. The goal is not to recreate sites but to give a designer a good idea and a place to look at it. Each entry says what the physical thing is, what the interaction idea is, and where to see it. Variety and quality of finds matter more than depth on any one entry.

## Workflow

1. **Orient.** Read the existing entries in `examples/` to see what is covered, and `coverage.md` (if present) for candidates already rejected. Skip both.
2. **Find.** Look for 5 or so new candidates per run (see Finding designs).
3. **Look.** Open each candidate live when you can (see Looking at a site). Reject the ones that are only skin: a paper texture on an ordinary button is styling, not a metaphor.
4. **Write.** One entry per reference (see Entry). Show a short breakdown in the reply, then the JSON.
5. **Report.** Entries added, candidates rejected and why, tools used or blocked, object types still uncovered.

## Finding designs

**Anything physical can be a source.** The lists below are starting examples, not limits. Objects, materials, surfaces, spaces, patterns and the way things are laid out all count: a tiled floor (a square grid with grout-width padding and a centered image acting as the CTA), a pegboard, a shop signboard, a train departure board, a mosaic, a window blind, a bus-stop map. If you can say what the physical thing does or how it is arranged, and a design borrows that, it belongs. Do not pass over a good find because it is not on a list.

**Aim for spread.** Cover many families, not one favorite. Keep at most 2 entries per object type and 2 per studio or author. Examples of families:

- paper and print: receipts, tickets, tags, labels, envelopes, folders, index cards, catalog drawers, newspapers, posters
- books and media: spines, bookmarks, vinyl, cassettes, VHS, film strips, instant photos, CDs
- hardware controls: dials, knobs, switches, sliders, keys, patch cables, dip switches, displays
- devices and instruments: calculators, radios, cameras, typewriters, synths, gauges
- containers and packaging: boxes, cans, bottles, drawers, luggage, passports
- surfaces and materials: fabric, wood, metal, glass, stone, tile, mesh
- built environment and signage: floors, walls, windows, shelving, boards, maps, signs, storefronts
- layouts and patterns: grids, tiling, stacking, overlap, perforation, weaving, folding

**Where to look**, in this order of usefulness:
1. Places that show working code: CodePen, Codrops tutorials, GitHub repos and demos, component libraries.
2. Studio and author sites.
3. Showcase sites (Awwwards, SiteInspire, Godly, Dribbble). Good for leads; follow each to the real site.

**Search by what the object does** as well as its name: "tear-off", "flip", "stack", "drag to rotate", "peel", "slide-in drawer", "perforated", "stamp". Different verbs surface different designs.

**Reverse mode.** If asked for ideas for a UI need (for example "a settings screen" or "a pricing table"), name physical objects, materials or layouts that fit that need, then find examples of each.

Do not add a near-duplicate of an existing entry. Note it in the report instead.

## Looking at a site

Plain fetch reads static HTML, docs and code. It cannot see what happens in the browser: scroll effects, WebGL, canvas, GSAP. A real browser can.

- `python3 scripts/capture.py <url>` opens the page in headless Chromium and saves screenshots plus a `report.json` (libraries, WebGL/shaders, colors, fonts, shadows, motion during a real scroll, accessibility checks). Use it to see how a design looks and moves, and to take colors and fonts from the page itself instead of estimating from an image.
- Screenshots stay in `captures/` on the local machine, which is not committed. They are other people's work; the entry's `url` is how they are credited.
- Capture is for JS-heavy or motion-driven designs where plain fetch would miss the idea. It is optional for static pages.
- Read the screenshots. If the page is a cookie wall, a bot block, or an error, the capture describes that, not the design.
- No absence claims from the report alone. "No GSAP global found" does not mean GSAP is not used; bundled libraries are invisible there. Say "not detected" unless you checked the bundle.
- If no browser is available or it is blocked, say so and do not try to get around network limits.

## Entry

Each entry is one JSON file, `examples/ref-NNN-short-slug.json`, valid against `schemas/entry.schema.json`.

Fields:
- `title`, `url` (the reference's own page, not an article about it; this is also its credit)
- `tags`: the physical `metaphors`, `art_styles` (max 3), `ui_components`, `materials`
- `affordance_translation`: `physical_behavior` (what the real object does) and `digital_mechanic` (how the site turns that into layout and interaction)
- `design_tokens`: colors, borders, elevation, typography
- `interactive_mechanics`: what happens on hover, click, scroll, drag
- `usability_notes`: where it works, where it does not, at least one weakness

Honesty rules, kept short:
- **Do not invent.** If you did not open the site, start `usability_notes` with "Not opened." and mark interactions you only read about with `Reported:`.
- **Colors only from the page.** Use values read from CSS or computed styles, or leave `dominant_colors` empty. Never copy hex codes from another entry.
- **No superlatives** ("masterclass", "strongest", "stunning"). One to three plain sentences per field.
- **Separate function from decoration.** A tear-off that works as a CTA is a metaphor. Say which parts of the physical behavior the digital version keeps and which it loses.

### Template

```json
{
  "id": "ref-NNN",
  "title": "<Reference title>",
  "url": "<the reference's own page>",
  "tags": {
    "metaphors": ["<object>", "<specific part>"],
    "art_styles": ["<style>"],
    "ui_components": ["<navigation | cta | gallery | ...>"],
    "materials": ["<paper | metal | plastic | ...>"]
  },
  "affordance_translation": {
    "physical_behavior": "<what the real object does>",
    "digital_mechanic": "<how it becomes layout and interaction>"
  },
  "design_tokens": {
    "dominant_colors": ["#..."],
    "borders": "<keyline weight, style, corner radius>",
    "elevation": "<shadow or flat>",
    "typography": "<classification, orientation, weights>"
  },
  "interactive_mechanics": ["<hover ...>", "<click ...>", "Reported: <seen elsewhere, not tested>"],
  "usability_notes": "<where it works, item limits, one observed weakness>"
}
```

Older entries also have `sources` and `evidence`. They are still valid and are left as they are. New entries do not need them.

### Tags
- Lowercase kebab-case. Reuse existing tags before inventing one; read the existing entries first.
- `art_styles`: at most 3, visual styles only. Prefer a specific style over `flat-skeuomorphic`. Preferred list is in `schemas/vocabulary.json`.
- `materials` is open. List every material present.
- Technique labels (vertical text, dot-matrix) go in the `typography` text, not in tags.

### IDs and files
- `id` is `ref-NNN`: the highest existing number plus one. Gaps are fine; never reuse a number.
- Filename is `ref-NNN-short-slug.json`.

## After writing

1. Run `python scripts/validate_entries.py` and fix any `[ERROR]`. Ignore warnings.
2. Run `python scripts/build_manifest.py` so the gallery shows the new entries.
3. Add rejected candidates, with a one-line reason, to `coverage.md`, so the next run does not re-propose them.

## Gotchas

- Do not reduce a design to "modern" or "minimal". Name the physical thing and the technique.
- Do not anchor on the examples in this file. Describe each find on its own terms.
- For vertical or rotated text, note legibility and accessibility tradeoffs.
- Do not reproduce a site's imagery or copy. Describe it and link to it.
- Do not silently continue when a tool fails. Say what was blocked and what that leaves unchecked.
- Respect `robots.txt` and site terms, and rate-limit requests.
