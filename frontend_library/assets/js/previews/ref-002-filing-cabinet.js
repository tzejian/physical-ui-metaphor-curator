/**
 * previews/ref-002-filing-cabinet.js
 *
 * Interactive metaphor preview for ref-002: Mosby's Files — Filing Cabinet
 * & Index Tab Navigation.
 *
 * Abstraction level: Archival / Editorial — mid-spectrum.
 * Technique: Four color-coded stacked drawer bars, each with a protruding
 * rounded index tab. Clicking a tab pulls that folder open in-place (the
 * drawer expands downward revealing a mock contents panel) while all other
 * drawers stay closed — preserving spatial context. No drop shadows; depth
 * is communicated purely through z-index stacking and flat color saturation.
 *
 * Token fidelity (ref-002):
 *   Colors  : #1A1A1A, #2A4FD7, #1E8A6E, #5B2A86, #D42B1F, #F5D020, #EDE8DE
 *   Borders : flat color blocks; ~8px rounded tab corners only; 0-1px elsewhere
 *   Elevation: flat layered z-index stacking — no drop shadows
 *   Typography: heavy condensed uppercase grotesque, serif tab names, monospace metadata
 */

/** @param {object} entry  @param {HTMLElement} stageEl */
export function mount(entry, stageEl) {
  const colors  = entry.design_tokens?.dominant_colors ?? [];
  const drawers = buildDrawerData(colors);

  stageEl.innerHTML = buildStageHtml(drawers);
  attachInteractions(stageEl, drawers);
}

// ── Data ──────────────────────────────────────────────────────────────────────

function buildDrawerData(colors) {
  // Map extracted colors to drawer categories (skip very dark / light background hues)
  const drawerColors  = colors.filter(c => !['#1A1A1A', '#EDE8DE'].includes(c));
  const paperColor    = '#EDE8DE';
  const cabinetColor  = '#1A1A1A';

  const defs = [
    {
      tab:      'CASE FILES',
      subtitle: 'Active Investigations',
      items:    ['The Barton Incident', 'Cross-Reference: 1983', 'Encrypted Fax — Unread', 'Witness Statement B'],
      meta:     ['REF-AF-001', '14 documents', 'Last modified: 1988-04-07'],
    },
    {
      tab:      'CORRESPONDENCE',
      subtitle: 'Letters & Communiqués',
      items:    ["Director's Memo, March", 'Field Report — Agent 7', 'Redacted: Classified', 'Response Pending'],
      meta:     ['REF-CR-012', '9 documents', 'Last modified: 1988-05-21'],
    },
    {
      tab:      'EVIDENCE',
      subtitle: 'Physical & Photographic',
      items:    ['Exhibit A — Photo Roll', 'Exhibit B — Audio Tape', 'Chain of Custody Log', 'Lab Analysis 44-B'],
      meta:     ['REF-EV-007', '23 documents', 'Last modified: 1988-04-19'],
    },
    {
      tab:      'PERSONS',
      subtitle: 'Persons of Interest',
      items:    ['Subject: D. Harlow', 'Subject: M. Reyes', 'Unnamed Informant X', 'Background: Redacted'],
      meta:     ['REF-PI-003', '11 documents', 'Last modified: 1988-05-03'],
    },
  ];

  return defs.map((d, i) => ({
    ...d,
    id:         i,
    color:      drawerColors[i] ?? '#555',
    paperColor,
    cabinetColor,
    textColor:  needsDarkText(drawerColors[i] ?? '#555') ? '#000' : '#fff',
  }));
}

// ── HTML ──────────────────────────────────────────────────────────────────────

