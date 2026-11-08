/**
 * previews/ref-001-bookshelf.js
 *
 * Interactive metaphor preview for ref-001: FREAK MAG Bookshelf Spine Navigation.
 *
 * Abstraction level: Graphic / Editorial (left of the spectrum).
 * Technique: Color-block vertical spine cards, layout rhythm, the leftmost
 * spine tilted via a slight 2D rotation. Hover → Y-axis lift. Click →
 * the spine becomes "active" and an archive drawer slides open to its right,
 * revealing a mock article list. Completely flat — no shadows, no textures.
 *
 * Token fidelity:
 *   - Colors  : bound to entry.design_tokens.dominant_colors
 *   - Borders : 1-2px solid black keylines, 0px radius
 *   - Elevation: flat 2D (translateY on hover, rotate on first spine)
 *   - Typography: vertical writing-mode, monospace dates, bold numerals
 */

/** @param {object} entry @param {HTMLElement} stageEl */
export function mount(entry, stageEl) {
  const colors  = (entry.design_tokens?.dominant_colors ?? []).filter(c => c !== '#000000');
  const black   = '#000000';

  // Build a set of spine definitions — one per extracted color
  const spineData = buildSpineData(colors);

  stageEl.innerHTML = buildStageHtml(spineData, black);
  attachInteractions(stageEl, spineData, black);
}

// ── Data ──────────────────────────────────────────────────────────────────────

function buildSpineData(colors) {
  // Editorial labels for each spine column — evocative of magazine issues
  const labels = [
    { issue: 'FREAK',  vol: 'No.01', year: '2024', tag: 'SPRING'  },
    { issue: 'FREAK',  vol: 'No.02', year: '2024', tag: 'SUMMER'  },
    { issue: 'FREAK',  vol: 'No.03', year: '2024', tag: 'AUTUMN'  },
    { issue: 'FREAK',  vol: 'No.04', year: '2024', tag: 'WINTER'  },
    { issue: 'FREAK',  vol: 'No.05', year: '2025', tag: 'SPECIAL' },
    { issue: 'FREAK',  vol: 'No.06', year: '2025', tag: 'ANNUAL'  },
  ];

  // Vary heights to create shelf rhythm (in px)
  const heights = [260, 230, 250, 220, 240, 215];

  return colors.slice(0, labels.length).map((color, i) => ({
    id:     i,
    color,
    label:  labels[i],
    height: heights[i] ?? 230,
    // The leftmost spine is the leaner
    isLeaning: i === 0,
    textColor: needsDarkText(color) ? '#000000' : '#ffffff',
    // Mock article list shown when this spine is active
    articles: mockArticles(labels[i].tag),
  }));
}

function mockArticles(tag) {
  const pool = {
    SPRING:  ['Vinyl Revival', 'Paper Futures', 'Editorial Drift', 'Grid Logic'],
    SUMMER:  ['Cassette Culture', 'Warm Renders', 'Sun Dial UI', 'Analog Forms'],
    AUTUMN:  ['Leaf & Layer', 'Matte States', 'Tactile Memory', 'Receipt Hours'],
    WINTER:  ['Frosted Glass', 'Cold Palette', 'Dark Tokens', 'Minimal Noise'],
    SPECIAL: ['Object Studies', 'Physical Forms', 'Touch Points', 'The Archive'],
    ANNUAL:  ['Year in Craft', 'Best of Tactile', 'Token Index', 'Retrospective'],
  };
  return (pool[tag] ?? ['Article 01', 'Article 02', 'Article 03', 'Article 04']).slice(0, 4);
}

// ── HTML ──────────────────────────────────────────────────────────────────────

