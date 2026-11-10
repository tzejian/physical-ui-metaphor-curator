/**
 * previews/ref-005-boarding-pass.js
 *
 * Interactive metaphor preview for ref-005: DVR Labs Boarding Pass —
 * Split-Flap Ticker & Perforated Tear-Off Stub.
 *
 * Abstraction level: Mid-right — industrial hardware + print ephemera.
 * Technique: A paper boarding pass with functional split-flap letter
 * tiles that animate on change (top-half falls, bottom-half rises via
 * Web Animations API, tiles staggered). A perforation line separates
 * the main pass from the tear-off stub; dragging the stub applies
 * elastic give, then tears along a ragged clip-path and the stub falls
 * away. A "Reprint" button restores the stub.
 *
 * Token fidelity (ref-005):
 *   Colors  : #F6F3EC (paper), #1A1A1A (ink), #FF3D1F (accent), #D8D2C4 (muted paper)
 *   Borders : radial-gradient perforation notches, hairline ticket rules, ragged tear edge
 *   Elevation: subtle paper shadow on drag; tiles flat; otherwise flat
 *   Typography: monospaced condensed; bold seat/gate numerals; label-value ticket fields
 */

/** @param {object} entry  @param {HTMLElement} stageEl */
export function mount(entry, stageEl) {
  const tokens = entry.design_tokens ?? {};
  const colors = tokens.dominant_colors ?? [];

  const paper  = colors[0] ?? '#F6F3EC';
  const ink    = colors[1] ?? '#1A1A1A';
  const accent = colors[2] ?? '#FF3D1F';
  const muted  = colors[3] ?? '#D8D2C4';

  const route = generateRoute();
  stageEl.innerHTML = buildStageHtml(paper, ink, accent, muted, route);
  attachInteractions(stageEl, paper, ink, accent, muted);
}

// ── Route data ────────────────────────────────────────────────────────────────

function generateRoute() {
  const routes = [
    { from: 'JFK', to: 'NRT', gate: 'B42', seat: '14A', flight: 'DVR-1701', date: '09 NOV 2026' },
    { from: 'LAX', to: 'ICN', gate: 'C18', seat: '22F', flight: 'DVR-0803', date: '09 NOV 2026' },
    { from: 'LHR', to: 'SIN', gate: 'A07', seat: '08C', flight: 'DVR-0512', date: '09 NOV 2026' },
    { from: 'CDG', to: 'HND', gate: 'D31', seat: '31K', flight: 'DVR-2240', date: '09 NOV 2026' },
  ];
  return routes[Math.floor(Math.random() * routes.length)];
}

// ── HTML ──────────────────────────────────────────────────────────────────────

