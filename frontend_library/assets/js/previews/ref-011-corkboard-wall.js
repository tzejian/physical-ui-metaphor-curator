/**
 * previews/ref-011-corkboard-wall.js
 *
 * Interactive metaphor preview for ref-011: Silicon & Sepia —
 * The Corkboard Pin Wall.
 *
 * Abstraction level: Retro-tactile modern / flat-skeuomorphic.
 * Technique: A pannable corkboard surface with pinned index cards, polaroids,
 * and push pins. A live radar minimap in the corner reflects the viewport's
 * spatial position relative to the full board. Pinned notes can be dragged,
 * clicked to highlight, or recentered via "Reset View".
 *
 * Token fidelity (ref-011):
 *   Colors   : #C49A6C (corkboard), #7A5230 (wood frame), #E9DCC3 (cream notes), #B5442E (red push-pins), #1A1A1A (dark ink)
 *   Borders  : photo white borders, circular push-pin heads, torn paper edges
 *   Elevation: flat board base with directional drop shadows under pins and cards
 *   Typography: typewriter labels, handwritten accents, small-caps minimap legend
 */

/** @param {object} entry  @param {HTMLElement} stageEl */
export function mount(entry, stageEl) {
  const tokens = entry.design_tokens ?? {};
  const colors = tokens.dominant_colors ?? ['#C49A6C', '#7A5230', '#E9DCC3', '#B5442E', '#1A1A1A'];

  const cork  = colors[0] ?? '#C49A6C';
  const frame = colors[1] ?? '#7A5230';
  const paper = colors[2] ?? '#E9DCC3';
  const pin   = colors[3] ?? '#B5442E';
  const ink   = colors[4] ?? '#1A1A1A';

  stageEl.innerHTML = buildStageHtml(cork, frame, paper, pin, ink);
  attachInteractions(stageEl, cork, frame, paper, pin, ink);
}

// ── Pinned Items ──────────────────────────────────────────────────────────────

const PINS = [
  { id: 'pin-1', type: 'note', title: 'PROJECT BLUEPRINT', text: 'Structure spatial layers by weight and tactile friction.', x: 60, y: 50, rot: -4 },
  { id: 'pin-2', type: 'polaroid', title: 'FIELD SPECIMEN 04', text: 'BROWN LEATHER & BRASS', x: 280, y: 40, rot: 6 },
  { id: 'pin-3', type: 'note', title: 'INTERACTION NOTE', text: 'Minimap provides cognitive anchor across unbounded canvas.', x: 120, y: 190, rot: 3 },
  { id: 'pin-4', type: 'polaroid', title: 'ARCHIVE STACK', text: 'MANILA FOLDERS // 1982', x: 380, y: 180, rot: -5 },
  { id: 'pin-5', type: 'tag', title: 'APPROVED', text: 'VERIFIED AFFORDANCE', x: 260, y: 160, rot: 8 }
];

// ── HTML ──────────────────────────────────────────────────────────────────────

