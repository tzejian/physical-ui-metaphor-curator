/**
 * previews/ref-017-pull-cord-detent.js
 *
 * Interactive metaphor preview for ref-017: Tactile UI Pull-Cord Bulb —
 * Detent & Snap Toggle Component.
 *
 * Abstraction level: Industrial hardware / flat-skeuomorphic.
 * Technique: A precision pull-cord switch engineered with a true force-displacement
 * detent curve. Pulling down the acorn knob encounters elastic resistance and pointer lag.
 * Releasing before the trip point causes the lamp to tilt and spring back (incomplete pull).
 * Dragging past the detent point triggers a sudden force drop and crisp mechanical snap,
 * heating the filament from dull red (1800K) to luminous incandescent amber (2700K).
 *
 * Token fidelity (ref-017):
 *   Colors   : #181818 (graphite ceiling mount), #F5F1E8 (cream wall), #FFB65C (warm 2700K filament), #8A8A8A (cord & acorn), #C8102E (dull filament / trip point)
 *   Borders  : Spun-dome shade silhouette, acorn knob, glass bulb contour
 *   Elevation: Light-direction-aware highlights and pooled radial glow
 *   Typography: Minimal functional component telemetry
 */

/** @param {object} entry  @param {HTMLElement} stageEl */
export function mount(entry, stageEl) {
  const tokens = entry.design_tokens ?? {};
  const colors = tokens.dominant_colors ?? ['#181818', '#F5F1E8', '#FFB65C', '#8A8A8A', '#C8102E'];

  const graphite = colors[0] ?? '#181818';
  const cream    = colors[1] ?? '#F5F1E8';
  const amber    = colors[2] ?? '#FFB65C';
  const grey     = colors[3] ?? '#8A8A8A';
  const redDetent= colors[4] ?? '#C8102E';

  stageEl.innerHTML = buildStageHtml(graphite, cream, amber, grey, redDetent);
  attachInteractions(stageEl, graphite, cream, amber, grey, redDetent);
}

// ── HTML ──────────────────────────────────────────────────────────────────────

