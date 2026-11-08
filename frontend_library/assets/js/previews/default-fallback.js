/**
 * previews/default-fallback.js
 *
 * Fallback preview renderer used when no dedicated sandbox exists for a ref.
 * Renders an elegant token palette card: color strip, palette grid, and key
 * token values — a visual digest of the design system extracted from the entry.
 */

/**
 * Mount the fallback token card into the preview stage.
 *
 * @param {object}      entry    — the full reference JSON record
 * @param {HTMLElement} stageEl  — the #preview-stage container element
 */
export function mount(entry, stageEl) {
  const tokens = entry.design_tokens || {};
  const colors = tokens.dominant_colors || [];

  // ── Color strip ──────────────────────────────────────────────────────────
  const stripHtml = colors.length
    ? colors.map(c => `<div class="fb-strip-seg" style="background:${css(c)};flex:1;"></div>`).join('')
    : '<div class="fb-strip-seg" style="background:var(--border-subtle);flex:1;"></div>';

  // ── Palette swatches ──────────────────────────────────────────────────────
  const paletteHtml = colors.length
    ? colors.map(c => `
        <div class="fb-swatch-cell" title="${css(c)}">
          <div class="fb-swatch-block" style="background:${css(c)};"></div>
          <span class="fb-swatch-hex">${css(c)}</span>
        </div>`).join('')
    : '<span style="color:var(--text-muted);font-size:.8125rem;">No colors extracted</span>';

  // ── Token rows ────────────────────────────────────────────────────────────
  const tokenRows = [
    { label: 'Borders',    value: tokens.borders   || '—' },
    { label: 'Elevation',  value: tokens.elevation  || '—' },
    { label: 'Typography', value: tokens.typography || '—' },
  ].map(({ label, value }) => `
    <div class="fb-token-row">
      <span class="fb-token-label">${label}</span>
      <span class="fb-token-value">${esc(value)}</span>
    </div>`).join('');

  stageEl.innerHTML = `
    <style>
      .fb-root        { display:flex; flex-direction:column; gap:20px; width:100%; }
      .fb-strip       { display:flex; height:8px; border-radius:4px; overflow:hidden; }
      .fb-strip-seg   { transition:flex .2s; }
      .fb-palette     { display:flex; flex-wrap:wrap; gap:10px; }
      .fb-swatch-cell { display:flex; flex-direction:column; align-items:center; gap:5px; cursor:default; }
      .fb-swatch-block{
        width:44px; height:44px; border-radius:6px;
        border:1px solid rgba(255,255,255,.1);
        transition:transform .15s, box-shadow .15s;
      }
      .fb-swatch-cell:hover .fb-swatch-block {
        transform:scale(1.12);
        box-shadow:0 4px 14px rgba(0,0,0,.5);
      }
      .fb-swatch-hex  { font-family:var(--font-mono); font-size:.625rem; color:var(--text-muted); }
      .fb-divider     { height:1px; background:var(--border-subtle); }
      .fb-token-row   { display:flex; gap:12px; padding:8px 0; border-bottom:1px solid var(--border-subtle); }
      .fb-token-row:last-child { border-bottom:none; }
      .fb-token-label { font-size:.6875rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase;
                        color:var(--text-muted); min-width:90px; flex-shrink:0; padding-top:1px; }
      .fb-token-value { font-size:.8125rem; color:var(--text-secondary); line-height:1.5; }
      .fb-label       { font-size:.6875rem; font-weight:700; letter-spacing:.08em;
                        text-transform:uppercase; color:var(--text-muted); }
    </style>

    <div class="fb-root">
      <div>
        <p class="fb-label" style="margin-bottom:10px;">Color Palette</p>
        <div class="fb-strip">${stripHtml}</div>
      </div>
      <div class="fb-palette">${paletteHtml}</div>
      <div class="fb-divider"></div>
      <div>
        <p class="fb-label" style="margin-bottom:4px;">Design Tokens</p>
        <div>${tokenRows}</div>
      </div>
    </div>`;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function css(str)  { return String(str).replace(/[<>"'&]/g, ''); }
function esc(str)  {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

