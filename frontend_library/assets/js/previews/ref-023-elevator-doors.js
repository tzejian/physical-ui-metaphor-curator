/**
 * previews/ref-023-elevator-doors.js
 *
 * Interactive metaphor preview for ref-023: Southern Lifts —
 * Sliding Elevator Doors as Menu & 3D Lift Hero.
 *
 * Abstraction level: Industrial-hardware / Swiss-minimalist.
 * Technique: A brushed-steel elevator door assembly acting as navigation.
 * Clicking the illuminated call button or door parting line triggers
 * biparting doors to slide smoothly apart, revealing the internal cabin
 * directory and floor index. Features an interactive door-swing geometry diagram.
 *
 * Token fidelity (ref-023):
 *   Colors   : #1A1A1A (chassis), #C0C5CC (brushed steel), #8A939E (steel shade), #E8E4DC (directory cream), #B5442E (call button illuminate)
 *   Borders  : Metal panel seams and brushed-steel door parting lines
 *   Elevation: 3D cabin lighting reflections; flat engineered UI panels
 *   Typography: Engineered grotesque; spec-sheet architectural labels
 */

/** @param {object} entry  @param {HTMLElement} stageEl */
export function mount(entry, stageEl) {
  const tokens = entry.design_tokens ?? {};
  const colors = tokens.dominant_colors ?? ['#1A1A1A', '#C0C5CC', '#8A939E', '#E8E4DC', '#B5442E'];

  const dark      = colors[0] ?? '#1A1A1A';
  const steel     = colors[1] ?? '#C0C5CC';
  const steelDark = colors[2] ?? '#8A939E';
  const cream     = colors[3] ?? '#E8E4DC';
  const callRed   = colors[4] ?? '#B5442E';

  stageEl.innerHTML = buildStageHtml(dark, steel, steelDark, cream, callRed);
  attachInteractions(stageEl, dark, steel, steelDark, cream, callRed);
}

// ── HTML ──────────────────────────────────────────────────────────────────────