function buildStageHtml(drawers) {
  const drawersHtml = drawers.map(d => buildDrawerHtml(d)).join('');

  return `
    <style>
      .fc-scene        { display:flex; flex-direction:column; gap:0; width:100%; font-family:var(--font-sans); }
      .fc-label        { font-size:.6875rem; font-weight:700; letter-spacing:.1em;
                         text-transform:uppercase; color:var(--text-muted); margin-bottom:14px; }

      /* Cabinet shell */
      .fc-cabinet      { background:#1A1A1A; border-radius:6px; overflow:visible;
                         padding:10px 10px 10px 10px; display:flex; flex-direction:column; gap:5px;
                         position:relative; }

      /* Drawer unit */
      .fc-drawer       { position:relative; border-radius:3px; overflow:visible; }

      /* Drawer bar (the visible closed strip) */
      .fc-drawer__bar  {
        display:flex; align-items:center;
        height:46px; padding:0 14px; gap:12px;
        border-radius:3px; cursor:pointer;
        position:relative; z-index:1;
        user-select:none;
        transition:filter .15s;
      }
      .fc-drawer__bar:hover { filter:brightness(1.12); }
      .fc-drawer__bar:focus-visible { outline:2px solid var(--border-focus); outline-offset:2px; }

      /* Protruding index tab */
      .fc-drawer__tab  {
        position:absolute;
        top:-18px; left:18px;
        height:20px; padding:0 12px;
        border-radius:8px 8px 0 0;
        display:flex; align-items:center;
        font-size:.625rem; font-weight:700; letter-spacing:.1em;
        white-space:nowrap; cursor:pointer;
        transition:top .15s;
        z-index:2;
      }
      .fc-drawer:hover .fc-drawer__tab:not(.is-active) { top:-22px; }
      .fc-drawer__tab.is-active { top:-22px; }

      /* Drawer label & meta */
      .fc-drawer__handle {
        width:28px; height:28px; border-radius:3px;
        background:rgba(255,255,255,.12); flex-shrink:0;
        display:flex; align-items:center; justify-content:center;
        font-size:.5rem; font-weight:900; letter-spacing:.08em;
      }
      .fc-drawer__title  { font-size:.75rem; font-weight:700; letter-spacing:.08em; flex:1; }
      .fc-drawer__count  { font-family:var(--font-mono); font-size:.625rem; opacity:.6; }

      /* Expand panel */
      .fc-drawer__panel {
        background:#EDE8DE; border-radius:0 0 3px 3px;
        max-height:0; overflow:hidden;
        transition:max-height .28s cubic-bezier(.4,0,.2,1);
      }
      .fc-drawer__panel.is-open { max-height:280px; }
      .fc-panel-inner  { padding:14px 16px; display:flex; flex-direction:column; gap:0; }

      .fc-panel-heading {
        font-family:'Georgia',serif; font-size:.6875rem; font-style:italic;
        color:rgba(0,0,0,.45); border-bottom:1px solid rgba(0,0,0,.12);
        padding-bottom:6px; margin-bottom:8px;
      }
      .fc-panel-row {
        display:flex; align-items:center; gap:10px;
        padding:6px 0; border-bottom:1px dashed rgba(0,0,0,.1);
        font-size:.8125rem; color:#111; cursor:default;
        transition:background .1s;
      }
      .fc-panel-row:last-child { border-bottom:none; }
      .fc-panel-row:hover      { background:rgba(0,0,0,.04); }
      .fc-panel-num  { font-family:var(--font-mono); font-size:.5625rem; color:rgba(0,0,0,.35); min-width:22px; }

      .fc-panel-meta {
        display:flex; gap:16px; padding-top:10px; border-top:1px solid rgba(0,0,0,.1); margin-top:4px;
      }
      .fc-panel-meta span { font-family:var(--font-mono); font-size:.5625rem; color:rgba(0,0,0,.4); }

      /* Bottom rail */
      .fc-rail { height:14px; background:#111; border-radius:0 0 4px 4px; margin-top:5px; }

      .fc-hint { font-size:.6875rem; color:var(--text-muted); margin-top:12px; font-style:italic; }
    </style>

    <div class="fc-scene">
      <p class="fc-label">Interactive Metaphor Preview — Filing Cabinet Index Tab Navigation</p>
      <div class="fc-cabinet">
        ${drawersHtml}
        <div class="fc-rail"></div>
      </div>
      <p class="fc-hint">↑ Hover to lift tabs · Click a tab to pull open the folder</p>
    </div>`;
}

function buildDrawerHtml(d) {
  const itemsHtml = d.items.map((item, i) => `
    <div class="fc-panel-row">
      <span class="fc-panel-num">${String(i + 1).padStart(2, '0')}</span>
      <span>${esc(item)}</span>
    </div>`).join('');

  const metaHtml = d.meta.map(m => `<span>${esc(m)}</span>`).join('');

  return `
    <div class="fc-drawer" data-drawer-id="${d.id}">
      <div class="fc-drawer__tab"
           style="background:${d.color}; color:${d.textColor};"
           role="button" tabindex="0"
           aria-expanded="false"
           aria-label="Open ${esc(d.tab)} folder">
        ${esc(d.tab)}
      </div>
      <div class="fc-drawer__bar"
           style="background:${d.color}; color:${d.textColor};"
           role="button" tabindex="-1"
           aria-hidden="true">
        <div class="fc-drawer__handle" style="background:rgba(0,0,0,.2);">
          <span style="color:${d.textColor};opacity:.7">▬▬</span>
        </div>
        <span class="fc-drawer__title">${esc(d.subtitle)}</span>
        <span class="fc-drawer__count">${d.items.length} items</span>
      </div>
      <div class="fc-drawer__panel" id="fc-panel-${d.id}" role="region" aria-label="${esc(d.tab)} contents">
        <div class="fc-panel-inner">
          <div class="fc-panel-heading">${esc(d.subtitle)}</div>
          ${itemsHtml}
          <div class="fc-panel-meta">${metaHtml}</div>
        </div>
      </div>
    </div>`;
}

// ── Interactions ──────────────────────────────────────────────────────────────

function attachInteractions(stageEl, drawers) {
  let activeId = null;

  // Delegate from cabinet
  stageEl.addEventListener('click', e => {
    const drawerEl = e.target.closest('.fc-drawer');
    if (!drawerEl) return;

    const id    = parseInt(drawerEl.dataset.drawerId, 10);
    const panel = stageEl.querySelector(`#fc-panel-${id}`);
    const tab   = drawerEl.querySelector('.fc-drawer__tab');
    if (!panel || !tab) return;

    if (activeId === id) {
      // Close
      closeAll(stageEl);
      activeId = null;
    } else {
      closeAll(stageEl);
      panel.classList.add('is-open');
      tab.classList.add('is-active');
      tab.setAttribute('aria-expanded', 'true');
      activeId = id;
    }
  });

  stageEl.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      const tab = e.target.closest('.fc-drawer__tab');
      if (tab) { e.preventDefault(); tab.click(); }
    }
  });
}

function closeAll(stageEl) {
  stageEl.querySelectorAll('.fc-drawer__panel').forEach(p => p.classList.remove('is-open'));
  stageEl.querySelectorAll('.fc-drawer__tab').forEach(t => {
    t.classList.remove('is-active');
    t.setAttribute('aria-expanded', 'false');
  });
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function needsDarkText(hex) {
  if (!hex || hex.length < 7) return false;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55;
}

function esc(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

