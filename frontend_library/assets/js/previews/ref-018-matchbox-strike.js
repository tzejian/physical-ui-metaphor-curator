/**
 * previews/ref-018-matchbox-strike.js
 *
 * Interactive metaphor preview for ref-018: James Frewin Matchbox —
 * Slide-Out Tray & Strike-to-Ignite.
 *
 * Abstraction level: Industrial hardware / flat-skeuomorphic.
 * Technique: A tactile card matchbox with an interactive two-stage sequence:
 * 1. Thumb slides the inner tray out from the kraft cardboard sleeve.
 * 2. Drag a matchstick across the side striker strip with velocity threshold
 *    to ignite a living flame.
 * 3. The ignited matchstick acts as a physical burn progress timer: the wooden
 *    shaft progressively chars and shortens from 140px down to a 28px stub
 *    over a 5.0-second burn duration before naturally extinguishing.
 *
 * Token fidelity (ref-018):
 *   Colors   : #C8A15A (kraft sleeve), #E8DCC0 (cardboard tray), #1A1A1A (striker strip), #FF7A00 (flame orange), #B5442E (red match head)
 *   Borders  : Cardboard tray edges with printed vintage label face, speckled striker band
 *   Elevation: Drawer-slide parallax between tray and sleeve; radial flame glow
 *   Typography: Letterpress-style vintage matchbox label type
 */

/** @param {object} entry  @param {HTMLElement} stageEl */
export function mount(entry, stageEl) {
  const tokens = entry.design_tokens ?? {};
  const colors = tokens.dominant_colors ?? ['#C8A15A', '#E8DCC0', '#1A1A1A', '#FF7A00', '#B5442E'];

  const kraft   = colors[0] ?? '#C8A15A';
  const tray    = colors[1] ?? '#E8DCC0';
  const striker = colors[2] ?? '#1A1A1A';
  const flame   = colors[3] ?? '#FF7A00';
  const matchRed= colors[4] ?? '#B5442E';

  stageEl.innerHTML = buildStageHtml(kraft, tray, striker, flame, matchRed);
  attachInteractions(stageEl, kraft, tray, striker, flame, matchRed);
}

// ── HTML ──────────────────────────────────────────────────────────────────────