function buildStageHtml(paper, ink, accent, muted, route) {
  return `
    <style>
      .bp-scene        { display:flex; flex-direction:column; align-items:center; width:100%; }
      .bp-label        { font-size:.6875rem; font-weight:700; letter-spacing:.1em;
                         text-transform:uppercase; color:var(--text-muted); margin-bottom:14px;
                         align-self:flex-start; }

      /* ── Pass container ── */
      .bp-pass         {
        position:relative; width:100%; max-width:440px;
        font-family:var(--font-mono); background:transparent;
        display:flex; flex-direction:column;
        user-select:none;
      }

      /* ── Main ticket ── */
      .bp-main         {
        background:${paper}; color:${ink};
        padding:20px 22px 16px;
        display:flex; flex-direction:column; gap:12px;
        border:1px solid ${muted};
        border-bottom:none;
        position:relative; z-index:2;
      }

      /* Header */
      .bp-header       { display:flex; justify-content:space-between; align-items:flex-start; }
      .bp-airline      { font-size:.625rem; font-weight:700; letter-spacing:.16em;
                         color:${accent}; }
      .bp-flight       { font-size:.625rem; letter-spacing:.08em; color:${ink}80; }
      .bp-date         { font-size:.5625rem; color:${ink}60; margin-top:2px; }

      /* Route display — the big split-flap tiles */
      .bp-route        { display:flex; align-items:center; gap:10px; justify-content:center;
                         padding:10px 0; }
      .bp-route-arrow  { font-size:.75rem; color:${ink}40; }

      /* Split-flap tile */
      .bp-tile         {
        position:relative; width:28px; height:38px;
        perspective:200px; overflow:visible;
      }
      .bp-tile__char   {
        display:flex; align-items:center; justify-content:center;
        width:100%; height:100%;
        background:${ink}; color:${paper};
        font-size:1.1rem; font-weight:700; letter-spacing:.04em;
        border-radius:2px; position:relative;
      }
      /* Center split line */
      .bp-tile__char::after {
        content:''; position:absolute; left:0; right:0; top:50%;
        height:1px; background:${ink}CC;
      }

      /* Flip animation overlay */
      .bp-tile__flip-top,
      .bp-tile__flip-bot {
        position:absolute; left:0; right:0;
        display:flex; align-items:center; justify-content:center;
        overflow:hidden; background:${ink}; color:${paper};
        font-size:1.1rem; font-weight:700;
        border-radius:2px;
        pointer-events:none;
      }
      .bp-tile__flip-top {
        top:0; height:50%;
        transform-origin:bottom center;
        clip-path:inset(0 0 0 0);
      }
      .bp-tile__flip-bot {
        bottom:0; height:50%;
        transform-origin:top center;
        clip-path:inset(0 0 0 0);
      }

      /* Flap changed accent */
      .bp-tile--changed .bp-tile__char {
        background:${accent}; color:#fff;
        transition:background 0.8s 0.4s;
      }
      .bp-tile--changed .bp-tile__char::after {
        background:${accent}CC;
      }

      /* Gate/Seat fields */
      .bp-fields       { display:flex; gap:16px; flex-wrap:wrap; }
      .bp-field        { display:flex; flex-direction:column; gap:2px; }
      .bp-field__label { font-size:.5rem; font-weight:700; letter-spacing:.18em;
                         text-transform:uppercase; color:${ink}55; }
      .bp-field__value { font-size:1rem; font-weight:700; letter-spacing:.08em; }

      /* ── Perforation line ── */
      .bp-perf         {
        width:100%; height:14px; position:relative; z-index:3;
        /* Radial notch mask */
        background:repeating-linear-gradient(to right,
          ${paper} 0px, ${paper} 4px,
          transparent 4px, transparent 8px
        );
        cursor:default;
      }
      .bp-perf-line    {
        position:absolute; left:0; right:0; top:50%;
        height:0; border-top:2px dashed ${muted};
      }

      /* ── Tear-off stub ── */
      .bp-stub         {
        background:${paper}; color:${ink};
        border:1px solid ${muted}; border-top:none;
        padding:10px 22px 14px;
        display:flex; justify-content:space-between; align-items:center;
        position:relative; z-index:1;
        transition:transform 0.12s ease-out, opacity 0.15s;
        cursor:grab;
        touch-action:none;
      }
      .bp-stub:active  { cursor:grabbing; }
      .bp-stub-info    { font-size:.5625rem; color:${ink}70; }
      .bp-stub-seat    { font-size:.875rem; font-weight:700; }

      /* Torn state */
      .bp-stub.is-torn {
        transform:translateY(60px) rotate(5deg) !important;
        opacity:0;
        pointer-events:none;
        transition:transform 0.45s cubic-bezier(.2,.8,.3,1), opacity 0.4s 0.1s;
        clip-path:polygon(0% 0%, 3% 6%, 7% 1%, 12% 5%, 18% 2%, 22% 7%, 28% 0%, 33% 4%,
          38% 1%, 44% 6%, 50% 2%, 55% 5%, 60% 0%, 66% 4%, 72% 1%, 78% 5%,
          83% 2%, 88% 6%, 93% 1%, 97% 5%, 100% 0%, 100% 100%, 0% 100%);
      }

      /* Torn main edge */
      .bp-main.is-torn-edge {
        clip-path:polygon(0% 0%, 100% 0%, 100% 100%, 97% 95%, 93% 99%, 88% 94%, 83% 98%,
          78% 95%, 72% 99%, 66% 96%, 60% 100%, 55% 95%, 50% 98%, 44% 94%, 38% 99%,
          33% 96%, 28% 100%, 22% 93%, 18% 98%, 12% 95%, 7% 99%, 3% 94%, 0% 100%);
      }

      /* Actions row */
      .bp-actions      { display:flex; gap:10px; margin-top:12px; align-self:flex-start; }
      .bp-btn          {
        font-family:var(--font-mono); font-size:.625rem; font-weight:700;
        letter-spacing:.12em; text-transform:uppercase;
        background:transparent; color:var(--text-secondary);
        border:1px solid var(--border-subtle); border-radius:3px;
        padding:5px 12px; cursor:pointer;
        transition:all var(--transition-fast);
      }
      .bp-btn:hover    { border-color:var(--accent); color:var(--accent); }
      .bp-btn--accent  { border-color:${accent}; color:${accent}; }
      .bp-btn--accent:hover { background:${accent}; color:#fff; }

      .bp-hint { font-size:.6875rem; color:var(--text-muted);
                 margin-top:14px; font-style:italic; align-self:flex-start; }
    </style>

    <div class="bp-scene">
      <p class="bp-label">Interactive Metaphor Preview — Boarding Pass Split-Flap & Tear-Off</p>

      <div class="bp-pass" id="bp-pass">
        <!-- Main ticket -->
        <div class="bp-main" id="bp-main">
          <div class="bp-header">
            <div>
              <div class="bp-airline">DVR LABS</div>
              <div class="bp-date">${esc(route.date)}</div>
            </div>
            <div class="bp-flight">${esc(route.flight)}</div>
          </div>

          <!-- Split-flap route -->
          <div class="bp-route" id="bp-route">
            ${buildFlaps(route.from)}
            <span class="bp-route-arrow">→</span>
            ${buildFlaps(route.to)}
          </div>

          <!-- Fields -->
          <div class="bp-fields" id="bp-fields">
            <div class="bp-field">
              <span class="bp-field__label">Gate</span>
              <span class="bp-field__value" id="bp-gate">${esc(route.gate)}</span>
            </div>
            <div class="bp-field">
              <span class="bp-field__label">Seat</span>
              <span class="bp-field__value" id="bp-seat">${esc(route.seat)}</span>
            </div>
            <div class="bp-field">
              <span class="bp-field__label">Boarding</span>
              <span class="bp-field__value">NOW</span>
            </div>
          </div>
        </div>

        <!-- Perforation -->
        <div class="bp-perf"><div class="bp-perf-line"></div></div>

        <!-- Tear-off stub -->
        <div class="bp-stub" id="bp-stub">
          <div>
            <div class="bp-stub-info">${esc(route.flight)} · ${esc(route.from)}→${esc(route.to)}</div>
          </div>
          <div class="bp-stub-seat">${esc(route.seat)}</div>
        </div>
      </div>

      <div class="bp-actions" id="bp-actions">
        <button class="bp-btn bp-btn--accent" id="bp-btn-shuffle">New Route</button>
        <button class="bp-btn" id="bp-btn-reprint" style="display:none;">Reprint Stub</button>
      </div>

      <p class="bp-hint">↑ Drag the stub down to tear · Click "New Route" to flip the board</p>
    </div>`;
}

