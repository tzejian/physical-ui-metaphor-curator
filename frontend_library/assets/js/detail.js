/**
 * detail.js — Single Reference View Controller
 * Parses ?id= from URL, fetches manifest, renders full reference detail,
 * and mounts the interactive metaphor preview via previews/index.js.
 */

import {
  buildBadge,
  buildSwatch,
  attachSwatchCopy,
  escapeHtml,
} from './utils.js';

import { resolvePreview } from './previews/index.js';

const MANIFEST_PATH = 'assets/data/manifest.json';

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const refId  = params.get('id');

  if (!refId) {
    renderError('No reference ID specified.');
    return;
  }

  let entries;
  try {
    const res = await fetch(MANIFEST_PATH);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    entries = await res.json();
  } catch (err) {
    renderError(`Failed to load manifest: ${err.message}`);
    return;
  }

  const entry = entries.find(e => e.id === refId);
  if (!entry) {
    renderError(`Reference "${escapeHtml(refId)}" not found in the library.`);
    return;
  }

  renderDetail(entry);
  await mountPreview(entry);
});

// ── Detail renderer ───────────────────────────────────────────────────────────

function renderDetail(entry) {
  document.title = `${entry.title} — Physical UI Library`;

  const main = document.getElementById('detail-main');
  if (!main) return;

  const tags      = entry.tags                   || {};
  const tokens    = entry.design_tokens          || {};
  const afford    = entry.affordance_translation || {};
  const mechanics = entry.interactive_mechanics  || [];
  const colors    = tokens.dominant_colors       || [];

  // All tag badges — no truncation on the detail view
  const allCategories = ['metaphors', 'art_styles', 'ui_components', 'materials'];
  const badgesHtml = allCategories
    .flatMap(cat => (tags[cat] || []).map(label => buildBadge(label, cat)))
    .join('');

  const swatchesHtml  = colors.map(c => buildSwatch(c)).join('');
  const mechanicsHtml = mechanics.length
    ? mechanics.map(m => `<li class="mechanics-list__item">${escapeHtml(m)}</li>`).join('')
    : '<li class="mechanics-list__item">No mechanics documented.</li>';

  main.innerHTML = `
    <!-- Header -->
    <div class="detail-header detail-layout__full">
      <div class="detail-header__id">${escapeHtml(entry.id)}</div>
      <h1 class="detail-header__title">${escapeHtml(entry.title)}</h1>
      <div class="detail-header__tags">${badgesHtml}</div>
    </div>

    <!-- ① Interactive Metaphor Preview (mounted async after render) -->
    <div class="preview-stage detail-layout__full" id="preview-stage" aria-label="Interactive metaphor preview">
      <div class="preview-stage__loading">Loading preview…</div>
    </div>

    <!-- ② Physical & Digital Affordance -->
    <div class="detail-panel">
      <p class="section-title">Affordance Translation</p>
      <div class="affordance-block">
        <div class="affordance-item affordance-item--physical">
          <div class="affordance-item__label">Physical Behavior</div>
          <div class="affordance-item__text">${escapeHtml(afford.physical_behavior || '—')}</div>
        </div>
        <div class="affordance-item affordance-item--digital">
          <div class="affordance-item__label">Digital Mechanic</div>
          <div class="affordance-item__text">${escapeHtml(afford.digital_mechanic || '—')}</div>
        </div>
      </div>
    </div>

    <!-- ③ Design Tokens -->
    <div class="detail-panel">
      <p class="section-title">Design Tokens</p>

      <div class="token-spec">
        <div class="token-spec__label">Dominant Colors</div>
        <div class="swatch-row" id="swatch-row">${swatchesHtml}</div>
      </div>

      <div class="token-spec">
        <div class="token-spec__label">Borders &amp; Keylines</div>
        <div class="token-spec__value token-spec__value--mono">${escapeHtml(tokens.borders || '—')}</div>
      </div>

      <div class="token-spec">
        <div class="token-spec__label">Elevation</div>
        <div class="token-spec__value token-spec__value--mono">${escapeHtml(tokens.elevation || '—')}</div>
      </div>

      <div class="token-spec">
        <div class="token-spec__label">Typography</div>
        <div class="token-spec__value">${escapeHtml(tokens.typography || '—')}</div>
      </div>
    </div>

    <!-- ④ Interactive Mechanics -->
    <div class="detail-panel">
      <p class="section-title">Interactive Mechanics</p>
      <ul class="mechanics-list">${mechanicsHtml}</ul>
    </div>

    <!-- ⑤ Usability Notes -->
    <div class="detail-panel">
      <p class="section-title">Usability Notes</p>
      <div class="usability-block">${escapeHtml(entry.usability_notes || '—')}</div>
    </div>
  `;

  // Activate swatch copy behaviour
  const swatchRow = document.getElementById('swatch-row');
  if (swatchRow) attachSwatchCopy(swatchRow);
}

// ── Preview mounting ──────────────────────────────────────────────────────────

async function mountPreview(entry) {
  const stageEl = document.getElementById('preview-stage');
  if (!stageEl) return;

  try {
    const previewModule = await resolvePreview(entry.id);
    if (typeof previewModule?.mount !== 'function') {
      throw new Error('Preview module missing mount() export.');
    }
    // Clear the loading indicator before mounting
    stageEl.innerHTML = '';
    previewModule.mount(entry, stageEl);
  } catch (err) {
    console.error('[detail] Preview mount failed:', err);
    stageEl.innerHTML = `
      <div class="preview-stage__error">
        Preview unavailable — ${escapeHtml(err.message)}
      </div>`;
  }
}

// ── Error state ───────────────────────────────────────────────────────────────

function renderError(message) {
  const main = document.getElementById('detail-main');
  if (!main) return;
  document.title = 'Not Found — Physical UI Library';
  main.innerHTML = `
    <div class="error-state detail-layout__full">
      <div class="error-state__code">404</div>
      <p class="error-state__message">${escapeHtml(message)}</p>
      <a href="index.html" class="back-link">← Back to Library</a>
    </div>`;
}
