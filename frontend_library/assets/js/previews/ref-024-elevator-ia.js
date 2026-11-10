/**
 * previews/ref-024-elevator-ia.js
 *
 * Interactive metaphor preview for ref-024: Rise of Digital —
 * Elevator Ride Through Six Floors of Craft.
 *
 * Abstraction level: Industrial-hardware / playful-brutalist.
 * Technique: An elevator system as information architecture. Navigating between
 * site sections is represented as traveling between 6 distinct floors.
 * The car features an authentic brass floor indicator, an express jump mode,
 * and interactive physics exhibits waiting on each floor level.
 *
 * Token fidelity (ref-024):
 *   Colors   : #0E0E10 (dark shaft), #F2C200 (amber indicator), #3B7DDD (blue neon), #E8E4DC (floor plates), #1C1C1E (cabin interior)
 *   Borders  : Elevator panel framing and floor-number plates, glass vitrine borders
 *   Elevation: Full 3D environment perspective with floor travel inertia
 *   Typography: Floor-plate numerals as section markers, exhibit placard labels
 */

/** @param {object} entry  @param {HTMLElement} stageEl */
export function mount(entry, stageEl) {
  const tokens = entry.design_tokens ?? {};
  const colors = tokens.dominant_colors ?? ['#0E0E10', '#F2C200', '#3B7DDD', '#E8E4DC', '#1C1C1E'];

  const darkShaft = colors[0] ?? '#0E0E10';
  const amber     = colors[1] ?? '#F2C200';
  const blueNeon  = colors[2] ?? '#3B7DDD';
  const cream     = colors[3] ?? '#E8E4DC';
  const cabin     = colors[4] ?? '#1C1C1E';

  stageEl.innerHTML = buildStageHtml(darkShaft, amber, blueNeon, cream, cabin);
  attachInteractions(stageEl, darkShaft, amber, blueNeon, cream, cabin);
}

// ── Six Floors of Craft Data ──────────────────────────────────────────────────

const FLOORS = [
  { num: 6, title: 'THE PENTHOUSE OBSERVATORY', desc: 'Night city skyline folding into integrated circuits.', icon: '🌆' },
  { num: 5, title: 'AI NIGHT SHIFT LAB', desc: 'Autonomous generative models running batch inference.', icon: '🧠' },
  { num: 4, title: 'GALTON BOARD VAULT', desc: 'Simulated probability beads cascading through pegs.', icon: '🎲' },
  { num: 3, title: 'NEWTON’S CRADLE WORKSHOP', desc: 'Momentum conservation physics demonstration.', icon: '⚙️' },
  { num: 2, title: 'VECTOR & TYPOGRAPHY ATELIER', desc: 'Custom variable fonts and parametric glyphs.', icon: '✒️' },
  { num: 1, title: 'GROUND RECEPTION & ARCHIVE', desc: 'Arrival terminal and architectural building directory.', icon: '🏛️' }
];

// ── HTML ──────────────────────────────────────────────────────────────────────

