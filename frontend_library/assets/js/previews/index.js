/**
 * previews/index.js — Registry routing reference IDs to their preview builder.
 *
 * To register a new preview:
 *   1. Add a dedicated file at `previews/<ref-id-slug>.js`
 *   2. Export a `mount(entry, stageEl)` function from it.
 *   3. Add an entry to REGISTRY below.
 */

/** @type {Record<string, () => Promise<{ mount: Function }>>} */
const REGISTRY = {
  'ref-001': () => import('./ref-001-bookshelf.js'),
  'ref-002': () => import('./ref-002-filing-cabinet.js'),
  'ref-003': () => import('./ref-003-kitchen-ticket.js'),
  'ref-004': () => import('./ref-004-cassette.js'),
  'ref-005': () => import('./ref-005-boarding-pass.js'),
  'ref-006': () => import('./ref-006-polaroid-dials.js'),
  'ref-007': () => import('./ref-007-hanging-threads.js'),
  'ref-008': () => import('./ref-008-rotary-knob.js'),
  'ref-009': () => import('./ref-009-gumball-machine.js'),
  'ref-010': () => import('./ref-010-vintage-desk.js'),
  'ref-011': () => import('./ref-011-corkboard-wall.js'),
  'ref-012': () => import('./ref-012-gacha-cylinder.js'),
  'ref-013': () => import('./ref-013-typewriter.js'),
  'ref-014': () => import('./ref-014-mechanical-keyboard.js'),
  'ref-015': () => import('./ref-015-day-night-switch.js'),
  'ref-016': () => import('./ref-016-pull-cord-lamp.js'),
  'ref-017': () => import('./ref-017-pull-cord-detent.js'),
  'ref-018': () => import('./ref-018-matchbox-strike.js'),
  'ref-019': () => import('./ref-019-page-flip.js'),
  'ref-021': () => import('./ref-021-polaroid-fling.js'),
  'ref-022': () => import('./ref-022-wax-seal-envelope.js'),
  'ref-023': () => import('./ref-023-elevator-doors.js'),
  'ref-024': () => import('./ref-024-elevator-ia.js'),
  'ref-025': () => import('./ref-025-curtain-menu.js'),
  'ref-026': () => import('./ref-026-slot-machine.js'),
  'ref-027': () => import('./ref-027-fabric-sheets.js'),
};

/**
 * Resolve the preview module for a given reference ID.
 * Returns the dedicated module if registered, the default fallback otherwise.
 *
 * @param {string} id — reference entry id (e.g. "ref-001")
 * @returns {Promise<{ mount: Function }>}
 */
export async function resolvePreview(id) {
  const loader = REGISTRY[id];
  if (loader) {
    try {
      return await loader();
    } catch (err) {
      console.warn(`[previews] Failed to load dedicated preview for "${id}":`, err);
    }
  }
  return import('./default-fallback.js');
}

