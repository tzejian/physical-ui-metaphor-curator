/**
 * previews/ref-010-vintage-desk.js
 *
 * Interactive metaphor preview for ref-010: Silicon & Sepia —
 * The Vintage Desk Writing Environment.
 *
 * Abstraction level: Retro-tactile modern / flat-skeuomorphic.
 * Technique: A tactile writer's desk composition. Scattered papers and polaroids
 * lie rotated across a walnut desk surface. Clicking the brass desk lamp switches
 * ambient spotlight illumination (physical light/dark mode). Clicking any document
 * lifts it toward the viewer into an editorial reader with drop-caps.
 * Clicking the tea cup sips and drains the session indicator.
 *
 * Token fidelity (ref-010):
 *   Colors   : #2B2218 (walnut desk), #E9DCC3 (cream paper), #B5442E (rust wax/stamp), #4A6741 (sage lamp shade), #D9A441 (brass/light)
 *   Borders  : photo white borders, deckle paper edges, 2-8° rotation on props
 *   Elevation: 3D-transformed layered props with soft directional shadows
 *   Typography: drop-cap editorial serif reader, typewriter annotations
 */

/** @param {object} entry  @param {HTMLElement} stageEl */
export function mount(entry, stageEl) {
  const tokens = entry.design_tokens ?? {};
  const colors = tokens.dominant_colors ?? ['#2B2218', '#E9DCC3', '#B5442E', '#4A6741', '#D9A441'];

  const walnut = colors[0] ?? '#2B2218';
  const paper  = colors[1] ?? '#E9DCC3';
  const rust   = colors[2] ?? '#B5442E';
  const sage   = colors[3] ?? '#4A6741';
  const brass  = colors[4] ?? '#D9A441';

  stageEl.innerHTML = buildStageHtml(walnut, paper, rust, sage, brass);
  attachInteractions(stageEl, walnut, paper, rust, sage, brass);
}

// ── Desk Items ────────────────────────────────────────────────────────────────

const PAPERS = [
  {
    id: 'draft-01',
    title: 'On the Mechanics of Tactile Web',
    type: 'ESSAY',
    snippet: 'Physical affordances provide immediate spatial intuition. When pixels borrow the weight of paper and wood, digital interactions gain visceral memory.',
    rotation: -4,
    x: 40,
    y: 35
  },
  {
    id: 'draft-02',
    title: 'Autumn Field Notes (1994)',
    type: 'DISPATCH',
    snippet: 'The morning mist clings to the valley floor. Typewriters chatter rhythmically across drafting desks as the season turns.',
    rotation: 5,
    x: 180,
    y: 20
  },
  {
    id: 'polaroid-01',
    title: 'Archive No. 7',
    type: 'PHOTO',
    caption: 'STUDIO DAWN · NOV 8',
    rotation: -7,
    x: 320,
    y: 45
  }
];

// ── HTML ──────────────────────────────────────────────────────────────────────