function buildStageHtml(graphite, cream, amber, grey, redDetent) {
  return `
    <style>
      .tc-scene {
        display: flex;
        flex-direction: column;
        width: 100%;
        font-family: var(--font-sans);
        user-select: none;
      }
      .tc-label {
        font-size: .6875rem;
        font-weight: 700;
        letter-spacing: .12em;
        text-transform: uppercase;
        color: var(--text-muted);
        margin-bottom: 14px;
        display: flex;
        justify-content: space-between;
      }

      /* Workshop Stage Area */
      .tc-bench {
        position: relative;
        width: 100%;
        min-height: 380px;
        background: #121316;
        border-radius: 8px;
        border: 2px solid #23252a;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        padding: 0 24px 20px;
        box-sizing: border-box;
        box-shadow: 0 16px 40px rgba(0,0,0,.6);
      }

      /* Ceiling Mount */
      .tc-ceiling-mount {
        width: 80px;
        height: 12px;
        background: ${graphite};
        border-radius: 0 0 4px 4px;
        border-bottom: 2px solid #2a2a2e;
        position: relative;
        z-index: 5;
      }

      /* Pendant Lamp Assembly */
      .tc-lamp-assembly {
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
        transform-origin: top center;
        transition: transform .25s ease-out;
        z-index: 4;
      }

      .tc-fixture-wire {
        width: 3px;
        height: 40px;
        background: #333;
      }

      /* Spun-dome industrial shade */
      .tc-shade {
        width: 110px;
        height: 48px;
        background: linear-gradient(180deg, #2a2b30 0%, ${graphite} 100%);
        border-radius: 55px 55px 4px 4px;
        border: 2px solid #3c3d44;
        box-shadow: 0 4px 12px rgba(0,0,0,.5);
        position: relative;
      }

      /* Edison Filament Bulb */
      .tc-bulb-globe {
        width: 42px;
        height: 52px;
        border-radius: 50% 50% 40% 40%;
        background: rgba(255,255,255,.06);
        border: 1.5px solid rgba(255,255,255,.2);
        margin-top: -8px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        position: relative;
        overflow: hidden;
        transition: all .4s cubic-bezier(.4, 0, .2, 1);
      }
      .tc-bulb-globe.is-lit {
        background: radial-gradient(circle at center, rgba(255, 182, 92, 0.35) 0%, rgba(255, 182, 92, 0.08) 70%, transparent 100%);
        border-color: ${amber};
        box-shadow: 0 0 35px 12px ${amber}66, inset 0 0 15px ${amber}88;
      }

      /* Internal Tungsten Filament */
      .tc-filament {
        width: 14px;
        height: 20px;
        border: 2px solid #443224;
        border-bottom: none;
        border-radius: 6px 6px 0 0;
        transition: all .35s ease;
      }
      .tc-bulb-globe.is-lit .tc-filament {
        border-color: #fff;
        box-shadow: 0 0 12px #fff, 0 0 20px ${amber};
      }

      /* ── The Force-Detent Pull Cord & Acorn ── */
      .tc-cord-station {
        position: absolute;
        top: 86px;
        right: 18px;
        display: flex;
        flex-direction: column;
        align-items: center;
        z-index: 6;
      }

      .tc-cord-line {
        width: 2px;
        height: 60px;
        background: repeating-linear-gradient(
          to bottom,
          ${grey} 0px,
          ${grey} 2px,
          transparent 2px,
          transparent 4px
        );
        transform-origin: top center;
      }

      .tc-acorn {
        width: 14px;
        height: 22px;
        background: ${grey};
        border-radius: 4px 4px 10px 10px;
        border: 1.5px solid #4a4a4f;
        box-shadow: 0 3px 6px rgba(0,0,0,.5);
        cursor: grab;
        touch-action: none;
        position: relative;
        transition: transform .05s linear;
      }
      .tc-acorn:active {
        cursor: grabbing;
      }
      .tc-acorn.is-snapped {
        background: ${amber};
        box-shadow: 0 0 10px ${amber};
      }

      /* Ambient Light Pool from the Bulb */
      .tc-ambient-pool {
        position: absolute;
        bottom: -40px;
        width: 480px;
        height: 220px;
        border-radius: 50%;
        background: radial-gradient(ellipse, rgba(255, 182, 92, 0.45) 0%, rgba(255, 182, 92, 0.1) 50%, transparent 75%);
        pointer-events: none;
        opacity: 0;
        transition: opacity .5s;
        mix-blend-mode: screen;
        z-index: 1;
      }
      .tc-ambient-pool.is-lit {
        opacity: 1;
      }

      /* Telemetry / Detent Force HUD */
      .tc-hud-panel {
        width: 100%;
        max-width: 440px;
        background: rgba(20,21,25,.85);
        border: 1px solid rgba(255,255,255,.08);
        border-radius: 6px;
        padding: 10px 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        z-index: 5;
        font-family: var(--font-mono);
      }
      .tc-hud-col {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .tc-hud-label {
        font-size: .5rem;
        letter-spacing: .12em;
        text-transform: uppercase;
        color: rgba(255,255,255,.4);
      }
      .tc-hud-val {
        font-size: .75rem;
        font-weight: 700;
        color: #fff;
      }

      /* Detent Force Bar */
      .tc-force-bar-track {
        width: 110px;
        height: 6px;
        background: #25262c;
        border-radius: 3px;
        overflow: hidden;
        position: relative;
      }
      .tc-force-bar-fill {
        height: 100%;
        width: 0%;
        background: ${grey};
        border-radius: 3px;
        transition: width .05s linear, background .15s;
      }
      .tc-force-detent-marker {
        position: absolute;
        left: 70%;
        top: 0;
        bottom: 0;
        width: 2px;
        background: ${redDetent};
      }

      .tc-hint {
        font-size: .6875rem;
        color: var(--text-muted);
        margin-top: 14px;
        font-style: italic;
      }
    </style>

    <div class="tc-scene">
      <div class="tc-label">
        <span>Interactive Metaphor Preview — Tactile UI Pull-Cord Detent Component</span>
        <span id="tc-state-tag" style="color:${grey}; font-family:var(--font-mono); font-size:.625rem;">STATE: OFF (COLD)</span>
      </div>

      <div class="tc-bench" id="tc-bench">
        <div class="tc-ceiling-mount"></div>

        <!-- Hanging Lamp Unit -->
        <div class="tc-lamp-assembly" id="tc-lamp">
          <div class="tc-fixture-wire"></div>
          <div class="tc-shade"></div>
          <div class="tc-bulb-globe" id="tc-bulb">
            <div class="tc-filament"></div>
          </div>

          <!-- Pull Cord with Acorn Knob -->
          <div class="tc-cord-station">
            <div class="tc-cord-line" id="tc-cord"></div>
            <div
              class="tc-acorn"
              id="tc-acorn"
              role="slider"
              tabindex="0"
              aria-label="Pull cord switch with force detent"
              aria-valuenow="0"
            ></div>
          </div>
        </div>

        <div class="tc-ambient-pool" id="tc-pool"></div>

        <!-- Force Detent Telemetry HUD -->
        <div class="tc-hud-panel">
          <div class="tc-hud-col">
            <span class="tc-hud-label">DETENT TRAVEL</span>
            <span class="tc-hud-val" id="tc-disp-val">0.0 mm</span>
          </div>

          <div class="tc-hud-col">
            <span class="tc-hud-label">FORCE CURVE // TRIP @ 70%</span>
            <div class="tc-force-bar-track">
              <div class="tc-force-detent-marker" title="Detent Trip Point"></div>
              <div class="tc-force-bar-fill" id="tc-force-fill"></div>
            </div>
          </div>

          <div class="tc-hud-col" style="text-align:right;">
            <span class="tc-hud-label">TEMP // KELVIN</span>
            <span class="tc-hud-val" id="tc-temp-val">COLD</span>
          </div>
        </div>
      </div>

      <div class="tc-hint">
        ↑ Drag acorn knob downward · Pulling past red detent trips switch with force-drop snap · Releasing early springs back
      </div>
    </div>
  `;
}