function buildStageHtml(darkShaft, amber, blueNeon, cream, cabin) {
  const floorButtonsHtml = FLOORS.map(f => `
    <button class="el-btn-floor ${f.num === 1 ? 'is-active' : ''}" data-floor="${f.num}">
      ${f.num}
    </button>
  `).join('');

  return `
    <style>
      .el-scene {
        display: flex;
        flex-direction: column;
        width: 100%;
        font-family: var(--font-sans);
        user-select: none;
      }
      .el-label {
        font-size: .6875rem;
        font-weight: 700;
        letter-spacing: .12em;
        text-transform: uppercase;
        color: var(--text-muted);
        margin-bottom: 14px;
        display: flex;
        justify-content: space-between;
      }

      /* Shaft & Cabin Container */
      .el-shaft-stage {
        position: relative;
        width: 100%;
        min-height: 380px;
        background: ${darkShaft};
        border-radius: 8px;
        border: 2px solid #23252a;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: space-around;
        padding: 24px;
        box-sizing: border-box;
        box-shadow: 0 16px 40px rgba(0,0,0,.7);
        flex-wrap: wrap;
        gap: 24px;
      }

      /* ── Elevator Control Panel (The Keypad) ── */
      .el-keypad-panel {
        width: 120px;
        background: ${cabin};
        border: 3px solid #333640;
        border-radius: 10px;
        padding: 16px 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        box-shadow: 0 12px 28px rgba(0,0,0,.6);
      }
      .el-panel-brand {
        font-family: var(--font-mono);
        font-size: .5rem;
        letter-spacing: .12em;
        color: rgba(255,255,255,.4);
        text-transform: uppercase;
      }
      .el-keypad-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        width: 100%;
      }
      .el-btn-floor {
        height: 38px;
        border-radius: 50%;
        background: #141518;
        border: 2px solid #454955;
        color: #fff;
        font-family: var(--font-mono);
        font-size: .875rem;
        font-weight: 800;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all .15s;
        box-shadow: inset 0 2px 4px rgba(0,0,0,.6);
      }
      .el-btn-floor:hover {
        border-color: ${amber};
        color: ${amber};
      }
      .el-btn-floor.is-active {
        background: ${amber};
        border-color: #fff;
        color: #111;
        box-shadow: 0 0 12px ${amber};
      }

      .el-btn-express {
        width: 100%;
        background: transparent;
        border: 1px solid ${blueNeon};
        color: ${blueNeon};
        border-radius: 4px;
        font-family: var(--font-mono);
        font-size: .5625rem;
        font-weight: 700;
        letter-spacing: .08em;
        padding: 6px 0;
        cursor: pointer;
        margin-top: 4px;
        transition: all .15s;
      }
      .el-btn-express:hover {
        background: ${blueNeon};
        color: #fff;
        box-shadow: 0 0 10px ${blueNeon};
      }

      /* ── Active Floor Exhibit Display ── */
      .el-floor-vitrine {
        flex: 1;
        min-width: 260px;
        max-width: 380px;
        background: #14161a;
        border: 2px solid #282a33;
        border-radius: 8px;
        padding: 24px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 16px;
        position: relative;
        overflow: hidden;
        box-shadow: 0 8px 30px rgba(0,0,0,.5);
        transition: transform .4s cubic-bezier(.2, .8, .2, 1);
      }

      /* Floor Number Indicator Marquee */
      .el-indicator-box {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        border-bottom: 2px solid #252830;
        padding-bottom: 10px;
      }
      .el-floor-num-badge {
        font-family: var(--font-mono);
        font-size: 2rem;
        font-weight: 900;
        color: ${amber};
        text-shadow: 0 0 16px ${amber}66;
        line-height: 1;
      }
      .el-floor-motion-tag {
        font-family: var(--font-mono);
        font-size: .5625rem;
        letter-spacing: .12em;
        color: #00D18F;
      }

      /* Exhibit Artwork Area */
      .el-exhibit-display {
        height: 130px;
        background: #0d0e12;
        border: 1px solid rgba(255,255,255,.08);
        border-radius: 6px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 10px;
        text-align: center;
        padding: 12px;
      }
      .el-exhibit-icon {
        font-size: 3rem;
        filter: drop-shadow(0 4px 10px rgba(0,0,0,.5));
        transition: transform .3s cubic-bezier(.34, 1.56, .64, 1);
      }
      .el-exhibit-title {
        font-size: .875rem;
        font-weight: 800;
        letter-spacing: .08em;
        color: ${cream};
        text-transform: uppercase;
      }
      .el-exhibit-desc {
        font-size: .6875rem;
        color: rgba(255,255,255,.6);
        line-height: 1.4;
      }

      .el-hint {
        font-size: .6875rem;
        color: var(--text-muted);
        margin-top: 14px;
        font-style: italic;
      }
    </style>

    <div class="el-scene">
      <div class="el-label">
        <span>Interactive Metaphor Preview — Rise of Digital Elevator Ride IA</span>
        <span id="el-telemetry" style="font-family:var(--font-mono); color:${amber};">CABIN AT FL 1 // RECEPTION</span>
      </div>

      <div class="el-shaft-stage">
        <!-- Keypad -->
        <div class="el-keypad-panel">
          <div class="el-panel-brand">RISE // LIFT IA</div>
          <div class="el-keypad-grid" id="el-keypad">
            ${floorButtonsHtml}
          </div>
          <button class="el-btn-express" id="el-btn-express">⚡ EXPRESS (FL 6)</button>
        </div>

        <!-- Floor Exhibit Vitrine -->
        <div class="el-floor-vitrine" id="el-vitrine">
          <div class="el-indicator-box">
            <span class="el-floor-num-badge" id="el-floor-badge">FL 01</span>
            <span class="el-floor-motion-tag" id="el-motion-tag">ARRIVED · DOORS CLEAR</span>
          </div>

          <div class="el-exhibit-display">
            <div class="el-exhibit-icon" id="el-icon">🏛️</div>
            <div class="el-exhibit-title" id="el-title">GROUND RECEPTION & ARCHIVE</div>
            <div class="el-exhibit-desc" id="el-desc">Arrival terminal and architectural building directory.</div>
          </div>

          <div style="font-family:var(--font-mono); font-size:.5rem; color:#666; text-align:center;">
            DIEGETIC ELEVATOR INFORMATION ARCHITECTURE · 6 FLOORS
          </div>
        </div>
      </div>

      <div class="el-hint">
        ↑ Press any floor button to ride the cabin between storeys · Use Express jump to shoot straight to Penthouse
      </div>
    </div>
  `;
}

