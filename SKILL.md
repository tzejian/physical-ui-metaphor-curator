---
name: physical-ui-metaphor-curator
description: Discovers, researches, deconstructs, and indexes UI/UX patterns that adapt physical real-world objects, tactile ephemera, and industrial hardware (bookshelf spines, receipts, ticket stubs, cassettes, dials, folders) into digital components. Trigger when asked to research physical UI metaphors, analyze a website or screenshot for a physical-object metaphor, curate design aesthetics, or produce schema-compliant entries for a UI reference library. Do not use for general UI critique, or for generic skeuomorphism (glossy buttons, drop shadows) that does not reference a specific physical object.
---

# Physical UI Metaphor & Art Style Curator

Researches and deconstructs how physical artifacts, print ephemera, and mechanical affordances translate into interactive digital interfaces, then records each finding as a library entry. An entry is only as valuable as its evidence, so every entry must show what was observed and what was only read about. A smaller library of verified entries beats a larger one of plausible guesses.

## Research Protocol

### 1. Know your tools and their limits
Note which of these you have before researching:

- **Search:** finds leads. Results are not evidence.
- **Fetch/extract (HTTP to text):** reads static HTML, source code, docs, and articles. It does not run JavaScript, so it cannot see canvas, WebGL, scroll-driven or script-driven behavior, or anything rendered client-side.
- **Headless browser:** renders the real page, takes screenshots, runs JS, reads computed styles, and tests interactions. This is the only tool that verifies how a site looks and behaves.
- **Vision:** reads layout and rough color from images. Output is approximate.

Name the tools you actually used in the final report. If the browser is unavailable or blocked, say so, and do not try to bypass network restrictions.

### 2. Discovery
- Read the existing entries and `research-log.md` first. Find gaps in object type and component type, and skip anything already added or already rejected.
- Broaden beyond paper and print where entries cluster: dials, switches, vinyl, instant film, luggage tags, card catalogs, passports, keyboards, hardware controls.
- Use showcase listings and case studies to find leads, then trace each lead to a better source (below).
- Prefer references where the metaphor shapes the interaction, not just the skin.

### 3. Source tiers
Rank every candidate by the best source you can reach, and prefer higher tiers.

- **Tier A, code or docs:** source code, component docs, a technical write-up with code. Fetch can fully verify these. Prefer them.
- **Tier B, live site:** the real site, rendered in a browser. Needed for anything visual or interactive.
- **Tier C, showcase or article only:** an awards listing, a case-study summary, or a design-review blog. Use it only as a lead. Any entry resting on Tier C alone has `inferred` interactions and `inferred` or `unknown` stack.

No more than about a third of the library should come from any single showcase site. If you are about to exceed that, find Tier A or B sources instead.

### 4. Acceptance bar
Accept a candidate only if all of these hold:
- The physical object is specific and identifiable.
- At least one real affordance survives into the interaction (tear, flip, stack, pull, turn).
- It is meaningfully different from an existing entry. If it adds only a new brand to an existing pattern, reject it or fold it into the existing entry as an additional source.
- The live site loads, or an archived copy exists.

Reject the rest. Append each to `research-log.md` with the date, a URL or name, and a one-line reason.

### 5. Verification and evidence
Verify with the browser whenever possible: render the page, take a screenshot, read computed styles for key elements, try the interaction. Use fetch for markup, code, and articles.

Mark each of these four evidence fields as `inspected`, `published`, or `inferred` (plus `none` for palette and `unknown` for stack):

- **inspected:** you saw it yourself in the rendered page, its code, or a test.
- **published:** stated by the creators or a showcase site, such as a palette listed on an awards page.
- **inferred:** derived from descriptions, articles, or images.

