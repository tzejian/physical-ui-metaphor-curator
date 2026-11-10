/**
 * previews/ref-008-rotary-knob.js
 *
 * Interactive metaphor preview for ref-008: XO Festival —
 * Rotary Knob as Slider Control.
 *
 * Abstraction level: Flat design / retro-tactile modern.
 * Technique: A hi-fi potentiometer knob rotating through a 270° travel arc
 * (-135° to +135°). Radial ticks light up proportionally to the value.
 * Dragging vertically or rotationally turns the knob, driving a simulated
 * festival soundstage equalizer / gain meter. An accompanying numerical readout
 * and fallback slider are provided to address precision usability.
 *
 * Token fidelity (ref-008):
 *   Colors   : #2779A7 (ocean blue), #49C5B6 (teal/mint), #FFFFFF (white)
 *   Borders  : flat circular silhouette with indicator line; clean vector edges, no bevels
 *   Elevation: completely flat 2D; depth suggested only by the radial tick arc
 *   Typography: geometric sans-serif festival legends and equipment readouts
 */

/** @param {object} entry  @param {HTMLElement} stageEl */
export function mount(entry, stageEl) {
  const tokens = entry.design_tokens ?? {};
  const colors = tokens.dominant_colors ?? ['#2779A7', '#49C5B6', '#FFFFFF'];

  const primary = colors[0] ?? '#2779A7';
  const accent  = colors[1] ?? '#49C5B6';
  const white   = colors[2] ?? '#FFFFFF';

  stageEl.innerHTML = buildStageHtml(primary, accent, white);
  attachInteractions(stageEl, primary, accent, white);
}

// ── Config ────────────────────────────────────────────────────────────────────

const MIN_DEG = -135;
const MAX_DEG = 135;
const DEG_RANGE = MAX_DEG - MIN_DEG; // 270 deg
const NUM_TICKS = 21;

// ── HTML ──────────────────────────────────────────────────────────────────────

