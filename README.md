# Physical UI Metaphor Curator

An agent skill and a small gallery for collecting UI/UX designs that borrow from something physical: an object, a material, a space or a layout (bookshelf spines, receipts, cassettes, dials, floor tiling, signage). The library is for design inspiration. Each entry records what the physical thing is, what the interaction idea is, and where to see it. It does not try to recreate the original sites.

## How it works

1. An agent uses `SKILL.md` to find designs, look at them in a browser, and write one JSON entry per reference into `examples/`.
2. `scripts/validate_entries.py` checks the entries against `schemas/entry.schema.json`.
3. `scripts/build_manifest.py` compiles the entries into the gallery's data file.
4. `frontend_library/` shows them as a searchable gallery.

## Layout

```text
├── SKILL.md                 the agent skill: how to find, look at, and write up references
├── examples/                one JSON entry per reference (ref-NNN-slug.json)
├── schemas/                 entry schema and tag vocabulary
├── scripts/
│   ├── validate_entries.py  check entries (fix [ERROR]; warnings are advice)
│   ├── build_manifest.py    rebuild the gallery data after any entry change
│   └── capture.py           open a site in headless Chromium: screenshots, colors, fonts, motion
├── frontend_library/        the gallery (plain HTML, CSS and JavaScript)
└── .github/workflows/       runs the validator on push
```

## Using the skill

Add `SKILL.md` to your agent's skills, or place this repository in its skills directory. Ask it to find references, for example "find five new references based on tiles or signage". Each run adds a small batch of entries and lists what it rejected in `coverage.md`.

`capture.py` needs `pip install playwright` and `playwright install chromium`. Its output goes to `captures/`, which is local only: those are screenshots of other people's sites and are not committed. An entry's `url` is the credit for the original.

## Viewing the gallery

```bash
python scripts/build_manifest.py
cd frontend_library && python -m http.server
```

Open the address it prints. The gallery has to be served over HTTP, because opening the files directly blocks loading the data.

- **Gallery page:** cards with tags, palette swatches and the digital mechanic. Search covers title, metaphors, art styles and UI components.
- **Detail page** (`detail.html?id=ref-NNN`): the physical metaphor, interaction states, design tokens (click a swatch to copy its hex), usability notes, and a preview area.
- **Previews are optional.** Every entry gets a token card by default (`previews/default-fallback.js`). A hand-built interactive sketch is only worth adding when the interaction is the whole point: create `previews/ref-NNN-slug.js` exporting `mount(entry, stageEl)` and register it in `previews/index.js`. Match the original's level of abstraction, use the entry's own tokens (neutral ones if its palette is empty), and label the result as a sketch.
- Screenshots are not displayed yet. If you add them locally, save them as `frontend_library/assets/media/images/<ref-id>-preview.<ext>` and keep them out of git.

## Entries

Each entry has a title, `url`, tags, the physical behavior and its digital translation, design tokens, interaction notes and usability notes. Older entries also carry `sources` and `evidence` fields. They remain valid and are left as they are; new entries do not need them.