Rules:
- **Palette:** use only values you inspected or that were published. If you have neither, set `dominant_colors` to `[]` and `evidence.palette` to `none`. Do not estimate colors from memory or description, and do not reuse hex values from another entry. A missing palette is acceptable; an invented one is not.
- **No embellishment:** never turn a prose description into a mechanical specific. "Photos can be flung" is not "throw physics with momentum" unless you observed it. Report the original claim.
- **Tech stack:** WebGL, Web Audio, a named library, and similar claims need code or network inspection, or must be labeled `published` or `inferred`.
- **JS-heavy sites:** if you cannot render a WebGL, canvas, or scroll-driven page, set interactions to `inferred` and say the motion was not seen.
- **Unreachable site:** try an archived copy. If that fails, record the entry from its secondary sources, mark the evidence, and do not fill gaps with plausible detail.
- **Statistics:** include none without a cited source.

### 6. Testing (when a browser is available)
For `usability_notes`, test; do not speculate:
- keyboard-only navigation
- `prefers-reduced-motion` emulation
- a 375px mobile viewport
- text contrast on key elements

Write "Tested: ..." with what you found, or "Not tested". Every entry names at least one weakness you observed. If nothing was tested, say so instead of listing generic recommendations.

### 7. Report back
After the entries, return:
- entries added
- rejected candidates, with reasons
- tools used, and any tool that was blocked or unavailable
- claims left unverified, by entry
- object types still uncovered

## Analysis Framework

Analyze these four dimensions for every reference.

### 1. The Physical Metaphor & Affordance
- **Source Object:** The real-world item referenced, and the specific part of it.
- **Physical Affordance Preserved:** Gravity, leaning, perforation, tear-off, rotational drag, insertion slots, spine reading, tab stacking. Say which survives in the digital version and which is lost.
- **Digital Component Mapping:** How the object functions digitally (spine = category navigation accordion; ticket stub = voucher CTA; receipt = order summary).

### 2. Aesthetic & Visual Style Archetype
- **Primary Style:** Choose the most specific style that fits (see Tag Rules). Generic labels such as `flat-skeuomorphic` apply only when nothing more specific does.
- **Secondary Influences:** Print ephemera, packaging design, brutalist web, audio hardware.

### 3. Materiality & Design Tokens
- **Palette:** 3 to 7 representative hex colors, neutrals included, following the palette rule above.
- **Material & Texture:** Paper grain, matte plastic, brushed aluminum, frosted acrylic, clear polycarbonate. List every material present, not only the dominant one.
- **Borders & Edges:** Hairlines, heavy solid lines, dashed perforations, jagged zig-zags, stamped bevels. Include corner radius. Perforations and tears are usually built with `radial-gradient`, `mask`, `clip-path`, or SVG filters, so check those.
- **Typography & Layout:** Vertical text (tategaki, `writing-mode: vertical-rl`), upright digits inside vertical text (tate-chu-yoko), monospaced serials, thermal dot-matrix, stamped serifs, rotated numerals. Technique labels belong here, not in `art_styles`.

### 4. Interactive Dynamics & Usability
- **Micro-interactions:** Hover, active, and focus transitions. Be specific about the transform: `translateY` for a lift, `rotateY` for a flip.
- **Usability evaluation:** Strengths (delight, brand recall, spatial memory) against tradeoffs (legibility, mobile limits, scalability, recommended item count).
- **Accessibility:** Note contrast, focus order, reduced-motion handling, touch target size, and screen-reader order for rotated or vertical text, or state that it is unknown.

## Output Format

For each reference, return two parts:

1. **Curator Breakdown:** A concise narrative of the object metaphor, visual mechanics, and interactive qualities.
2. **Library JSON Record:** Ready to commit, and valid against `schemas/entry.schema.json`.

For multiple references, return one breakdown and one record per reference. Never merge them.

### Voice
- Write critically and plainly. No superlatives or rankings ("masterclass", "strongest", "most complete", "extremely strong").
- Keep each text field to one to three sentences.
- Prefix any interaction you did not observe with `Reported:`.
- Put provenance and uncertainty in `sources` and `evidence`, not in `usability_notes`.