function buildStageHtml(walnut, paper, rust, sage, brass) {
  return `
    <style>
      .vd-scene {
        display: flex;
        flex-direction: column;
        width: 100%;
        font-family: var(--font-sans);
        user-select: none;
      }
      .vd-label {
        font-size: .6875rem;
        font-weight: 700;
        letter-spacing: .1em;
        text-transform: uppercase;
        color: var(--text-muted);
        margin-bottom: 14px;
      }

      /* Desk mat & wooden surface */
      .vd-desk {
        position: relative;
        width: 100%;
        min-height: 340px;
        background: ${walnut};
        border-radius: 8px;
        border: 3px solid #1c150e;
        overflow: hidden;
        box-shadow: inset 0 0 60px rgba(0,0,0,.6), 0 10px 30px rgba(0,0,0,.5);
        transition: background .4s ease;
      }

      /* Ambient light spotlight from the lamp */
      .vd-light-cone {
        position: absolute;
        top: -60px;
        right: 40px;
        width: 440px;
        height: 440px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(217, 164, 65, 0.28) 0%, rgba(217, 164, 65, 0.08) 50%, transparent 75%);
        pointer-events: none;
        transition: opacity .4s ease;
        mix-blend-mode: screen;
        z-index: 1;
      }
      .vd-desk.is-dark .vd-light-cone {
        opacity: 0;
      }

      /* Lamp fixture in top-right */
      .vd-lamp {
        position: absolute;
        top: 14px;
        right: 24px;
        display: flex;
        flex-direction: column;
        align-items: center;
        z-index: 5;
        cursor: pointer;
      }
      .vd-lamp-shade {
        width: 46px;
        height: 28px;
        background: ${sage};
        border-radius: 20px 20px 4px 4px;
        border: 2px solid #233420;
        box-shadow: 0 4px 10px rgba(0,0,0,.5), inset 0 2px 4px rgba(255,255,255,.2);
      }
      .vd-lamp-neck {
        width: 5px;
        height: 18px;
        background: ${brass};
        border: 1px solid #73541b;
      }
      .vd-lamp-base {
        width: 32px;
        height: 8px;
        background: ${brass};
        border-radius: 4px;
        border: 1px solid #73541b;
      }
      .vd-lamp-switch-pill {
        margin-top: 6px;
        font-family: var(--font-mono);
        font-size: .5625rem;
        font-weight: 700;
        padding: 2px 6px;
        border-radius: 3px;
        background: rgba(0,0,0,.5);
        color: ${brass};
        border: 1px solid ${brass}66;
        transition: all .2s;
      }
      .vd-lamp:hover .vd-lamp-switch-pill {
        background: ${brass};
        color: #000;
      }

      /* Tea Cup Session Indicator */
      .vd-teacup-station {
        position: absolute;
        bottom: 20px;
        left: 24px;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 4;
        cursor: pointer;
      }
      .vd-teacup {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: #fdfaf4;
        border: 3px solid #ccc;
        box-shadow: 0 4px 12px rgba(0,0,0,.4);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      }
      .vd-tea-liquid {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: #8b4513;
        transition: transform .3s ease, opacity .3s;
      }
      .vd-teacup-legend {
        font-family: var(--font-mono);
        font-size: .5625rem;
        color: rgba(255,255,255,.5);
        letter-spacing: .06em;
      }

      /* Scattered Documents */
      .vd-item {
        position: absolute;
        cursor: pointer;
        transition: transform .22s cubic-bezier(.2, .8, .2, 1), box-shadow .22s;
        z-index: 2;
      }
      .vd-item:hover {
        transform: translateY(-8px) scale(1.03) !important;
        box-shadow: 0 16px 28px rgba(0,0,0,.5) !important;
        z-index: 10 !important;
      }

      /* Paper manuscript item */
      .vd-paper {
        width: 145px;
        background: ${paper};
        color: #2b2218;
        padding: 14px 12px;
        border-radius: 2px;
        box-shadow: 0 4px 14px rgba(0,0,0,.4);
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .vd-paper-badge {
        font-family: var(--font-mono);
        font-size: .5rem;
        font-weight: 700;
        letter-spacing: .12em;
        color: ${rust};
        border-bottom: 1px solid rgba(0,0,0,.15);
        padding-bottom: 3px;
      }
      .vd-paper-title {
        font-family: 'Georgia', serif;
        font-size: .75rem;
        font-weight: 700;
        line-height: 1.3;
      }
      .vd-paper-lines {
        display: flex;
        flex-direction: column;
        gap: 3px;
        opacity: .4;
      }
      .vd-paper-line {
        height: 3px;
        background: #2b2218;
        border-radius: 1px;
      }

      /* Polaroid item */
      .vd-polaroid {
        width: 110px;
        background: #fff;
        padding: 8px 8px 20px;
        box-shadow: 0 4px 14px rgba(0,0,0,.45);
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .vd-polaroid-photo {
        width: 100%;
        height: 80px;
        background: #44372c;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.25rem;
      }
      .vd-polaroid-caption {
        font-family: var(--font-mono);
        font-size: .4375rem;
        font-weight: 600;
        color: #666;
        text-align: center;
        letter-spacing: .06em;
      }

      /* ── Document Reader Modal / Sheet Lift ── */
      .vd-reader-drawer {
        position: absolute;
        inset: 12px;
        background: ${paper};
        color: #2b2218;
        border-radius: 6px;
        padding: 24px;
        box-shadow: 0 16px 40px rgba(0,0,0,.7);
        z-index: 20;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        opacity: 0;
        pointer-events: none;
        transform: translateY(20px) scale(.97);
        transition: all .25s cubic-bezier(.2, .8, .2, 1);
      }
      .vd-reader-drawer.is-open {
        opacity: 1;
        pointer-events: auto;
        transform: translateY(0) scale(1);
      }
      .vd-reader-header {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        border-bottom: 2px solid ${rust};
        padding-bottom: 8px;
      }
      .vd-reader-title {
        font-family: 'Georgia', serif;
        font-size: 1.125rem;
        font-weight: 700;
      }
      .vd-reader-close {
        background: transparent;
        border: 1px solid #777;
        font-size: .6875rem;
        font-family: var(--font-mono);
        font-weight: 700;
        padding: 2px 8px;
        cursor: pointer;
        border-radius: 3px;
      }
      .vd-reader-body {
        font-family: 'Georgia', serif;
        font-size: .875rem;
        line-height: 1.65;
        margin: 12px 0;
        color: #222;
      }
      .vd-drop-cap {
        float: left;
        font-size: 2.8rem;
        line-height: .8;
        font-weight: 700;
        margin-right: 8px;
        color: ${rust};
      }
      .vd-reader-footer {
        font-family: var(--font-mono);
        font-size: .625rem;
        color: #666;
        border-top: 1px dashed rgba(0,0,0,.2);
        padding-top: 6px;
      }

      .vd-hint {
        font-size: .6875rem;
        color: var(--text-muted);
        margin-top: 14px;
        font-style: italic;
      }
    </style>

    <div class="vd-scene">
      <p class="vd-label">Interactive Metaphor Preview — The Vintage Desk Writing Environment</p>

      <div class="vd-desk" id="vd-desk">
        <div class="vd-light-cone"></div>

        <!-- Desk Lamp -->
        <div class="vd-lamp" id="vd-lamp" role="button" tabindex="0" aria-label="Toggle desk lamp">
          <div class="vd-lamp-shade"></div>
          <div class="vd-lamp-neck"></div>
          <div class="vd-lamp-base"></div>
          <span class="vd-lamp-switch-pill" id="vd-lamp-status">LAMP ON</span>
        </div>

        <!-- Scattered Document 1 -->
        <div
          class="vd-item vd-paper"
          id="vd-item-0"
          style="left:${PAPERS[0].x}px; top:${PAPERS[0].y}px; transform: rotate(${PAPERS[0].rotation}deg);"
          role="button"
          tabindex="0"
          data-idx="0"
        >
          <div class="vd-paper-badge">DISPATCH // ESSAY</div>
          <div class="vd-paper-title">${PAPERS[0].title}</div>
          <div class="vd-paper-lines">
            <div class="vd-paper-line" style="width:100%;"></div>
            <div class="vd-paper-line" style="width:85%;"></div>
            <div class="vd-paper-line" style="width:70%;"></div>
          </div>
        </div>

        <!-- Scattered Document 2 -->
        <div
          class="vd-item vd-paper"
          id="vd-item-1"
          style="left:${PAPERS[1].x}px; top:${PAPERS[1].y}px; transform: rotate(${PAPERS[1].rotation}deg);"
          role="button"
          tabindex="0"
          data-idx="1"
        >
          <div class="vd-paper-badge">FIELD NOTES // ARCHIVE</div>
          <div class="vd-paper-title">${PAPERS[1].title}</div>
          <div class="vd-paper-lines">
            <div class="vd-paper-line" style="width:90%;"></div>
            <div class="vd-paper-line" style="width:95%;"></div>
            <div class="vd-paper-line" style="width:60%;"></div>
          </div>
        </div>

        <!-- Polaroid Print -->
        <div
          class="vd-item vd-polaroid"
          id="vd-item-2"
          style="left:${PAPERS[2].x}px; top:${PAPERS[2].y}px; transform: rotate(${PAPERS[2].rotation}deg);"
          role="button"
          tabindex="0"
          data-idx="2"
        >
          <div class="vd-polaroid-photo">📷</div>
          <div class="vd-polaroid-caption">${PAPERS[2].caption}</div>
        </div>

        <!-- Tea cup -->
        <div class="vd-teacup-station" id="vd-teacup" role="button" tabindex="0" aria-label="Sip tea session indicator">
          <div class="vd-teacup">
            <div class="vd-tea-liquid" id="vd-tea-liquid"></div>
          </div>
          <span class="vd-teacup-legend" id="vd-tea-legend">HOT TEA · 100%</span>
        </div>

        <!-- Document Reader Drawer -->
        <div class="vd-reader-drawer" id="vd-reader">
          <div class="vd-reader-header">
            <span class="vd-reader-title" id="vd-reader-title">Document Title</span>
            <button class="vd-reader-close" id="vd-reader-close">CLOSE [ESC]</button>
          </div>
          <div class="vd-reader-body" id="vd-reader-body">
            <span class="vd-drop-cap" id="vd-reader-drop">P</span>
            <span id="vd-reader-text">Text content...</span>
          </div>
          <div class="vd-reader-footer">
            SILICON & SEPIA JOURNAL · ARCHIVAL REFERENCE SYSTEM
          </div>
        </div>
      </div>

      <p class="vd-hint">↑ Click desk lamp to toggle ambient lighting · Click papers to read drop-cap manuscripts · Click tea cup to sip</p>
    </div>
  `;
}

