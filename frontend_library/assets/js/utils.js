/**
 * utils.js — Shared formatting helpers, badge builders, clipboard utilities.
 */

/**
 * Map a tag category key to its CSS badge modifier class.
 * @param {'metaphors'|'art_styles'|'ui_components'|'materials'} category
 * @returns {string}
 */
export function categoryToModifier(category) {
  const map = {
    metaphors:    'metaphor',
    art_styles:   'style',
    ui_components:'component',
    materials:    'material',
  };
  return map[category] || 'metaphor';
}

/**
 * Build an HTML string for a single tag badge.
 * @param {string} label
 * @param {string} category — one of the tag category keys
 * @returns {string}
 */
export function buildBadge(label, category) {
  const mod = categoryToModifier(category);
  return `<span class="badge badge--${mod}">${escapeHtml(label)}</span>`;
}

/**
 * Build all badge HTML for all tag categories in a record.
 * @param {object} tags
 * @param {number} [maxPerCategory=2] — max badges shown per category
 * @returns {string}
 */
export function buildAllBadges(tags, maxPerCategory = 2) {
  const categories = ['metaphors', 'art_styles', 'ui_components', 'materials'];
  return categories
    .flatMap(cat => (tags[cat] || []).slice(0, maxPerCategory).map(label => buildBadge(label, cat)))
    .join('');
}

/**
 * Build an HTML string for an interactive color swatch.
 * @param {string} hex
 * @returns {string}
 */
export function buildSwatch(hex) {
  return `<button
    class="swatch"
    style="background-color:${escapeHtml(hex)};"
    data-hex="${escapeHtml(hex)}"
    title="Copy ${escapeHtml(hex)}"
    aria-label="Copy color ${escapeHtml(hex)} to clipboard"
  ></button>`;
}

/**
 * Build a horizontal color strip for card headers.
 * @param {string[]} colors
 * @returns {string}
 */
export function buildColorStrip(colors) {
  return colors
    .map(c => `<div class="ref-card__swatch-strip-item" style="background-color:${escapeHtml(c)};"></div>`)
    .join('');
}

/**
 * Copy text to clipboard; return a promise that resolves to true on success.
 * @param {string} text
 * @returns {Promise<boolean>}
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for non-secure contexts
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Attach clipboard-copy behaviour to all .swatch elements inside a container.
 * @param {HTMLElement} container
 */
export function attachSwatchCopy(container) {
  container.querySelectorAll('.swatch').forEach(swatch => {
    swatch.addEventListener('click', async () => {
      const hex = swatch.dataset.hex;
      const ok = await copyToClipboard(hex);
      if (ok) {
        swatch.classList.add('is-copied');
        setTimeout(() => swatch.classList.remove('is-copied'), 1500);
      }
    });
  });
}

/**
 * Escape a string for safe HTML insertion.
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Truncate a string to a max number of words, appending ellipsis if needed.
 * @param {string} str
 * @param {number} maxWords
 * @returns {string}
 */
export function truncateWords(str, maxWords) {
  const words = str.split(' ');
  if (words.length <= maxWords) return str;
  return words.slice(0, maxWords).join(' ') + '…';
}