### Tag Rules
- All tags are lowercase kebab-case.
- Reuse existing tags before inventing one. Read the existing entries first.
- Use at most 3 `art_styles`, and only visual styles. Technique labels such as `thermal-dot-matrix` go in `typography`.
- Prefer the specific style over `flat-skeuomorphic`. Use it only when no better one fits.
- Use `navigation` for menus and navigation, and `gallery` for image collections.
- Preferred vocabulary:
  - **art_styles:** `flat-skeuomorphic`, `neo-brutalist`, `playful-brutalist`, `japanese-editorial`, `swiss-minimalist`, `retro-tactile-modern`, `neo-retro-80s`, `archival-editorial`, `editorial-print`, `industrial-hardware`, `collage-editorial`
  - **materials:** `paper`, `card-stock`, `plastic`, `metal`, `glass`, `wood`, `fabric`, `cork`, `ceramic`, `wax`. Add materials freely when they are accurate.
  - **ui_components:** `navigation`, `cta`, `modal`, `form-input`, `data-table`, `accordion`, `drawer`, `category-filter`, `gallery`
- Aliases to normalize on sight:
  - `print-ephemera`, `monospace-editorial`, `theatrical-gothic` → pick the closest preferred style
  - `thermal-dot-matrix` → typography text
  - `menu` → `navigation`
  - `flat-design` → `flat-skeuomorphic` (only if a physical object is present)

### ID and File Rules
- `id` is `ref-NNN`, where NNN is the highest existing number plus one. Gaps are fine (entries get removed); never reuse a number.
- The file is `examples/ref-NNN-short-slug.json`.
- Do not add a near-duplicate. Add the new source to the existing entry's `sources` instead.

### URL Rules
- `url` is the reference itself: the live site or component page someone opens to see the design. It is not an article, listing, or showcase page about it.
- `sources` is the evidence: where each claim came from. Often the best source is an article or listing, so `url` and `sources` can differ. When the live site is also a source, list it in both.
- Required for every new entry. If the site is gone, keep the original address in `url` and add an `archive` entry to `sources`.
- If you cannot find the reference's own page, omit `url` and say so in the report. Do not fill it with a showcase or article link.

### Schema Template

```json
{
  "id": "ref-NNN",
  "title": "<Reference Title>",
  "url": "<the reference's own page, not an article about it>",
  "sources": [
    { "url": "<URL>", "tier": "<A | B | C>", "type": "<code | live-site | case-study | article | archive>", "accessed": "<YYYY-MM-DD>" }
  ],
  "evidence": {
    "palette": "<inspected | published | inferred | none>",
    "tokens": "<inspected | published | inferred>",
    "interactions": "<inspected | published | inferred>",
    "stack": "<inspected | published | inferred | unknown>"
  },
  "tags": {
    "metaphors": ["<source-object>", "<specific-part>"],
    "art_styles": ["<primary-style>", "<secondary-style>"],
    "ui_components": ["<navigation | cta | modal | form-input | data-table | gallery | etc.>"],
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
    "<State 1: hover behavior, or 'Reported: ...'>",
    "<State 2: click/activation behavior>"
  ],
  "usability_notes": "<Best context, item limits, 'Tested: ...' or 'Not tested', at least one observed weakness>"
}
```

## After Writing an Entry

1. Run `python scripts/validate_entries.py` and fix any `[ERROR]`.
2. Run `python scripts/build_manifest.py` to rebuild the gallery manifest.
3. A gallery preview in `frontend_library/assets/js/previews/` is optional. If you build one:
   - Bind it to the entry's tokens only when `evidence.tokens` is `inspected` or `published`.
   - Label it "Illustrative recreation, sample content" so it is not mistaken for the original site.
   - Fall back to the default token card when the evidence is `inferred`.
4. Update `research-log.md` with anything rejected or left unverified.

## Gotchas

- Do not reduce designs to generic labels like "modern" or "minimal". Identify the concrete physical archetype and tactile technique.
- Separate a functional affordance from decoration. A tear-off that works as a CTA is a metaphor; a paper texture on an ordinary button is styling.
- Do not anchor on one example. Describe each object on its own terms.
- Do not invent references, URLs, colors, or behavior. If something cannot be verified, say so.
- Do not silently continue when a tool fails. Report it, and downgrade the evidence.
- For non-standard typography (vertical text, rotated numbers), note accessibility and legibility tradeoffs.
- Do not reproduce a site's copyrighted imagery or full copy. Describe it and link to it.
- Respect `robots.txt` and site terms, and rate-limit requests.