function buildStageHtml(kraft, tray, striker, flame, matchRed) {
  return `
    <style>
      .mb-scene {
        display: flex;
        flex-direction: column;
        width: 100%;
        font-family: var(--font-sans);
        user-select: none;
      }
      .mb-label {
        font-size: .6875rem;
        font-weight: 700;
        letter-spacing: .12em;
        text-transform: uppercase;
        color: var(--text-muted);
        margin-bottom: 14px;
        display: flex;
        justify-content: space-between;
      }

      /* Workshop Bench Area */
      .mb-bench {
        position: relative;
        width: 100%;
        min-height: 380px;
        background: #181614;
        border-radius: 8px;
        border: 2px solid #282420;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-around;
        padding: 24px;
        box-sizing: border-box;
        box-shadow: 0 16px 40px rgba(0,0,0,.6);
      }

      /* ── Matchbox Assembly ── */
      .mb-box-wrap {
        position: relative;
        width: 260px;
        height: 140px;
        perspective: 600px;
      }

      /* Inner Slide-Out Tray */
      .mb-tray {
        position: absolute;
        top: 8px;
        left: 10px;
        width: 230px;
        height: 124px;
        background: ${tray};
        border-radius: 4px;
        border: 2px solid #c4b699;
        box-shadow: inset 0 0 12px rgba(0,0,0,.25);
        display: flex;
        align-items: center;
        padding: 10px 14px;
        box-sizing: border-box;
        gap: 6px;
        transition: transform .35s cubic-bezier(.34, 1.25, .64, 1);
        z-index: 2;
      }
      .mb-tray.is-open {
        transform: translateX(110px);
      }

      /* Matches inside tray */
      .mb-matches-row {
        display: flex;
        flex-direction: column;
        gap: 8px;
        width: 100%;
      }
      .mb-tray-stick {
        height: 8px;
        background: #e0d0b0;
        border-radius: 2px;
        display: flex;
        align-items: center;
        position: relative;
      }
      .mb-tray-head {
        width: 14px;
        height: 12px;
        background: ${matchRed};
        border-radius: 4px;
        position: absolute;
        right: 0;
      }

      /* Outer Cardboard Sleeve */
      .mb-sleeve {
        position: absolute;
        top: 0;
        left: 0;
        width: 240px;
        height: 140px;
        background: ${kraft};
        border-radius: 6px;
        border: 2px solid #9e7a3b;
        box-shadow: 0 12px 28px rgba(0,0,0,.5);
        z-index: 4;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 12px;
        box-sizing: border-box;
        cursor: pointer;
      }
      .mb-label-face {
        border: 2px solid #4a3416;
        border-radius: 4px;
        padding: 10px;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        text-align: center;
        background: #dbc185;
      }
      .mb-label-brand {
        font-family: 'Georgia', serif;
        font-size: 1.1rem;
        font-weight: 900;
        letter-spacing: .12em;
        color: #2b1d0c;
      }
      .mb-label-star {
        font-size: 1.2rem;
        color: ${matchRed};
      }
      .mb-label-sub {
        font-family: var(--font-mono);
        font-size: .5rem;
        font-weight: 700;
        letter-spacing: .14em;
        color: #4a3416;
      }

      /* Striker Strip along bottom of the sleeve */
      .mb-striker-band {
        position: absolute;
        bottom: -18px;
        left: 14px;
        width: 212px;
        height: 18px;
        background: ${striker};
        /* Speckled friction pattern */
        background-image: radial-gradient(rgba(255,255,255,.25) 15%, transparent 16%);
        background-size: 4px 4px;
        border-radius: 0 0 4px 4px;
        border: 1px solid #111;
        cursor: crosshair;
        display: flex;
        align-items: center;
        justify-content: center;
        color: rgba(255,255,255,.6);
        font-family: var(--font-mono);
        font-size: .5rem;
        letter-spacing: .15em;
        z-index: 5;
      }

      /* ── The Active Matchstick ── */
      .mb-match-active {
        width: 140px;
        height: 10px;
        background: #f0e2c8;
        border-radius: 2px;
        box-shadow: 0 4px 10px rgba(0,0,0,.4);
        display: flex;
        align-items: center;
        position: relative;
        cursor: grab;
        touch-action: none;
        transition: transform .05s linear;
        z-index: 10;
        margin-top: 20px;
        overflow: visible;
      }
      .mb-match-active:active {
        cursor: grabbing;
      }
      .mb-head-active {
        width: 18px;
        height: 16px;
        background: ${matchRed};
        border-radius: 6px;
        position: absolute;
        left: -4px;
        transition: background .2s;
        box-shadow: 0 0 4px rgba(0,0,0,.4);
      }

      /* Living Flickering Flame */
      .mb-flame {
        position: absolute;
        left: -14px;
        top: -34px;
        width: 32px;
        height: 48px;
        background: radial-gradient(ellipse at 50% 80%, #fff 0%, #ffde59 35%, ${flame} 70%, transparent 100%);
        border-radius: 50% 50% 35% 35%;
        filter: drop-shadow(0 0 16px ${flame});
        opacity: 0;
        pointer-events: none;
        transform-origin: bottom center;
        animation: mb-flicker .12s infinite alternate ease-in-out;
        transition: opacity .3s;
      }
      .mb-flame.is-lit {
        opacity: 1;
      }
      @keyframes mb-flicker {
        0%   { transform: scale(1) rotate(-1deg); }
        100% { transform: scale(1.08, 0.95) rotate(2deg); }
      }

      /* Telemetry / Status Bar */
      .mb-status-bar {
        font-family: var(--font-mono);
        font-size: .625rem;
        color: rgba(255,255,255,.5);
        display: flex;
        gap: 16px;
        align-items: center;
        flex-wrap: wrap;
        justify-content: center;
      }
      .mb-status-tag {
        color: ${flame};
        font-weight: 700;
      }

      .mb-btn-reset {
        background: transparent;
        border: 1px solid rgba(255,255,255,.2);
        color: rgba(255,255,255,.7);
        border-radius: 4px;
        font-family: var(--font-mono);
        font-size: .5625rem;
        padding: 3px 8px;
        cursor: pointer;
        transition: all .15s;
      }
      .mb-btn-reset:hover {
        border-color: ${flame};
        color: ${flame};
      }

      .mb-hint {
        font-size: .6875rem;
        color: var(--text-muted);
        margin-top: 14px;
        font-style: italic;
      }
    </style>

    <div class="mb-scene">
      <div class="mb-label">
        <span>Interactive Metaphor Preview — James Frewin Matchbox Strike</span>
        <span class="mb-status-tag" id="mb-status">1. CLICK SLEEVE TO OPEN TRAY</span>
      </div>

      <div class="mb-bench">
        <!-- Matchbox Unit -->
        <div class="mb-box-wrap">
          <!-- Tray -->
          <div class="mb-tray" id="mb-tray">
            <div class="mb-matches-row">
              <div class="mb-tray-stick"><div class="mb-tray-head"></div></div>
              <div class="mb-tray-stick"><div class="mb-tray-head"></div></div>
              <div class="mb-tray-stick"><div class="mb-tray-head"></div></div>
            </div>
          </div>

          <!-- Sleeve -->
          <div class="mb-sleeve" id="mb-sleeve" role="button" tabindex="0" aria-label="Slide matchbox open">
            <div class="mb-label-face">
              <div class="mb-label-sub">EXTRA QUALITY SAFETY MATCHES</div>
              <div class="mb-label-brand">THE PHOENIX</div>
              <div class="mb-label-star">★ ★ ★</div>
              <div class="mb-label-sub">MADE IN SWEDEN // 50 CT</div>
            </div>
          </div>

          <!-- Striker Band -->
          <div class="mb-striker-band" id="mb-striker">
            STRIKER SURFACE · SWIPE FAST TO IGNITE
          </div>
        </div>

        <!-- Loose Matchstick to strike (Progress stick) -->
        <div class="mb-match-active" id="mb-match" role="slider" tabindex="0" aria-label="Matchstick to strike">
          <div class="mb-flame" id="mb-flame"></div>
          <div class="mb-head-active" id="mb-head"></div>
        </div>

        <div class="mb-status-bar">
          <div>TRAY: <span id="mb-tray-state">CLOSED</span></div>
          <div>BURN PROGRESS: <span id="mb-flame-state">UNLIT (100%)</span></div>
          <button class="mb-btn-reset" id="mb-btn-reset">↺ NEW MATCH</button>
        </div>
      </div>

      <div class="mb-hint">
        ↑ Click sleeve to open tray · Drag match across striker strip to ignite · Stick burns down over 5.0 seconds
      </div>
    </div>
  `;
}