// ── Interactions ──────────────────────────────────────────────────────────────

function attachInteractions(stageEl, darkShaft, amber, blueNeon, cream, cabin) {
  const keypad     = stageEl.querySelector('#el-keypad');
  const btnExpress = stageEl.querySelector('#el-btn-express');
  const floorBadge = stageEl.querySelector('#el-floor-badge');
  const motionTag  = stageEl.querySelector('#el-motion-tag');
  const iconEl     = stageEl.querySelector('#el-icon');
  const titleEl    = stageEl.querySelector('#el-title');
  const descEl     = stageEl.querySelector('#el-desc');
  const telemetry  = stageEl.querySelector('#el-telemetry');
  const vitrine    = stageEl.querySelector('#el-vitrine');

  let currentFloor = 1;
  let isMoving = false;

  function rideTo(targetFloor) {
    if (isMoving || targetFloor === currentFloor) return;
    isMoving = true;

    // Highlight button
    keypad.querySelectorAll('.el-btn-floor').forEach(b => {
      b.classList.toggle('is-active', parseInt(b.dataset.floor, 10) === targetFloor);
    });

    const goingUp = targetFloor > currentFloor;
    motionTag.textContent = goingUp ? 'TRANSIT: ASCENDING ▲' : 'TRANSIT: DESCENDING ▼';
    motionTag.style.color = amber;
    telemetry.textContent = `TRAVELING TO FLOOR ${targetFloor}...`;

    // Vitrine vertical shake motion
    vitrine.style.transform = `translateY(${goingUp ? -8 : 8}px)`;

    setTimeout(() => {
      currentFloor = targetFloor;
      const f = FLOORS.find(fl => fl.num === currentFloor);

      floorBadge.textContent = `FL 0${currentFloor}`;
      iconEl.textContent = f.icon;
      titleEl.textContent = f.title;
      descEl.textContent = f.desc;

      motionTag.textContent = 'ARRIVED · DOORS CLEAR';
      motionTag.style.color = '#00D18F';
      telemetry.textContent = `CABIN AT FL ${currentFloor} // ${f.title}`;

      vitrine.style.transform = 'translateY(0px)';
      isMoving = false;
    }, 450);
  }

  keypad?.addEventListener('click', e => {
    const btn = e.target.closest('.el-btn-floor');
    if (!btn) return;
    rideTo(parseInt(btn.dataset.floor, 10));
  });

  btnExpress?.addEventListener('click', () => {
    rideTo(6);
  });
}