function buildStageHtml(spineData, black) {
  const spinesHtml = spineData.map(s => buildSpineHtml(s, black)).join('');

  return `
    <style>
      /* ── Shelf scene ── */
      .bs-scene {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        width: 100%;
        user-select: none;
      }
      .bs-label {
        font-size: .6875rem; font-weight: 700; letter-spacing: .1em;
        text-transform: uppercase; color: var(--text-muted); margin-bottom: 16px;
      }
      .bs-shelf-wrap {
        display: flex;
        align-items: flex-end;
        gap: 0;
        position: relative;
        width: 100%;
        padding-bottom: 0;
      }
      .bs-spines {
        display: flex;
        align-items: flex-end;
        gap: 3px;
        flex-shrink: 0;
      }

      /* ── Individual spine ── */
      .bs-spine {
        position: relative;
        width: 52px;
        border: 2px solid ${black};
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        padding: 10px 0;
        box-sizing: border-box;
        cursor: pointer;
        transition: transform 180ms cubic-bezier(.2,.8,.3,1);
        transform-origin: bottom center;
        flex-shrink: 0;
        outline: none;
      }
      .bs-spine:focus-visible { outline: 2px solid var(--border-focus); outline-offset: 2px; }
      .bs-spine--leaning      { transform: rotate(-7deg); }
      .bs-spine:hover:not(.bs-spine--active) { transform: translateY(-10px); }
      .bs-spine--leaning:hover:not(.bs-spine--active) {
        transform: rotate(-7deg) translateY(-10px);
      }
      .bs-spine--active {
        transform: translateY(-8px) scaleX(1.04) !important;
        border-width: 2px;
        z-index: 2;
      }

      /* Spine text — vertical writing mode */
      .bs-spine__issue {
        writing-mode: vertical-rl;
        text-orientation: mixed;
        font-weight: 900;
        font-size: .9375rem;
        letter-spacing: .15em;
        line-height: 1;
      }
      .bs-spine__meta {
        writing-mode: vertical-rl;
        text-orientation: mixed;
        font-family: var(--font-mono);
        font-size: .5625rem;
        letter-spacing: .06em;
        opacity: .75;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
      }
      .bs-spine__tag {
        writing-mode: vertical-rl;
        text-orientation: mixed;
        font-size: .5rem;
        font-weight: 700;
        letter-spacing: .2em;
        opacity: .6;
      }
      .bs-spine__dot {
        width: 6px; height: 6px; border-radius: 50%;
        background: currentColor; opacity: .5; flex-shrink: 0;
      }

      /* ── Shelf line ── */
      .bs-shelf-line {
        height: 3px;
        background: ${black};
        width: 100%;
        margin-top: 0;
        flex-shrink: 0;
      }

      /* ── Article drawer ── */
      .bs-drawer {
        flex: 1;
        min-width: 0;
        border: 2px solid ${black};
        border-left: none;
        background: #fff;
        overflow: hidden;
        max-height: 0;
        opacity: 0;
        transition: max-height 260ms cubic-bezier(.4,0,.2,1), opacity 200ms ease;
        display: flex;
        flex-direction: column;
        align-self: stretch;
      }
      .bs-drawer.is-open {
        max-height: 400px;
        opacity: 1;
      }
      .bs-drawer__inner {
        padding: 14px 16px;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .bs-drawer__heading {
        font-size: .625rem;
        font-weight: 700;
        letter-spacing: .15em;
        text-transform: uppercase;
        color: rgba(0,0,0,.4);
        margin-bottom: 10px;
      }
      .bs-drawer__item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 7px 0;
        border-bottom: 1px solid rgba(0,0,0,.08);
        font-size: .8125rem;
        color: #111;
        font-weight: 500;
        cursor: default;
        transition: color .12s;
      }
      .bs-drawer__item:last-child { border-bottom: none; }
      .bs-drawer__item:hover      { color: #000; }
      .bs-drawer__num {
        font-family: var(--font-mono);
        font-size: .625rem;
        color: rgba(0,0,0,.35);
        min-width: 20px;
      }
      .bs-hint {
        font-size: .6875rem;
        color: var(--text-muted);
        margin-top: 14px;
        font-style: italic;
      }
    </style>

    <div class="bs-scene">
      <p class="bs-label">Interactive Metaphor Preview — Bookshelf Spine Navigation</p>
      <div class="bs-shelf-wrap">
        <div class="bs-spines" id="bs-spines">${spinesHtml}</div>
        <div class="bs-drawer" id="bs-drawer" aria-live="polite">
          <div class="bs-drawer__inner" id="bs-drawer-inner"></div>
        </div>
      </div>
      <div class="bs-shelf-line"></div>
      <p class="bs-hint">↑ Hover to lift · Click a spine to open its archive</p>
    </div>`;
}

