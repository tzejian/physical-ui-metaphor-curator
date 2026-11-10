/**
 * previews/ref-004-cassette.js
 *
 * Interactive metaphor preview for ref-004: Press Play On Tape —
 * Cassette Deck & VHS Packaging Interface.
 *
 * Abstraction level: Mid-spectrum — retro-tactile modern.
 * Technique: Cassettes lined up side-by-side as navigable service cards,
 * each with a two-reel spool window, label, and color-stripe spine band.
 * Clicking a cassette flips it A→B / B→A with a 3D rotateY transform.
 * A tape-stripe bar runs across the top as a decorative structure.
 *
 * Token fidelity (ref-004):
 *   Colors  : #111111, #F2EAD3, #FF7A00, #E8332A, #C41E7A, #FFC400, #00B3B0
 *   Borders : hard-edged cassette windows, no rounded corners
 *   Elevation: flat 2D mechanical; depth from overlapping stripes/layers
 *   Typography: bold uppercase sans-serif, mode-label acronyms
 */

/** @param {object} entry  @param {HTMLElement} stageEl */
export function mount(entry, stageEl) {
  const tokens = entry.design_tokens ?? {};
  const colors = tokens.dominant_colors ?? [];

  const bg      = colors[0] ?? '#111111';
  const cream   = colors[1] ?? '#F2EAD3';
  const stripes = colors.slice(2).length ? colors.slice(2) : ['#FF7A00','#E8332A','#C41E7A','#FFC400','#00B3B0'];

  const cassettes = buildCassetteData(stripes, cream, bg);
  stageEl.innerHTML = buildStageHtml(cassettes, stripes, bg, cream);
  attachInteractions(stageEl);
}

// ── Data ──────────────────────────────────────────────────────────────────────

function buildCassetteData(stripes, cream, bg) {
  const defs = [
    { label: 'VISUAL MEDIA', acronym: 'VM', sideA: 'Brand Identity', sideB: 'Motion Design' },
    { label: 'AUDIO/BRAND',  acronym: 'AB', sideA: 'Sonic Logo',     sideB: 'Sound Design'  },
    { label: 'STRATEGY',     acronym: 'S',  sideA: 'Campaign Plan',  sideB: 'Market Research'},
    { label: 'SOUND DESIGN', acronym: 'SD', sideA: 'Foley Pack',     sideB: 'Mix Master'    },
    { label: 'ARCHIVE',      acronym: 'AX', sideA: 'Past Projects',  sideB: 'Demo Reel'     },
  ];

  return defs.map((d, i) => ({
    ...d,
    id:         i,
    color:      stripes[i % stripes.length],
    cream,
    bg,
    textColor:  needsDarkText(stripes[i % stripes.length]) ? '#000' : '#fff',
    showingB:   false,
  }));
}

// ── HTML ──────────────────────────────────────────────────────────────────────