// ── Interactions ──────────────────────────────────────────────────────────────

function attachInteractions(stageEl, walnut, paper, rust, sage, brass) {
  const desk        = stageEl.querySelector('#vd-desk');
  const lamp        = stageEl.querySelector('#vd-lamp');
  const lampStatus  = stageEl.querySelector('#vd-lamp-status');
  const teacup      = stageEl.querySelector('#vd-teacup');
  const teaLiquid   = stageEl.querySelector('#vd-tea-liquid');
  const teaLegend   = stageEl.querySelector('#vd-tea-legend');
  const reader      = stageEl.querySelector('#vd-reader');
  const readerTitle = stageEl.querySelector('#vd-reader-title');
  const readerDrop  = stageEl.querySelector('#vd-reader-drop');
  const readerText  = stageEl.querySelector('#vd-reader-text');
  const readerClose = stageEl.querySelector('#vd-reader-close');
  const items       = stageEl.querySelectorAll('.vd-item');

  let lampLit = true;
  let teaLevel = 100;

  // Toggle Lamp
  function toggleLamp() {
    lampLit = !lampLit;
    desk.classList.toggle('is-dark', !lampLit);
    lampStatus.textContent = lampLit ? 'LAMP ON' : 'LAMP OFF';
    lampStatus.style.color = lampLit ? brass : '#888';
  }
  lamp?.addEventListener('click', toggleLamp);

  // Tea Cup sip
  function sipTea() {
    teaLevel = teaLevel <= 25 ? 100 : teaLevel - 25;
    const scale = teaLevel / 100;
    teaLiquid.style.transform = `scale(${scale})`;
    teaLiquid.style.opacity = scale > 0.3 ? '1' : '0.4';
    teaLegend.textContent = teaLevel === 100 ? 'FRESH CUP · 100%' : `SESSION TEA · ${teaLevel}%`;
  }
  teacup?.addEventListener('click', sipTea);

  // Document reader lift
  function openReader(idx) {
    const item = PAPERS[idx];
    if (!item) return;

    readerTitle.textContent = item.title;
    const firstLetter = item.snippet.charAt(0);
    const restText = item.snippet.slice(1);

    readerDrop.textContent = firstLetter;
    readerText.textContent = restText;
    reader.classList.add('is-open');
  }

  function closeReader() {
    reader.classList.remove('is-open');
  }

  items.forEach(el => {
    el.addEventListener('click', () => {
      openReader(parseInt(el.dataset.idx, 10));
    });
  });

  readerClose?.addEventListener('click', closeReader);

  // Keyboard navigation
  desk.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeReader();
  });
}

