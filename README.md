# Frontend library

A small, framework-free gallery for browsing the references in `examples/`. It exists for inspiration: a designer scans the cards, opens one, and sees the idea, the tokens and (optionally) a small interactive sketch of it. It is not a recreation of the original sites. Plain HTML, CSS and vanilla JavaScript; no build step except the manifest.

## How data gets here

```text
examples/ref-NNN-slug.json  ->  python scripts/build_manifest.py  ->  assets/data/manifest.json  ->  app.js / detail.js
```

After adding or changing an entry, run `python scripts/build_manifest.py`. The gallery reads only the manifest, so entries do not appear until it is rebuilt. Serve the folder over HTTP to view it (for example `python -m http.server` inside `frontend_library/`); opening the files directly blocks the manifest fetch.

## Layout

```text
frontend_library/
├── index.html              gallery: cards, search
├── detail.html             one reference, opened as detail.html?id=ref-NNN
└── assets/
    ├── css/                variables.css (tokens), layout.css, components.css
    ├── js/
    │   ├── app.js          fetch manifest, render cards, search by title, metaphors, art styles, UI components
    │   ├── detail.js       read ?id=, render the entry, mount the preview
    │   ├── utils.js        badges, click-to-copy hex
    │   └── previews/
    │       ├── index.js            registry: entry id -> preview module
    │       ├── default-fallback.js token card (palette, borders, elevation, typography)
    │       └── ref-NNN-*.js        optional hand-built sketch for one entry
    ├── data/manifest.json  generated; do not edit by hand
    └── media/images/       local screenshots (see below)
```

## What the pages show

- **Gallery card:** title, tags, palette swatches, the digital mechanic in one line. Clicking opens the detail page.
- **Detail page:** the physical metaphor and affordance, the digital mechanic, interaction states, design tokens (swatches copy their hex on click), usability notes, and the preview stage. An unknown or missing id shows an error with a link back.

## Previews are optional

Every entry already works without a preview: the fallback token card renders from the entry's own tokens, and handles empty palettes. Build a dedicated preview only when the interaction is the whole point and a sketch would teach something the text cannot. Most new entries should not get one.

To add one: create `previews/ref-NNN-slug.js` exporting `mount(entry, stageEl)`, then register it in `previews/index.js`. If it fails to load, the fallback is used.

When you do build one:
- **Match the original's level of abstraction.** A graphic, editorial reference (color blocks, layout rhythm, one clever tilt) needs no textures or physics. A tactile or industrial one (dials, switches, depth) needs mechanical feel. A minimal one needs space and typography. Do not apply one technique to everything.
- **Use the entry's tokens.** Colors from `design_tokens.dominant_colors`, borders, elevation and type from the matching fields. If the palette is empty, use the neutral tokens from `variables.css`, not invented colors.
- **Keep the one interaction that carries the idea** (slide, lean, lift, tear, turn) and make it feel right for the style: snappy for brutalist or editorial, damped for soft tactile designs.
- **Label it as a sketch**, not the original site.

## Screenshots

Screenshots of other people's sites stay on the local machine and are never committed. If you want them in the gallery locally, save them in `assets/media/images/` as `<ref-id>-preview.<ext>` and add `assets/media/images/*` (except the README) to `.gitignore`. The entry's `url` is the credit for the original.

## Checking a change

1. `python scripts/validate_entries.py` shows no `[ERROR]` lines (warnings are advice).
2. `python scripts/build_manifest.py` lists the entry among the compiled files.
3. The card shows in `index.html` and is found by search.
4. `detail.html?id=ref-NNN` renders the entry and either its preview or the fallback card, with no console errors.

## Not done yet

- The detail page does not show the entry's `url`. It should link to the original site as the credit.
- Screenshots are not displayed. Only the naming convention above is reserved for them.