function buildStageHtml(cassettes, stripes, bg, cream) {
  const stripeBarHtml = stripes.map(c =>
    `<div style="flex:1;height:100%;background:${c};"></div>`).join('');

  const cassettesHtml = cassettes.map(c => buildCassetteHtml(c)).join('');

  return `
    <style>
      .ct-scene       { display:flex; flex-direction:column; width:100%; }
      .ct-label       { font-size:.6875rem; font-weight:700; letter-spacing:.1em;
                        text-transform:uppercase; color:var(--text-muted); margin-bottom:14px; }

      /* Stripe bar */
      .ct-stripe-bar  { display:flex; height:8px; width:100%; margin-bottom:20px; }

      /* Cassette rack */
      .ct-rack        { display:flex; gap:10px; flex-wrap:wrap; justify-content:center; }

      /* Individual cassette */
      .ct-cassette    {
        width:132px; perspective:600px; cursor:pointer;
        outline:none;
      }
      .ct-cassette:focus-visible .ct-cassette__inner {
        outline:2px solid var(--border-focus); outline-offset:3px;
      }

      .ct-cassette__inner {
        position:relative; width:100%; height:170px;
        transition:transform 0.5s cubic-bezier(.4,.0,.2,1);
        transform-style:preserve-3d;
      }
      .ct-cassette__inner.is-flipped { transform:rotateY(180deg); }

      .ct-cassette__face {
        position:absolute; inset:0;
        backface-visibility:hidden;
        display:flex; flex-direction:column;
        border:2px solid ${bg};
      }

      .ct-cassette__face--back {
        transform:rotateY(180deg);
      }

      /* Shell */
      .ct-shell       { background:${bg}; flex:1; display:flex; flex-direction:column;
                        align-items:center; justify-content:center; padding:6px; gap:4px; }

      /* Spool window */
      .ct-spool-win   {
        width:90%; height:36px; background:${cream}11;
        border:1px solid rgba(255,255,255,.12);
        display:flex; align-items:center; justify-content:space-around;
        position:relative;
      }
      .ct-spool {
        width:18px; height:18px; border-radius:50%;
        border:2px solid rgba(255,255,255,.25);
        background:transparent;
        position:relative;
      }
      .ct-spool::after {
        content:''; position:absolute; inset:5px;
        border-radius:50%; background:rgba(255,255,255,.12);
      }
      .ct-tape-line {
        position:absolute; top:50%; left:22px; right:22px;
        height:1px; background:rgba(255,255,255,.12);
      }

      /* Acronym */
      .ct-acronym     {
        font-size:.5rem; font-weight:900; letter-spacing:.2em;
        color:rgba(255,255,255,.35);
      }

      /* Label strip */
      .ct-label-strip {
        padding:6px 8px; display:flex; flex-direction:column;
        gap:2px; align-items:center; justify-content:center;
        min-height:52px;
      }
      .ct-label-title {
        font-size:.5625rem; font-weight:900; letter-spacing:.14em;
        text-transform:uppercase; text-align:center; line-height:1.3;
      }
      .ct-label-side  {
        font-size:.5rem; font-weight:600; letter-spacing:.08em;
        opacity:.7;
      }

      /* Spine stripe */
      .ct-spine       { height:6px; width:100%; flex-shrink:0; }

      /* Flip hint */
      .ct-flip-hint   {
        position:absolute; bottom:4px; right:6px;
        font-size:.5rem; opacity:.4; color:${cream};
        pointer-events:none;
      }

      .ct-hint { font-size:.6875rem; color:var(--text-muted);
                 margin-top:16px; font-style:italic; text-align:center; }

      /* Spool spin animation on hover */
      @keyframes spool-spin { to { transform:rotate(360deg); } }
      .ct-cassette:hover .ct-spool { animation:spool-spin 1.5s linear infinite; }
    </style>

    <div class="ct-scene">
      <p class="ct-label">Interactive Metaphor Preview — Cassette Deck Navigation</p>
      <div class="ct-stripe-bar">${stripeBarHtml}</div>
      <div class="ct-rack" id="ct-rack">${cassettesHtml}</div>
      <p class="ct-hint">↑ Hover to spin reels · Click to flip A/B side</p>
    </div>`;
}

function buildCassetteHtml(c) {
  // Side A face
  const sideA = buildFaceHtml(c, 'A', c.sideA, false);
  // Side B face
  const sideB = buildFaceHtml(c, 'B', c.sideB, true);

  return `
    <div class="ct-cassette" data-cassette-id="${c.id}" tabindex="0"
         role="button" aria-label="Flip ${esc(c.label)} cassette">
      <div class="ct-cassette__inner" id="ct-inner-${c.id}">
        ${sideA}
        ${sideB}
      </div>
    </div>`;
}

function buildFaceHtml(c, side, content, isBack) {
  const faceClass = isBack ? 'ct-cassette__face ct-cassette__face--back' : 'ct-cassette__face';

  return `
    <div class="${faceClass}">
      <div class="ct-shell">
        <div class="ct-spool-win">
          <div class="ct-spool"></div>
          <div class="ct-tape-line"></div>
          <div class="ct-spool"></div>
        </div>
        <span class="ct-acronym">${esc(c.acronym)}</span>
        <span class="ct-flip-hint">SIDE ${side}</span>
      </div>
      <div class="ct-label-strip" style="background:${c.color}; color:${c.textColor};">
        <span class="ct-label-title">${esc(c.label)}</span>
        <span class="ct-label-side">${esc(content)}</span>
      </div>
      <div class="ct-spine" style="background:${c.color};"></div>
    </div>`;
}

// ── Interactions ──────────────────────────────────────────────────────────────

function attachInteractions(stageEl) {
  const rack = stageEl.querySelector('#ct-rack');
  if (!rack) return;

  rack.addEventListener('click', e => {
    const cassette = e.target.closest('.ct-cassette');
    if (!cassette) return;
    const id = cassette.dataset.cassetteId;
    const inner = stageEl.querySelector(`#ct-inner-${id}`);
    if (inner) inner.classList.toggle('is-flipped');
  });

  rack.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.target.closest('.ct-cassette')?.click();
    }
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