function buildFlaps(code) {
  return code.split('').map((ch, i) =>
    `<div class="bp-tile" data-flap-index="${i}">
       <div class="bp-tile__char">${ch}</div>
     </div>`).join('');
}

// ── Interactions ──────────────────────────────────────────────────────────────

function attachInteractions(stageEl, paper, ink, accent, muted) {
  const stub       = stageEl.querySelector('#bp-stub');
  const mainEl     = stageEl.querySelector('#bp-main');
  const routeEl    = stageEl.querySelector('#bp-route');
  const gateEl     = stageEl.querySelector('#bp-gate');
  const seatEl     = stageEl.querySelector('#bp-seat');
  const btnShuffle = stageEl.querySelector('#bp-btn-shuffle');
  const btnReprint = stageEl.querySelector('#bp-btn-reprint');

  let isTorn = false;

  // ── Stub tear via drag ──────────────────────────────────────────────────
  let dragStartY  = null;
  let dragging    = false;
  const tearThreshold = 55;

  function onPointerDown(e) {
    if (isTorn) return;
    dragStartY = e.clientY;
    dragging   = true;
    stub.style.transition = 'none';
    stub.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e) {
    if (!dragging || isTorn) return;
    const dy = Math.max(0, e.clientY - dragStartY);
    // Elastic give — square root curve
    const elastic = Math.min(dy, tearThreshold * 1.5);
    const give = Math.sqrt(elastic / tearThreshold) * tearThreshold * 0.4;
    stub.style.transform = `translateY(${give}px)`;
    if (dy >= tearThreshold) {
      tearOff();
    }
  }

  function onPointerUp() {
    if (!isTorn && dragging) {
      stub.style.transition = 'transform 0.25s ease-out';
      stub.style.transform  = 'translateY(0)';
    }
    dragging = false;
  }

  stub.addEventListener('pointerdown', onPointerDown);
  stub.addEventListener('pointermove', onPointerMove);
  stub.addEventListener('pointerup',   onPointerUp);
  stub.addEventListener('pointercancel', onPointerUp);

  function tearOff() {
    isTorn   = true;
    dragging = false;
    stub.style.transition = '';
    stub.style.transform  = '';
    stub.classList.add('is-torn');
    mainEl.classList.add('is-torn-edge');
    btnReprint.style.display = '';
  }

  // ── Reprint ─────────────────────────────────────────────────────────────
  btnReprint.addEventListener('click', () => {
    stub.classList.remove('is-torn');
    mainEl.classList.remove('is-torn-edge');
    stub.style.transform = '';
    isTorn = false;
    btnReprint.style.display = 'none';
  });

  // ── Shuffle route + split-flap animation ────────────────────────────────
  btnShuffle.addEventListener('click', () => {
    const newRoute = generateRoute();
    const tiles = routeEl.querySelectorAll('.bp-tile');
    const newCode = newRoute.from + newRoute.to; // 6 chars total

    tiles.forEach((tile, i) => {
      const charEl = tile.querySelector('.bp-tile__char');
      const oldChar = charEl.textContent;
      const newChar = newCode[i] ?? oldChar;
      if (newChar === oldChar) return;

      tile.classList.remove('bp-tile--changed');

      // Stagger: each tile delayed by 80ms
      setTimeout(() => {
        flipTile(tile, charEl, oldChar, newChar, ink, paper, accent);
      }, i * 80);
    });

    // Update field values
    gateEl.textContent = newRoute.gate;
    seatEl.textContent = newRoute.seat;

    // Update stub info
    const stubInfo = stub.querySelector('.bp-stub-info');
    const stubSeat = stub.querySelector('.bp-stub-seat');
    if (stubInfo) stubInfo.textContent = `${newRoute.flight} · ${newRoute.from}→${newRoute.to}`;
    if (stubSeat) stubSeat.textContent = newRoute.seat;
  });
}