function buildStageHtml(cork, frame, paper, pin, ink) {
  const pinsHtml = PINS.map(item => {
    if (item.type === 'polaroid') {
      return `
        <div class="cb-item cb-polaroid" id="${item.id}" style="left:${item.x}px; top:${item.y}px; transform:rotate(${item.rot}deg);">
          <div class="cb-pushpin" style="background:${pin};"></div>
          <div class="cb-polaroid-photo">📌</div>
          <div class="cb-polaroid-title">${item.title}</div>
          <div class="cb-polaroid-meta">${item.text}</div>
        </div>
      `;
    }
    if (item.type === 'tag') {
      return `
        <div class="cb-item cb-tag" id="${item.id}" style="left:${item.x}px; top:${item.y}px; transform:rotate(${item.rot}deg); background:${pin}; color:#fff;">
          <div class="cb-pushpin" style="background:#fff; border-color:${ink};"></div>
          <span style="font-size:.625rem; font-weight:800; letter-spacing:.1em;">${item.title}</span>
        </div>
      `;
    }
    return `
      <div class="cb-item cb-note" id="${item.id}" style="left:${item.x}px; top:${item.y}px; transform:rotate(${item.rot}deg);">
        <div class="cb-pushpin" style="background:${pin};"></div>
        <div class="cb-note-title">${item.title}</div>
        <div class="cb-note-text">${item.text}</div>
      </div>
    `;
  }).join('');

  return `
    <style>
      .cb-scene {
        display: flex;
        flex-direction: column;
        width: 100%;
        font-family: var(--font-sans);
        user-select: none;
      }
      .cb-label {
        font-size: .6875rem;
        font-weight: 700;
        letter-spacing: .1em;
        text-transform: uppercase;
        color: var(--text-muted);
        margin-bottom: 14px;
      }

      /* Board Frame Viewport */
      .cb-viewport {
        position: relative;
        width: 100%;
        height: 320px;
        border: 10px solid ${frame};
        border-radius: 8px;
        overflow: hidden;
        background: ${cork};
        box-shadow: inset 0 0 40px rgba(0,0,0,.5), 0 8px 24px rgba(0,0,0,.4);
        cursor: grab;
        touch-action: none;
      }
      .cb-viewport:active {
        cursor: grabbing;
      }

      /* Inner Pannable Canvas */
      .cb-canvas {
        position: absolute;
        width: 700px;
        height: 500px;
        top: 0;
        left: 0;
        /* Cork texture dots */
        background-color: ${cork};
        background-image:
          radial-gradient(#9e7448 15%, transparent 16%),
          radial-gradient(#b08556 15%, transparent 16%);
        background-size: 24px 24px;
        background-position: 0 0, 12px 12px;
        transition: transform .05s linear;
      }

      /* Pinned Items */
      .cb-item {
        position: absolute;
        box-shadow: 0 4px 14px rgba(0,0,0,.35);
        cursor: pointer;
        transition: transform .15s, box-shadow .15s;
      }
      .cb-item:hover {
        box-shadow: 0 10px 24px rgba(0,0,0,.5);
        z-index: 10;
      }

      /* Pushpin head */
      .cb-pushpin {
        position: absolute;
        top: -6px;
        left: calc(50% - 6px);
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: 2px solid rgba(0,0,0,.4);
        box-shadow: 0 2px 4px rgba(0,0,0,.4), inset 0 2px 2px rgba(255,255,255,.5);
        z-index: 5;
      }

      /* Note card */
      .cb-note {
        width: 160px;
        background: ${paper};
        color: ${ink};
        padding: 14px 12px;
        border-radius: 2px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .cb-note-title {
        font-family: var(--font-mono);
        font-size: .5625rem;
        font-weight: 700;
        letter-spacing: .1em;
        border-bottom: 1px dashed rgba(0,0,0,.2);
        padding-bottom: 4px;
      }
      .cb-note-text {
        font-family: 'Georgia', serif;
        font-size: .75rem;
        line-height: 1.4;
      }

      /* Polaroid */
      .cb-polaroid {
        width: 130px;
        background: #fff;
        color: ${ink};
        padding: 10px 10px 16px;
        border-radius: 2px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        text-align: center;
      }
      .cb-polaroid-photo {
        width: 100%;
        height: 80px;
        background: #44342a;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
      }
      .cb-polaroid-title {
        font-family: var(--font-mono);
        font-size: .5rem;
        font-weight: 700;
        letter-spacing: .08em;
      }
      .cb-polaroid-meta {
        font-size: .4375rem;
        color: #777;
        font-family: var(--font-mono);
      }

      /* Tag item */
      .cb-tag {
        padding: 6px 12px;
        border-radius: 3px;
        box-shadow: 0 2px 8px rgba(0,0,0,.3);
      }

      /* ── Radar Minimap ── */
      .cb-minimap {
        position: absolute;
        bottom: 12px;
        right: 12px;
        width: 90px;
        height: 65px;
        background: rgba(26, 26, 26, 0.85);
        border: 1.5px solid rgba(255,255,255,.2);
        border-radius: 4px;
        backdrop-filter: blur(4px);
        overflow: hidden;
        z-index: 10;
        cursor: pointer;
      }
      .cb-minimap-header {
        font-family: var(--font-mono);
        font-size: .4375rem;
        font-weight: 700;
        letter-spacing: .1em;
        color: rgba(255,255,255,.6);
        padding: 2px 4px;
        border-bottom: 1px solid rgba(255,255,255,.1);
      }
      .cb-minimap-field {
        position: relative;
        width: 100%;
        height: 50px;
      }
      .cb-radar-dot {
        position: absolute;
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: ${pin};
      }
      .cb-viewport-window {
        position: absolute;
        border: 1.5px solid ${paper};
        background: rgba(233, 220, 195, 0.2);
        pointer-events: none;
        transition: all .05s linear;
      }

      /* Controls */
      .cb-controls-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 10px;
      }
      .cb-btn {
        background: transparent;
        border: 1px solid var(--border-subtle);
        border-radius: 3px;
        color: var(--text-secondary);
        font-family: var(--font-mono);
        font-size: .625rem;
        padding: 4px 10px;
        cursor: pointer;
        transition: all .12s;
      }
      .cb-btn:hover {
        border-color: ${frame};
        color: #fff;
      }

      .cb-hint {
        font-size: .6875rem;
        color: var(--text-muted);
        font-style: italic;
      }
    </style>

    <div class="cb-scene">
      <p class="cb-label">Interactive Metaphor Preview — Corkboard Infinite Pin Wall</p>

      <div class="cb-viewport" id="cb-viewport">
        <!-- Canvas -->
        <div class="cb-canvas" id="cb-canvas">
          ${pinsHtml}
        </div>

        <!-- Radar Minimap -->
        <div class="cb-minimap" id="cb-minimap" title="Click to recenter">
          <div class="cb-minimap-header">RADAR // MAP</div>
          <div class="cb-minimap-field" id="cb-minimap-field">
            <div class="cb-radar-dot" style="left:12px; top:8px;"></div>
            <div class="cb-radar-dot" style="left:38px; top:6px;"></div>
            <div class="cb-radar-dot" style="left:18px; top:25px;"></div>
            <div class="cb-radar-dot" style="left:52px; top:24px;"></div>
            <div class="cb-viewport-window" id="cb-view-rect"></div>
          </div>
        </div>
      </div>

      <div class="cb-controls-bar">
        <button class="cb-btn" id="cb-btn-reset">↺ RECENTER CANVAS</button>
        <span class="cb-hint">Drag anywhere to pan corkboard · Viewport tracks in radar minimap</span>
      </div>
    </div>
  `;
}