function buildStageHtml(primary, accent, white) {
  // Generate radial ticks around the knob
  const ticksHtml = Array.from({ length: NUM_TICKS }, (_, i) => {
    const fraction = i / (NUM_TICKS - 1);
    const angle = MIN_DEG + fraction * DEG_RANGE;
    return `
      <div class="rk-tick-wrap" style="transform: rotate(${angle}deg);" data-tick-idx="${i}">
        <div class="rk-tick"></div>
      </div>
    `;
  }).join('');

  // Equalizer visualizer bars
  const eqBarsHtml = Array.from({ length: 16 }, (_, i) => `
    <div class="rk-eq-bar" data-bar-idx="${i}">
      <div class="rk-eq-fill"></div>
    </div>
  `).join('');

  return `
    <style>
      .rk-scene {
        display: flex;
        flex-direction: column;
        width: 100%;
        font-family: var(--font-sans);
        color: ${white};
        user-select: none;
      }
      .rk-label {
        font-size: .6875rem;
        font-weight: 700;
        letter-spacing: .1em;
        text-transform: uppercase;
        color: var(--text-muted);
        margin-bottom: 16px;
      }

      /* Soundstage console chassis */
      .rk-chassis {
        background: #141f28;
        border: 2px solid ${primary};
        border-radius: 8px;
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 20px;
        position: relative;
        overflow: hidden;
      }

      .rk-header-row {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        border-bottom: 1px solid rgba(255,255,255,.08);
        padding-bottom: 10px;
      }
      .rk-brand {
        font-size: 1.125rem;
        font-weight: 900;
        letter-spacing: .15em;
        color: ${accent};
      }
      .rk-channel {
        font-family: var(--font-mono);
        font-size: .625rem;
        letter-spacing: .1em;
        color: rgba(255,255,255,.5);
      }

      /* Main layout */
      .rk-body {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-around;
        gap: 28px;
      }

      /* Knob station */
      .rk-station {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
      }

      .rk-knob-container {
        position: relative;
        width: 160px;
        height: 160px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      /* Ticks ring */
      .rk-ticks-ring {
        position: absolute;
        inset: 0;
        pointer-events: none;
      }
      .rk-tick-wrap {
        position: absolute;
        top: 0;
        left: 50%;
        width: 0;
        height: 50%;
        transform-origin: bottom center;
        display: flex;
        justify-content: center;
      }
      .rk-tick {
        width: 2px;
        height: 8px;
        background: rgba(255,255,255,.2);
        border-radius: 1px;
        transition: background .12s, transform .12s;
      }
      .rk-tick.is-lit {
        background: ${accent};
        box-shadow: 0 0 6px ${accent}88;
        transform: scaleY(1.2);
      }

      /* The physical knob */
      .rk-knob {
        position: relative;
        width: 96px;
        height: 96px;
        border-radius: 50%;
        background: ${primary};
        cursor: grab;
        touch-action: none;
        outline: none;
        box-shadow: 0 4px 16px rgba(0,0,0,.35);
        transition: transform .05s linear;
      }
      .rk-knob:active {
        cursor: grabbing;
      }
      .rk-knob:focus-visible {
        outline: 2px solid ${accent};
        outline-offset: 4px;
      }

      /* Inner cap */
      .rk-knob::before {
        content: '';
        position: absolute;
        inset: 6px;
        border-radius: 50%;
        background: #1e648c;
        border: 1px solid rgba(255,255,255,.15);
      }

      /* Single indicator line from center to edge */
      .rk-indicator-line {
        position: absolute;
        top: 8px;
        left: calc(50% - 1.5px);
        width: 3px;
        height: 24px;
        background: ${white};
        border-radius: 2px;
        box-shadow: 0 0 4px rgba(255,255,255,.6);
      }

      /* Readout legend */
      .rk-readout-box {
        text-align: center;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .rk-readout-val {
        font-family: var(--font-mono);
        font-size: 1.5rem;
        font-weight: 700;
        color: ${accent};
        letter-spacing: .05em;
      }
      .rk-readout-legend {
        font-size: .625rem;
        font-weight: 700;
        letter-spacing: .15em;
        text-transform: uppercase;
        color: rgba(255,255,255,.45);
      }

      /* Equalizer section */
      .rk-eq-box {
        flex: 1;
        min-width: 180px;
        max-width: 260px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .rk-eq-title {
        font-size: .5625rem;
        font-weight: 700;
        letter-spacing: .14em;
        text-transform: uppercase;
        color: rgba(255,255,255,.5);
        display: flex;
        justify-content: space-between;
      }
      .rk-eq-visualizer {
        height: 96px;
        background: rgba(0,0,0,.3);
        border: 1px solid rgba(255,255,255,.08);
        border-radius: 4px;
        padding: 6px;
        display: flex;
        align-items: flex-end;
        gap: 4px;
      }
      .rk-eq-bar {
        flex: 1;
        height: 100%;
        display: flex;
        align-items: flex-end;
      }
      .rk-eq-fill {
        width: 100%;
        background: ${accent};
        border-radius: 1px;
        min-height: 2px;
        transition: height .08s ease-out;
      }

      /* Fallback slider & presets row */
      .rk-fallback-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding-top: 14px;
        border-top: 1px solid rgba(255,255,255,.08);
      }
      .rk-presets {
        display: flex;
        gap: 6px;
      }
      .rk-btn {
        background: transparent;
        border: 1px solid rgba(255,255,255,.15);
        border-radius: 3px;
        color: rgba(255,255,255,.75);
        font-family: var(--font-mono);
        font-size: .625rem;
        font-weight: 600;
        padding: 4px 8px;
        cursor: pointer;
        transition: all .12s;
      }
      .rk-btn:hover {
        border-color: ${accent};
        color: ${accent};
      }
      .rk-btn.is-active {
        background: ${accent};
        border-color: ${accent};
        color: #141f28;
      }

      .rk-fallback-slider-wrap {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .rk-slider-label {
        font-size: .5625rem;
        font-weight: 700;
        letter-spacing: .08em;
        text-transform: uppercase;
        color: rgba(255,255,255,.45);
      }
      .rk-slider {
        accent-color: ${accent};
        cursor: pointer;
        width: 120px;
      }

      .rk-hint {
        font-size: .6875rem;
        color: var(--text-muted);
        margin-top: 14px;
        font-style: italic;
      }
    </style>

    <div class="rk-scene">
      <p class="rk-label">Interactive Metaphor Preview — XO Festival Rotary Control</p>

      <div class="rk-chassis">
        <div class="rk-header-row">
          <div class="rk-brand">XO // FESTIVAL</div>
          <div class="rk-channel">STAGE MASTER GAIN · CH-01</div>
        </div>

        <div class="rk-body">
          <!-- Knob Station -->
          <div class="rk-station">
            <div class="rk-knob-container">
              <div class="rk-ticks-ring" id="rk-ticks-ring">${ticksHtml}</div>
              <div
                class="rk-knob"
                id="rk-knob"
                tabindex="0"
                role="slider"
                aria-label="Festival master gain rotary control"
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow="65"
              >
                <div class="rk-indicator-line"></div>
              </div>
            </div>

            <div class="rk-readout-box">
              <div class="rk-readout-val" id="rk-val-text">65%</div>
              <div class="rk-readout-legend" id="rk-legend-text">MASTER LEVEL // +1.5 dB</div>
            </div>
          </div>

          <!-- Equalizer Meter -->
          <div class="rk-eq-box">
            <div class="rk-eq-title">
              <span>OUTPUT SPECTRUM</span>
              <span id="rk-eq-state">OPTIMAL</span>
            </div>
            <div class="rk-eq-visualizer" id="rk-visualizer">
              ${eqBarsHtml}
            </div>
          </div>
        </div>

        <!-- Presets and Fallback Slider (Usability requirement) -->
        <div class="rk-fallback-row">
          <div class="rk-presets" id="rk-presets">
            <button class="rk-btn" data-val="0">MUTE</button>
            <button class="rk-btn" data-val="25">LOW</button>
            <button class="rk-btn" data-val="65">DEFAULT</button>
            <button class="rk-btn" data-val="100">MAX BOOST</button>
          </div>

          <div class="rk-fallback-slider-wrap">
            <span class="rk-slider-label">Slider Fallback:</span>
            <input
              type="range"
              class="rk-slider"
              id="rk-fallback-slider"
              min="0"
              max="100"
              value="65"
              aria-label="Direct slider input fallback"
            />
          </div>
        </div>
      </div>

      <p class="rk-hint">↑ Drag knob vertically or in a circle · Scroll wheel supported · Arrow keys adjust level</p>
    </div>
  `;
}