/**
 * Animate a single split-flap tile: top half falls, bottom half rises.
 */
function flipTile(tile, charEl, oldChar, newChar, ink, paper) {
  tile.classList.add('bp-tile--changed');

  // Create top-half overlay (shows old char, will fall)
  const topFlap = document.createElement('div');
  topFlap.className = 'bp-tile__flip-top';
  topFlap.textContent = oldChar;
  topFlap.style.zIndex = '3';
  tile.appendChild(topFlap);

  // Animate top flap falling
  topFlap.animate([
    { transform: 'rotateX(0deg)' },
    { transform: 'rotateX(-90deg)' },
  ], {
    duration: 200,
    easing: 'ease-in',
    fill: 'forwards',
  }).onfinish = () => {
    // Swap the character
    charEl.textContent = newChar;
    topFlap.remove();

    // Create bottom-half overlay (shows new char, will rise into place)
    const botFlap = document.createElement('div');
    botFlap.className = 'bp-tile__flip-bot';
    botFlap.textContent = newChar;
    botFlap.style.zIndex = '3';
    tile.appendChild(botFlap);

    botFlap.animate([
      { transform: 'rotateX(90deg)' },
      { transform: 'rotateX(0deg)' },
    ], {
      duration: 200,
      easing: 'ease-out',
      fill: 'forwards',
    }).onfinish = () => {
      botFlap.remove();
    };
  };
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function esc(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