// ── Interactions ──────────────────────────────────────────────────────────────

function attachInteractions(stageEl, cork, frame, paper, pin, ink) {
  const viewport  = stageEl.querySelector('#cb-viewport');
  const canvas    = stageEl.querySelector('#cb-canvas');
  const minimap   = stageEl.querySelector('#cb-minimap');
  const viewRect  = stageEl.querySelector('#cb-view-rect');
  const btnReset  = stageEl.querySelector('#cb-btn-reset');

  if (!viewport || !canvas || !viewRect) return;

  const CANVAS_W = 700;
  const CANVAS_H = 500;
  const MINI_FIELD_W = 90;
  const MINI_FIELD_H = 50;

  // Viewport offsets
  let panX = -80;
  let panY = -50;
  let isPanning = false;
  let startX = 0;
  let startY = 0;

  function updateTransform() {
    const vpW = viewport.clientWidth;
    const vpH = viewport.clientHeight;

    // Bounds limit
    const minX = vpW - CANVAS_W;
    const minY = vpH - CANVAS_H;

    panX = Math.min(0, Math.max(minX, panX));
    panY = Math.min(0, Math.max(minY, panY));

    canvas.style.transform = `translate(${panX}px, ${panY}px)`;

    // Update minimap indicator
    const scaleX = MINI_FIELD_W / CANVAS_W;
    const scaleY = MINI_FIELD_H / CANVAS_H;

    const rectW = Math.min(MINI_FIELD_W, vpW * scaleX);
    const rectH = Math.min(MINI_FIELD_H, vpH * scaleY);
    const rectX = Math.abs(panX) * scaleX;
    const rectY = Math.abs(panY) * scaleY;

    viewRect.style.width  = `${rectW}px`;
    viewRect.style.height = `${rectH}px`;
    viewRect.style.left   = `${rectX}px`;
    viewRect.style.top    = `${rectY}px`;
  }

  viewport.addEventListener('pointerdown', e => {
    if (e.target.closest('#cb-minimap') || e.target.closest('.cb-item')) return;
    isPanning = true;
    startX = e.clientX - panX;
    startY = e.clientY - panY;
    viewport.setPointerCapture(e.pointerId);
  });

  viewport.addEventListener('pointermove', e => {
    if (!isPanning) return;
    panX = e.clientX - startX;
    panY = e.clientY - startY;
    updateTransform();
  });

  function stopPan() {
    isPanning = false;
  }
  viewport.addEventListener('pointerup', stopPan);
  viewport.addEventListener('pointercancel', stopPan);

  // Recenter button
  btnReset?.addEventListener('click', () => {
    panX = -80;
    panY = -50;
    updateTransform();
  });

  // Minimap click to pan
  minimap?.addEventListener('click', e => {
    const rect = minimap.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const targetFractionX = clickX / MINI_FIELD_W;
    const targetFractionY = clickY / MINI_FIELD_H;

    panX = -(targetFractionX * CANVAS_W - viewport.clientWidth / 2);
    panY = -(targetFractionY * CANVAS_H - viewport.clientHeight / 2);
    updateTransform();
  });

  // Resize listener
  window.addEventListener('resize', updateTransform);

  // Initial draw
  updateTransform();
}

