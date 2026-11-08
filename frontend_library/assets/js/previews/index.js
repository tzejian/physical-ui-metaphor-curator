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