function buildStageHtml(dark, steel, steelDark, cream, callRed) {
  return `
    <style>
      .ed-scene {
        display: flex;
        flex-direction: column;
        width: 100%;
        font-family: var(--font-sans);
        user-select: none;
      }
      .ed-label {
        font-size: .6875rem;
        font-weight: 700;
        letter-spacing: .12em;
        text-transform: uppercase;
        color: var(--text-muted);
        margin-bottom: 14px;
        display: flex;
        justify-content: space-between;
      }

      /* Elevator Wall Shaft */
      .ed-shaft {
        position: relative;
        width: 100%;
        min-height: 380px;
        background: #141517;
        border-radius: 8px;
        border: 2px solid #23252a;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 24px;
        box-sizing: border-box;
        box-shadow: 0 16px 40px rgba(0,0,0,.6);
      }

      /* Indicator Header */
      .ed-header-bar {
        display: flex;
        align-items: center;
        gap: 16px;
        background: #1c1d21;
        border: 1px solid #2f323a;
        padding: 6px 16px;
        border-radius: 4px;
        margin-bottom: 16px;
        font-family: var(--font-mono);
      }
      .ed-floor-num {
        font-size: 1.1rem;
        font-weight: 800;
        color: ${callRed};
      }
      .ed-direction-arrow {
        color: #00D18F;
        font-size: .75rem;
      }
      .ed-status-text {
        font-size: .625rem;
        color: rgba(255,255,255,.5);
        letter-spacing: .1em;
      }

      /* ── Elevator Door Portal Frame ── */
      .ed-portal {
        position: relative;
        width: 300px;
        height: 240px;
        border: 8px solid #282a30;
        border-bottom: none;
        box-shadow: inset 0 0 20px rgba(0,0,0,.8), 0 12px 30px rgba(0,0,0,.5);
        overflow: hidden;
        background: #111;
      }

      /* Inside Cabin Interior (Revealed when doors open) */
      .ed-cabin-interior {
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, #202227 0%, #16171a 100%);
        padding: 20px 24px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        color: ${cream};
        z-index: 1;
      }
      .ed-cabin-title {
        font-size: .75rem;
        font-weight: 800;
        letter-spacing: .15em;
        text-transform: uppercase;
        color: ${callRed};
        border-bottom: 1px solid rgba(255,255,255,.1);
        padding-bottom: 6px;
      }
      .ed-directory-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin: 10px 0;
      }
      .ed-dir-item {
        display: flex;
        justify-content: space-between;
        font-size: .6875rem;
        color: #ccc;
        cursor: pointer;
        padding: 3px 6px;
        border-radius: 3px;
        transition: background .12s;
      }
      .ed-dir-item:hover {
        background: rgba(255,255,255,.08);
        color: #fff;
      }
      .ed-dir-floor {
        font-family: var(--font-mono);
        color: ${callRed};
        font-weight: 700;
      }

      /* Sliding Steel Doors */
      .ed-door {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 50%;
        background: linear-gradient(90deg, ${steelDark} 0%, ${steel} 50%, ${steelDark} 100%);
        box-shadow: inset 0 0 14px rgba(0,0,0,.4);
        z-index: 4;
        transition: transform .55s cubic-bezier(.4, 0, .2, 1);
        display: flex;
        align-items: center;
      }
      /* Left Door */
      .ed-door-left {
        left: 0;
        border-right: 1.5px solid #111;
        justify-content: flex-end;
      }
      /* Right Door */
      .ed-door-right {
        right: 0;
        border-left: 1.5px solid #111;
        justify-content: flex-start;
      }

      /* Vertical brushed metal grooves */
      .ed-door-groove {
        width: 100%;
        height: 100%;
        background-image: repeating-linear-gradient(
          to right,
          transparent 0px,
          transparent 12px,
          rgba(0,0,0,.08) 12px,
          rgba(0,0,0,.08) 13px
        );
      }

      /* Open Doors state */
      .ed-portal.is-open .ed-door-left {
        transform: translateX(-100%);
      }
      .ed-portal.is-open .ed-door-right {
        transform: translateX(100%);
      }

      /* ── External Call Button Station ── */
      .ed-call-station {
        position: absolute;
        right: 28px;
        top: 50%;
        transform: translateY(-50%);
        background: #202227;
        border: 2px solid #363942;
        border-radius: 6px;
        padding: 12px 10px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        box-shadow: 0 4px 14px rgba(0,0,0,.5);
        z-index: 5;
      }
      .ed-btn-call {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: #141517;
        border: 2px solid #444752;
        color: #fff;
        font-size: .875rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all .15s;
        box-shadow: inset 0 2px 4px rgba(0,0,0,.5);
      }
      .ed-btn-call.is-lit {
        background: ${callRed};
        border-color: #ff6b52;
        box-shadow: 0 0 12px ${callRed};
      }

      .ed-hint {
        font-size: .6875rem;
        color: var(--text-muted);
        margin-top: 14px;
        font-style: italic;
      }
    </style>

    <div class="ed-scene">
      <div class="ed-label">
        <span>Interactive Metaphor Preview — Southern Lifts Elevator Doors Menu</span>
        <span id="ed-state-tag" style="font-family:var(--font-mono); color:${callRed};">DOORS: CLOSED</span>
      </div>

      <div class="ed-shaft">
        <!-- Floor Indicator Display -->
        <div class="ed-header-bar">
          <span class="ed-direction-arrow">▲</span>
          <span class="ed-floor-num" id="ed-floor">FL 04</span>
          <span class="ed-status-text" id="ed-status">CABIN STATIONARY</span>
        </div>

        <!-- Elevator Door Portal -->
        <div class="ed-portal" id="ed-portal">
          <!-- Interior Cabin Directory (Revealed) -->
          <div class="ed-cabin-interior">
            <div>
              <div class="ed-cabin-title">SOUTHERN LIFTS // DIRECTORY</div>
              <div class="ed-directory-list">
                <div class="ed-dir-item" data-fl="06">
                  <span>PENTHOUSE SUITES</span>
                  <span class="ed-dir-floor">FL 06</span>
                </div>
                <div class="ed-dir-item" data-fl="05">
                  <span>ENGINEERING & CAD</span>
                  <span class="ed-dir-floor">FL 05</span>
                </div>
                <div class="ed-dir-item" data-fl="04">
                  <span>RESIDENTIAL PASSENGER</span>
                  <span class="ed-dir-floor">FL 04</span>
                </div>
                <div class="ed-dir-item" data-fl="01">
                  <span>GROUND FOYER & SALON</span>
                  <span class="ed-dir-floor">FL 01</span>
                </div>
              </div>
            </div>
            <div style="font-family:var(--font-mono); font-size:.5rem; color:#777;">
              BRUSHED STAINLESS STEEL 316 · 1.5 M/S
            </div>
          </div>

          <!-- Biparting Steel Doors -->
          <div class="ed-door ed-door-left"><div class="ed-door-groove"></div></div>
          <div class="ed-door ed-door-right"><div class="ed-door-groove"></div></div>
        </div>

        <!-- External Call Button Station -->
        <div class="ed-call-station">
          <button class="ed-btn-call" id="ed-btn-call" aria-label="Call elevator and open doors">▲</button>
          <span style="font-family:var(--font-mono); font-size:.4375rem; color:#777; letter-spacing:.08em;">CALL</span>
        </div>
      </div>

      <div class="ed-hint">
        ↑ Press the call button or click doors to part the sliding elevator panels and enter the cabin menu
      </div>
    </div>
  `;
}

// ── Interactions ──────────────────────────────────────────────────────────────

function attachInteractions(stageEl, dark, steel, steelDark, cream, callRed) {
  const portal    = stageEl.querySelector('#ed-portal');
  const btnCall   = stageEl.querySelector('#ed-btn-call');
  const stateTag  = stageEl.querySelector('#ed-state-tag');
  const floorDisp = stageEl.querySelector('#ed-floor');
  const statusDisp= stageEl.querySelector('#ed-status');
  const dirItems  = stageEl.querySelectorAll('.ed-dir-item');

  let isOpen = false;

  function toggleDoors() {
    isOpen = !isOpen;
    portal.classList.toggle('is-open', isOpen);
    btnCall.classList.toggle('is-lit', isOpen);
    stateTag.textContent = isOpen ? 'DOORS: OPEN (CABIN ACCESSIBLE)' : 'DOORS: CLOSED';
    statusDisp.textContent = isOpen ? 'DOORS PARTED' : 'CABIN STATIONARY';
  }

  btnCall?.addEventListener('click', toggleDoors);
  portal?.addEventListener('click', e => {
    if (e.target.closest('.ed-dir-item')) return;
    toggleDoors();
  });

  // Select Floor from Directory
  dirItems.forEach(item => {
    item.addEventListener('click', () => {
      const fl = item.dataset.fl;
      floorDisp.textContent = `FL ${fl}`;
      statusDisp.textContent = `TRAVELING TO FL ${fl}...`;

      setTimeout(() => {
        toggleDoors(); // Auto close on select
      }, 500);
    });
  });
}