// ── Interactions ──────────────────────────────────────────────────────────────

function attachInteractions(stageEl, primary, accent, white) {
  const knob       = stageEl.querySelector('#rk-knob');
  const ticks      = stageEl.querySelectorAll('.rk-tick');
  const valText    = stageEl.querySelector('#rk-val-text');
  const legendText = stageEl.querySelector('#rk-legend-text');
  const eqState    = stageEl.querySelector('#rk-eq-state');
  const eqFills    = stageEl.querySelectorAll('.rk-eq-fill');
  const slider     = stageEl.querySelector('#rk-fallback-slider');
  const presets    = stageEl.querySelector('#rk-presets');

  if (!knob) return;

  // Normalized 0..100 state
  let currentVal = 65;

  // Update UI elements based on current value
  function setVal(newVal) {
    currentVal = Math.max(0, Math.min(100, Math.round(newVal)));

    // 1. Rotate the knob: 0% -> MIN_DEG (-135°), 100% -> MAX_DEG (+135°)
    const angle = MIN_DEG + (currentVal / 100) * DEG_RANGE;
    knob.style.transform = `rotate(${angle}deg)`;
    knob.setAttribute('aria-valuenow', currentVal);

    // 2. Light up radial ticks
    const litCount = Math.round((currentVal / 100) * (NUM_TICKS - 1));
    ticks.forEach((tick, i) => {
      tick.classList.toggle('is-lit', i <= litCount);
    });

    // 3. Readout numbers & dB
    if (valText) valText.textContent = `${currentVal}%`;
    const db = ((currentVal / 100) * 18 - 12).toFixed(1);
    if (legendText) {
      legendText.textContent = currentVal === 0
        ? 'MASTER LEVEL // -∞ dB (MUTED)'
        : `MASTER LEVEL // ${db > 0 ? '+' : ''}${db} dB`;
    }

    // 4. Equalizer state label
    if (eqState) {
      if (currentVal === 0) {
        eqState.textContent = 'MUTED';
        eqState.style.color = 'rgba(255,255,255,.4)';
      } else if (currentVal > 85) {
        eqState.textContent = 'DRIVE PEAK';
        eqState.style.color = '#ff4d4f';
      } else {
        eqState.textContent = 'OPTIMAL';
        eqState.style.color = accent;
      }
    }

    // 5. Update fallback slider
    if (slider && parseInt(slider.value, 10) !== currentVal) {
      slider.value = currentVal;
    }

    // 6. Update preset buttons
    if (presets) {
      presets.querySelectorAll('.rk-btn').forEach(btn => {
        btn.classList.toggle('is-active', parseInt(btn.dataset.val, 10) === currentVal);
      });
    }

    // 7. Drive equalizer bars
    renderEq(currentVal);
  }

  // Visualizer bar heights with varied frequency profiles
  function renderEq(val) {
    const intensity = val / 100;
    eqFills.forEach((fill, i) => {
      if (val === 0) {
        fill.style.height = '2px';
        return;
      }
      // Create musical wave contour
      const wave = Math.sin((i / 15) * Math.PI) * 0.4 + 0.6;
      const jitter = (Math.sin(i * 3.7 + Date.now() * 0.005) * 0.15 + 0.85);
      const heightPercent = Math.min(100, Math.max(4, intensity * wave * jitter * 100));
      fill.style.height = `${heightPercent}%`;
      fill.style.background = val > 85 && i >= 13 ? '#ff4d4f' : accent;
    });
  }

  // Periodic subtle jitter to simulate live audio flow when > 0
  let eqInterval = setInterval(() => {
    if (currentVal > 0) renderEq(currentVal);
  }, 120);

  // Drag interaction: support vertical drag and rotational drag
  let isDragging = false;
  let startY = 0;
  let startVal = 0;

  knob.addEventListener('pointerdown', e => {
    isDragging = true;
    startY = e.clientY;
    startVal = currentVal;
    knob.setPointerCapture(e.pointerId);
    e.preventDefault();
  });

  knob.addEventListener('pointermove', e => {
    if (!isDragging) return;
    // Moving 150px vertically covers full 0-100% range
    const deltaY = startY - e.clientY;
    const deltaVal = (deltaY / 150) * 100;
    setVal(startVal + deltaVal);
  });

  function stopDrag() {
    isDragging = false;
  }
  knob.addEventListener('pointerup', stopDrag);
  knob.addEventListener('pointercancel', stopDrag);

  // Wheel interaction
  knob.addEventListener('wheel', e => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 3 : -3;
    setVal(currentVal + delta);
  }, { passive: false });

  // Keyboard navigation
  knob.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
      e.preventDefault();
      setVal(currentVal + (e.shiftKey ? 10 : 2));
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
      e.preventDefault();
      setVal(currentVal - (e.shiftKey ? 10 : 2));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setVal(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setVal(100);
    }
  });

  // Fallback slider listener
  if (slider) {
    slider.addEventListener('input', e => {
      setVal(parseFloat(e.target.value));
    });
  }

  // Presets listeners
  if (presets) {
    presets.addEventListener('click', e => {
      const btn = e.target.closest('.rk-btn');
      if (btn && btn.dataset.val !== undefined) {
        setVal(parseInt(btn.dataset.val, 10));
      }
    });
  }

  // Initial draw
  setVal(currentVal);
}