// ── Interactions ──────────────────────────────────────────────────────────────

function attachInteractions(stageEl, kraft, tray, striker, flame, matchRed) {
  const sleeve     = stageEl.querySelector('#mb-sleeve');
  const trayEl     = stageEl.querySelector('#mb-tray');
  const strikerEl  = stageEl.querySelector('#mb-striker');
  const matchEl    = stageEl.querySelector('#mb-match');
  const flameEl    = stageEl.querySelector('#mb-flame');
  const headEl     = stageEl.querySelector('#mb-head');
  const statusEl   = stageEl.querySelector('#mb-status');
  const trayState  = stageEl.querySelector('#mb-tray-state');
  const flameState = stageEl.querySelector('#mb-flame-state');
  const btnReset   = stageEl.querySelector('#mb-btn-reset');

  const BURN_DURATION_MS = 5000; // 5 seconds burn duration
  const INITIAL_STICK_WIDTH = 140;
  const FINAL_STICK_WIDTH = 28;

  let trayOpen = false;
  let isLit = false;
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let lastTime = 0;
  let burnInterval = null;

  // Toggle Tray
  function toggleTray() {
    trayOpen = !trayOpen;
    trayEl.classList.toggle('is-open', trayOpen);
    trayState.textContent = trayOpen ? 'OPEN (ACCESSIBLE)' : 'CLOSED';
    if (trayOpen && !isLit) {
      statusEl.textContent = '2. SWIPE MATCH ACROSS STRIKER STRIP QUICKLY';
    } else if (!isLit) {
      statusEl.textContent = '1. CLICK SLEEVE TO OPEN TRAY';
    }
  }

  sleeve?.addEventListener('click', toggleTray);

  // Keyboard shortcut: Enter to open tray, Enter again to strike
  sleeve?.addEventListener('keydown', e => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      toggleTray();
    }
  });

  // Drag Matchstick & Check Striker Intersection & Velocity
  matchEl?.addEventListener('pointerdown', e => {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    lastTime = performance.now();
    matchEl.setPointerCapture(e.pointerId);
  });

  matchEl?.addEventListener('pointermove', e => {
    if (!isDragging) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    matchEl.style.transform = `translate(${dx}px, ${dy}px)`;

    // Check collision with striker strip
    const headRect = headEl.getBoundingClientRect();
    const strRect  = strikerEl.getBoundingClientRect();

    const touchesStriker = (
      headRect.right >= strRect.left &&
      headRect.left <= strRect.right &&
      headRect.bottom >= strRect.top &&
      headRect.top <= strRect.bottom
    );

    if (touchesStriker && !isLit) {
      const now = performance.now();
      const dt = now - lastTime;
      const speed = Math.abs(dx) / (dt || 1); // px per ms

      if (speed > 0.45) { // Fast strike threshold
        igniteFlame();
      }
    }
  });

  function stopDrag() {
    if (!isDragging) return;
    isDragging = false;
    matchEl.style.transition = 'transform .3s ease';
    matchEl.style.transform = 'translate(0px, 0px)';
    setTimeout(() => {
      matchEl.style.transition = '';
    }, 300);
  }

  matchEl?.addEventListener('pointerup', stopDrag);
  matchEl?.addEventListener('pointercancel', stopDrag);

  // Ignite & Burn Down Loop (5 Seconds)
  function igniteFlame() {
    if (isLit) return;
    isLit = true;
    flameEl.classList.add('is-lit');
    headEl.style.background = '#222'; // Charred head

    const burnStartTime = performance.now();

    if (burnInterval) clearInterval(burnInterval);
    burnInterval = setInterval(() => {
      const elapsed = performance.now() - burnStartTime;
      const progress = Math.min(1, elapsed / BURN_DURATION_MS); // 0 -> 1
      const remainingPct = Math.round((1 - progress) * 100);
      const remainingSec = Math.max(0, ((BURN_DURATION_MS - elapsed) / 1000)).toFixed(1);

      // Progressively shrink stick width from 140px down to 28px
      const currentWidth = INITIAL_STICK_WIDTH - progress * (INITIAL_STICK_WIDTH - FINAL_STICK_WIDTH);
      matchEl.style.width = `${currentWidth}px`;

      // Charred ember burn gradient advancing down the wood
      const charLimit = Math.min(100, progress * 100);
      matchEl.style.background = `linear-gradient(90deg, #1c150e 0%, #3a2212 ${charLimit}%, #f0e2c8 ${Math.min(100, charLimit + 25)}%)`;

      flameState.textContent = `${remainingPct}% (${remainingSec}s)`;
      statusEl.textContent = `BURNING: ${remainingPct}% · ${remainingSec}s REMAINING`;

      if (progress >= 1) {
        clearInterval(burnInterval);
        burnInterval = null;
        extinguishFlame();
      }
    }, 40);
  }

  function extinguishFlame() {
    isLit = false;
    flameEl.classList.remove('is-lit');
    flameState.textContent = 'EXTINGUISHED (SPENT)';
    statusEl.textContent = 'MATCH BURNT OUT · CLICK "NEW MATCH" TO RELIGHT';
  }

  function resetMatch() {
    if (burnInterval) {
      clearInterval(burnInterval);
      burnInterval = null;
    }
    isLit = false;
    flameEl.classList.remove('is-lit');
    headEl.style.background = matchRed;
    matchEl.style.width = `${INITIAL_STICK_WIDTH}px`;
    matchEl.style.background = '#f0e2c8';
    flameState.textContent = 'UNLIT (100%)';
    statusEl.textContent = trayOpen
      ? '2. SWIPE MATCH ACROSS STRIKER STRIP QUICKLY'
      : '1. CLICK SLEEVE TO OPEN TRAY';
  }

  btnReset?.addEventListener('click', resetMatch);

  // Keyboard strike shortcut
  matchEl?.addEventListener('keydown', e => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (!isLit && matchEl.clientWidth <= FINAL_STICK_WIDTH) {
        resetMatch();
      } else {
        igniteFlame();
      }
    }
  });
}