// ── Interactions ──────────────────────────────────────────────────────────────

function attachInteractions(stageEl, graphite, cream, amber, grey, redDetent) {
  const acorn     = stageEl.querySelector('#tc-acorn');
  const cord      = stageEl.querySelector('#tc-cord');
  const bulb      = stageEl.querySelector('#tc-bulb');
  const pool      = stageEl.querySelector('#tc-pool');
  const lamp      = stageEl.querySelector('#tc-lamp');
  const forceFill = stageEl.querySelector('#tc-force-fill');
  const dispVal   = stageEl.querySelector('#tc-disp-val');
  const tempVal   = stageEl.querySelector('#tc-temp-val');
  const stateTag  = stageEl.querySelector('#tc-state-tag');

  const DETENT_THRESHOLD = 42; // px drag to trip
  const MAX_DRAG = 60;

  let isLit = false;
  let isDragging = false;
  let startY = 0;
  let currentY = 0;
  let hasSnapped = false;

  function updateVisuals(dragPx) {
    // Pointer lag formula: drag resistance before detent
    const lagFraction = Math.pow(Math.min(1, dragPx / DETENT_THRESHOLD), 0.85);
    const renderY = dragPx * 0.8;

    acorn.style.transform = `translateY(${renderY}px)`;
    cord.style.height = `${60 + renderY}px`;

    // Lamp tilts slightly towards cord pull
    const tilt = (dragPx / DETENT_THRESHOLD) * 2.5;
    lamp.style.transform = `rotate(${-tilt}deg)`;

    // HUD update
    const percent = Math.min(100, Math.round((dragPx / DETENT_THRESHOLD) * 70));
    forceFill.style.width = `${percent}%`;
    forceFill.style.background = dragPx >= DETENT_THRESHOLD ? amber : (percent > 50 ? redDetent : grey);
    dispVal.textContent = `${(dragPx * 0.4).toFixed(1)} mm`;

    // Snap trigger
    if (dragPx >= DETENT_THRESHOLD && !hasSnapped) {
      hasSnapped = true;
      acorn.classList.add('is-snapped');
      triggerSnap();
    }
  }

  function triggerSnap() {
    isLit = !isLit;
    bulb.classList.toggle('is-lit', isLit);
    pool.classList.toggle('is-lit', isLit);

    if (isLit) {
      tempVal.textContent = '2700K (WARM)';
      tempVal.style.color = amber;
      stateTag.textContent = 'STATE: ON (2700K INCANDESCENT)';
      stateTag.style.color = amber;
    } else {
      tempVal.textContent = 'COLD';
      tempVal.style.color = '#fff';
      stateTag.textContent = 'STATE: OFF (COLD)';
      stateTag.style.color = grey;
    }
  }

  function resetCord() {
    acorn.style.transition = 'transform .22s cubic-bezier(.34, 1.56, .64, 1)';
    cord.style.transition = 'height .22s cubic-bezier(.34, 1.56, .64, 1)';
    lamp.style.transition = 'transform .3s cubic-bezier(.34, 1.56, .64, 1)';

    acorn.style.transform = 'translateY(0)';
    cord.style.height = '60px';
    lamp.style.transform = 'rotate(0deg)';
    acorn.classList.remove('is-snapped');

    forceFill.style.width = '0%';
    dispVal.textContent = '0.0 mm';
    hasSnapped = false;

    setTimeout(() => {
      acorn.style.transition = '';
      cord.style.transition = '';
      lamp.style.transition = '';
    }, 250);
  }

  // Pointer drag events
  acorn?.addEventListener('pointerdown', e => {
    isDragging = true;
    startY = e.clientY;
    currentY = 0;
    acorn.setPointerCapture(e.pointerId);
    e.preventDefault();
  });

  acorn?.addEventListener('pointermove', e => {
    if (!isDragging) return;
    const dy = Math.max(0, Math.min(MAX_DRAG, e.clientY - startY));
    currentY = dy;
    updateVisuals(dy);
  });

  function stopDrag() {
    if (!isDragging) return;
    isDragging = false;
    resetCord();
  }

  acorn?.addEventListener('pointerup', stopDrag);
  acorn?.addEventListener('pointercancel', stopDrag);

  // Click / Keyboard support
  acorn?.addEventListener('keydown', e => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      updateVisuals(DETENT_THRESHOLD + 5);
      setTimeout(resetCord, 180);
    }
  });
}