function buildSpineHtml(s, black) {
  const bg        = s.color;
  const fg        = s.textColor;
  const leanClass = s.isLeaning ? ' bs-spine--leaning' : '';

  return `
    <div
      class="bs-spine${leanClass}"
      style="background:${bg}; color:${fg}; height:${s.height}px;"
      data-spine-id="${s.id}"
      tabindex="0"
      role="button"
      aria-label="Open ${s.label.tag} issue archive"
    >
      <span class="bs-spine__tag">${s.label.tag}</span>
      <span class="bs-spine__dot"></span>
      <span class="bs-spine__issue">${s.label.issue}</span>
      <span class="bs-spine__dot"></span>
      <span class="bs-spine__meta">
        <span>${s.label.vol}</span>
        <span>${s.label.year}</span>
      </span>
    </div>`;
}

// ── Interactions ──────────────────────────────────────────────────────────────

function attachInteractions(stageEl, spineData, black) {
  const spinesEl  = stageEl.querySelector('#bs-spines');
  const drawer    = stageEl.querySelector('#bs-drawer');
  const drawerIn  = stageEl.querySelector('#bs-drawer-inner');
  if (!spinesEl || !drawer || !drawerIn) return;

  let activeId = null;

  spinesEl.addEventListener('click', e => {
    const spineEl = e.target.closest('.bs-spine');
    if (!spineEl) return;

    const id = parseInt(spineEl.dataset.spineId, 10);
    const data = spineData[id];
    if (!data) return;

    // Toggle: clicking the same spine again closes the drawer
    if (activeId === id) {
      closeDrawer(spinesEl, drawer);
      activeId = null;
      return;
    }

    activeId = id;
    openDrawer(spinesEl, drawer, drawerIn, spineEl, data);
  });

  // Keyboard support
  spinesEl.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.target.closest('.bs-spine')?.click();
    }
  });
}

function openDrawer(spinesEl, drawer, drawerIn, activeSpineEl, data) {
  // Deactivate all spines
  spinesEl.querySelectorAll('.bs-spine').forEach(el => el.classList.remove('bs-spine--active'));
  activeSpineEl.classList.add('bs-spine--active');

  // Populate drawer
  const articlesHtml = data.articles.map((title, i) => `
    <div class="bs-drawer__item">
      <span class="bs-drawer__num">${String(i + 1).padStart(2, '0')}</span>
      <span>${title}</span>
    </div>`).join('');

  drawerIn.innerHTML = `
    <div class="bs-drawer__heading" style="color:${data.color !== '#ffffff' ? data.color : '#888'}">
      ${data.label.issue} — ${data.label.tag} ${data.label.year}
    </div>
    ${articlesHtml}`;

  drawer.style.borderTopColor = data.color;
  drawer.classList.add('is-open');
}

function closeDrawer(spinesEl, drawer) {
  spinesEl.querySelectorAll('.bs-spine').forEach(el => el.classList.remove('bs-spine--active'));
  drawer.classList.remove('is-open');
}

// ── Utilities ─────────────────────────────────────────────────────────────────

/**
 * Returns true if dark text (#000) should be used on the given background hex.
 * Uses the WCAG relative luminance formula.
 * @param {string} hex
 * @returns {boolean}
 */
function needsDarkText(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55;
}

